const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { logSecurityEvent } = require('../utils/logger');

// @desc    Protect routes — verifies JWT token
const protect = async (req, res, next) => {
  let token;

  // Check for Bearer token in Authorization header
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    logSecurityEvent('UNAUTHORIZED_ACCESS_NO_TOKEN', { path: req.originalUrl, ip: req.ip });
    return res.status(401).json({
      success: false,
      error: 'Not authorized — no token provided',
    });
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Attach user to request (excluding password)
    req.user = await User.findById(decoded.id).select('-password');

    if (!req.user) {
      logSecurityEvent('UNAUTHORIZED_ACCESS_USER_DELETED', { userId: decoded.id, ip: req.ip });
      return res.status(401).json({
        success: false,
        error: 'Not authorized — user no longer exists',
      });
    }

    next();
  } catch (error) {
    logSecurityEvent('UNAUTHORIZED_ACCESS_INVALID_TOKEN', { path: req.originalUrl, ip: req.ip, error: error.message });
    return res.status(401).json({
      success: false,
      error: 'Not authorized — invalid token',
    });
  }
};

// @desc    Restrict access to specific roles
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      logSecurityEvent('FORBIDDEN_ROLE_ACCESS', {
        userId: req.user.publicId,
        userRole: req.user.role,
        requiredRoles: roles,
        path: req.originalUrl,
        ip: req.ip,
      });
      return res.status(403).json({
        success: false,
        error: `Role '${req.user.role}' is not authorized to access this resource`,
      });
    }
    next();
  };
};

module.exports = { protect, authorize };

