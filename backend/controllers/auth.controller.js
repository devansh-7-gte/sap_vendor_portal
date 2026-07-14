const Vendor = require('../models/Vendor');
const jwt = require('jsonwebtoken');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');

// Helper to format flat vendor db document to backwards-compatible format with nested objects
const formatVendorResponse = (vendor) => {
  if (!vendor) return null;
  const obj = vendor.toObject ? vendor.toObject({ virtuals: true }) : { ...vendor };
  
  obj.address = {
    street: obj.address || '',
    city: obj.city || '',
    state: obj.state || '',
    pincode: obj.postalCode || '',
    country: 'India'
  };
  
  obj.bankDetails = {
    bankName: obj.bankName || '',
    accountNumber: obj.accountNumber || '',
    ifscCode: obj.ifscCode || '',
    accountName: obj.accountName || '',
    accountHolderName: obj.accountName || '',
    branch: obj.bankBranch || '',
    accountType: 'Current'
  };
  
  return obj;
};

// Generate JWT token helper
const generateToken = (vendor) => {
  return jwt.sign(
    { id: vendor._id, vendorId: vendor.vendorId, email: vendor.email },
    process.env.JWT_SECRET || 'secret',
    { expiresIn: process.env.JWT_EXPIRES_IN || '30d' }
  );
};

// @desc    Register a new vendor
// @route   POST /api/auth/register
// @access  Public
const register = asyncHandler(async (req, res, next) => {
  const { vendorId, password, companyName, gstin, pan, email, phone, address, city, state, postalCode, bankName, accountNumber, ifscCode, accountName, bankBranch } = req.body;

  const existingVendor = await Vendor.findOne({
    $or: [{ vendorId }, { email }, { gstin }]
  });

  if (existingVendor) {
    return next(ApiError.conflict('Vendor with this ID, email, or GSTIN already exists'));
  }

  // Auto-set status for registration
  const defaultStatus = vendorId.startsWith('mock_vendor_') ? 'Pending' : 'Draft';

  const vendor = await Vendor.create({
    vendorId,
    password,
    companyName,
    gstin,
    pan,
    email,
    phone,
    address,
    city,
    state,
    postalCode,
    bankName,
    accountNumber,
    ifscCode,
    accountName,
    bankBranch,
    status: defaultStatus
  });

  const token = generateToken(vendor);
  const formattedVendor = formatVendorResponse(vendor);

  res.status(201).json({
    success: true,
    token,
    vendor: formattedVendor
  });
});

// @desc    Login vendor
// @route   POST /api/auth/login
// @access  Public
const login = asyncHandler(async (req, res, next) => {
  const { vendorIdOrEmail, password } = req.body;

  // Search vendor by email or vendorId
  const vendor = await Vendor.findOne({
    $or: [{ email: vendorIdOrEmail.toLowerCase() }, { vendorId: vendorIdOrEmail }]
  }).select('+password');

  if (!vendor) {
    return next(ApiError.unauthorized('Invalid credentials'));
  }

  const isMatch = await vendor.comparePassword(password);
  if (!isMatch) {
    return next(ApiError.unauthorized('Invalid credentials'));
  }

  const token = generateToken(vendor);
  const formattedVendor = formatVendorResponse(vendor);

  res.json({
    success: true,
    token,
    vendor: formattedVendor
  });
});

// @desc    Get currently logged in vendor profile
// @route   GET /api/auth/me
// @access  Private
const getMe = asyncHandler(async (req, res, next) => {
  res.json({
    success: true,
    vendor: formatVendorResponse(req.vendor)
  });
});

module.exports = {
  register,
  login,
  getMe
};
