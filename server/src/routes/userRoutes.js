const express = require('express');
const {
  getUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
} = require('../controllers/userController');
const { protect, authorize } = require('../middlewares/auth');
const { validate, createUserSchema, updateUserSchema } = require('../middlewares/validators');

const router = express.Router();

router.route('/')
  .get(protect, authorize('admin'), getUsers)
  .post(protect, authorize('admin'), validate(createUserSchema), createUser);

router.route('/:id')
  .get(protect, getUser)
  .put(protect, authorize('admin'), validate(updateUserSchema), updateUser)
  .delete(protect, authorize('admin'), deleteUser);

module.exports = router;

