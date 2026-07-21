const jwt = require('jsonwebtoken');
const Vendor = require('../models/Vendor');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');

const protect = asyncHandler(async (req, res, next) => {
  let token;
  
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }
  
  // Dev/test-only fallback: lets local requests authenticate via x-vendor-id
  // instead of a JWT. Inert whenever NODE_ENV=production (checked below), so
  // it must never be treated as a supported production auth path.
  if (!token && process.env.NODE_ENV !== 'production') {
    const fallbackVendorId = req.headers['x-vendor-id'];
    if (fallbackVendorId) {
      const vendor = await Vendor.findOne({ vendorId: fallbackVendorId });
      if (vendor) {
        req.vendor = vendor;
        req.vendorId = vendor.vendorId;
        req.clerkUserId = vendor.vendorId; // backward compatibility
        return next();
      }
    }
  }

  if (!token) {
    return next(ApiError.unauthorized('Not authorized to access this route, token missing'));
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
    
    // Find the vendor by id or vendorId from token payload
    const vendor = await Vendor.findOne({ $or: [{ _id: decoded.id }, { vendorId: decoded.vendorId }] });
    
    if (!vendor) {
      return next(ApiError.unauthorized('Not authorized, vendor not found'));
    }

    req.vendor = vendor;
    req.vendorId = vendor.vendorId;
    req.clerkUserId = vendor.vendorId; // backward compatibility
    next();
  } catch (error) {
    return next(ApiError.unauthorized('Not authorized, invalid token'));
  }
});

// Must run after `protect` — relies on req.vendor being populated
const authorize = (...roles) => (req, res, next) => {
  if (!req.vendor || !roles.includes(req.vendor.role)) {
    return next(ApiError.forbidden('Not authorized for this action'));
  }
  next();
};

module.exports = { protect, authorize };
