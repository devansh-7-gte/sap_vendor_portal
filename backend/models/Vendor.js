const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// ⚠️ NO password field — Clerk manages authentication
// ⚠️ clerkId is the link between Clerk user and our MongoDB vendor

const vendorSchema = new Schema({
  clerkId:        { type: String, required: true, unique: true }, // ← Clerk user ID (user_xxxx)
  companyName:    { type: String, required: true, trim: true },
  tradeName:      { type: String, trim: true },
  businessType:   { type: String },
  incorporationDate: { type: String },
  gstin:          { type: String, required: true, unique: true, uppercase: true },
  gstType:        { type: String },
  pan:            { type: String, required: true, uppercase: true },
  cin:            { type: String },
  msmeNumber:     { type: String },
  tdsSection:     { type: String },
  email:          { type: String, required: true, unique: true, lowercase: true },
  phone:          { type: String },
  
  // Flat address properties
  address:        { type: String },
  city:           { type: String },
  state:          { type: String },
  postalCode:     { type: String },

  // Flat banking details
  bankName:       { type: String },
  accountNumber:  { type: String },
  ifscCode:       { type: String },
  accountName:    { type: String },
  bankBranch:     { type: String },

  // Uploaded compliance documents
  cancelledCheque: { type: String },
  panCardCopy:     { type: String },
  gstCertificate:  { type: String },
  incorporationCertificate: { type: String },
  msmeCertificate: { type: String },
  isoCertificate:  { type: String },
  itReturns:       { type: String },

  // SAP ERP synchronization metadata
  sapVendorCode:  { type: String, unique: true, sparse: true }, // e.g. 'VND-40013'
  status:         { type: String, enum: ['Draft', 'Pending', 'Pending Approval', 'Under Review', 'Approved', 'Rejected'], default: 'Draft' },
  rejectionReason:{ type: String },
  vendorCategory: { type: String },
  submittedAt:    { type: Date },
  approvedAt:     { type: Date }
}, { timestamps: true });

// Indexes
vendorSchema.index({ status: 1 });

module.exports = mongoose.model('Vendor', vendorSchema);
