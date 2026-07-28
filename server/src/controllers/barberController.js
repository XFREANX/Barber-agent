const Barber = require('../models/Barber');

// @desc    Get all barbers
// @route   GET /api/barbers
exports.getBarbers = async (req, res, next) => {
  try {
    const barbers = await Barber.find().populate('specialties');
    res.status(200).json({ success: true, count: barbers.length, data: barbers });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single barber
// @route   GET /api/barbers/:id
exports.getBarber = async (req, res, next) => {
  try {
    const barber = await Barber.findById(req.params.id).populate('specialties');
    if (!barber) {
      return res.status(404).json({ success: false, error: 'Barber not found' });
    }
    res.status(200).json({ success: true, data: barber });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new barber
// @route   POST /api/barbers
exports.createBarber = async (req, res, next) => {
  try {
    const { name, bio, image, specialties, isActive } = req.body;
    const barber = await Barber.create({ name, bio, image, specialties, isActive });
    res.status(201).json({ success: true, data: barber });
  } catch (error) {
    next(error);
  }
};

// @desc    Update barber
// @route   PUT /api/barbers/:id
exports.updateBarber = async (req, res, next) => {
  try {
    const ALLOWED_UPDATES = ['name', 'bio', 'image', 'specialties', 'isActive'];
    const updates = {};

    Object.keys(req.body).forEach((key) => {
      if (ALLOWED_UPDATES.includes(key)) {
        updates[key] = req.body[key];
      }
    });

    const barber = await Barber.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true,
    });
    if (!barber) {
      return res.status(404).json({ success: false, error: 'Barber not found' });
    }
    res.status(200).json({ success: true, data: barber });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete barber
// @route   DELETE /api/barbers/:id
exports.deleteBarber = async (req, res, next) => {
  try {
    const barber = await Barber.findByIdAndDelete(req.params.id);
    if (!barber) {
      return res.status(404).json({ success: false, error: 'Barber not found' });
    }
    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    next(error);
  }
};

