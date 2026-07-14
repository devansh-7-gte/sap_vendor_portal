const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const documentSchema = new Schema({
  vendorId:     { type: String, required: true }, // Clerk user ID or fallback
  fileName:     { type: String, required: true }, // Saved unique file name
  originalName: { type: String, required: true }, // User uploaded file name
  mimeType:     { type: String, required: true },
  size:         { type: Number, required: true }, // in bytes
  filePath:     { type: String, required: true },
  linkedTo:     { type: String, enum: ['ASN', 'RFQ', 'Profile', 'Invoice'], default: 'Profile' }
}, { timestamps: true });

documentSchema.index({ vendorId: 1 });

module.exports = mongoose.model('Document', documentSchema);
