require('dotenv').config();  

const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs'); 

const app = express();
const PORT = process.env.PORT || 5000;  
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? 'https://your-frontend-domain.com' 
    : 'http://localhost:5173',  // Updated to use correct Vite port
  credentials: true
}));            
app.use(express.json());    

const SECRET_KEY = process.env.JWT_SECRET;

// ---------------- Helper Validations ----------------

const validatePassword = (password) => {
  return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/.test(password);
};

// ---------------- Users Database (In-Memory) ----------------

let users = [
  { 
    id: 1,
    loginId: 'testuser',
    username: 'testuser',
    passwordHash: bcrypt.hashSync('testpass', 10),
    email: 'test@example.com',
    role: 'admin',
    department: 'IT',
    fullName: 'Test User',
    otp: null,
    otpExpiry: null
  },
  { 
    id: 2,
    loginId: 'manager',
    username: 'manager',
    passwordHash: bcrypt.hashSync('manager123', 10),
    email: 'manager@example.com',
    role: 'manager',
    department: 'Sales',
    fullName: 'Manager User',
    otp: null,
    otpExpiry: null
  }
];

// ---------------- Helper: Generate Next ID ----------------
const getNextId = () => {
  return Math.max(...users.map(u => u.id), 0) + 1;
};

//
// ======================== SIGNUP ========================
//
app.post('/signup', async (req, res) => {
  try {
    const { loginId, email, password } = req.body;

    if (!loginId || !email || !password) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    const existingUser = users.find(u => u.loginId === loginId || u.email === email);
    if (existingUser) {
      return res.status(400).json({ error: 'User with this login ID or email already exists' });
    }

    if (!/^[a-zA-Z0-9_]{6,12}$/.test(loginId)) {
      return res.status(400).json({ error: 'Login ID must be 6-12 characters (letters, digits, underscore only)' });
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }

    if (!validatePassword(password)) {
      return res.status(400).json({
        error: "Password must be 8+ chars, include upper, lower, number, and special character"
      });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const newUser = {
      id: getNextId(),
      loginId,
      username: loginId,
      email,
      passwordHash,
      role: "staff",
      department: "General",
      fullName: loginId,
      otp: null,
      otpExpiry: null
    };

    users.push(newUser);

    return res.json({ message: "User registered successfully!" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});


//
// ======================== LOGIN ========================
//
app.post('/login', async (req, res) => {
  const { loginId, password } = req.body;

  const user = users.find(u => u.loginId === loginId);
  if (!user) return res.status(401).json({ error: "Invalid Login ID or Password" });

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) return res.status(401).json({ error: "Invalid Login ID or Password" });

  const token = jwt.sign(
    { userId: user.id, loginId: user.loginId, email: user.email, role: user.role },
    SECRET_KEY,
    { expiresIn: "1h" }
  );

  return res.json({ message: "Login successful", token });
});


//
// ======================== REQUEST OTP ========================
//
app.post('/request-otp', (req, res) => {
  const { email } = req.body;

  const user = users.find(u => u.email === email);
  if (!user) return res.status(404).json({ error: "No account found with this email" });

  const otp = Math.floor(100000 + Math.random() * 900000).toString();

  user.otp = otp;
  user.otpExpiry = Date.now() + 5 * 60 * 1000;

  console.log("Generated OTP (Demo):", otp);

  return res.json({ message: "OTP sent (demo mode)", otp });
});


//
// ======================== RESET PASSWORD ========================
//
app.post('/reset-password', async (req, res) => {
  const { email, otp, newPassword } = req.body;

  const user = users.find(u => u.email === email);
  if (!user) return res.status(404).json({ error: "User not found" });

  if (!otp || user.otp !== otp) {
    return res.status(400).json({ error: "Invalid OTP" });
  }

  if (Date.now() > user.otpExpiry) {
    return res.status(400).json({ error: "OTP expired" });
  }

  if (!validatePassword(newPassword)) {
    return res.status(400).json({
      error: "Password must be 8+ chars, include upper, lower, number & special char"
    });
  }

  user.passwordHash = await bcrypt.hash(newPassword, 10);
  user.otp = null;
  user.otpExpiry = null;

  return res.json({ message: "Password reset successful" });
});


//
// ======================== PROTECTED ROUTE ========================
app.get('/protected', (req, res) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.sendStatus(401);

  jwt.verify(token, SECRET_KEY, (err, user) => {
    if (err) return res.sendStatus(403);
    res.json({ message: `Welcome ${user.loginId}!`, user });
  });
});


//
// ======================== START SERVER ========================
app.listen(PORT, () => {
  console.log(`Auth server running on http://localhost:${PORT}`);
});
