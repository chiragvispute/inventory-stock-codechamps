import express from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { UserModel } from '../models/User.js';

const router = express.Router();

const SECRET_KEY = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// ---------------- Helper Validations ----------------

const validatePassword = (password) => {
  return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/.test(password);
};

const validateEmail = (email) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

const validateLoginId = (loginId) => {
  return /^[a-zA-Z0-9_]{3,20}$/.test(loginId);
};

//
// ======================== SIGNUP ========================
//
router.post('/signup', async (req, res) => {
  try {
    const { loginId, email, password, firstName, lastName } = req.body;

    // Validate required fields
    if (!loginId || !email || !password) {
      return res.status(400).json({ error: 'Login ID, email, and password are required' });
    }

    // Validate login ID format
    if (!validateLoginId(loginId)) {
      return res.status(400).json({ error: 'Login ID must be 3-20 characters (letters, digits, underscore only)' });
    }

    // Validate email format
    if (!validateEmail(email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }

    // Validate password strength
    if (!validatePassword(password)) {
      return res.status(400).json({
        error: "Password must be 8+ chars, include upper, lower, number, and special character"
      });
    }

    // Check if user already exists
    const existingUserByLoginId = await UserModel.getUserByLoginId(loginId);
    if (existingUserByLoginId) {
      return res.status(400).json({ error: 'User with this login ID already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user in database
    const userData = {
      loginId,
      email,
      password: hashedPassword,
      userRole: 'operator', // Changed from 'staff' to 'operator' to match DB constraint
      firstName: firstName || loginId,
      lastName: lastName || 'User'
    };

    const newUser = await UserModel.createUser(userData);

    return res.status(201).json({ 
      message: "User registered successfully!",
      user: {
        id: newUser.user_id,
        loginId: newUser.login_id,
        email: newUser.email,
        role: newUser.user_role,
        firstName: newUser.first_name,
        lastName: newUser.last_name
      }
    });

  } catch (err) {
    console.error('Signup error:', err);
    
    // Handle duplicate key errors
    if (err.name === 'SequelizeUniqueConstraintError') {
      const field = err.errors[0].path;
      if (field === 'login_id') {
        return res.status(400).json({ error: 'User with this login ID already exists' });
      } else if (field === 'email') {
        return res.status(400).json({ error: 'User with this email already exists' });
      }
    }
    
    res.status(500).json({ error: "Internal server error" });
  }
});


//
// ======================== LOGIN ========================
//
router.post('/login', async (req, res) => {
  try {
    const { loginId, password } = req.body;

    // Validate input
    if (!loginId || !password) {
      return res.status(400).json({ error: "Login ID and password are required" });
    }

    // Find user in database
    const user = await UserModel.getUserByLoginId(loginId);
    if (!user) {
      return res.status(401).json({ error: "Invalid Login ID or Password" });
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ error: "Invalid Login ID or Password" });
    }

    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: user.user_id, 
        loginId: user.login_id, 
        email: user.email, 
        role: user.user_role 
      },
      SECRET_KEY,
      { expiresIn: "8h" } // Extended token life for better UX
    );

    return res.json({ 
      message: "Login successful", 
      token,
      user: {
        id: user.user_id,
        loginId: user.login_id,
        email: user.email,
        role: user.user_role,
        firstName: user.first_name,
        lastName: user.last_name,
        fullName: `${user.first_name} ${user.last_name}`
      }
    });

  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: "Internal server error" });
  }
});


//
// ======================== REQUEST OTP ========================
//
router.post('/request-otp', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }

    // Find user by email in database
    const users = await UserModel.getAllUsers();
    const user = users.find(u => u.email === email);
    
    if (!user) {
      return res.status(404).json({ error: "No account found with this email" });
    }

    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiry = Date.now() + 5 * 60 * 1000; // 5 minutes

    // Store OTP in database (using otp_secret field temporarily)
    await UserModel.updateUser(user.user_id, {
      otpSecret: JSON.stringify({ otp, expiry: otpExpiry })
    });

    console.log("Generated OTP (Demo):", otp, "for", email);

    return res.json({ 
      message: "OTP sent successfully", 
      otp: process.env.NODE_ENV === 'development' ? otp : undefined // Only show in dev
    });

  } catch (err) {
    console.error('Request OTP error:', err);
    res.status(500).json({ error: "Internal server error" });
  }
});


//
// ======================== RESET PASSWORD ========================
//
router.post('/reset-password', async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;

    if (!email || !otp || !newPassword) {
      return res.status(400).json({ error: "Email, OTP, and new password are required" });
    }

    // Find user by email
    const users = await UserModel.getAllUsers();
    const user = users.find(u => u.email === email);
    
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Get user with OTP data
    const userWithOtp = await UserModel.getUserByLoginId(user.login_id);
    
    if (!userWithOtp.otp_secret) {
      return res.status(400).json({ error: "No OTP request found. Please request a new OTP." });
    }

    // Parse OTP data
    let otpData;
    try {
      otpData = JSON.parse(userWithOtp.otp_secret);
    } catch {
      return res.status(400).json({ error: "Invalid OTP data. Please request a new OTP." });
    }

    // Verify OTP
    if (!otp || otpData.otp !== otp) {
      return res.status(400).json({ error: "Invalid OTP" });
    }

    // Check expiry
    if (Date.now() > otpData.expiry) {
      return res.status(400).json({ error: "OTP expired. Please request a new one." });
    }

    // Validate new password
    if (!validatePassword(newPassword)) {
      return res.status(400).json({
        error: "Password must be 8+ chars, include upper, lower, number & special char"
      });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 12);

    // Update password and clear OTP
    await UserModel.updateUser(user.user_id, {
      password: hashedPassword,
      otpSecret: null
    });

    return res.json({ message: "Password reset successful" });

  } catch (err) {
    console.error('Reset password error:', err);
    res.status(500).json({ error: "Internal server error" });
  }
});


//
// ======================== PROTECTED ROUTE ========================
router.get('/protected', async (req, res) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) return res.sendStatus(401);

    jwt.verify(token, SECRET_KEY, async (err, decoded) => {
      if (err) return res.sendStatus(403);
      
      try {
        // Get user from database
        const user = await UserModel.getUserById(decoded.userId);
        if (!user) {
          return res.status(404).json({ error: 'User not found' });
        }

        res.json({ 
          message: `Welcome ${user.login_id}!`, 
          user: {
            id: user.user_id,
            loginId: user.login_id,
            role: user.user_role,
            fullName: `${user.first_name} ${user.last_name}`
          }
        });
      } catch (dbErr) {
        console.error('Database error in protected route:', dbErr);
        res.status(500).json({ error: 'Internal server error' });
      }
    });
  } catch (err) {
    console.error('Protected route error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ======================== GET CURRENT USER ========================
router.get('/me', async (req, res) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    jwt.verify(token, SECRET_KEY, async (err, decoded) => {
      if (err) {
        if (err.name === 'TokenExpiredError') {
          return res.status(403).json({ error: 'Token expired' });
        }
        return res.status(403).json({ error: 'Invalid token' });
      }
      
      try {
        // Get user from database
        const user = await UserModel.getUserById(decoded.userId);
        if (!user) {
          return res.status(404).json({ error: 'User not found' });
        }

        res.json({
          id: user.user_id,
          loginId: user.login_id,
          email: user.email,
          role: user.user_role,
          firstName: user.first_name,
          lastName: user.last_name,
          fullName: `${user.first_name} ${user.last_name}`,
          createdAt: user.created_at
        });
      } catch (dbErr) {
        console.error('Database error in /me:', dbErr);
        res.status(500).json({ error: 'Internal server error' });
      }
    });
  } catch (err) {
    console.error('Auth /me error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;