const Payment = require('../models/Payment');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');

// @desc    Get Payments
// @route   GET /api/payments
// @access  Public
const getPayments = asyncHandler(async (req, res, next) => {
  const vendorId = req.clerkUserId || req.headers['x-vendor-id'];
  const { page = 1, limit = 10 } = req.query;

  let query = {};
  if (vendorId) {
    query.vendorId = vendorId;
  }

  const skip = (page - 1) * limit;
  const payments = await Payment.find(query)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(Number(limit));

  const total = await Payment.countDocuments(query);

  res.json({
    payments,
    pagination: {
      total,
      page: Number(page),
      limit: Number(limit),
      pages: Math.ceil(total / limit)
    }
  });
});

module.exports = {
  getPayments
};
