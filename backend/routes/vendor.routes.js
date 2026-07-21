const router = require('express').Router();
const {
  getProfile,
  createProfile,
  updateProfile,
  submitRegistration,
  approveVendor,
  rejectVendor,
  listVendors,
  getPerformance
} = require('../controllers/vendor.controller');

const validate = require('../middleware/validate');
const { protect, authorize } = require('../middleware/auth');
const {
  profileCreateSchema,
  profileUpdateSchema,
  rejectVendorSchema
} = require('../validators/vendor.validator');

// Profile routes
router.get('/profile', protect, getProfile);
router.post('/profile', validate(profileCreateSchema), createProfile);
router.put('/profile', protect, validate(profileUpdateSchema), updateProfile);
router.post('/profile/submit', protect, submitRegistration);

// Performance analytics route
router.get('/performance', protect, getPerformance);

// Admin routes
router.get('/', protect, authorize('admin'), listVendors);
router.put('/:id/approve', protect, authorize('admin'), approveVendor);
router.put('/:id/reject', protect, authorize('admin'), validate(rejectVendorSchema), rejectVendor);

module.exports = router;
