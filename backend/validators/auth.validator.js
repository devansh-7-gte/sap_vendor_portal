const { z } = require('zod');

const gstinRegex = /^[0-9]{2}[A-Z0-9]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/i;
const panRegex = /^[A-Z0-9]{5}[0-9]{4}[A-Z]{1}$/i;
const phoneRegex = /^[6-9]\d{9}$/;

const registerSchema = z.object({
  vendorId: z.string().min(3).max(50),
  password: z.string().min(6, { message: "Password must be at least 6 characters long" }),
  companyName: z.string().min(3).max(100),
  gstin: z.string().regex(gstinRegex, { message: "Invalid GSTIN format" }),
  pan: z.string().regex(panRegex, { message: "Invalid PAN format" }),
  email: z.string().email({ message: "Invalid email format" }),
  phone: z.string().regex(phoneRegex, { message: "Invalid phone number format" }).optional().or(z.literal('')),
  
  // Flat address & bank details
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  postalCode: z.string().optional(),
  
  bankName: z.string().optional(),
  accountNumber: z.string().optional(),
  ifscCode: z.string().optional(),
  accountName: z.string().optional(),
  bankBranch: z.string().optional(),
});

const loginSchema = z.object({
  vendorIdOrEmail: z.string().min(1, { message: "Vendor ID or Email is required" }),
  password: z.string().min(1, { message: "Password is required" })
});

module.exports = {
  registerSchema,
  loginSchema
};
