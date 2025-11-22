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
    
    // Get user from database to ensure they still exist and account is active
    const user = await User.findByPk(decoded.userId);
    if (!user) {
      return res.status(401).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    // Check if user account is active (if you have status field)
    if (user.status && user.status === 'inactive') {
      return res.status(401).json({ 
        success: false, 
        message: 'Account is inactive' 
      });
    }

    // Add comprehensive user info to request object for inventory operations
    req.user = {
      userId: user.user_id,
      loginId: user.login_id,
      email: user.email,
      role: user.user_role,
      firstName: user.first_name,
      lastName: user.last_name,
      fullName: `${user.first_name} ${user.last_name}`.trim(),
      warehouseId: user.warehouse_id || null, // For warehouse-specific operations
      isActive: user.status !== 'inactive'
    };
    
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        success: false, 
        message: 'Token expired',
        code: 'TOKEN_EXPIRED'
      });
    } else if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid token',
        code: 'INVALID_TOKEN'
      });
    } else {
      return res.status(500).json({ 
        success: false, 
        message: 'Token verification failed',
        code: 'TOKEN_VERIFICATION_FAILED'
      });
    }
  }
};

// Middleware to check user roles with enhanced permissions
export const requireRole = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ 
        success: false, 
        message: 'Authentication required',
        code: 'AUTH_REQUIRED'
      });
    }

    // Normalize roles to array
    const allowedRoles = Array.isArray(roles) ? roles : [roles];
    
    if (!allowedRoles.includes(req.user.role)) {
      console.log(`Access denied: User ${req.user.loginId} (${req.user.role}) attempted to access resource requiring roles: ${allowedRoles.join(', ')}`);
      return res.status(403).json({ 
        success: false, 
        message: 'Insufficient permissions',
        code: 'INSUFFICIENT_PERMISSIONS',
        required: allowedRoles,
        current: req.user.role
      });
    }

    next();
  };
};

// Warehouse-specific access control for inventory operations
export const requireWarehouseAccess = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ 
      success: false, 
      message: 'Authentication required' 
    });
  }

  // Admins have access to all warehouses
  if (req.user.role === 'admin' || req.user.role === 'manager') {
    return next();
  }

  // Check if user has warehouse access for inventory operations
  const requestedWarehouseId = req.params.warehouseId || req.body.warehouseId;
  if (requestedWarehouseId && req.user.warehouseId && 
      parseInt(requestedWarehouseId) !== parseInt(req.user.warehouseId)) {
    return res.status(403).json({ 
      success: false, 
      message: 'Access denied to this warehouse' 
    });
  }

  next();
};

// Generate JWT token with enhanced payload
export const generateToken = (user) => {
  const payload = {
    userId: user.user_id,
    loginId: user.login_id,
    email: user.email,
    role: user.user_role,
    warehouseId: user.warehouse_id || null,
    timestamp: Date.now()
  };

  return jwt.sign(
    payload,
    JWT_SECRET,
    { 
      expiresIn: process.env.JWT_EXPIRES_IN || '24h',
      issuer: 'inventory-system',
      audience: 'inventory-users'
    }
  );
};

// Refresh token validation
export const validateRefreshToken = (refreshToken) => {
  try {
    return jwt.verify(refreshToken, JWT_SECRET);
  } catch (error) {
    return null;
  }
};

// Generate refresh token
export const generateRefreshToken = (user) => {
  return jwt.sign(
    { 
      userId: user.user_id,
      type: 'refresh'
    },
    JWT_SECRET,
    { 
      expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN || '7d',
      issuer: 'inventory-system'
    }
  );
};

// Optional: Rate limiting middleware for auth endpoints
export const authRateLimit = (req, res, next) => {
  // This is a simple rate limiting - in production, use redis-based solution
  const clientId = req.ip;
  const now = Date.now();
  
  if (!global.authAttempts) {
    global.authAttempts = new Map();
  }
  
  const attempts = global.authAttempts.get(clientId) || { count: 0, resetTime: now + 900000 }; // 15 min window
  
  if (now > attempts.resetTime) {
    attempts.count = 0;
    attempts.resetTime = now + 900000;
  }
  
  if (attempts.count >= 5) { // Max 5 attempts per 15 minutes
    return res.status(429).json({ 
      success: false, 
      message: 'Too many authentication attempts. Please try again later.',
      retryAfter: Math.ceil((attempts.resetTime - now) / 1000)
    });
  }
  
  attempts.count++;
  global.authAttempts.set(clientId, attempts);
  
  next();
};