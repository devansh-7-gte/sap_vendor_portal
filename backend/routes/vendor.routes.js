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

// Profile routes
router.get('/profile', getProfile);
router.post('/profile', createProfile);
router.put('/profile', updateProfile);
router.post('/profile/submit', submitRegistration);

// Performance analytics route
router.get('/performance', getPerformance);

// Admin routes
router.get('/', listVendors);
router.put('/:id/approve', approveVendor);
router.put('/:id/reject', rejectVendor);

module.exports = router;
