const express = require('express');
const {
  getAppointments,
  getAppointment,
  getMyAppointments,
  createAppointment,
  updateAppointment,
  deleteAppointment,
  cancelAppointment,
} = require('../controllers/appointmentController');
const { protect, authorize } = require('../middlewares/auth');
const { validate, createAppointmentSchema } = require('../middlewares/validators');

const router = express.Router();

router.get('/my', protect, getMyAppointments);

router.route('/')
  .get(protect, authorize('admin'), getAppointments)
  .post(validate(createAppointmentSchema), createAppointment);

router.put('/:id/cancel', protect, cancelAppointment);

router.route('/:id')
  .get(protect, getAppointment)
  .put(protect, authorize('admin'), updateAppointment)
  .delete(protect, authorize('admin'), deleteAppointment);

module.exports = router;

