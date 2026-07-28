const express = require('express');
const {
  getBarbers,
  getBarber,
  createBarber,
  updateBarber,
  deleteBarber,
} = require('../controllers/barberController');
const { protect, authorize } = require('../middlewares/auth');
const { validate, createBarberSchema, updateBarberSchema } = require('../middlewares/validators');

const router = express.Router();

router.route('/')
  .get(getBarbers)
  .post(protect, authorize('admin'), validate(createBarberSchema), createBarber);

router.route('/:id')
  .get(getBarber)
  .put(protect, authorize('admin'), validate(updateBarberSchema), updateBarber)
  .delete(protect, authorize('admin'), deleteBarber);

module.exports = router;

