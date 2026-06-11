const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const asnSchema = new Schema({
  id:                { type: String, required: true, unique: true }, // e.g. 'ASN-826291'
  poId:              { type: String, required: true },               // ref PO.id
  vendorId:          { type: String, required: true },
  status:            { type: String, enum: ['Submitted','In Transit','Received'], default: 'Submitted' },
  shipDate:          { type: Date, required: true },
  estimatedDeliveryDate: { type: Date, required: true },
  carrierName:       String,
  trackingNumber:    String,
  vehicleNumber:     String,
  invoiceReference:  String,
  ewayBillNo:        String,
  sapInboundDelivery:String,
  documentIds:       [{ type: Schema.Types.ObjectId, ref: 'File' }],  // uploaded files (or file documents)
  items:             [{
    line: Number,
    materialCode: { type: String, required: true },
    description: String,
    shippedQuantity: { type: Number, required: true },
    uom: { type: String, default: 'EA' }
  }],
  submittedAt:       { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('ASN', asnSchema);
