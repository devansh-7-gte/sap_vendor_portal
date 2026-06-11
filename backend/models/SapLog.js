const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const sapLogSchema = new Schema({
  vendorId:     { type: String, required: true },    // Clerk user ID
  type:         { type: String, enum: ['BAPI','RFC','OData','IDoc','SYS'], required: true },
  direction:    { type: String, enum: ['OUTBOUND','INBOUND'], required: true },
  name:         { type: String, required: true },    // e.g. 'BAPI_RFQ_CREATE'
  payload:      { type: String },                    // JSON string of BAPI parameters
  status:       { type: String, enum: ['SUCCESS','PENDING','FAILED'], default: 'PENDING' },
  errorMessage: String,
  documentRef:  String,                              // poId, rfqId, invoiceId etc.
  timestamp:    { type: Date, default: Date.now }
});

// TTL index: auto-purge after 30 days
sapLogSchema.index({ timestamp: 1 }, { expireAfterSeconds: 2592000 });
sapLogSchema.index({ vendorId: 1, timestamp: -1 });

module.exports = mongoose.model('SapLog', sapLogSchema);
