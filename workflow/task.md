# VendorConnect Portal — Sprint Execution Tasks

## Phase 1 — Backend Foundation (Week 1)

### Week 1 · Day 1 — Backend Folder Structure & Middleware Stack
- [x] Create `backend/middleware/errorHandler.js`
- [x] Create `backend/middleware/rateLimiter.js`
- [x] Create `backend/utils/asyncHandler.js`
- [x] Create `backend/utils/ApiError.js`
- [x] Create `backend/utils/sapLogger.js`
- [x] Create `backend/routes/index.js`
- [x] Update `backend/server.js`

### Week 1 · Day 2 — Mongoose Schemas: Vendor + RFQ
- [x] Create `backend/models/Vendor.js`
- [x] Create `backend/models/RFQ.js`

### Week 1 · Day 3 — Mongoose Schemas: PO → Payment → SapLog
- [x] Create `backend/models/PurchaseOrder.js`
- [x] Create `backend/models/ASN.js`
- [x] Create `backend/models/GRN.js`
- [x] Create `backend/models/Invoice.js`
- [x] Create `backend/models/Payment.js`
- [x] Create `backend/models/SapLog.js`

### Week 1 · Day 4 — Vendor Profile API
- [x] Create `backend/controllers/vendor.controller.js`
- [x] Create `backend/routes/vendor.routes.js`

### Week 1 · Day 5 — Admin + Performance Aggregation
- [x] Add admin actions to vendor controller
- [x] MongoDB aggregation pipeline for performance scores

## Phase 2 — RFQ & PO API (Week 2)
- [x] W2D1 — RFQ CRUD
- [x] W2D2 — RFQ bid + award
- [x] W2D3 — PO API
- [x] W2D4 — ASN + auto-GRN
- [x] W2D5 — Invoice + auto-payment

## Phase 3 — Real-Time with Socket.io (Week 3)
- [x] W3D1–W3D5 (Socket.io event loops, rooms, chat feed loggers completed)

## Phase 4 — Frontend Migration (Week 4)
- [x] W4D1–W4D5 (Completed ahead of schedule: domain-driven custom hooks refactoring)

## Phase 5 — Security Hardening (Week 5)
- [x] W5D1–W5D5 (Zod schema checking, Helmet, NoSQL sanitization, Parameter pollution, Winston logging, Env validation, Admin panel completed)

## Phase 6 — SAP RFC Integration (Week 6)
- [ ] W6D1–W6D5 (SAP node-rfc client connection, BAPI data translation models, IDoc payload receivers)

## Phase 7 — JWT Authentication (Week 7)
- [ ] W7D1–W7D5 (Register/Login APIs, JWT token verification middleware, frontend sign-in wizard, Socket.io authorization checks)

## Phase 8 — Multi-Page Site & Landing Page Integration (Week 8)
- [ ] W8D1–W8D2 (Design premium landing page with company connect details, product highlights, and onboarding resources)
- [ ] W8D3–W8D4 (Convert portal to multi-page Next.js architecture with public routes, custom navbars, and navigation paths)
- [ ] W8D5 (Enforce routing security transitions between public pages and protected partner portal)

## Phase 9 — Testing, CI/CD & Deployment (Week 9)
- [ ] W9D1–W9D5 (End-to-end Jest tests, Vercel/Railway deployments, production pipeline checks)

## Frontend Enhancements (June 2026)
- [x] Redesign Vendor Registration module to a 4-step wizard
  - [x] Remove helper descriptions and standardise card UI
  - [x] Implement business/SAP view mapping toggle
  - [x] Integrate interactive date calendar picker
  - [x] Integrate searchable state list dropdown
  - [x] Implement drag-and-drop document upload zones
  - [x] Align state management and saveDraft actions in store-context
  - [x] Update database schemas and technical architecture docs
