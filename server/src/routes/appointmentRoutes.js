const express = require('express');
const {
  getAppointments,
  getAppointment,
  createAppointment,
  updateAppointment,
  deleteAppointment,
} = require('../controllers/appointmentController');
const { protect, authorize } = require('../middlewares/auth');

const router = express.Router();

// POST /api/appointments — public (clients book without account)
// GET/PUT/DELETE — protected (admin management)

router.route('/')
  .get(protect, authorize('admin'), getAppointments)
  .post(createAppointment);

router.route('/:id')
  .get(protect, getAppointment)
  .put(protect, authorize('admin'), updateAppointment)
  .delete(protect, authorize('admin'), deleteAppointment);

module.exports = router;
