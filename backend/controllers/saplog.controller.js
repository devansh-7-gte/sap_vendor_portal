const SapLog = require('../models/SapLog');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');

// Helper to determine vendor ID from header (for dev) or Clerk auth
const getVendorId = (req) => {
  return req.clerkUserId || req.headers['x-vendor-id'] || 'mock_vendor_id';
};

// @desc    Get SAP log history
// @route   GET /api/logs
// @access  Private
const listSapLogs = asyncHandler(async (req, res, next) => {
  const vendorId = getVendorId(req);
  const { type, status, all } = req.query;

  const query = {};
  if (all !== 'true') {
    query.vendorId = vendorId;
  }

  if (type) {
    query.type = type;
  }

  if (status) {
    query.status = status;
  }

  const logs = await SapLog.find(query)
    .sort({ timestamp: -1 })
    .limit(100);

  res.json(logs);
});

module.exports = {
  listSapLogs
};
