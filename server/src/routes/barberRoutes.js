const express = require('express');
const {
  getBarbers,
  getBarber,
  createBarber,
  updateBarber,
  deleteBarber,
} = require('../controllers/barberController');
const { protect, authorize } = require('../middlewares/auth');

const router = express.Router();

router.route('/')
  .get(getBarbers)
  .post(protect, authorize('admin'), createBarber);

router.route('/:id')
  .get(getBarber)
  .put(protect, authorize('admin'), updateBarber)
  .delete(protect, authorize('admin'), deleteBarber);

module.exports = router;
