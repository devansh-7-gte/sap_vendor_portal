const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const invoiceSchema = new Schema({
  id:            { type: String, required: true, unique: true },
  grnId:         { type: String, required: true },
  poId:          { type: String, required: true },
  vendorId:      { type: String, required: true },
  invoiceNumber: { type: String, required: true },
  invoiceDate:   { type: Date, required: true },
  sapMiroDoc:    String,
  status:        { type: String, enum: ['Submitted','Under Review','Match Warning','Approved','Posted in SAP','Cleared'], default: 'Submitted' },
  subTotal:      { type: Number, required: true },
  taxAmount:     { type: Number, required: true },
  totalAmount:   { type: Number, required: true },
  taxCode:       { type: String, default: 'G1' },
  currency:      { type: String, default: 'INR' },
  matchWarning:  String,
  items:         [{
    line: Number,
    materialCode: { type: String, required: true },
    description: String,
    quantity: { type: Number, required: true },
    unitPrice: { type: Number, required: true },
    amount: { type: Number, required: true }
  }],
  postedAt:      Date,
  clearedAt:     Date
}, { timestamps: true });

module.exports = mongoose.model('Invoice', invoiceSchema);
