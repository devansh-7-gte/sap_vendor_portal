const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const grnSchema = new Schema({
  id:              { type: String, required: true, unique: true }, // unique, e.g. 'GRN-1800xxxxx'
  poId:            { type: String, required: true },
  asnId:           { type: String, required: true },
  vendorId:        { type: String, required: true },
  sapMigoDoc:      String,
  postingDate:     { type: Date, required: true },
  receivedBy:      String,
  invoiceSubmitted:{ type: Boolean, default: false },
  items: [{
    line: Number,
    materialCode: { type: String, required: true },
    description: String,
    receivedQuantity: { type: Number, required: true },
    acceptedQuantity: { type: Number, required: true },
    rejectedQuantity: { type: Number, default: 0 },
    rejectionReason: String,
    uom: { type: String, default: 'EA' }
  }]
}, { timestamps: true });

grnSchema.virtual('totalAccepted').get(function() {
  return this.items.reduce((sum, item) => sum + item.acceptedQuantity, 0);
});

grnSchema.virtual('rejectionRate').get(function() {
  const totalReceived = this.items.reduce((sum, item) => sum + item.receivedQuantity, 0);
  if (totalReceived === 0) return 0;
  const totalRejected = this.items.reduce((sum, item) => sum + item.rejectedQuantity, 0);
  return (totalRejected / totalReceived) * 100;
});

grnSchema.set('toJSON', { virtuals: true });
grnSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('GRN', grnSchema);
