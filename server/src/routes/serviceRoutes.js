const express = require('express');
const {
  getServices,
  getService,
  createService,
  updateService,
  deleteService,
} = require('../controllers/serviceController');
const { protect, authorize } = require('../middlewares/auth');
const { validate, createServiceSchema, updateServiceSchema } = require('../middlewares/validators');

const router = express.Router();

router.route('/')
  .get(getServices)
  .post(protect, authorize('admin'), validate(createServiceSchema), createService);

router.route('/:id')
  .get(getService)
  .put(protect, authorize('admin'), validate(updateServiceSchema), updateService)
  .delete(protect, authorize('admin'), deleteService);

module.exports = router;

