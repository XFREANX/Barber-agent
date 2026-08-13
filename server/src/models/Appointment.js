const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
  clientName: {
    type: String,
    required: [true, 'Please provide your name'],
    trim: true,
  },
  clientEmail: {
    type: String,
    required: [true, 'Please provide your email'],
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email'],
  },
  clientPhone: {
    type: String,
    required: [true, 'Please provide your phone number'],
    trim: true,
  },
  barber: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Barber',
    required: [true, 'Please select a barber'],
  },
  service: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Service',
    required: [true, 'Please select a service'],
  },
  date: {
    type: Date,
    required: [true, 'Please provide an appointment date'],
  },
  time: {
    type: String, // e.g., "14:30"
    required: [true, 'Please provide an appointment time'],
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'cancelled', 'completed', 'no-show'],
    default: 'pending',
  },
  totalPrice: {
    type: Number,
  },
  notes: {
    type: String,
    maxlength: [500, 'Notes cannot exceed 500 characters'],
    trim: true,
  },
}, {
  timestamps: true,
});

// Compound index with partial filter — database-level guard against double-booking active appointments.
// Cancelled or completed slots are excluded from the unique constraint so they can be re-booked.
appointmentSchema.index(
  { barber: 1, date: 1, time: 1 },
  { unique: true, partialFilterExpression: { status: { $in: ['pending', 'confirmed'] } } }
);

module.exports = mongoose.model('Appointment', appointmentSchema);

