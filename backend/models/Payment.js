const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const paymentSchema = new Schema({
  id:            { type: String, required: true, unique: true },
  invoiceId:     { type: String, required: true },
  poId:          { type: String, required: true },
  vendorId:      { type: String, required: true },
  invoiceRef:    String,
  invoiceNumber: { type: String },
  sapMiroDoc:    { type: String },
  grossAmount:   { type: Number },
  tdsDeducted:   { type: Number, default: 0 },
  netAmount:     { type: Number, required: true },
  paymentDate:   { type: Date, required: true },
  utrCode:       { type: String, required: true },
  paymentMethod: { type: String, enum: ['NEFT','RTGS','IMPS'], default: 'NEFT' },
  sapPaymentDoc: String,
  bankName:      String,
  runId:         String,    // F110 Run ID
  
  // TDS quarterly certificate fields
  fiscalYear:    { type: Number },
  quarter:       { type: String },
  tdsSection:    { type: String },
  deducteePan:   { type: String },
  deductorTan:   { type: String },
  totalTds:      { type: Number }
}, { timestamps: true });

module.exports = mongoose.model('Payment', paymentSchema);
