const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { logSecurityEvent } = require('../utils/logger');

// Helper: generate JWT token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d',
  });
};

// @desc    Register a new user
// @route   POST /api/auth/register
exports.register = async (req, res, next) => {
  try {
    const { name, email, password, phone } = req.body;

    const normalizedEmail = email.toLowerCase().trim();
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      logSecurityEvent('REGISTER_FAILED_DUPLICATE_EMAIL', { email: normalizedEmail, ip: req.ip });
      return res.status(400).json({
        success: false,
        error: 'Registration failed. Please check your credentials and try again.',
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user (role is always 'customer' — never from req.body)
    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password: hashedPassword,
      phone: phone ? phone.trim() : undefined,
    });

    logSecurityEvent('USER_REGISTERED', { userId: user.publicId, email: normalizedEmail });

    // Generate token
    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      data: {
        publicId: user.publicId,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
      },
      token,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Login user & get token
// @route   POST /api/auth/login
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const normalizedEmail = email.toLowerCase().trim();

    const user = await User.findOne({ email: normalizedEmail }).select('+password');
    if (!user) {
      logSecurityEvent('LOGIN_FAILED_INVALID_USER', { email: normalizedEmail, ip: req.ip });
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials',
      });
    }

    // Compare passwords
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      logSecurityEvent('LOGIN_FAILED_WRONG_PASSWORD', { email: normalizedEmail, ip: req.ip });
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials',
      });
    }

    logSecurityEvent('USER_LOGGED_IN', { userId: user.publicId, email: normalizedEmail });

    // Generate token
    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      data: {
        publicId: user.publicId,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
      },
      token,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current logged-in user
// @route   GET /api/auth/me
exports.getMe = async (req, res) => {
  // Return safe representation without MongoDB _id or __v
  res.status(200).json({
    success: true,
    data: {
      publicId: req.user.publicId,
      name: req.user.name,
      email: req.user.email,
      phone: req.user.phone,
      role: req.user.role,
    },
  });
};

// @desc    Update current logged-in user profile
// @route   PUT /api/auth/profile
exports.updateProfile = async (req, res, next) => {
  try {
    const ALLOWED_UPDATES = ['name', 'phone'];
    const updates = {};

    Object.keys(req.body).forEach((key) => {
      if (ALLOWED_UPDATES.includes(key)) {
        updates[key] = req.body[key];
      }
    });

    const user = await User.findByIdAndUpdate(req.user._id, updates, {
      new: true,
      runValidators: true,
    });

    logSecurityEvent('USER_PROFILE_UPDATED', { userId: user.publicId });

    res.status(200).json({
      success: true,
      data: {
        publicId: user.publicId,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
      },
    });
  } catch (error) {
    next(error);
  }
};


