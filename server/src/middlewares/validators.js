const Joi = require('joi');

/**
 * Middleware factory to validate req.body against a Joi schema
 */
const validate = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true, // Remove extra fields not specified in schema
    });

    if (error) {
      const errorMessage = error.details.map((detail) => detail.message).join(', ');
      return res.status(400).json({
        success: false,
        error: `Validation Error: ${errorMessage}`,
      });
    }

    // Replace req.body with validated and stripped value
    req.body = value;
    next();
  };
};

// ─── SCHEMAS ─────────────────────────────────────────────────────────────────

const registerSchema = Joi.object({
  name: Joi.string().trim().min(2).max(50).required(),
  email: Joi.string().trim().email().required(),
  password: Joi.string().min(6).max(128).required(),
  phone: Joi.string().trim().allow('', null).optional(),
});

const loginSchema = Joi.object({
  email: Joi.string().trim().email().required(),
  password: Joi.string().required(),
});

const createAppointmentSchema = Joi.object({
  name: Joi.string().trim().min(2).max(50).required(),
  email: Joi.string().trim().email().required(),
  phone: Joi.string().trim().required(),
  date: Joi.string().regex(/^\d{4}-\d{2}-\d{2}$/).required().messages({
    'string.pattern.base': 'Date must be in YYYY-MM-DD format',
  }),
  time: Joi.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/).required().messages({
    'string.pattern.base': 'Time must be in HH:MM (24-hour) format',
  }),
  service: Joi.string().regex(/^[0-9a-fA-F]{24}$/).required().messages({
    'string.pattern.base': 'Invalid Service ID',
  }),
  barber: Joi.string().regex(/^[0-9a-fA-F]{24}$/).required().messages({
    'string.pattern.base': 'Invalid Barber ID',
  }),
  notes: Joi.string().trim().max(500).allow('', null).optional(),
});

const createBarberSchema = Joi.object({
  name: Joi.string().trim().min(2).max(50).required(),
  bio: Joi.string().trim().allow('', null).optional(),
  image: Joi.string().trim().allow('', null).optional(),
  specialties: Joi.array().items(Joi.string().regex(/^[0-9a-fA-F]{24}$/)).optional(),
  isActive: Joi.boolean().optional(),
});

const updateBarberSchema = Joi.object({
  name: Joi.string().trim().min(2).max(50).optional(),
  bio: Joi.string().trim().allow('', null).optional(),
  image: Joi.string().trim().allow('', null).optional(),
  specialties: Joi.array().items(Joi.string().regex(/^[0-9a-fA-F]{24}$/)).optional(),
  isActive: Joi.boolean().optional(),
});

const createServiceSchema = Joi.object({
  name: Joi.string().trim().min(2).max(100).required(),
  description: Joi.string().trim().required(),
  price: Joi.number().min(0).required(),
  duration: Joi.number().integer().min(1).required(),
  image: Joi.string().trim().allow('', null).optional(),
});

const updateServiceSchema = Joi.object({
  name: Joi.string().trim().min(2).max(100).optional(),
  description: Joi.string().trim().optional(),
  price: Joi.number().min(0).optional(),
  duration: Joi.number().integer().min(1).optional(),
  image: Joi.string().trim().allow('', null).optional(),
});

const createUserSchema = Joi.object({
  name: Joi.string().trim().min(2).max(50).required(),
  email: Joi.string().trim().email().required(),
  password: Joi.string().min(6).max(128).required(),
  phone: Joi.string().trim().allow('', null).optional(),
  role: Joi.string().valid('customer', 'admin').optional(),
});

const updateUserSchema = Joi.object({
  name: Joi.string().trim().min(2).max(50).optional(),
  phone: Joi.string().trim().allow('', null).optional(),
});

module.exports = {
  validate,
  registerSchema,
  loginSchema,
  createAppointmentSchema,
  createBarberSchema,
  updateBarberSchema,
  createServiceSchema,
  updateServiceSchema,
  createUserSchema,
  updateUserSchema,
};
