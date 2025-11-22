import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';

// JWT secret key - in production, use environment variable
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// Middleware to verify JWT token
export const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ 
      success: false, 
      message: 'Access token required' 
    });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Get user from database to ensure they still exist
    const user = await User.findByPk(decoded.userId);
    if (!user) {
      return res.status(401).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    // Add user info to request object
    req.user = {
      userId: user.user_id,
      loginId: user.login_id,
      email: user.email,
      role: user.user_role,
      firstName: user.first_name,
      lastName: user.last_name
    };
    
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        success: false, 
        message: 'Token expired' 
      });
    } else if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid token' 
      });
    } else {
      return res.status(500).json({ 
        success: false, 
        message: 'Token verification failed' 
      });
    }
  }
};

// Middleware to check user roles
export const requireRole = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ 
        success: false, 
        message: 'Authentication required' 
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        success: false, 
        message: 'Insufficient permissions' 
      });
    }

    next();
  };
};

// Generate JWT token
export const generateToken = (user) => {
  return jwt.sign(
    { 
      userId: user.user_id,
      loginId: user.login_id,
      email: user.email,
      role: user.user_role 
    },
    JWT_SECRET,
    { 
      expiresIn: process.env.JWT_EXPIRES_IN || '24h' 
    }
  );
};