const User = require('../models/User');
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');

// Helper to query user by either publicId (UUID) or Mongo ObjectId
const buildUserQuery = (id) => {
  if (mongoose.Types.ObjectId.isValid(id)) {
    return { _id: id };
  }
  return { publicId: id };
};

// @desc    Get all users
// @route   GET /api/users
exports.getUsers = async (req, res, next) => {
  try {
    const users = await User.find().select('-password');
    res.status(200).json({ success: true, count: users.length, data: users });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single user
// @route   GET /api/users/:id
exports.getUser = async (req, res, next) => {
  try {
    const user = await User.findOne(buildUserQuery(req.params.id)).select('-password');
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }
    res.status(200).json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new user (Admin route)
// @route   POST /api/users
exports.createUser = async (req, res, next) => {
  try {
    const { name, email, password, phone, role } = req.body;

    // Hash password before saving
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      phone: phone ? phone.trim() : undefined,
      role: role || 'customer',
    });

    const { password: _, ...safeUser } = user.toObject();
    res.status(201).json({ success: true, data: safeUser });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user
// @route   PUT /api/users/:id
exports.updateUser = async (req, res, next) => {
  try {
    const ALLOWED_UPDATES = ['name', 'phone'];
    const updates = {};

    Object.keys(req.body).forEach((key) => {
      if (ALLOWED_UPDATES.includes(key)) {
        updates[key] = req.body[key];
      }
    });

    const user = await User.findOneAndUpdate(buildUserQuery(req.params.id), updates, {
      new: true,
      runValidators: true,
    }).select('-password');

    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }
    res.status(200).json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete user
// @route   DELETE /api/users/:id
exports.deleteUser = async (req, res, next) => {
  try {
    const user = await User.findOneAndDelete(buildUserQuery(req.params.id));
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }
    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    next(error);
  }
};
