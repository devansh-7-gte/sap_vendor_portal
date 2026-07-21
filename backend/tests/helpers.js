const request = require('supertest');
const jwt = require('jsonwebtoken');
const Vendor = require('../models/Vendor');

const baseVendor = {
  vendorId: 'vendor_test_001',
  password: 'secret123',
  companyName: 'Acme Industries Pvt Ltd',
  gstin: '27AABCB1234F1Z5',
  pan: 'AABCB1234F',
  email: 'acme@example.com',
  phone: '9876543210',
  address: '12 MG Road',
  city: 'Pune',
  state: 'Maharashtra',
  postalCode: '411001',
  bankName: 'HDFC Bank',
  accountNumber: '123456789012',
  ifscCode: 'HDFC0000060',
  accountName: 'Acme Industries Pvt Ltd',
  bankBranch: 'Pune Main'
};

// Registers a vendor through the real API and returns { token, vendor }
const registerVendor = async (app, overrides = {}) => {
  const payload = { ...baseVendor, ...overrides };
  const res = await request(app).post('/api/auth/register').send(payload);
  if (res.status !== 201) {
    throw new Error(`Test vendor registration failed: ${JSON.stringify(res.body)}`);
  }
  return { token: res.body.token, vendor: res.body.vendor, payload };
};

// Creates a vendor with role 'admin' directly via the model (the register
// endpoint intentionally never accepts a client-supplied role) and signs a
// token for it the same way auth.controller.js's generateToken does.
const createAdminVendor = async (overrides = {}) => {
  const vendor = await Vendor.create({
    vendorId: 'vendor_admin_001',
    companyName: 'Portal Admin Ops',
    gstin: '27AABCA9999F1Z1',
    pan: 'AABCA9999F',
    email: 'admin@example.com',
    role: 'admin',
    ...overrides
  });
  const token = jwt.sign(
    { id: vendor._id, vendorId: vendor.vendorId, email: vendor.email },
    process.env.JWT_SECRET || 'secret',
    { expiresIn: '30d' }
  );
  return { token, vendor };
};

module.exports = { baseVendor, registerVendor, createAdminVendor };
