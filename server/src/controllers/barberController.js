const Barber = require('../models/Barber');

// @desc    Get all barbers
// @route   GET /api/barbers
exports.getBarbers = async (req, res) => {
  try {
    const barbers = await Barber.find().populate('specialties');
    res.status(200).json({ success: true, count: barbers.length, data: barbers });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Get single barber
// @route   GET /api/barbers/:id
exports.getBarber = async (req, res) => {
  try {
    const barber = await Barber.findById(req.params.id).populate('specialties');
    if (!barber) {
      return res.status(404).json({ success: false, error: 'Barber not found' });
    }
    res.status(200).json({ success: true, data: barber });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Create new barber
// @route   POST /api/barbers
exports.createBarber = async (req, res) => {
  try {
    const barber = await Barber.create(req.body);
    res.status(201).json({ success: true, data: barber });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// @desc    Update barber
// @route   PUT /api/barbers/:id
exports.updateBarber = async (req, res) => {
  try {
    const barber = await Barber.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!barber) {
      return res.status(404).json({ success: false, error: 'Barber not found' });
    }
    res.status(200).json({ success: true, data: barber });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// @desc    Delete barber
// @route   DELETE /api/barbers/:id
exports.deleteBarber = async (req, res) => {
  try {
    const barber = await Barber.findByIdAndDelete(req.params.id);
    if (!barber) {
      return res.status(404).json({ success: false, error: 'Barber not found' });
    }
    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
