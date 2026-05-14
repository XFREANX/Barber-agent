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

// VULN-07 FIX (Layer 1): Compound unique index — database-level guard against double-booking.
// Prevents two appointments for the same barber at the same date+time, even under race conditions.
// Only active bookings (pending/confirmed) block a slot — cancelled ones free it up via app logic.
appointmentSchema.index({ barber: 1, date: 1, time: 1 }, { unique: true });

module.exports = mongoose.model('Appointment', appointmentSchema);

