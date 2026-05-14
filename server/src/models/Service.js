const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a service name'],
    trim: true,
  },
  description: {
    type: String,
    required: [true, 'Please provide a description'],
  },
  price: {
    type: Number,
    required: [true, 'Please provide a price'],
  },
  duration: {
    type: Number, // in minutes
    required: [true, 'Please provide duration in minutes'],
  },
  image: {
    type: String,
    default: 'default-service.jpg',
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('Service', serviceSchema);
