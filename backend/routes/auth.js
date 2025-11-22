import express from 'express';
import bcrypt from 'bcryptjs';
import { User } from '../models/User.js';
import { generateToken, authenticateToken } from '../middleware/auth.js';
import { 
  generateOTPWithExpiry, 
  verifyOTP, 
  logOTPForTesting 
} from '../utils/otp.js';

const router = express.Router();

// User registration
router.post('/register', async (req, res) => {
  try {
    const { 
      loginId, 
      email, 
      password, 
      firstName, 
      lastName, 
      userRole = 'viewer' // Default role (admin, manager, operator, viewer)
    } = req.body;

    // Validate required fields
    if (!loginId || !email || !password || !firstName || !lastName) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required: loginId, email, password, firstName, lastName'
      });
    }

    // Validate password strength
    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long'
      });
    }

    // Check if user already exists
    const existingUserByLogin = await User.findOne({
      where: { login_id: loginId }
    });

    const existingUserByEmail = await User.findOne({
      where: { email: email }
    });

    if (existingUserByLogin || existingUserByEmail) {
      return res.status(400).json({
        success: false,
        message: 'User with this login ID or email already exists'
      });
    }

    // Hash password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create new user
    const newUser = await User.create({
      login_id: loginId,
      email: email,
      password: hashedPassword,
      user_role: userRole,
      first_name: firstName,
      last_name: lastName
    });

    // Generate JWT token
    const token = generateToken(newUser);

    // Return success response (don't send password)
    const userResponse = {
      userId: newUser.user_id,
      loginId: newUser.login_id,
      email: newUser.email,
      role: newUser.user_role,
      firstName: newUser.first_name,
      lastName: newUser.last_name
    };

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      token: token,
      user: userResponse
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Registration failed',
      error: error.message
    });
  }
});

// User login
router.post('/login', async (req, res) => {
  try {
    const { loginId, password } = req.body;

    // Validate input
    if (!loginId || !password) {
      return res.status(400).json({
        success: false,
        message: 'Login ID and password are required'
      });
    }

    // Find user by login_id
    const user = await User.findOne({
      where: { login_id: loginId }
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid login credentials'
      });
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid login credentials'
      });
    }

    // Generate JWT token
    const token = generateToken(user);

    // Update last login timestamp
    await user.update({ updated_at: new Date() });

    // Return success response (don't send password)
    const userResponse = {
      userId: user.user_id,
      loginId: user.login_id,
      email: user.email,
      role: user.user_role,
      firstName: user.first_name,
      lastName: user.last_name
    };

    res.json({
      success: true,
      message: 'Login successful',
      token: token,
      user: userResponse
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Login failed',
      error: error.message
    });
  }
});

// Get current user profile (protected route)
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    const user = await User.findByPk(req.user.userId, {
      attributes: { exclude: ['password'] } // Don't send password
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      user: {
        userId: user.user_id,
        loginId: user.login_id,
        email: user.email,
        role: user.user_role,
        firstName: user.first_name,
        lastName: user.last_name,
        createdAt: user.created_at,
        updatedAt: user.updated_at
      }
    });

  } catch (error) {
    console.error('Profile fetch error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user profile',
      error: error.message
    });
  }
});

// Update user profile (protected route)
router.put('/profile', authenticateToken, async (req, res) => {
  try {
    const { firstName, lastName, email } = req.body;

    const user = await User.findByPk(req.user.userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Update user fields
    await user.update({
      first_name: firstName || user.first_name,
      last_name: lastName || user.last_name,
      email: email || user.email
    });

    res.json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        userId: user.user_id,
        loginId: user.login_id,
        email: user.email,
        role: user.user_role,
        firstName: user.first_name,
        lastName: user.last_name
      }
    });

  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update profile',
      error: error.message
    });
  }
});

// Verify token route
router.post('/verify', authenticateToken, (req, res) => {
  res.json({
    success: true,
    message: 'Token is valid',
    user: req.user
  });
});

// Logout route (client-side token removal, but can be used for logging)
router.post('/logout', authenticateToken, (req, res) => {
  // In a more advanced setup, you might want to blacklist tokens
  res.json({
    success: true,
    message: 'Logged out successfully'
  });
});

// Forgot password - Send OTP
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required'
      });
    }

    // Find user by email
    const user = await User.findOne({
      where: { email: email }
    });

    if (!user) {
      // Don't reveal if email exists or not for security
      return res.json({
        success: true,
        message: 'If the email exists, an OTP has been sent'
      });
    }

    // Generate OTP
    const { otp } = generateOTPWithExpiry();
    
    // Debug logging
    console.log('OTP Generation Debug:');
    console.log('- Email:', email);
    console.log('- OTP:', otp);
    console.log('- Generated at:', new Date().toISOString());

    // Save OTP to database
    await user.update({
      reset_otp: otp,
      reset_otp_expires: null
    });

    // Log OTP to console for development/testing
    logOTPForTesting(email, otp);

    res.json({
      success: true,
      message: 'OTP sent successfully. Check the console for OTP.',
      otp: otp // Include OTP in response for development
    });

  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process forgot password request'
    });
  }
});

// Verify OTP
router.post('/verify-otp', async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: 'Email and OTP are required'
      });
    }

    // Find user by email
    const user = await User.findOne({
      where: { email: email }
    });

    if (!user || !user.reset_otp) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired OTP'
      });
    }

    // Verify OTP
    const otpVerification = verifyOTP(
      user.reset_otp,
      user.reset_otp_expires,
      otp
    );

    if (!otpVerification.valid) {
      return res.status(400).json({
        success: false,
        message: otpVerification.reason
      });
    }

    // OTP is valid - generate temporary reset token
    const resetToken = generateToken(user);

    res.json({
      success: true,
      message: 'OTP verified successfully',
      resetToken: resetToken
    });

  } catch (error) {
    console.error('OTP verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to verify OTP'
    });
  }
});

// Reset password
router.post('/reset-password', async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;

    if (!email || !otp || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Email, OTP, and new password are required'
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long'
      });
    }

    // Find user by email
    const user = await User.findOne({
      where: { email: email }
    });

    if (!user || !user.reset_otp) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired OTP'
      });
    }

    // Verify OTP one more time
    const otpVerification = verifyOTP(
      user.reset_otp,
      user.reset_otp_expires,
      otp
    );

    if (!otpVerification.valid) {
      return res.status(400).json({
        success: false,
        message: otpVerification.reason
      });
    }

    // Hash new password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

    // Update password and clear OTP
    await user.update({
      password: hashedPassword,
      reset_otp: null,
      reset_otp_expires: null
    });

    res.json({
      success: true,
      message: 'Password reset successfully'
    });

  } catch (error) {
    console.error('Password reset error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to reset password'
    });
  }
});

export default router;
