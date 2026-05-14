const mongoose = require('mongoose');

const barberSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a barber name'],
    trim: true,
  },
  bio: {
    type: String,
  },
  image: {
    type: String,
    default: 'default-barber.jpg',
  },
  specialties: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Service',
  }],
  isActive: {
    type: Boolean,
    default: true,
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('Barber', barberSchema);
