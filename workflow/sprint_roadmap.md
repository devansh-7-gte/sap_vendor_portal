# VendorConnect Portal — Sprint Roadmap (Clerk Auth Edition)
> **8-Week Production Build Plan · June 2026**  
> **Authentication**: Clerk (Phase 3 — Week 3, Day 1–3)  
> **Philosophy**: Ship the entire API first. Add auth in one dedicated sprint. Never mix concerns.

---

## Key Decision: Why Clerk, Why Later?

| Concern | Decision |
|---|---|
| **What Clerk replaces** | All custom JWT code: `bcryptjs`, `jsonwebtoken`, `generateToken.js`, `auth.controller.js`, `auth.routes.js`, `/login` page, `/register` page |
| **What Clerk provides** | Hosted login/register UI · Session management · Social OAuth · MFA · Webhook user sync · `@clerk/express` backend middleware |
| **Why Phase 7, not Phase 1** | Build and test the entire API layer first (open routes), then lock it down with Clerk in a single focused sprint. This avoids constant auth debugging while building business logic. |
| **Backend protection** | `@clerk/express` → `clerkMiddleware()` + `requireAuth()` replace all custom `protect` middleware |
| **User→MongoDB sync** | Clerk Webhooks (via Svix) → `user.created` event → create Vendor document in Atlas |
| **MongoDB schema** | `clerkId: String` (unique) replaces `password: String` on the Vendor model. No passwords stored anywhere. |

---

## Reading This Document

| Symbol | Meaning |
|---|---|
| 📁 | File to create (new) |
| ✏️ | File to modify (edit) |
| 🧪 | Test / verify in browser or terminal |
| ❌ | Do NOT build this — Clerk handles it |
| ⚠️ | Critical — do not skip |

**Stack reminder**:
- Frontend → `a:\sap_vendor_portal\` (Next.js 16, port 3000)  
- Backend → `a:\sap_vendor_portal\backend\` (Express 5, port 5000)  
- Database → MongoDB Atlas (`sap_vendor_portal` DB)  
- Auth → Clerk (Dashboard: `dashboard.clerk.com`)

---

## Phase 1 — Backend Foundation (Week 1)
> **Goal**: Production-quality modular Express backend with all Mongoose models and scaffold.  
> **Auth**: None yet. All routes are open. We add Clerk in Phase 7.

---

### Week 1 · Day 1 — Backend Folder Structure & Middleware Stack

**Objective**: Transform flat `server.js` into a production-quality modular architecture.

#### Folder scaffold to create
```
backend/
├── config/
│   └── db.js                ✅ (exists)
├── middleware/
│   📁 errorHandler.js       ← Global Express error handler
│   📁 rateLimiter.js        ← express-rate-limit presets
│   📁 requestLogger.js      ← Morgan + structured format
├── models/                  ← All Mongoose schemas (Days 2–3)
├── routes/
│   📁 index.js              ← Route aggregator (mounts all sub-routers)
├── controllers/             ← Business logic functions
├── utils/
│   📁 asyncHandler.js       ← try/catch wrapper for async controllers
│   📁 ApiError.js           ← Custom error class with factory methods
│   📁 sapLogger.js          ← SAP payload structured log helper
└── server.js                ✏️ (wire middleware + routes)
```

#### `utils/ApiError.js`
```javascript
class ApiError extends Error {
  constructor(statusCode, message, isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
  }
  static notFound(msg = 'Not found')     { return new ApiError(404, msg); }
  static badRequest(msg)                 { return new ApiError(400, msg); }
  static unauthorized(msg = 'Unauthorized') { return new ApiError(401, msg); }
  static forbidden(msg = 'Forbidden')    { return new ApiError(403, msg); }
  static conflict(msg)                   { return new ApiError(409, msg); }
}
module.exports = ApiError;
```

#### `utils/asyncHandler.js`
```javascript
// Eliminates try/catch boilerplate in every controller function
const asyncHandler = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
module.exports = asyncHandler;
```

#### `middleware/errorHandler.js`
```javascript
// Global error handler — must be last app.use() in server.js
// Catches: all next(err) calls + unhandled promise rejections
// Returns: { success: false, error: message, code: statusCode }
// In dev: also returns stack trace
// Logs every 5xx with full context
```

#### `middleware/rateLimiter.js`
```javascript
// Three presets using express-rate-limit:
// apiLimiter:    100 req / 15 min  → apply to all /api/* routes
// uploadLimiter: 20 req / 10 min   → apply to /api/uploads/*
// webhookLimiter:50 req / 1 min    → apply to /api/webhooks/*
```

#### ✏️ `backend/server.js` — wire it all together
```javascript
const express = require('express');
const cors    = require('cors');
const helmet  = require('helmet');
const morgan  = require('morgan');
const compression = require('compression');
const dotenv  = require('dotenv');
const connectDB = require('./config/db');
const routes    = require('./routes/index');
const { errorHandler } = require('./middleware/errorHandler');
const { apiLimiter }   = require('./middleware/rateLimiter');

dotenv.config();

const app = express();

app.use(helmet({ contentSecurityPolicy: false })); // CSP configured later in Phase 6
app.use(compression());
app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:3000', credentials: true }));
app.use(express.json({ limit: '10kb' }));
app.use(morgan('dev'));
app.use('/api', apiLimiter);
app.use('/api', routes);
app.use(errorHandler);

const startServer = async () => {
  await connectDB();
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
};
startServer();
```

#### 🧪 End of Day Test
```
GET localhost:5000/api/health → { status: "healthy", timestamp: "..." }
Throw an error in a test route → errorHandler returns { success: false, error: "..." }
```

---

### Week 1 · Day 2 — Mongoose Schemas: Vendor + RFQ

**Objective**: Define the two primary entity schemas.

#### `models/Vendor.js`
```javascript
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
  sapVendorCode:  { type: String, unique: true, sparse: true },
  status:         { type: String, enum: ['Draft', 'Pending', 'Pending Approval', 'Under Review', 'Approved', 'Rejected'], default: 'Draft' },
  rejectionReason:{ type: String },
  vendorCategory: { type: String },
  submittedAt:    { type: Date },
  approvedAt:     { type: Date }
}, { timestamps: true });

// Indexes
vendorSchema.index({ status: 1 });
```

#### `models/RFQ.js`
```javascript
const rfqSchema = new Schema({
  id:             { type: String, required: true, unique: true },  // 'RFQ-2026-001'
  description:    { type: String, required: true },
  status:         { type: String, enum: ['Draft','Bidding Open','Submitted','Under Review','Awarded','Closed'], default: 'Bidding Open' },
  deadlineDate:   { type: Date, required: true },
  rfqType:        { type: String, enum: ['AN','AB'], default: 'AN' },
  paymentTerms:   String,
  purchasingOrg:  { type: String, default: '1000' },
  purchasingGroup:String,
  companyCode:    { type: String, default: '1000' },
  currency:       { type: String, default: 'INR' },
  deliveryLocation:String,
  createdDate:    { type: Date, default: Date.now },
  
  items: [{
    line:         { type: Number, required: true },
    materialCode: { type: String, required: true },
    description:  String,
    quantity:     { type: Number, required: true },
    uom:          { type: String, default: 'EA' },
    targetPrice:  Number,
    plant:        { type: String, default: '1000' },
    deliveryDate: Date
  }],
  
  bids: [{
    vendorId:     String,        // Clerk user ID
    vendorDbId:   Schema.Types.ObjectId, // MongoDB Vendor._id
    vendorName:   String,
    unitPrices:   { type: Map, of: Number },  // lineNo → price
    gstRate:      String,
    taxCode:      String,        // G1, G2, G3, G4
    freight:      { type: Number, default: 0 },
    deliveryLeadTimeDays: Number,
    vendorRating: Number,
    technicalScore:{ type: Number, default: 80 },
    validityDate: Date,
    moq:          { type: Number, default: 1 },
    remarks:      String,
    submittedAt:  { type: Date, default: Date.now }
  }],
  
  invitedVendors:[{ id: String, name: String, status: { type: String, default: 'Pending' }, rating: Number }],
  awardedVendorId:  String,
  awardedVendorName:String,
  awardedAt:        Date,
  convertedPoId:    String
}, { timestamps: true });

rfqSchema.index({ status: 1 });
rfqSchema.index({ deadlineDate: 1 });
rfqSchema.index({ 'invitedVendors.id': 1 });
```

#### 🧪 End of Day Test
```
node -e "require('./models/Vendor')" → no schema errors
node -e "require('./models/RFQ')"    → no schema errors
```

---

### Week 1 · Day 3 — Mongoose Schemas: PO → ASN → GRN → Invoice → Payment → SapLog

**Objective**: Define the entire logistics chain schemas.

#### `models/PurchaseOrder.js`
```javascript
{
  id:            String (unique, e.g. 'PO-2026-0081'),
  sapPoNumber:   String,
  vendorId:      String,        // Clerk user ID
  vendorDbId:    ObjectId (ref Vendor),
  buyerName:     String,
  plant:         String,
  paymentTerms:  String,
  currency:      { type: String, default: 'INR' },
  incoterms:     String,
  deliveryAddress:String,
  status:        enum ['Open','Acknowledged','Dispatched','Delivered','Invoiced','Paid'],
  createdDate:   Date,
  acknowledgedAt:Date,
  fromRfqId:     String,
  
  items: [{
    line: Number, materialCode: String, description: String,
    quantity: Number, grnQuantity: { type: Number, default: 0 },
    unitPrice: Number, netValue: Number, uom: String
  }]
}
```

#### `models/ASN.js`
```javascript
{
  id:                String (unique, e.g. 'ASN-826291'),
  poId:              String (ref PO.id),
  vendorId:          String,
  status:            enum ['Submitted','In Transit','Received'],
  shipDate:          Date,
  estimatedDeliveryDate: Date,
  carrierName:       String,
  trackingNumber:    String,
  vehicleNumber:     String,
  invoiceReference:  String,
  ewayBillNo:        String,
  sapInboundDelivery:String,
  documentIds:       [ObjectId],  // uploaded files
  items:             [{ line, materialCode, description, shippedQuantity, uom }],
  submittedAt:       Date
}
```

#### `models/GRN.js`
```javascript
{
  id:              String (unique, e.g. 'GRN-1800xxxxx'),
  poId:            String,
  asnId:           String,
  vendorId:        String,
  sapMigoDoc:      String,
  postingDate:     Date,
  receivedBy:      String,
  invoiceSubmitted:{ type: Boolean, default: false },
  items: [{
    line, materialCode, description,
    receivedQuantity, acceptedQuantity, rejectedQuantity,
    rejectionReason, uom
  }]
}
// Virtuals: totalAccepted, rejectionRate
```

#### `models/Invoice.js`
```javascript
{
  id:            String,
  grnId:         String,
  poId:          String,
  vendorId:      String,
  invoiceNumber: String (required),
  invoiceDate:   Date,
  sapMiroDoc:    String,
  status:        enum ['Submitted','Under Review','Match Warning','Approved','Posted in SAP','Cleared'],
  subTotal:      Number,
  taxAmount:     Number,
  totalAmount:   Number,
  taxCode:       { type: String, default: 'G1' },
  currency:      { type: String, default: 'INR' },
  matchWarning:  String,
  items:         [{ line, materialCode, description, quantity, unitPrice, amount }],
  postedAt:      Date,
  clearedAt:     Date
}
```

#### `models/Payment.js`
```javascript
{
  id:            String,
  invoiceId:     String,
  poId:          String,
  vendorId:      String,
  invoiceRef:    String,
  invoiceNumber: String,
  sapMiroDoc:    String,
  grossAmount:   Number,
  tdsDeducted:   Number,
  netAmount:     Number,
  paymentDate:   Date,
  utrCode:       String,
  paymentMethod: enum ['NEFT','RTGS','IMPS'],
  sapPaymentDoc: String,
  bankName:      String,
  runId:         String,
  fiscalYear:    Number,
  quarter:       String,
  tdsSection:    String,
  deducteePan:   String,
  deductorTan:   String,
  totalTds:      Number
}
```

#### `models/SapLog.js`
```javascript
{
  vendorId:     String,    // Clerk user ID
  type:         enum ['BAPI','RFC','OData','IDoc','SYS'],
  direction:    enum ['OUTBOUND','INBOUND'],
  name:         String,    // e.g. 'BAPI_RFQ_CREATE'
  payload:      String,    // JSON string of BAPI parameters
  status:       enum ['SUCCESS','PENDING','FAILED'],
  errorMessage: String,
  documentRef:  String,    // poId, rfqId, invoiceId etc.
  timestamp:    { type: Date, default: Date.now }
}
// TTL index: auto-purge after 30 days
sapLogSchema.index({ timestamp: 1 }, { expireAfterSeconds: 2592000 });
sapLogSchema.index({ vendorId: 1, timestamp: -1 });
```

#### 🧪 End of Day Test
```
node -e "require('./models/GRN')"     → no errors
node -e "require('./models/Invoice')" → no errors
node -e "require('./models/SapLog')"  → no errors
MongoDB Atlas: all 8 collections appear after first document save
```

---

### Week 1 · Day 4 — Vendor Profile API (No Auth Yet)

**Objective**: Build vendor profile CRUD. Routes are open (no auth middleware yet).

#### `controllers/vendor.controller.js`
```javascript
// All controllers receive req.clerkUserId (set by Clerk middleware in Phase 7)
// For now, use req.headers['x-vendor-id'] as temporary stand-in during development

// getProfile(req, res):
//   → Find Vendor by clerkId (from header or future Clerk middleware)
//   → Return vendor document

// updateProfile(req, res):
//   → Validate: only companyName, phone, address, bankDetails, vendorCategory, msmeRegistered
//   → Update and return

// submitRegistration(req, res):
//   → Set status = 'Under Review', submittedAt = now
//   → Create SapLog: BAPI_VENDOR_CREATE OUTBOUND PENDING
//   → Simulate auto-approval after 5 seconds (setTimeout):
//       Set status = 'Approved'
//       Assign sapVendorCode = 'VND-' + 5-digit random
//       Create SapLog: OData_VENDOR_CONFIRM INBOUND SUCCESS

// getPerformance(req, res):
//   → Aggregate from GRNs: qualityAcceptance = sum(acceptedQty)/sum(receivedQty)
//   → Aggregate from ASNs: deliveryOTIF vs PO delivery dates
//   → Calculate grade (A/B/C/D)
```

#### `routes/vendor.routes.js`
```javascript
// ⚠️ No auth middleware yet — all open routes for development testing
GET  /api/vendors/profile            → getProfile
PUT  /api/vendors/profile            → updateProfile
POST /api/vendors/profile/submit     → submitRegistration
GET  /api/vendors/performance        → getPerformance
GET  /api/vendors                    → listVendors (admin)
PUT  /api/vendors/:id/approve        → approveVendor
PUT  /api/vendors/:id/reject         → rejectVendor
```

#### `routes/index.js`
```javascript
const router = require('express').Router();
router.get('/health', (req, res) => res.json({ status: 'healthy', db: 'connected' }));
router.use('/vendors', require('./vendor.routes'));
// More routes added each day
module.exports = router;
```

#### 🧪 End of Day Test
```
POST /api/vendors/profile with { clerkId, companyName, gstin, pan, email }
  → vendor created in Atlas vendors collection
GET /api/vendors/profile  → profile returned
POST /api/vendors/profile/submit → status = 'Under Review' → 5s later 'Approved'
```

---

### Week 1 · Day 5 — Vendor Profile API: Admin + Performance Aggregation

**Objective**: Admin approval routes + real MongoDB aggregation for performance scores.

#### Add to `controllers/vendor.controller.js`
```javascript
// approveVendor(req, res):
//   → Find vendor, set status = 'Approved', approvedAt = now
//   → Generate sapVendorCode if not exists
//   → Create SapLog: OData_VENDOR_CONFIRM INBOUND SUCCESS

// rejectVendor(req, res):
//   → Set status = 'Rejected', rejectionReason = req.body.reason
//   → Create SapLog: OData_VENDOR_REJECT INBOUND SUCCESS

// listVendors(req, res):
//   → Find all, support ?status= filter
//   → Return with pagination

// getPerformance(req, res):  ← MongoDB Aggregation Pipeline
//   Stage 1: Lookup GRNs for this vendorId
//   Stage 2: $group: { totalReceived: {$sum}, totalAccepted: {$sum} }
//   Stage 3: Calculate qualityAcceptance = totalAccepted/totalReceived * 100
//   Stage 4: Lookup ASNs, compare shipDate vs PO delivery date → OTIF
//   Stage 5: Lookup Invoices, count matchWarnings → invoiceAccuracy
//   Stage 6: Calculate grade based on weighted score
```

#### `utils/sapLogger.js`
```javascript
// Helper used by all controllers:
// createSapLog({ vendorId, type, direction, name, payload, status, documentRef })
// → Creates SapLog document in MongoDB
// → Returns saved log (for response or further processing)

const createSapLog = async ({ vendorId, type, direction, name, payload, status = 'SUCCESS', documentRef = '' }) => {
  const SapLog = require('../models/SapLog');
  return await SapLog.create({
    vendorId, type, direction, name,
    payload: typeof payload === 'object' ? JSON.stringify(payload, null, 2) : payload,
    status, documentRef
  });
};
module.exports = { createSapLog };
```

#### 🧪 End of Day Test
```
PUT /api/vendors/:id/approve → status = 'Approved' in Atlas
GET /api/vendors/performance → returns { deliveryOTIF, qualityAcceptance, grade }
SapLog entries appearing correctly in Atlas saplogs collection
```

---

## Phase 2 — RFQ & PO API Layer (Week 2)
> **Goal**: Full REST API for RFQ lifecycle, Purchase Orders, ASN, GRN, Invoice, and Payment.  
> **Auth**: Still open routes. Clerk protection is added in Phase 7 in one pass.

---

### Week 2 · Day 1 — RFQ API: Create + List + Cancel + Reissue (ME41)

#### `controllers/rfq.controller.js`
```javascript
// Helper: gstToTaxCode(gstRate) → 5%→G3, 12%→G2, 18%→G1, 28%→G4

// getRFQs(req, res):
//   → req.vendorId (from header, later from Clerk)
//   → Find RFQs where invitedVendors.id == vendorId OR all (procurement role)
//   → Support: ?status=Bidding+Open, ?page=1, ?limit=20
//   → Sort by createdDate descending

// getRFQById(req, res):
//   → Find by rfq.id (string field, not ObjectId)

// createRFQ(req, res):
//   → Validate: description, deadlineDate, items[].materialCode + quantity, invitedVendors[]
//   → Generate id: 'RFQ-' + year + '-' + zero-padded sequence (check max existing)
//   → Create RFQ, status = 'Bidding Open'
//   → createSapLog: BAPI_RFQ_CREATE OUTBOUND SUCCESS with EKKO/EKPO structure

// cancelRFQ(req, res):
//   → Find + update status = 'Closed'
//   → createSapLog: RFC_RFQ_CANCEL OUTBOUND SUCCESS

// reissueRFQ(req, res):
//   → Update deadlineDate, status = 'Bidding Open'
//   → createSapLog: RFC_RFQ_REISSUE OUTBOUND SUCCESS
```

#### `routes/rfq.routes.js`
```javascript
GET    /api/rfqs              → getRFQs
GET    /api/rfqs/:id          → getRFQById
POST   /api/rfqs              → createRFQ
PUT    /api/rfqs/:id/cancel   → cancelRFQ
PUT    /api/rfqs/:id/reissue  → reissueRFQ
```

#### 🧪 End of Day Test
```
POST /api/rfqs with full body → RFQ-2026-001 in Atlas
GET /api/rfqs?status=Bidding+Open → returns array
PUT /api/rfqs/RFQ-2026-001/cancel → status = 'Closed'
```

---

### Week 2 · Day 2 — RFQ Bid + Award (ME47, ME48, ME58)

#### `controllers/rfq.controller.js` additions
```javascript
// submitBid(req, res):
//   Validations:
//   → RFQ must be 'Bidding Open'
//   → deadlineDate must not have passed
//   → vendorId must be in invitedVendors[]
//   → unitPrices must have a value for each item.line
//
//   Logic:
//   → Map gstRate → taxCode via gstToTaxCode()
//   → Push bid into rfq.bids[] (or replace if same vendorId already bid)
//   → Set rfq.status = 'Submitted' (if first bid) or keep current
//   → createSapLog: RFC_RFQ_SUBMIT_BID OUTBOUND SUCCESS
//     payload: { EBELN, LIFNR, NETPR map, MWSKZ, PLIFZ, BNDDT }

// getEvaluationMatrix(req, res):
//   → Scoring formula (identical to current RfqView.js ME48 logic):
//     priceScore    = (lowestTotalCost / vendorTotalCost) × 100
//     deliveryScore = (shortestLeadTime / vendorLeadTime) × 100
//     weightedScore = priceScore×0.40 + techScore×0.30 + deliveryScore×0.20 + rating×0.10
//   → Sort vendors by weightedScore desc
//   → Return ranked matrix

// awardBid(req, res):
//   → Validate rfq.status !== 'Awarded'
//   → Find winning bid by vendorId
//   → Set rfq.status = 'Awarded', rfq.awardedVendorId, rfq.awardedAt
//   → Auto-create PurchaseOrder:
//       id: 'PO-' + year + '-' + sequence
//       items from rfq.items + prices from winning bid
//       vendorId, status = 'Open'
//   → Set rfq.convertedPoId = po.id
//   → createSapLog: BAPI_INFORECORD_CREATE OUTBOUND SUCCESS
//   → createSapLog: OData_PO_INBOUND_SYNC INBOUND SUCCESS (simulates SAP pushing PO)
```

#### `routes/rfq.routes.js` additions
```javascript
POST   /api/rfqs/:id/bid       → submitBid
GET    /api/rfqs/:id/evaluate  → getEvaluationMatrix
POST   /api/rfqs/:id/award     → awardBid
```

#### 🧪 End of Day Test
```
POST /api/rfqs/RFQ-2026-001/bid with { unitPrices, gstRate, deliveryLeadTimeDays }
  → bid appears in rfqs[].bids[] in Atlas
GET /api/rfqs/RFQ-2026-001/evaluate → sorted scoring matrix returned
POST /api/rfqs/RFQ-2026-001/award with { vendorId }
  → rfq.status = 'Awarded', new PO appears in purchaseOrders collection
```

---

### Week 2 · Day 3 — Purchase Order API (List, Acknowledge, Simulate)

#### `controllers/po.controller.js`
```javascript
// getPOs(req, res):
//   → Find POs where vendorId = req.vendorId
//   → Query: ?status=Open, ?page=1, ?limit=10
//   → Return with total count

// getPOById(req, res):
//   → Find by po.id (string), verify vendorId matches

// acknowledgePO(req, res):
//   → Validate status = 'Open'
//   → Set status = 'Acknowledged', acknowledgedAt = now
//   → createSapLog: RFC_PO_ACKNOWLEDGE OUTBOUND SUCCESS

// simulatePO(req, res):
//   → Generate new PO with random material from masterlist
//   → Items: random material, qty 100-2000, unit price 50-5000
//   → Create PO document, status = 'Open'
//   → createSapLog: OData_ME21N_PO_INBOUND INBOUND SUCCESS
//   → Emit Socket.io 'po:new' (Phase 4)
```

#### `routes/po.routes.js`
```javascript
GET    /api/pos                  → getPOs
GET    /api/pos/:id              → getPOById
PUT    /api/pos/:id/acknowledge  → acknowledgePO
POST   /api/pos/simulate         → simulatePO
```

#### 🧪 End of Day Test
```
GET /api/pos?status=Open → returns open POs
PUT /api/pos/PO-2026-0001/acknowledge → status = 'Acknowledged' in Atlas
POST /api/pos/simulate → new PO created in Atlas
```

---

### Week 2 · Day 4 — ASN API + Auto GRN

#### `controllers/po.controller.js` additions
```javascript
// submitASN(req, res):
//   → Validate PO status = 'Acknowledged'
//   → Validate each item: shippedQuantity > 0, ≤ (quantity - grnQuantity)
//   → Create ASN document
//   → Update PO status = 'Dispatched'
//   → createSapLog: BAPI_DELIVERY_CREATE_DN OUTBOUND SUCCESS
//     payload: { LIKP: { WADAT, TDLNR, LIFEX }, LIPS items }
//   → Schedule autoCreateGRN after 10 seconds

// autoCreateGRN (internal, not a route):
//   → Create GRN document:
//       For each item: receivedQty = shippedQty
//       acceptedQty = Math.round(shippedQty * 0.95)  // 95% acceptance
//       rejectedQty = shippedQty - acceptedQty
//   → sapMigoDoc = 'MIGO-18' + 9-digit number
//   → Update PO status = 'Delivered'
//   → Update ASN status = 'Received'
//   → Update all PO items: grnQuantity += acceptedQty
//   → createSapLog: MBGMCR03_GRN_IDoc INBOUND SUCCESS
//   → Emit Socket.io 'grn:received' (Phase 4)
```

#### Add to `routes/po.routes.js` + new GRN route file
```javascript
POST   /api/pos/:id/asn    → submitASN
GET    /api/pos/:id/asn    → getASNForPO
GET    /api/grns           → getGRNs
GET    /api/grns/:id       → getGRNById
```

#### 🧪 End of Day Test
```
POST /api/pos/PO-2026-0001/asn with carrier + items
  → ASN created, PO status = 'Dispatched'
Wait 10 seconds → GRN appears in Atlas, PO status = 'Delivered'
GET /api/grns → GRN with acceptedQuantity
```

---

### Week 2 · Day 5 — Invoice API + F110 Auto-Payment

#### `controllers/invoice.controller.js`
```javascript
// getInvoices(req, res):
//   → Find invoices by vendorId, support ?status= filter

// submitInvoice(req, res):
//   → Validate GRN exists + grn.invoiceSubmitted = false
//   → 3-Way Match check:
//       For each line: |GRN.acceptedQty - Invoice.qty| / GRN.acceptedQty > 0.02
//       → matchWarning = 'Line X: qty variance detected'
//   → Create Invoice (status: matchWarning ? 'Match Warning' : 'Submitted')
//   → sapMiroDoc = 'MIRO-51' + 9-digit random
//   → Mark grn.invoiceSubmitted = true
//   → Update PO status = 'Invoiced'
//   → createSapLog: BAPI_INCOMINGINVOICE_CREATE OUTBOUND SUCCESS
//   → Schedule autoPaymentRun after 12 seconds

// autoPaymentRun (internal):
//   → tdsDeducted = totalAmount × 0.01
//   → netAmount   = totalAmount - tdsDeducted
//   → Create Payment: { utrCode: 'UTR' + Date.now(), paymentMethod: 'NEFT', ... }
//   → Update invoice.status = 'Cleared'
//   → Update PO status = 'Paid'
//   → createSapLog: PAYEXT_F110_PAYMENT INBOUND SUCCESS
//   → Emit Socket.io 'payment:cleared' (Phase 4)
```

#### `routes/invoice.routes.js` + `routes/payment.routes.js`
```javascript
GET  /api/invoices       → getInvoices
GET  /api/invoices/:id   → getInvoiceById
POST /api/invoices        → submitInvoice
GET  /api/payments        → getPayments
```

#### 🧪 End of Day Test
```
POST /api/invoices with { grnId, invoiceNumber, invoiceDate, items }
  → invoice created, grn.invoiceSubmitted = true
Wait 12 seconds → payment in Atlas, invoice.status = 'Cleared'
GET /api/payments → payment with utrCode
Full P2P flow: RFQ → Bid → Award → PO → Acknowledge → ASN → GRN → Invoice → Payment ✅
```

---

## Phase 3 — Real-Time with Socket.io (Week 3)
> **Goal**: Live push events — GRN received, payment cleared, new PO, chat messages. Zero polling.

---

### Week 3 · Day 1 — Socket.io Server (Rooms configured with developer fallback headers; secured in Week 7)

#### ✏️ `backend/server.js`
```javascript
const http   = require('http');
const { Server } = require('socket.io');
const { createClerkClient } = require('@clerk/express');

const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: process.env.FRONTEND_URL, credentials: true }
});

const clerkClient = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY });

io.use(async (socket, next) => {
  // For Week 3 (pre-auth), socket connections use x-vendor-id fallback (locked down in Week 7)
  const token = socket.handshake.auth.token;
  if (!token) return next(new Error('No token'));
  
  try {
    const { sub: clerkUserId } = await clerkClient.verifyToken(token);
    socket.clerkUserId = clerkUserId;
    next();
  } catch (err) {
    next(new Error('Invalid token'));
  }
});

io.on('connection', (socket) => {
  // Vendor joins their own private room (clerkUserId as room name)
  socket.join(socket.clerkUserId);
  
  socket.on('join_procurement_room', () => socket.join('procurement'));
  socket.on('disconnect', () => { /* cleanup */ });
});

// Export io for use in controllers
app.set('io', io);

// Change server.listen (not app.listen)
server.listen(PORT);
```

#### 📁 `utils/socketEmitter.js`
```javascript
const EVENTS = {
  PO_NEW:           'po:new',
  GRN_RECEIVED:     'grn:received',
  PAYMENT_CLEARED:  'payment:cleared',
  RFQ_AWARDED:      'rfq:awarded',
  BID_RECEIVED:     'rfq:bid_received',
  CHAT_MESSAGE:     'chat:message',
  VENDOR_APPROVED:  'vendor:approved',
  LOG_NEW:          'log:new',
};

// Emit to a specific vendor's room
const emitToVendor = (io, clerkUserId, event, data) =>
  io.to(clerkUserId).emit(event, data);

// Emit to all procurement staff
const emitToProcurement = (io, event, data) =>
  io.to('procurement').emit(event, data);

module.exports = { EVENTS, emitToVendor, emitToProcurement };
```

#### Add Socket.io emits to existing controllers
```javascript
// In autoCreateGRN (po.controller.js):
const io = req.app.get('io');
emitToVendor(io, vendorClerkId, EVENTS.GRN_RECEIVED, { grnId, poId, acceptedQuantity });

// In autoPaymentRun (invoice.controller.js):
emitToVendor(io, vendorClerkId, EVENTS.PAYMENT_CLEARED, { utrCode, netAmount, invoiceId });

// In simulatePO (po.controller.js):
emitToVendor(io, vendorClerkId, EVENTS.PO_NEW, { poId, totalValue });
```

#### 🧪 End of Day Test
```
Open portal → check Network tab → WebSocket connection established
Submit ASN → 10s later → GRN event received in browser WebSocket frame
```

---

### Week 3 · Day 2 — Socket.io Client (Frontend)

#### 📁 `src/lib/socket.js`
```javascript
import { io } from 'socket.io-client';
// Install: npm install socket.io-client

let socket = null;

export const initSocket = (clerkToken) => {
  if (socket?.connected) return socket;
  
  socket = io(process.env.NEXT_PUBLIC_API_URL, {
    auth: { token: clerkToken },  // Clerk token for socket auth
    transports: ['websocket'],
    reconnectionAttempts: 5,
  });
  
  return socket;
};

export const getSocket   = () => socket;
export const closeSocket = () => { socket?.disconnect(); socket = null; };
```

#### ✏️ `src/lib/store-context.js` — socket event handlers
```javascript
// After sign-in and data load:
useEffect(() => {
  if (!isSignedIn || !dataLoaded) return;
  
  let cleanupFn;
  
  const setup = async () => {
    const token = await getToken();
    const socket = initSocket(token);
    
    socket.on('grn:received', async (data) => {
      const [grns, pos] = await Promise.all([grnApi.list(getToken), poApi.list({}, getToken)]);
      setState(prev => ({ ...prev, grns, pos }));
      showToast(`GRN received for ${data.poId}. Stores accepted your goods.`, 'success');
    });
    
    socket.on('payment:cleared', async (data) => {
      const [payments, invoices] = await Promise.all([paymentApi.list(getToken), invoiceApi.list(getToken)]);
      setState(prev => ({ ...prev, payments, invoices }));
      showToast(`Payment cleared! UTR: ${data.utrCode} · Net: ₹${data.netAmount.toLocaleString()}`, 'success');
    });
    
    socket.on('po:new', async () => {
      const pos = await poApi.list({}, getToken);
      setState(prev => ({ ...prev, pos }));
      showToast('New Purchase Order received from SAP!', 'info');
    });
    
    socket.on('vendor:approved', async () => {
      const profile = await vendorApi.getProfile(getToken);
      setState(prev => ({ ...prev, profile }));
      showToast('Your vendor registration has been approved!', 'success');
    });
    
    socket.on('log:new', async () => {
      const logs = await sapLogApi.list(getToken);
      setState(prev => ({ ...prev, logs }));
    });
    
    cleanupFn = () => socket.off();
  };
  
  setup();
  return () => cleanupFn?.();
}, [isSignedIn, dataLoaded]);
```

#### 📁 `src/components/portal/ToastNotification.js`
```javascript
// Fixed position: bottom-right
// Types: success(green), info(blue), warning(amber), error(red)
// Auto-dismiss: 5 seconds
// Max 3 visible (queue the rest)
// Slide-in animation from right
// Stone color system matches existing design
```

#### 🧪 End of Day Test
```
Submit ASN → wait 10 seconds → toast: "GRN received!" WITHOUT page refresh
Post invoice → wait 12 seconds → toast: "Payment cleared! UTR: UTR..." WITHOUT refresh
All SapLog entries appear in BapiConsole in real-time
```

---

### Week 3 · Day 3 — Real-Time Chat via Socket.io

#### ✏️ `controllers/chat.controller.js` — add socket emit
```javascript
// sendMessage:
//   → Create message in DB
//   → Emit 'chat:message' to vendor's room immediately:
//       emitToVendor(io, vendorClerkId, EVENTS.CHAT_MESSAGE, savedMessage)
//   → Generate auto-reply after 2s:
//       emitToVendor(io, vendorClerkId, EVENTS.CHAT_MESSAGE, replyMessage)
```

#### ✏️ `src/components/portal/ChatsView.js`
```javascript
// Replace setTimeout polling with Socket.io listener:
// socket.on('chat:message', (msg) => {
//   setChatMessages(prev => [...prev, msg])
//   scrollToBottom()
// })
// 
// Unread badge on Sidebar 'Communications' link:
//   Count messages since last active tab switch
```

#### 🧪 End of Day Test
```
Send message → appears immediately (optimistic update)
2 seconds later → buyer reply slides in via WebSocket (no polling)
```

---

### Week 3 · Day 4 — File Upload System

#### 📁 `middleware/upload.js`
```javascript
// Multer diskStorage:
//   destination: backend/uploads/{vendorId}/
//   filename: Date.now() + '_' + sanitize(originalname)
//
// File filter:
//   Allowed MIME types: pdf, doc, docx, jpg, jpeg, png, xlsx
//   Reject all others → 400 error
//
// Size limits:
//   Document: 10 MB
//   Image: 5 MB
```

#### `models/Document.js` + `controllers/upload.controller.js`
```javascript
// uploadFile(req, res):
//   → multer processes file
//   → Create Document in MongoDB: { vendorId, filename, originalName, mimeType, size, path, linkedTo }
//   → Return { documentId, url: /api/uploads/:id }
//
// downloadFile(req, res):
//   → Find Document, verify vendorId === req.clerkUserId
//   → Stream file to response with Content-Disposition: attachment
//
// listDocuments(req, res):
//   → Find docs by vendorId + optional linkedTo filter
```

#### 📁 `src/components/shared/FileUploadZone.js`
```javascript
// Drag-and-drop zone with:
//   - Client-side type + size validation (before upload)
//   - Progress indicator on upload
//   - File name + size display after upload
//   - Remove button (DELETE /api/uploads/:id)
//   - onUploadComplete(documentId) callback
```

#### ✏️ Wire into ASN form + Quotation form
```javascript
// PurchaseOrdersView.js ASN form:
//   packingList, invoiceCopy, transportDoc → each use <FileUploadZone>
//   documentIds[] collected → sent in ASN payload

// RfqView.js ME47 quotation:
//   technicalDocs → <FileUploadZone multiple>
//   documentIds[] → sent in bid payload
```

#### 🧪 End of Day Test
```
Drag PDF into ASN upload zone → file saved to backend/uploads/
Document record in Atlas documents collection
Submit ASN → ASN.documentIds populated with MongoDB ObjectIds
Download file → GET /api/uploads/:id → file streams to browser
Upload .exe → 400 "File type not permitted"
Upload 15MB PDF → 400 "File too large"
```

---

### Week 3 · Day 5 — PDF Report Generation

#### Install PDFKit
```bash
cd backend && npm install pdfkit
```

#### `controllers/reports.controller.js`
```javascript
// generateStatement(req, res):
//   → Fetch vendor's payments (last 3 months)
//   → Build PDF:
//       Header: "VendorConnect Portal — Account Statement"
//       Vendor: companyName, GSTIN, sapVendorCode
//       Period: Q1 FY 2026-27
//       Table: UTR | Invoice | Gross Amt | TDS (1%) | Net Received | Date | Method
//       Footer: Total Paid, Total TDS, NEFT/RTGS breakdown
//   → Stream to response: Content-Disposition: attachment; filename="statement-2026.pdf"
//
// generateInvoicePDF(req, res):
//   → Fetch invoice + PO + vendor details
//   → GST Invoice format:
//       Seller: vendor GSTIN, PAN, address
//       Buyer:  company code 1000, plant address
//       Items: HSN code, quantity, unit, rate, CGST+SGST (or IGST)
//       Amount in words
//       Digital note: "Submitted via VendorConnect Portal"
```

#### Wire download buttons in frontend
```javascript
// DashboardView.js "Download Statement" button:
//   Before: onClick={() => setActiveTab('payments')}  // placeholder
//   After:  window.open(`${API_BASE}/api/reports/statement?token=${clerkToken}`, '_blank')
//
// PaymentsView.js "Download Advice" button → same
// InvoicesView.js row download → /api/reports/invoice/:id
```

#### 🧪 End of Day Test
```
Click "Download Statement" → PDF downloads with payment data + TDS breakdown
Invoice PDF has correct CGST+SGST split for INR amounts
PDF filename: "statement-Q1-2026.pdf"
```

---

## Phase 4 — Frontend Migration Completion (Completed Ahead of Schedule)
> **Goal**: Transition monolithic client state (`store-context.js`) to decoupled, feature-based modules and custom React hooks under `src/features/...` (complete with loading states and api-client integrations).

---

### Week 4 · Day 1 — Migrate: PO + ASN + GRN Actions (Completed)

#### ✏️ `src/features/purchase-order/hooks/usePOs.js`
```javascript
// submitASN(asnData):
//   await poApi.submitASN(asnData.id, { ...asnData }, getToken)
//   const pos = await poApi.list({}, getToken)
//   setState(prev => ({ ...prev, pos }))
//   // GRN will arrive via Socket.io (Phase 5) → refreshGRNs()

// simulateIncomingPO():
//   await poApi.simulate(getToken)
//   const pos = await poApi.list({}, getToken)
//   setState(prev => ({ ...prev, pos }))
```

#### Add loading states to PurchaseOrdersView.js
```javascript
// isLoading flag: show skeleton loader while fetching
// error state: show retry button if API call fails
// Optimistic update: immediately add item to list, revert on API error
```

#### 🧪 End of Day Test
```
Acknowledge PO in UI → PO status updates without page refresh
Submit ASN → PO moves to "ASN Submitted" status in UI + Atlas
Simulate PO button → new PO appears in list
```

---

### Week 4 · Day 2 — Migrate: Invoice + Payment Actions (Completed)

#### ✏️ `src/features/billing/hooks/useInvoices.js` & `src/features/payments/hooks/usePayments.js`
```javascript
// submitInvoice(invoiceData):
//   await invoiceApi.submit(invoiceData, getToken)
//   const [invoices, grns] = await Promise.all([
//     invoiceApi.list(getToken), grnApi.list(getToken)
//   ])
//   setState(prev => ({ ...prev, invoices, grns }))
//   // Payment will arrive via Socket.io (Phase 5)
```

#### ✏️ `src/features/billing/components/InvoiceProcessingView.js`
```javascript
// Wire submit button to feature hook actions
// Show loading spinner during MIRO posting simulation (1.5s)
// Show success state: "MIRO document posted. Payment processing..."
// Error state: "3-Way Match Warning detected" — keep as is
```

#### 🧪 End of Day Test
```
Post invoice from UI → invoice in Atlas with status 'Submitted'
Wait 12 seconds → payment in Atlas, invoice status 'Cleared'
Payment appears in PaymentsView without browser refresh (polling for now, real-time in Phase 5)
```

---

### Week 4 · Day 3 — Global Loading Skeleton + Error Boundaries

**Objective**: Professional loading states across all views.

#### 📁 `src/components/shared/SkeletonLoader.js`
```javascript
// Variants:
//   <SkeletonLoader type="table" rows={5} cols={6} />
//   <SkeletonLoader type="card" count={4} />
//   <SkeletonLoader type="list" rows={8} />
//
// Animated pulse effect matching existing stone color palette
// Used in: RfqView, PurchaseOrdersView, DashboardView while data loads
```

#### 📁 `src/components/ErrorBoundary.js`
```javascript
// React class component error boundary
// Catches: unhandled JS errors in component tree
// Shows: clean error card with "Refresh" button
// Logs: error to console (dev only)
// Wrap all major views in <ErrorBoundary>
```

#### ✏️ All views: add `dataLoaded` check
```javascript
// Before rendering table content:
if (!dataLoaded) return <SkeletonLoader type="table" rows={5} cols={6} />;
if (error) return <ErrorCard message={error} onRetry={loadAllData} />;
```

#### 🧪 End of Day Test
```
Slow network → skeleton loader shows during data fetch
Throw JS error in DashboardView → ErrorBoundary catches → clean error card shows
```

---

### Week 4 · Day 4 — BapiConsole: Live Logs + Performance Scorecard (Completed)

#### API route for logs
```javascript
GET /api/logs → saplog.controller.js → list SapLogs for req.vendor.clerkId
               Sort: timestamp desc, limit: 50
               Support: ?type=BAPI, ?status=FAILED
```

#### ✏️ `src/lib/shell-context.js` & `src/features/dashboard/hooks/useDashboard.js`
```javascript
// refreshLogs() inside shell-context.js:
//   const logs = await sapLogApi.list(getToken)
//   setSapPayloadLogs(logs)
//
// Called: on initial load + after each business action
```

#### ✏️ `src/features/dashboard/components/PerformanceView.js`
```javascript
// Replace hardcoded values with:
// useEffect → vendorApi.getPerformance(getToken)
//           → set performanceData in useDashboard
// Show loading skeleton while calculating
// Real OTIF + quality + invoice accuracy from MongoDB aggregation
```

#### 🧪 End of Day Test
```
Submit a bid → BAPI Console immediately shows RFC_RFQ_SUBMIT_BID log
SapLog entry exists in Atlas with correct payload
PerformanceView shows calculated OTIF from actual GRN data
```

---

### Week 4 · Day 5 — Communications (Chat) API + View (Completed)

#### `models/ChatMessage.js` (📁 new)
```javascript
{
  vendorId:    String (Clerk ID),
  sender:      enum ['Vendor','Buyer','System','Finance','Quality','Warehouse'],
  message:     { type: String, maxlength: 1000 },
  linkedPoId:  String,
  linkedRfqId: String,
  timestamp:   { type: Date, default: Date.now },
  isRead:      { type: Boolean, default: false }
}
Index: { vendorId: 1, timestamp: 1 }
```

#### `controllers/chat.controller.js`
```javascript
// getMessages: Find by vendorId, sort asc, mark as read
// sendMessage:
//   → Create message (sender: 'Vendor')
//   → Auto-reply after 2s: keyword-based smart reply
//     'price'/'tax'/'gst' → "Tax code G1 (18% GST) applies..."
//     'delivery'/'delay' → "Please ensure dispatch qty matches remaining..."
//     'reject'/'quality' → "Quality failures require signed inspection sheet..."
//     default → "We have updated the records in SAP. Let us know if you need anything."
```

#### ✏️ `src/features/dashboard/components/ChatsView.js`
```javascript
// Load messages inside useDashboard: chatApi.list(getToken)
// Send inside useDashboard: chatApi.send(message, getToken) → optimistic update
// Auto-reply arrives via Socket.io in Phase 5
// For now: setTimeout 2s → refresh messages
```

#### 🧪 End of Day Test
```
Type message → appears immediately (optimistic)
2 seconds later → buyer auto-reply appears
Messages persist after page refresh
```

---

## Phase 5 — Security Hardening (Week 5)
> **Note**: Clerk has already handled authentication security. This phase covers input validation,  
> API security, HTTP headers, secrets management, and logging.

---

### Week 5 · Day 1 — Zod Input Validation

#### Install
```bash
cd backend && npm install zod
```

#### 📁 `validators/` directory
```javascript
// rfq.validator.js:
const rfqCreateSchema = z.object({
  description:     z.string().min(5).max(200),
  deadlineDate:    z.string().datetime(),
  items:           z.array(z.object({
    materialCode:  z.string().min(1),
    quantity:      z.number().positive(),
    uom:           z.string().optional()
  })).min(1),
  invitedVendors:  z.array(z.object({ id: z.string() })).min(1)
});

// bid.validator.js:
const bidSchema = z.object({
  unitPrices:          z.record(z.string(), z.number().positive()),
  gstRate:             z.enum(['5%','12%','18%','28%']),
  deliveryLeadTimeDays:z.number().int().positive(),
  validityDate:        z.string().datetime(),
  freight:             z.number().min(0).optional(),
});

// vendor.validator.js:
const profileSchema = z.object({
  companyName:  z.string().min(3).max(100),
  gstin:        z.string().regex(/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/),
  pan:          z.string().regex(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/),
  phone:        z.string().regex(/^[6-9]\d{9}$/).optional(),
});

// invoice.validator.js, asn.validator.js — similar patterns
```

#### 📁 `middleware/validate.js`
```javascript
// Generic Zod middleware:
const validate = (schema) => (req, res, next) => {
  const result = schema.safeParse(req.body);
  if (!result.success) {
    const errors = result.error.errors.reduce((acc, e) => {
      acc[e.path.join('.')] = e.message;
      return acc;
    }, {});
    return res.status(400).json({ success: false, errors });
  }
  req.body = result.data; // use coerced/cleaned data
  next();
};
```

#### 🧪 End of Day Test
```
POST /api/rfqs with invalid GSTIN in invitedVendors → { errors: { "invitedVendors.0.id": "..." } }
POST /api/rfqs/:id/bid with negative price → { errors: { "unitPrices.10": "Expected positive..." } }
Valid request → passes to controller unchanged
```

---

### Week 5 · Day 2 — API Security Hardening

#### Install
```bash
cd backend && npm install express-mongo-sanitize hpp
```

#### ✏️ `backend/server.js`
```javascript
const mongoSanitize = require('express-mongo-sanitize');
const hpp = require('hpp');

// Prevent NoSQL injection (strips $ and . from query strings)
app.use(mongoSanitize());

// Prevent HTTP Parameter Pollution
app.use(hpp());

// Limit JSON body to 10KB (except upload routes)
app.use('/api', (req, res, next) => {
  if (req.path.startsWith('/uploads')) return next();
  express.json({ limit: '10kb' })(req, res, next);
});

// Helmet hardening (CSP, HSTS, etc.)
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc:  ["'self'"],
      scriptSrc:   ["'self'"],
      styleSrc:    ["'self'", "'unsafe-inline'"],
      connectSrc:  ["'self'", process.env.FRONTEND_URL, 'https://clerk.*.com'],
      frameAncestors: ["'none'"],
    }
  },
  hsts: { maxAge: 31536000, includeSubDomains: true }
}));
```

#### CORS tightening
```javascript
const allowedOrigins = (process.env.ALLOWED_ORIGINS || 'http://localhost:3000').split(',');
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) callback(null, true);
    else callback(new ApiError(403, 'CORS policy violation'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
```

#### 🧪 End of Day Test
```
Try MongoDB injection: { "vendorId": { "$gt": "" } } → 400 sanitized
Check response headers → X-Frame-Options, X-Content-Type-Options present
Try CORS from unknown origin → 403 CORS policy violation
```

---

### Week 5 · Day 3 — Winston Structured Logging

#### Install
```bash
cd backend && npm install winston winston-daily-rotate-file
```

#### 📁 `utils/logger.js`
```javascript
// Console transport (development): colorized, aligned
// DailyRotateFile (production):
//   combined.log: all levels, JSON format, 14-day retention, 20MB max
//   error.log:    errors only
//   Compressed archives after rotation
//
// Always include: timestamp, level, requestId, method, url
// Never log: Clerk tokens, MongoDB URI, passwords
// Request ID: uuid per request → propagated through req.requestId
```

#### ✏️ `middleware/requestLogger.js`
```javascript
// Replace morgan with Winston HTTP logging:
// Log format: { requestId, method, url, statusCode, responseTime, ip }
// Attach requestId to req → include in all error responses
// Log 4xx/5xx request body (sanitized — remove passwords/tokens)
```

#### 🧪 End of Day Test
```
Make API calls → logs appear in backend/logs/combined.log as JSON
5xx error → appears in error.log with stack trace
Each log line has requestId
```

---

### Week 5 · Day 4 — Environment + Secrets Validation

#### 📁 `config/validateEnv.js`
```javascript
const required = [
  'PORT', 'MONGO_URI', 'FRONTEND_URL',
  'CLERK_SECRET_KEY', 'CLERK_PUBLISHABLE_KEY', 'CLERK_WEBHOOK_SIGNING_SECRET'
];
// ❌ No JWT secrets needed — Clerk handles all tokens

required.forEach(key => {
  if (!process.env[key]) {
    console.error(`❌ Missing required environment variable: ${key}`);
    process.exit(1);
  }
});
```

#### Environment file structure
```
backend/
  .env              ← Active env (gitignored)
  .env.example      ← Template committed to repo (no real values)
  
.env.example contents:
  PORT=5000
  MONGO_URI=mongodb+srv://user:password@cluster.mongodb.net/dbname
  FRONTEND_URL=http://localhost:3000
  ALLOWED_ORIGINS=http://localhost:3000
  CLERK_SECRET_KEY=sk_test_your_key_here
  CLERK_PUBLISHABLE_KEY=pk_test_your_key_here
  CLERK_WEBHOOK_SIGNING_SECRET=whsec_your_secret_here
  SAP_MOCK_MODE=true
  LOG_LEVEL=debug
  UPLOAD_DIR=./uploads
  MAX_FILE_SIZE_MB=10
```

#### 🧪 End of Day Test
```
Remove CLERK_SECRET_KEY from .env → server exits with:
  "❌ Missing required environment variable: CLERK_SECRET_KEY"
```

---

### Week 5 · Day 5 — Admin Panel

#### 📁 `src/app/admin/page.js`
```
Protected by Clerk (middleware.js already handles this)
Additional check: Clerk user must have 'admin' role (set in Clerk dashboard)

Admin Panel sections:
  1. System Status:
     - MongoDB: Connected / Disconnected (from /api/health)
     - Socket.io: N active connections
     - SAP: Mock Mode / Live
  
  2. Vendor Registration Queue:
     - List: status='Under Review' vendors
     - Approve button → PUT /api/vendors/:id/approve
     - Reject button + reason → PUT /api/vendors/:id/reject
  
  3. Recent SapLog Feed:
     - Last 100 logs, grouped by type
     - Failed logs highlighted red
     - Filter: type, status, vendorId
  
  4. Platform Metrics:
     - Total vendors, RFQs, POs, invoices, payments
     - Total ₹ volume processed (sum of payments.amount)
```

#### 🧪 End of Day Test
```
Admin signs in → /admin page accessible
Approve pending vendor → status updates in Atlas
SapLog feed shows real-time entries
```

---

## Phase 6 — SAP RFC Integration (Week 6)
> **Goal**: Build the real SAP integration scaffold. Mock mode first, real RFC calls when SAP is available.

---

### Week 6 · Day 1 — SAP RFC Client + Feature Flag

#### 📁 `sap/rfcClient.js`
```javascript
// Feature flag: process.env.SAP_MOCK_MODE = 'true' | 'false'
//
// callBAPI(functionModule, params):
//   if SAP_MOCK_MODE === 'true':
//     → return getMockResponse(functionModule, params)
//   else:
//     → use node-rfc package (npm install node-rfc)
//     → connect to SAP via RFC
//     → call function module
//     → parse BAPIRET2 return table
//     → throw ApiError on TYPE: 'E' or 'A'

const getMockResponse = (fm, params) => {
  const mocks = {
    'BAPI_VENDOR_CREATE':          { VENDOR: 'VND-' + Math.floor(10000+Math.random()*90000), RETURN: [{ TYPE: 'S', MESSAGE: 'Vendor created successfully' }] },
    'BAPI_RFQ_CREATE':             { EBELN: params.EKKO?.EBELN, RETURN: [{ TYPE: 'S' }] },
    'BAPI_INCOMINGINVOICE_CREATE': { INVOICEDOCNUMBER: 'MIRO-5' + Math.floor(100000000+Math.random()*900000000), RETURN: [{ TYPE: 'S' }] },
    'BAPI_DELIVERY_CREATE_DN':     { VBELN: '1800' + Math.floor(10000+Math.random()*90000), RETURN: [{ TYPE: 'S' }] },
  };
  return mocks[fm] || { RETURN: [{ TYPE: 'E', MESSAGE: `Mock not found for ${fm}` }] };
};
```

#### 🧪 End of Day Test
```
SAP_MOCK_MODE=true → rfcClient.callBAPI('BAPI_RFQ_CREATE', params) → mock response
SAP_MOCK_MODE=false → attempts real RFC (expected to fail without SAP system — OK)
```

---

### Week 6 · Day 2 — BAPI Parameter Translators

#### 📁 `sap/bapiTranslator.js`
```javascript
// formatSapDate(date) → 'YYYYMMDD' string

// vendorToBapiCreate(vendor):
//   → { COMPANYCODE: '1000', ACCOUNT_GROUP: 'KRED',
//       VENDOR_NAME: vendor.companyName, GSTIN: vendor.gstin,
//       PAN: vendor.pan, STREET: vendor.address?.street,
//       CITY: vendor.address?.city, COUNTRY: 'IN',
//       BANK_ACCT: vendor.bankDetails?.accountNumber,
//       SWIFT_CODE: vendor.bankDetails?.ifscCode }

// rfqToBapiCreate(rfq):
//   → { EKKO: { BSART: rfq.rfqType, ANGDT: formatSapDate(rfq.deadlineDate),
//               ZTERM: paymentTermCode(rfq.paymentTerms), EKORG: '1000', EKGRP: rfq.purchasingGroup },
//       T_RFQ_ITEMS: rfq.items.map(i => ({ EBELP: i.line*10, MATNR: i.materialCode,
//         MENGE: i.quantity, MEINS: i.uom, WERKS: i.plant, EEIND: formatSapDate(i.deliveryDate) })) }

// bidToMeProcess(bid, rfq):
//   → { EBELN: rfq.id, EBELP: 10, NETPR: bid.unitPrices[10],
//       MWSKZ: gstToTaxCode(bid.gstRate), PLIFZ: bid.deliveryLeadTimeDays }

// invoiceToMiro(invoice, vendor):
//   → { HEADERDATA: { INVOICE_IND: 'X', COMP_CODE: '1000',
//                     DOC_DATE: formatSapDate(invoice.invoiceDate),
//                     GROSS_AMOUNT: invoice.totalAmount, CURRENCY: 'INR' },
//       ITEMDATA: invoice.items.map(i => ({ PO_NUMBER: invoice.poId, PO_ITEM: i.line*10,
//         QUANTITY: i.quantity, PO_UNIT: 'EA', ITEM_AMOUNT: i.amount })) }
```

---

### Week 6 · Day 3 — IDoc Inbound Processor

#### 📁 `sap/idocProcessor.js`
```javascript
// processIdoc(idocType, segments, io):
//   'MBGMCR03' → processMigoGRN(segments, io)
//   'PAYEXT'   → processF110Payment(segments, io)
//   'ORDRSP'   → processPOAcknowledgement(segments, io)

// processMigoGRN:
//   Parse E1MBLKO (header), E1MBLPO (line items)
//   Create/update GRN, emit 'grn:received' to vendor

// processF110Payment:
//   Parse E1IDPAU (payment advice)
//   Create Payment, update Invoice, emit 'payment:cleared' to vendor
```

#### 📁 `routes/idoc.routes.js`
```javascript
// SAP sends IDocs via HTTP RFC destination
// POST /api/sap/idoc → verify SAP shared secret → processIdoc

const validateSapSecret = (req, res, next) => {
  if (req.headers['x-sap-secret'] !== process.env.SAP_WEBHOOK_SECRET)
    return res.status(401).json({ error: 'Invalid SAP secret' });
  next();
};

router.post('/api/sap/idoc', validateSapSecret, idocController.receive);
```

#### 🧪 End of Day Test
```
POST /api/sap/idoc with mock MBGMCR03 payload + SAP secret header
  → GRN created in Atlas, 'grn:received' Socket.io event emitted
POST /api/sap/idoc with mock PAYEXT payload
  → Payment created, invoice cleared, 'payment:cleared' emitted
Missing SAP secret → 401 rejected
```

---

### Week 6 · Day 4 — Analytics API

#### 📁 `controllers/analytics.controller.js`
```javascript
// getSpendAnalytics: 12-month invoice totals + top 5 materials by spend
// getOrderTimeline: PO counts by month + status
// getPaymentStats:  avg clearing time (invoice posted → payment date), TDS total
// getRFQStats:      bid win rate, avg weighted score, bids by material category
```

#### ✏️ `src/components/portal/AnalyticsView.js` + `ReportsAnalyticsView.js`
```javascript
// Replace all hardcoded Recharts data with API calls:
// useEffect → analyticsApi.getSpendAnalytics(getToken) → setChartData
// Loading skeleton while fetching
```

---

### Week 6 · Day 5 — SAP Mock Server + Integration Tests

#### 📁 `sap/mockSapServer.js`
```javascript
// Lightweight Express app on port 8080
// Simulates SAP BAPI REST responses for CI/CD testing
// Endpoints mirror SAP function module names
// ?simulate_error=true → returns TYPE: 'E' BAPI error
```

#### Install Jest + Supertest
```bash
cd backend && npm install --save-dev jest supertest mongodb-memory-server
```

#### 📁 `tests/integration/p2p.flow.test.js`
```javascript
// Full P2P workflow in test DB (mongodb-memory-server):
// register vendor via webhook → createRFQ → submitBid → awardBid
// → PO auto-created → acknowledgePO → submitASN → autoGRN → submitInvoice → autoPayment
// All 11 steps verified with Supertest
```

---

## Phase 7 — Clerk Authentication (Week 7)
> **Goal**: Install Clerk on frontend AND backend. Wire webhooks to sync users to MongoDB.  
> Lock down all existing API routes (RFQ, PO, Socket.io, etc.) with Clerk middleware. Remove all temporary dev headers.

---

### Week 7 · Day 1 — Clerk Setup (Frontend)

**Objective**: Install and configure Clerk in the Next.js frontend.

#### Step 1: Create Clerk Application
```
1. Go to dashboard.clerk.com
2. Create new application: "VendorConnect Portal"
3. Enable sign-in methods: Email + Password
4. (Optional) Enable Google OAuth for quicker dev testing
5. Copy: NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY, CLERK_SECRET_KEY
```

#### Step 2: Install Clerk for Next.js
```bash
cd a:\sap_vendor_portal
npm install @clerk/nextjs
```

#### Step 3: ✏️ `.env.local`
```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_xxxxxxxxxxxx
CLERK_SECRET_KEY=sk_test_xxxxxxxxxxxx
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/
NEXT_PUBLIC_API_URL=http://localhost:5000
```

#### Step 4: ✏️ `src/app/layout.js`
```javascript
import { ClerkProvider } from '@clerk/nextjs';

export default function RootLayout({ children }) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body>
          <StoreProvider>
            {children}
          </StoreProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
```

#### Step 5: 📁 `src/middleware.js` (Next.js route protection)
```javascript
import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

// Public routes: only sign-in and sign-up pages
const isPublicRoute = createRouteMatcher(['/sign-in(.*)', '/sign-up(.*)']);

export default clerkMiddleware((auth, request) => {
  if (!isPublicRoute(request)) {
    auth().protect(); // Redirect to /sign-in if no session
  }
});

export const config = {
  matcher: ['/((?!.*\\..*|_next).*)', '/', '/(api|trpc)(.*)'],
};
```

#### Step 6: Clerk's hosted sign-in/sign-up pages
```
📁 src/app/sign-in/[[...sign-in]]/page.js
  → <SignIn />  (Clerk's pre-built component — zero custom UI needed)

📁 src/app/sign-up/[[...sign-up]]/page.js
  → <SignUp />  (Clerk's pre-built component)
```

#### ❌ Do NOT build: custom login page, register page, password hashing, JWT generation

#### 🧪 End of Day Test
```
Navigate to localhost:3000 → redirected to /sign-in (Clerk's hosted UI)
Sign up with email → redirected back to portal
useUser() in any component → returns { user: { id, primaryEmailAddress, ... } }
```

---

### Week 7 · Day 2 — Clerk Setup (Backend) + Vendor Auto-Creation

**Objective**: Install `@clerk/express` on backend. Protect all routes. Auto-create Vendor on first sign-in.

#### Step 1: Install Clerk for Express
```bash
cd a:\sap_vendor_portal\backend
npm install @clerk/express
```

#### Step 2: ✏️ `backend/.env`
```env
CLERK_SECRET_KEY=sk_test_xxxxxxxxxxxx
CLERK_PUBLISHABLE_KEY=pk_test_xxxxxxxxxxxx
CLERK_WEBHOOK_SIGNING_SECRET=whsec_xxxxxxxxxxxx   ← from Clerk dashboard (Day 3)
```

#### Step 3: ✏️ `backend/server.js` — add Clerk middleware
```javascript
const { clerkMiddleware, getAuth } = require('@clerk/express');

// Add BEFORE your routes — Clerk attaches auth info to every request
app.use(clerkMiddleware());

// Now every request has req.auth = { userId, sessionId, ... }
// userId is the Clerk user ID (e.g., 'user_2abc123xyz')
```

#### Step 4: 📁 `middleware/requireAuth.js`
```javascript
const { requireAuth, getAuth } = require('@clerk/express');
const Vendor = require('../models/Vendor');

// Combined middleware: Clerk token check + MongoDB vendor lookup
const protect = [
  requireAuth(),   // ← Clerk handles token verification — throws 401 if invalid
  async (req, res, next) => {
    const { userId } = getAuth(req);
    
    // Find or create vendor in MongoDB linked to this Clerk user
    let vendor = await Vendor.findOne({ clerkId: userId });
    
    if (!vendor) {
      // First-time sign-in: create a minimal vendor profile
      // Full profile details come from Clerk webhook (Day 3) or profile form
      vendor = await Vendor.create({
        clerkId: userId,
        email: req.auth.sessionClaims?.email || '',
        companyName: 'New Vendor',
        gstin: 'PENDING',
        pan: 'PENDING',
        status: 'Pending'
      });
    }
    
    req.vendor = vendor;       // MongoDB vendor document
    req.clerkUserId = userId;  // Clerk user ID string
    next();
  }
];

module.exports = { protect };
```

#### Step 5: ✏️ Lock down all routes in `routes/index.js`
```javascript
const { protect } = require('../middleware/requireAuth');

// Apply protect to every route that needs auth:
router.use('/vendors', protect, require('./vendor.routes'));
router.use('/rfqs', protect, require('./rfq.routes'));
router.use('/pos', protect, require('./po.routes'));
router.use('/grns', protect, require('./grn.routes'));
router.use('/invoices', protect, require('./invoice.routes'));
router.use('/payments', protect, require('./payment.routes'));

// Public (no auth required):
router.get('/health', healthCheck);
router.post('/webhooks', require('./webhook.routes'));  // Clerk webhooks — own auth
```

#### Step 6: Update all controllers — replace `req.headers['x-vendor-id']` with `req.vendor` + `req.clerkUserId`

#### 🧪 End of Day Test
```
GET /api/vendors/profile WITHOUT token → 401 Unauthorized (Clerk)
GET /api/vendors/profile WITH Clerk Bearer token → vendor profile returned
Token issued from: const { getToken } = useAuth(); const t = await getToken();
```

---

### Week 7 · Day 3 — Clerk Webhook: User → MongoDB Vendor Sync

**Objective**: When a user signs up in Clerk, automatically create a full Vendor document in MongoDB.

#### Step 1: Expose backend locally for Clerk webhooks
```bash
# Install ngrok (or use Clerk's webhook dev tool)
npx ngrok http 5000
# Copy the https URL: https://abc123.ngrok.io
```

#### Step 2: Configure webhook in Clerk Dashboard
```
Clerk Dashboard → Webhooks → Add Endpoint
URL: https://abc123.ngrok.io/api/webhooks
Events to subscribe:
  ✅ user.created
  ✅ user.updated
  ✅ user.deleted
Copy: Signing Secret → CLERK_WEBHOOK_SIGNING_SECRET in .env
```

#### Step 3: Install Svix
```bash
cd backend && npm install svix
```

#### Step 4: 📁 `controllers/webhook.controller.js`
```javascript
const { Webhook } = require('svix');
const Vendor = require('../models/Vendor');

const handleClerkWebhook = async (req, res) => {
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SIGNING_SECRET;
  
  // ⚠️ Svix requires RAW body — must use bodyParser.raw on this route
  const wh = new Webhook(WEBHOOK_SECRET);
  let evt;
  
  try {
    evt = wh.verify(req.body, {
      'svix-id':        req.headers['svix-id'],
      'svix-timestamp': req.headers['svix-timestamp'],
      'svix-signature': req.headers['svix-signature'],
    });
  } catch (err) {
    return res.status(400).json({ error: 'Invalid webhook signature' });
  }
  
  const { type, data } = evt;
  
  if (type === 'user.created') {
    const email = data.email_addresses?.[0]?.email_address || '';
    
    // Upsert: idempotent — safe to receive same event multiple times
    await Vendor.findOneAndUpdate(
      { clerkId: data.id },
      {
        $setOnInsert: {
          clerkId:     data.id,
          email:       email,
          companyName: data.first_name ? `${data.first_name} ${data.last_name || ''}`.trim() : 'New Vendor',
          gstin:       'PENDING',
          pan:         'PENDING',
          status:      'Pending'
        }
      },
      { upsert: true, new: true }
    );
  }
  
  if (type === 'user.updated') {
    // Sync email updates
    const email = data.email_addresses?.[0]?.email_address || '';
    await Vendor.findOneAndUpdate({ clerkId: data.id }, { email });
  }
  
  if (type === 'user.deleted') {
    // Mark as inactive — do NOT delete (preserve transaction history)
    await Vendor.findOneAndUpdate({ clerkId: data.id }, { status: 'Rejected', rejectionReason: 'Account deleted' });
  }
  
  res.status(200).json({ success: true });
};
```

#### Step 5: 📁 `routes/webhook.routes.js`
```javascript
const express = require('express');
const router = express.Router();
const bodyParser = require('body-parser');
const { handleClerkWebhook } = require('../controllers/webhook.controller');

// ⚠️ CRITICAL: Use bodyParser.raw here — not express.json()
// Svix verifies the raw body bytes, not the parsed JSON
router.post('/', bodyParser.raw({ type: 'application/json' }), handleClerkWebhook);

module.exports = router;
```

#### 🧪 End of Day Test
```
Sign up new user in Clerk UI → check Atlas vendors collection → vendor auto-created
Update email in Clerk → vendor email updated in Atlas
Webhook endpoint shows 200 in Clerk dashboard webhook log
Test idempotency: replay same webhook twice → only one vendor document
```

---

### Week 7 · Day 4 — Frontend API Client Layer

**Objective**: Create the API client that all frontend views will use. Token injected from Clerk.

#### 📁 `src/lib/api.js`
```javascript
const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

// Core fetcher — used by all API methods
// getToken() comes from Clerk's useAuth() hook (passed in as param)
const apiFetch = async (endpoint, options = {}, getToken) => {
  const token = getToken ? await getToken() : null;
  
  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
  });
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Network error' }));
    throw new Error(error.error || `HTTP ${response.status}`);
  }
  
  return response.json();
};

// API namespaces (all take getToken as last arg):
export const vendorApi = {
  getProfile:          (getToken) => apiFetch('/api/vendors/profile', {}, getToken),
  updateProfile:       (data, getToken) => apiFetch('/api/vendors/profile', { method: 'PUT', body: JSON.stringify(data) }, getToken),
  submitRegistration:  (getToken) => apiFetch('/api/vendors/profile/submit', { method: 'POST' }, getToken),
  getPerformance:      (getToken) => apiFetch('/api/vendors/performance', {}, getToken),
};

export const rfqApi = {
  list:     (params, getToken) => apiFetch(`/api/rfqs?${new URLSearchParams(params)}`, {}, getToken),
  getById:  (id, getToken) => apiFetch(`/api/rfqs/${id}`, {}, getToken),
  create:   (data, getToken) => apiFetch('/api/rfqs', { method: 'POST', body: JSON.stringify(data) }, getToken),
  submitBid:(id, data, getToken) => apiFetch(`/api/rfqs/${id}/bid`, { method: 'POST', body: JSON.stringify(data) }, getToken),
  award:    (id, data, getToken) => apiFetch(`/api/rfqs/${id}/award`, { method: 'POST', body: JSON.stringify(data) }, getToken),
  evaluate: (id, getToken) => apiFetch(`/api/rfqs/${id}/evaluate`, {}, getToken),
  cancel:   (id, getToken) => apiFetch(`/api/rfqs/${id}/cancel`, { method: 'PUT' }, getToken),
  reissue:  (id, data, getToken) => apiFetch(`/api/rfqs/${id}/reissue`, { method: 'PUT', body: JSON.stringify(data) }, getToken),
};

export const poApi = {
  list:        (params, getToken) => apiFetch(`/api/pos?${new URLSearchParams(params)}`, {}, getToken),
  getById:     (id, getToken) => apiFetch(`/api/pos/${id}`, {}, getToken),
  acknowledge: (id, getToken) => apiFetch(`/api/pos/${id}/acknowledge`, { method: 'PUT' }, getToken),
  submitASN:   (id, data, getToken) => apiFetch(`/api/pos/${id}/asn`, { method: 'POST', body: JSON.stringify(data) }, getToken),
  simulate:    (getToken) => apiFetch('/api/pos/simulate', { method: 'POST' }, getToken),
};

export const grnApi    = { list: (getToken) => apiFetch('/api/grns', {}, getToken) };
export const invoiceApi= { list: (getToken) => apiFetch('/api/invoices', {}, getToken), submit: (data, getToken) => apiFetch('/api/invoices', { method: 'POST', body: JSON.stringify(data) }, getToken) };
export const paymentApi= { list: (getToken) => apiFetch('/api/payments', {}, getToken) };
export const sapLogApi = { list: (getToken) => apiFetch('/api/logs', {}, getToken) };
```

#### 🧪 End of Day Test
```
In browser console (after Clerk sign-in):
  const { getToken } = useAuth();
  import('/src/lib/api.js').then(m => m.vendorApi.getProfile(getToken))
  → returns vendor profile from API
```

---

### Week 7 · Day 5 — Migrate store-context.js: Profile + RFQ + Auth Wiring

**Objective**: Connect the StoreProvider to Clerk. Load real data on sign-in.

#### ✏️ `src/lib/store-context.js`

```javascript
'use client';
import { useAuth, useUser } from '@clerk/nextjs';

export function StoreProvider({ children }) {
  const { getToken, isSignedIn, isLoaded: clerkLoaded } = useAuth();
  const { user } = useUser();

  const [state, setState] = useState(getUiDefaults()); // only UI prefs
  const [dataLoaded, setDataLoaded] = useState(false);

  // Load all data from API once Clerk confirms sign-in
  useEffect(() => {
    if (!clerkLoaded || !isSignedIn) return;
    loadAllData();
  }, [clerkLoaded, isSignedIn]);

  const loadAllData = async () => {
    try {
      const [profile, rfqs, pos, grns, invoices, payments] = await Promise.all([
        vendorApi.getProfile(getToken),
        rfqApi.list({}, getToken),
        poApi.list({}, getToken),
        grnApi.list(getToken),
        invoiceApi.list(getToken),
        paymentApi.list(getToken),
      ]);
      setState(prev => ({ ...prev, profile, rfqs, pos, grns, invoices, payments }));
      setDataLoaded(true);
    } catch (err) {
      console.error('Failed to load portal data', err);
    }
  };

  // Actions — all call API now:
  const submitRegistration = async (profileData) => {
    await vendorApi.updateProfile(profileData, getToken);
    await vendorApi.submitRegistration(getToken);
    const profile = await vendorApi.getProfile(getToken);
    setState(prev => ({ ...prev, profile }));
  };

  const createRFQ = async (rfqData) => {
    const rfq = await rfqApi.create(rfqData, getToken);
    setState(prev => ({ ...prev, rfqs: [rfq, ...prev.rfqs] }));
  };

  const handleBidSubmit = async (rfqId, prices, leadTime, remarks, gstRate, validityDate, freight, moq) => {
    await rfqApi.submitBid(rfqId, { unitPrices: prices, deliveryLeadTimeDays: leadTime, remarks, gstRate, validityDate, freight, moq }, getToken);
    const rfqs = await rfqApi.list({}, getToken);
    setState(prev => ({ ...prev, rfqs }));
  };

  const acknowledgePO = async (poId) => {
    await poApi.acknowledge(poId, getToken);
    const pos = await poApi.list({}, getToken);
    setState(prev => ({ ...prev, pos }));
  };

  // ... all other actions similarly

  // ❌ REMOVE: localStorage business data, all setTimeout simulations,
  //            getInitialState() mock imports, logSAPEvent (now server-side)
  // ✅ KEEP: activeTab UI state, consoleOpen UI state in localStorage
}
```

#### ✏️ `src/lib/store.js` — strip down
```javascript
// Keep ONLY UI preference defaults (no business data):
export const getUiDefaults = () => ({
  activeTab: 'dashboard',
  consoleOpen: false,
  // performance defaults (until server returns real data)
  performance: { deliveryOTIF: 0, qualityAcceptance: 0, priceIndex: 0, grade: 'N/A' }
});
// ❌ Remove all mock RFQs, POs, GRNs, invoices, payments, logs, profile
```

#### 🧪 End of Day Test
```
Sign in → portal loads with real vendor profile from Atlas
Dashboard KPI cards show real PO/invoice counts
Create RFQ from UI → appears in Atlas rfqs collection
Refresh browser → data reloads from API (not localStorage)
```

---

## Phase 8 — Testing, CI/CD & Deployment (Week 8)

---

### Week 8 · Day 1 — Unit Tests

#### Test files
```
backend/tests/unit/
├── rfq.controller.test.js     — createRFQ, submitBid, awardBid, scoring formula
├── invoice.controller.test.js — 3-way match logic, tax calculations
├── vendor.controller.test.js  — performance aggregation, approval flow
├── bapiTranslator.test.js     — all 8 translation functions → format assertions
├── asyncHandler.test.js       — error propagation
└── sapLogger.test.js          — SapLog document creation
```

#### 🧪 `npm test` → > 70% coverage on all controllers

---

### Week 8 · Day 2 — Integration Tests (Clerk Mocked)

```javascript
// Mock Clerk's requireAuth() in test environment:
// jest.mock('@clerk/express', () => ({
//   clerkMiddleware: () => (req, res, next) => next(),
//   requireAuth: () => (req, res, next) => {
//     req.auth = { userId: 'test-user-clerk-id' };
//     next();
//   },
//   getAuth: (req) => req.auth,
// }));

// Full integration test suite:
// p2p.flow.test.js — 11-step complete workflow
// auth.webhook.test.js — Clerk webhook handler + Svix signature
// upload.test.js — file upload + download
// socket.test.js — socket event emissions
```

---

### Week 8 · Day 3 — GitHub Actions CI/CD

#### 📁 `.github/workflows/backend.yml`
```yaml
name: Backend CI/CD
on:
  push:
    branches: [main]
    paths: ['backend/**']
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: '22' }
      - run: cd backend && npm ci
      - run: cd backend && npm test
        env:
          MONGO_URI:             ${{ secrets.MONGO_TEST_URI }}
          CLERK_SECRET_KEY:      ${{ secrets.CLERK_SECRET_KEY }}
          CLERK_PUBLISHABLE_KEY: ${{ secrets.CLERK_PUBLISHABLE_KEY }}
          CLERK_WEBHOOK_SIGNING_SECRET: ${{ secrets.CLERK_WEBHOOK_SIGNING_SECRET }}
          SAP_MOCK_MODE: 'true'
  deploy:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Deploy to Railway
        uses: railway/deploy@v1
        with: { token: ${{ secrets.RAILWAY_TOKEN }} }
```

#### 📁 `.github/workflows/frontend.yml`
```yaml
name: Frontend CI/CD
on:
  push:
    branches: [main]
    paths: ['src/**']
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: npm ci && npm run build
        env:
          NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: ${{ secrets.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY }}
          NEXT_PUBLIC_API_URL: ${{ secrets.NEXT_PUBLIC_API_URL }}
      - uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
```

---

### Week 8 · Day 4 — Production Deployment

#### Backend → Railway
```bash
railway login && railway init
# Set all env vars in Railway dashboard:
# MONGO_URI, CLERK_SECRET_KEY, CLERK_PUBLISHABLE_KEY,
# CLERK_WEBHOOK_SIGNING_SECRET, FRONTEND_URL, NODE_ENV=production
railway up
# Get URL: https://vendorconnect-api.railway.app
```

#### Frontend → Vercel
```bash
vercel --prod
# Set in Vercel dashboard:
# NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY → production key from Clerk dashboard
# NEXT_PUBLIC_API_URL=https://vendorconnect-api.railway.app
```

#### Update Clerk Settings for Production
```
Clerk Dashboard → Settings:
  1. Add production domain: vendorconnect.vercel.app
  2. Update Webhook URL to: https://vendorconnect-api.railway.app/api/webhooks
  3. Update Allowed redirect URLs
  4. Enable production JWT keys (rotate from test keys)
```

---

### Week 8 · Day 5 — Production Verification

#### Final Checklist
```
Auth & Clerk:
☐ Sign-up on production URL → Clerk creates user → webhook fires → Vendor in Atlas
☐ Sign-in → portal loads with profile
☐ Sign out → redirected to /sign-in
☐ Invalid session → 401 from Express routes
☐ Webhook replayed twice → only one vendor created (idempotent)

API & Data:
☐ Full P2P workflow works end-to-end on production
☐ GRN auto-arrives 10s after ASN via WebSocket (not polling)
☐ Payment auto-clears 12s after invoice via WebSocket
☐ BAPI Console shows real server-side SapLog entries
☐ Performance scorecard calculates from real MongoDB aggregation

Files & Reports:
☐ PDF Statement downloads with real payment data
☐ File upload → stored → retrievable
☐ File auth: other vendor cannot download your documents

CI/CD:
☐ Push to main → GitHub Actions → tests pass → auto-deploy
☐ Both pipelines green
```

---

## Final Summary

| Phase | Week | Key Deliverables | Auth Status | Status |
|---|---|---|---|---|
| **Backend Foundation** | 1 | Folder structure · All 8 Mongoose schemas · Vendor profile API · SapLogger utility | Open routes | ✅ **Completed** |
| **RFQ & PO API** | 2 | RFQ lifecycle (ME41→ME58) · PO/ASN/GRN chain · Invoice 3-way match · F110 payment | Open routes | ⏳ **Next Up** |
| **Real-Time** | 3 | Socket.io (mock rooms) · GRN/payment/chat push events · File uploads · PDF reports | Open routes | 🔲 Planned |
| **Frontend Migration** | 4 | Transition monolithic `store-context.js` to modular feature hooks (`useProfile`, `useRFQs`, etc.) and api-client | Open routes | ✅ **Completed Ahead of Schedule** |
| **Security** | 5 | Zod validation · Helmet/sanitize · Winston logging · Env validation · Admin panel | Open routes | 🔲 Planned |
| **SAP RFC** | 6 | RFC client + mock mode · BAPI translators · IDoc handler · Analytics API · Jest tests | Open routes | 🔲 Planned |
| **🔐 Clerk Auth** | 7 | Clerk on frontend+backend · Webhook user sync · `requireAuth()` on all routes · Lock down socket.io | ✅ **Secured** | 🔲 Planned |
| **Deploy** | 8 | Unit + integration tests · GitHub Actions CI/CD · Vercel + Railway production | Production Clerk | 🔲 Planned | Production Clerk | 🔲 Planned |

---

## What Clerk Eliminates (vs. Previous Plan)

| ❌ Removed | ✅ Replaced By |
|---|---|
| `bcryptjs` password hashing | Clerk handles passwords |
| `jsonwebtoken` sign/verify | Clerk session tokens |
| `generateToken.js` | `@clerk/express` built-in |
| Custom `auth.controller.js` | Clerk dashboard + webhooks |
| Custom `auth.routes.js` | Not needed |
| `/login` page build | `<SignIn />` Clerk component |
| `/register` page build | `<SignUp />` Clerk component |
| JWT secret env vars | Clerk keys only |
| Token refresh logic | Clerk auto-refreshes |
| Session expiry handling | Clerk built-in |

---

*Roadmap Version 2.0 · Clerk Auth Edition · June 2026 · VendorConnect Portal*
