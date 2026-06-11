# VendorConnect Portal — Production Architecture Document
> **Audience**: CTO · Enterprise Architects · SAP Architects · Engineering Managers · Senior Developers  
> **Version**: 1.0 · **Date**: June 2026 · **Classification**: Internal Technical Reference

---

## 1. Executive Summary

### Problem Statement
Indian manufacturing enterprises procuring from hundreds of external suppliers face a fragmented, paper-heavy supplier management lifecycle. Suppliers register via emails, receive Purchase Orders via PDFs, submit invoices manually, and track payments through phone calls — with zero real-time visibility into SAP ERP transactions.

### Platform Description
**VendorConnect Portal** is a full-stack, SAP-integrated supplier self-service platform built for Indian enterprise procurement contexts. It simulates and orchestrates the complete P2P (Procure-to-Pay) lifecycle from vendor onboarding through to payment clearance, with every step instrumented and logged as SAP BAPI/RFC/OData/IDoc payloads.

### Primary Users
| User Role | Description |
|---|---|
| **Vendor / Supplier** | External companies submitting bids, acknowledging POs, submitting ASNs and invoices |
| **Procurement Officer** | Internal buyer creating RFQs, evaluating bids, awarding contracts |
| **Finance / AP Team** | Processing MIRO invoice postings and tracking F110 payment runs |
| **Warehouse / Stores** | Posting MIGO Goods Receipts and quality inspection outcomes |

### Core Workflows
1. **Vendor Onboarding** → BAPI_VENDOR_CREATE → SAP Vendor Master (LFA1)
2. **RFQ Management** → ME41 Create → ME47 Submit Bid → ME48 Evaluate → ME58 Convert to PO
3. **Purchase Order Cycle** → PO Acknowledge → ASN/Dispatch → BAPI_DELIVERY_CREATE_DN
4. **Goods Receipt** → MIGO auto-trigger → MBGMCR03 IDoc inbound → GRN
5. **Invoice Processing** → MIRO → BAPI_INCOMINGINVOICE_CREATE → 3-Way Match
6. **Payment Clearance** → SAP F110 Auto-run → PAYEXT IDoc → UTR confirmation

### Business Value
- Eliminates manual email/PDF workflows across the supplier lifecycle
- Provides real-time SAP transaction audit trails to suppliers
- Enforces GST-compliant (India) invoicing workflows
- Supports MSME/TDS compliance in payment modules
- Reduces procurement cycle time through automated bid evaluation scoring

### Design Philosophy
- **Simulation-first**: All SAP integrations are simulated client-side via a context-driven state machine; ready to swap to real RFC/BAPI calls
- **India-specific**: GST (18%), TDS, MSME, NEFT/RTGS, Indian plant codes baked into every module
- **Fiori-inspired UI**: SAP Fiori design language adapted to a modern React SPA

---

## 2. Application Overview

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                         VendorConnect Portal                                    │
│                                                                                 │
│  ┌──────────────────────────┐      ┌─────────────────────────────────────────┐ │
│  │   FRONTEND (Next.js 16)  │      │         BACKEND (Node.js/Express)       │ │
│  │   localhost:3000          │─────▶│         localhost:5000                  │ │
│  │                          │      │                                         │ │
│  │  React 19 SPA            │      │  REST API                               │ │
│  │  Tailwind CSS v4         │      │  CORS / Helmet / Morgan                 │ │
│  │  React Context API       │      │  Express Rate Limiting                  │ │
│  │  localStorage Persist    │      │  Socket.io (real-time)                  │ │
│  └──────────────────────────┘      └─────────────────────────────────────────┘ │
│                                                         │                       │
│                                                         ▼                       │
│                                        ┌────────────────────────────┐          │
│                                        │  MongoDB Atlas             │          │
│                                        │  (Cloud Database)          │          │
│                                        │  sap_vendor_portal DB      │          │
│                                        └────────────────────────────┘          │
│                                                                                 │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │  SAP ERP (SIMULATED — client-side state machine)                        │   │
│  │  BAPI · RFC · OData · IDoc payloads logged in real-time payload console │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────────────┘
```

| Component | Technology | Status |
|---|---|---|
| Frontend Application | Next.js 16 / React 19 | ✅ Live |
| Backend API Server | Node.js / Express 5 | ✅ Live |
| Database | MongoDB Atlas | ✅ Connected |
| Real-Time Layer | Socket.io 4 | ✅ Configured |
| Authentication | None (current MVP) | ⚠️ Planned |
| SAP Integration | Simulated client-side BAPIs | 🔲 Real RFC pending |
| File Storage | Browser memory only (multer ready) | ⚠️ Partial |
| Notifications | In-app chat messages | ✅ Simulated |
| AI Components | None | 🔲 Planned |

---

## 3. Complete Technology Stack

| Layer | Technology | Version | Purpose |
|---|---|---|---|
| **Frontend Framework** | Next.js | 16.2.7 | React SSR/SPA framework, App Router |
| **UI Library** | React | 19.2.4 | Component rendering |
| **Styling** | Tailwind CSS | v4 | Utility-first CSS |
| **Animation** | tw-animate-css | ^1.4.0 | Fade-in, slide transitions |
| **UI Primitives** | shadcn/ui + Base UI | latest | Headless component system |
| **Icons** | Lucide React | ^1.17.0 | Icon set |
| **Charts** | Recharts | ^3.8.1 | Analytics/performance charts |
| **Backend Framework** | Express | ^5.2.1 | REST API server |
| **Runtime** | Node.js | v22.13.1 | JavaScript runtime |
| **Database** | MongoDB Atlas | (cloud) | Document database |
| **ODM** | Mongoose | ^9.6.3 | MongoDB schema management |
| **Real-Time** | Socket.io | ^4.8.3 | WebSocket communication |
| **State Management** | React Context API | built-in | Global state — no Redux |
| **Persistence** | localStorage | browser | Client-side state persistence |
| **Auth** | JWT (jsonwebtoken) | ^9.0.3 | Token management (planned) |
| **Password Hashing** | bcryptjs | ^3.0.3 | Credential security (planned) |
| **Security** | Helmet | ^8.2.0 | HTTP security headers |
| **CORS** | cors | ^2.8.6 | Cross-origin requests |
| **Logging** | Morgan | ^1.11.0 | HTTP request logging |
| **Compression** | compression | ^1.8.1 | gzip response compression |
| **Rate Limiting** | express-rate-limit | ^8.5.2 | API abuse protection |
| **File Upload** | Multer | ^2.1.1 | Multipart form handling |
| **Environment** | dotenv | ^17.4.2 | Environment variable loading |
| **Dev Server** | Nodemon | ^3.1.14 | Auto-reload on file change |
| **Type Safety** | TypeScript | ^5 | Type checking (Next.js config) |
| **Linting** | ESLint | ^9 | Code quality |
| **Compiler** | React Compiler | 1.0.0 (babel) | Experimental React optimizer |
| **Font** | Geist (Google) | next/font | System-native font rendering |

### Why These Technologies?

**Next.js 16** — Selected for hybrid SSR/SPA capabilities, built-in optimization (font, image), React Server Components support, and excellent DX. Alternatives: Vite + React, Remix.

**React 19** — Chosen for concurrent features, native Suspense, and the experimental React Compiler that auto-memoizes components. Alternatives: Vue 3, Svelte 5.

**Tailwind CSS v4** — Zero-config CSS with JIT, native CSS layers, and design token support via `@theme inline`. Alternatives: styled-components, vanilla CSS modules.

**MongoDB Atlas** — Document database fits the flexible, nested structure of SAP procurement documents (PO items, bid arrays, GRN line items). Alternatives: PostgreSQL, Firestore.

**Express 5** — Stable, minimal backend with built-in async error handling (v5). Alternatives: Fastify, Hono, NestJS.

**Socket.io** — Chosen for real-time BAPI payload streaming and live chat. Alternatives: native WebSockets, Server-Sent Events.

---

## 4. Frontend Architecture

### Folder Structure

```
a:\sap_vendor_portal\
├── src\
│   ├── app\                          ← Next.js App Router root
│   │   ├── layout.js                 ← Root layout, StoreProvider wrapping
│   │   ├── page.js                   ← Main portal page (SPA router)
│   │   └── globals.css               ← Design system tokens, animations
│   ├── components\
│   │   ├── portal\                   ← Feature module components
│   │   │   ├── Header.js             ← Top navigation bar (branding)
│   │   │   ├── Sidebar.js            ← Left navigation with badge counters
│   │   │   ├── BapiConsole.js        ← SAP Payload debugger drawer
│   │   │   ├── DashboardView.js      ← KPI dashboard (506 lines)
│   │   │   ├── RegistrationView.js   ← Vendor onboarding (17,771 bytes)
│   │   │   ├── RfqView.js            ← Full RFQ lifecycle (1,960 lines)
│   │   │   ├── RFQsView.js           ← RFQ list simplified view
│   │   │   ├── PurchaseOrdersView.js ← PO lifecycle (2,186 lines, 118 KB)
│   │   │   ├── InvoiceProcessingView.js ← MIRO invoice (10,747 bytes)
│   │   │   ├── InvoicesView.js       ← Invoice list
│   │   │   ├── PaymentTrackingView.js ← F110 payments
│   │   │   ├── PaymentsView.js       ← Payment list
│   │   │   ├── CommunicationsView.js ← Chat messaging
│   │   │   ├── PerformanceView.js    ← Vendor scorecard KPIs
│   │   │   ├── ReportsAnalyticsView.js ← Reports module
│   │   │   ├── AnalyticsView.js      ← Analytics charts
│   │   │   ├── OverviewView.js       ← Overview/tour
│   │   │   ├── OnboardingView.js     ← Onboarding checklist
│   │   │   └── ChatsView.js          ← Global chat
│   │   └── ui\
│   │       └── button.tsx            ← shadcn/ui Button primitive
│   └── lib\
│       ├── store-context.js          ← Global state + all business logic (1,309 lines)
│       ├── store.js                  ← Initial mock data (200 lines)
│       └── utils.ts                  ← cn() utility function
├── backend\
│   ├── config\
│   │   └── db.js                     ← MongoDB Mongoose connection
│   ├── server.js                     ← Express server entry point
│   ├── package.json
│   └── .env
├── public\                           ← Static assets
├── next.config.ts                    ← Next.js config (React Compiler enabled)
├── tsconfig.json
└── components.json                   ← shadcn/ui registry config
```

### Component Hierarchy

```
RootLayout (layout.js)
└── StoreProvider (store-context.js)          ← Global context wrapping
    └── PortalPage (page.js)                  ← SPA entry point
        ├── Header                             ← Branding, SAP status capsules
        ├── Sidebar                            ← Navigation, badge counts
        │   └── NavigationItem[]
        └── Main
            ├── [activeTab === 'dashboard']    → DashboardView
            ├── [activeTab === 'registration'] → RegistrationView
            ├── [activeTab === 'rfqs']         → RfqView
            │   ├── RFQ Monitor (me41)
            │   ├── Create RFQ form (me41)
            │   ├── Submit Quotation (me47)
            │   └── Evaluate & Award (me48)
            ├── [activeTab === 'pos']          → PurchaseOrdersView
            │   ├── Orders Monitor
            │   ├── Goods Receipts (MIGO)
            │   └── Invoice Ready (MIRO)
            ├── [activeTab === 'invoices']     → InvoiceProcessingView
            ├── [activeTab === 'payments']     → PaymentTrackingView
            ├── [activeTab === 'chats']        → CommunicationsView
            ├── [activeTab === 'performance']  → PerformanceView
            └── [activeTab === 'analytics']    → ReportsAnalyticsView
```

### State Management Architecture

The application uses a **single-context, reducer-style architecture** without Redux.

```
store.js                        store-context.js
──────────────                  ──────────────────────────────
getInitialState()  ──────────▶  StoreProvider
                                  ├── state (useState)
                                  ├── isLoaded (localStorage hydration flag)
                                  │
                                  ├── Persistent Effects
                                  │   ├── useEffect → load from localStorage on mount
                                  │   ├── useEffect → save to localStorage on state change
                                  │   └── useEffect → test backend /api/health on load
                                  │
                                  ├── Business Actions (mutations)
                                  │   ├── submitRegistration(profileData)
                                  │   ├── approveRegistration()
                                  │   ├── rejectRegistration(reason)
                                  │   ├── submitBid(rfqId, prices, ...)
                                  │   ├── createRFQ(rfqData)
                                  │   ├── awardVendorBid(rfqId, vendorId)
                                  │   ├── reissueRFQ(rfqId, newDeadline)
                                  │   ├── cancelRFQ(rfqId)
                                  │   ├── acknowledgePO(poId)
                                  │   ├── submitASN(asnData)
                                  │   ├── submitInvoice(invoiceData)
                                  │   ├── sendChatMessage(text)
                                  │   ├── simulateIncomingPO()
                                  │   └── clearAllState()
                                  │
                                  └── useStore() hook ── consumed by all views
```

**State Shape**:
```javascript
{
  profile:     { companyName, gstin, pan, email, phone, address,
                 status, sapVendorCode, submittedAt, approvedAt },
  rfqs:        [ { id, description, status, items[], bids[], invitedVendors[] } ],
  pos:         [ { id, status, items[], paymentTerms, currency } ],
  asns:        [ { id, poId, status, items[], sapInboundDelivery } ],
  grns:        [ { id, poId, asnId, items[], sapMigoDoc, invoiceSubmitted } ],
  invoices:    [ { id, grnId, poId, status, sapMiroDoc, totalAmount } ],
  payments:    [ { id, invoiceId, amount, utrCode, paymentDate } ],
  chats:       [ { id, sender, message, timestamp } ],
  logs:        [ { id, type, name, direction, payload, status } ],  ← SAP payload log
  performance: { deliveryOTIF, qualityAcceptance, priceIndex,
                 responseTimeHours, grade }
}
```

### Design System

**Color Palette** (Tailwind stone scale — warm, neutral, enterprise):
- Background: `stone-50` (#fafaf9)
- Text primary: `stone-900` (#1c1917)
- Accent/CTA: `stone-850` / `blue-950`
- Success: `emerald-*`
- Warning: `amber-*`
- Error: `red-*`

**Typography**: System-native font stack — SF Pro → Segoe UI → Roboto → Helvetica

**Animations**:
- `animate-fade-in` — 250ms cubic-bezier page transitions
- `animate-slide-down` — 200ms dropdown reveals
- `animate-pulse` — live status indicators

**Custom scrollbars**: Thin 6px webkit scrollbar with `stone-400/30` thumb

### Routing Structure (Client-Side Tab Router)

```
PortalPage [activeTab state]
├── 'dashboard'    → Vendor Dashboard
├── 'registration' → Vendor Registration / Onboarding
├── 'rfqs'         → RFQ Management (ME41/ME47/ME48)
├── 'pos'          → Purchase Orders (Orders/GRN/MIRO)
├── 'invoices'     → Invoice Processing
├── 'payments'     → Payment Tracking (F110)
├── 'chats'        → Communications Center
├── 'performance'  → Performance Scorecard
└── 'analytics'    → Reports & Analytics
```

> **Note**: Navigation is a pure state toggle (`setActiveTab`). There are no URL route changes — this is a true SPA within a single Next.js page route.

---

## 5. Backend Architecture

### Current Architecture: Minimal Monolith

The backend is currently a **minimal Express.js monolith** that provides:
1. A REST API skeleton
2. MongoDB Atlas connection
3. CORS configuration for the frontend
4. Socket.io real-time layer
5. Security middleware (helmet, rate limiter, morgan)

```
backend/
├── server.js          ← Entry point, all middleware + routes
└── config/
    └── db.js          ← Mongoose connectDB()
```

### Server Entry Point (`server.js`)

```javascript
const express = require("express");
const cors    = require("cors");
const dotenv  = require("dotenv");
const connectDB = require("./config/db");

dotenv.config();
const app = express();

app.use(cors({ origin: 'http://localhost:3000', credentials: true }));

// Routes
app.get("/", ...)                                        // Health root
app.get("/api/health", ...)                              // Backend ping
app.get("/.well-known/appspecific/com.chrome.devtools.json", ...) // Chrome DevTools

const startServer = async () => {
  await connectDB();           // Wait for MongoDB before opening port
  app.listen(process.env.PORT || 5000);
};
```

### Request Flow (Current)

```
Browser                 Next.js (3000)           Express (5000)        MongoDB Atlas
  │                          │                        │                     │
  │── GET /api/health ──────▶│                        │                     │
  │                          │── fetch() ────────────▶│                     │
  │                          │                        │── mongoose ─────────▶│
  │                          │                        │◀── document ─────────│
  │                          │◀── JSON ───────────────│                     │
  │◀── response ─────────────│                        │                     │
```

### Planned Route Architecture

```
/api/
├── auth/
│   ├── POST /register        ← Vendor self-registration
│   ├── POST /login           ← JWT token issue
│   └── POST /refresh         ← Token refresh
│
├── vendors/
│   ├── GET  /profile         ← Get vendor profile
│   └── PUT  /profile         ← Update vendor profile
│
├── rfqs/
│   ├── GET  /                ← List RFQs
│   ├── POST /                ← Create RFQ (ME41)
│   ├── POST /:id/bid         ← Submit Quotation (ME47)
│   ├── POST /:id/award       ← Award & Convert PO (ME58)
│   └── POST /:id/cancel      ← Cancel RFQ
│
├── purchase-orders/
│   ├── GET  /                ← List POs
│   ├── POST /:id/acknowledge ← Acknowledge PO
│   └── POST /:id/asn         ← Submit ASN (BAPI_DELIVERY_CREATE_DN)
│
├── grns/
│   └── GET  /                ← List GRNs
│
├── invoices/
│   ├── GET  /                ← List Invoices
│   └── POST /                ← Submit Invoice (BAPI_INCOMINGINVOICE_CREATE)
│
├── payments/
│   └── GET  /                ← List Payments (F110 cleared)
│
└── health/
    └── GET  /api/health      ← Backend connectivity check
```

---

## 6. Database Architecture

### Active Production State
The database (MongoDB Atlas) is fully integrated. All schemas are active and synced with the frontend, replacing local browser storage with real database persistence.

### MongoDB Collection Design (ERD)

```
                    ┌─────────────────┐
                    │    vendors      │
                    │─────────────────│
                    │ _id             │
                    │ clerkId (unique)│
                    │ companyName     │
                    │ tradeName       │
                    │ businessType    │
                    │ incorporationDt │
                    │ gstin (unique)  │
                    │ gstType         │
                    │ pan             │
                    │ cin             │
                    │ msmeNumber      │
                    │ tdsSection      │
                    │ email (unique)  │
                    │ phone           │
                    │ address         │
                    │ city            │
                    │ state           │
                    │ postalCode      │
                    │ bankName        │
                    │ accountNumber   │
                    │ ifscCode        │
                    │ accountName     │
                    │ bankBranch      │
                    │ cancelledCheque │
                    │ panCardCopy     │
                    │ gstCertificate  │
                    │ incCertificate  │
                    │ msmeCertificate │
                    │ isoCertificate  │
                    │ itReturns       │
                    │ sapVendorCode   │
                    │ status          │
                    │ createdAt       │
                    │ approvedAt      │
                    └────────┬────────┘
                             │ 1:M
              ┌──────────────┼──────────────────┐
              ▼              ▼                   ▼
   ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐
   │     rfqs     │  │ purchaseOrders│  │    chatMessages  │
   │──────────────│  │──────────────│  │──────────────────│
   │ _id          │  │ _id          │  │ _id              │
   │ description  │  │ sapPoNumber  │  │ vendorId (ref)   │
   │ status       │  │ status       │  │ sender           │
   │ deadlineDate │  │ paymentTerms │  │ message          │
   │ createdDate  │  │ currency     │  │ timestamp        │
   │ currency     │  │ vendorId(ref)│  └──────────────────┘
   │ items[]      │  │ items[]      │
   │──────────────│  │ createdDate  │
   │ items:       │  └──────┬───────┘
   │   line       │         │ 1:M
   │   materialCode│         ▼
   │   description│  ┌──────────────┐
   │   quantity   │  │     asns     │
   │   targetPrice│  │──────────────│
   │   plant      │  │ _id          │
   │   gstRate    │  │ vehicleNo    │
   │   freight    │  │ sapInboundDel│
   │   leadTime   │  │ items[]      │
   │   vendorRating│  └──────┬───────┘
   └──────────────┘         │ 1:1
                             ▼
                    ┌──────────────────┐
                    │       grns       │
                    │──────────────────│
                    │ _id              │
                    │ poId (ref)       │
                    │ asnId (ref)      │
                    │ postingDate      │
                    │ sapMigoDoc       │
                    │ receivedBy       │
                    │ invoiceSubmitted │
                    │ items[]          │
                    │   line           │
                    │   receivedQty    │
                    │   acceptedQty    │
                    │   rejectedQty    │
                    │   rejectionReason│
                    └──────┬───────────┘
                           │ 1:1
                           ▼
                  ┌──────────────────┐
                  │    invoices      │
                  │──────────────────│
                  │ _id              │
                  │ grnId (ref)      │
                  │ poId (ref)       │
                  │ vendorId (ref)   │
                  │ invoiceNumber    │
                  │ sapMiroDoc       │
                  │ invoiceDate      │
                  │ subTotal         │
                  │ taxAmount (18%)  │
                  │ totalAmount      │
                  │ status           │
                  │ postedAt         │
                  │ items[]          │
                  └──────┬───────────┘
                         │ 1:1
                         ▼
                ┌──────────────────┐
                │    payments      │
                │──────────────────│
                │ _id              │
                │ invoiceId (ref)  │
                │ poId (ref)       │
                │ vendorId (ref)   │
                │ amount           │
                │ paymentDate      │
                │ utrCode          │
                │ paymentMethod    │
                │ sapPaymentDoc    │
                └──────────────────┘
```

### Table Classification

| Collection | Type | Purpose |
|---|---|---|
| `vendors` | Master Data | Vendor master records, SAP LIFNR |
| `rfqs` | Transaction | RFQ documents with embedded bids |
| `purchaseOrders` | Transaction | PO documents with line items |
| `asns` | Transaction | Advance Shipping Notices |
| `grns` | Transaction | Goods Receipt Notes from MIGO |
| `invoices` | Transaction | MIRO invoice documents |
| `payments` | Transaction | F110 cleared payments |
| `chatMessages` | Audit | Communication thread per vendor |
| `sapLogs` | Audit | BAPI/RFC/IDoc payload audit trail |

---

## 7. SAP Integration Architecture

### SAP Modules Connected (Simulated)

| SAP Module | Transaction | Portal Equivalent |
|---|---|---|
| MM (Materials Mgmt) | ME41 | Create RFQ |
| MM | ME47 | Submit Vendor Quotation |
| MM | ME48 | Evaluate & Compare Quotations |
| MM | ME58 | Convert Quotation to PO |
| MM | MIGO (MB01) | Goods Receipt Posting |
| FI (Finance) | MIRO (MIR7) | Vendor Invoice Verification |
| FI | F110 | Automatic Payment Run |
| LO (Logistics) | VL31N | Inbound Delivery Creation |
| MM | ME21N | Purchase Order Creation (Simulate) |
| FI | FBL1N | Vendor Ledger Clearing |

### Interface Types Used

```
Interface Type   Direction           Trigger
─────────────    ──────────────────  ──────────────────────────────────
BAPI             OUTBOUND (Portal→SAP)  Vendor actions (register, bid, ASN, invoice)
RFC              OUTBOUND (Portal→SAP)  Acknowledgements, bid submissions
OData            INBOUND (SAP→Portal)   PO sync, vendor confirmation
IDoc             INBOUND (SAP→Portal)   MIGO GRN, F110 payment notification
SYS              INBOUND               Internal system events (portal init, reset)
```

### Complete SAP Field Mapping Catalog

#### 1. Vendor Registration → BAPI_VENDOR_CREATE

| Portal Field | SAP Table | SAP Field | SAP Transaction |
|---|---|---|---|
| Company Name | LFA1 | NAME1 | XK01 |
| Trade / Brand Name | LFA1 | NAME2 | XK01 |
| Business Type | LFA1 | BRSCH | XK01 |
| Incorporation Date | LFA1 | GBDAT | XK01 |
| Street / Area | LFA1 | STRAS | XK01 |
| City | LFA1 | ORT01 | XK01 |
| State | LFA1 | REGIO | XK01 |
| PIN Code | LFA1 | PSTLZ | XK01 |
| Contact Email | LFA1 | SMTP_ADDR | XK01 |
| Mobile / Phone | LFA1 | TELF1 | XK01 |
| PAN Number | LFA1 | STCD2 | XK01 |
| GSTIN | LFB1 | STCEG | XK01 |
| GST Registration Type | LFB1 | GST_TYPE | XK01 |
| CIN Number | LFA1 | CIN_NO | XK01 |
| MSME / Udyam Number | LFA1 | MSME_NO | XK01 |
| TDS Section | LFBW | WITHT | XK01 |
| Account Holder Name | LFBK | KOINH | FI02 |
| Bank Account Number | LFBK | BANKN | FI02 |
| IFSC Code | LFBK | SWIFT | FI02 |
| Bank Name | LFBK | BANKA | FI02 |
| Branch | LFBK | BRNCH | FI02 |
| Cancelled Cheque Copy | LFBK | CHQ_DOC | FI02 |
| PAN Card Copy | DMS | PAN_DOC | CV01N |
| GST Certificate | DMS | GST_DOC | CV01N |
| Certificate of Incorporation | DMS | COI_DOC | CV01N |
| MSME Certificate | DMS | MSME_DOC | CV01N |
| ISO Certificate Copy | DMS | ISO_DOC | CV01N |
| IT Returns | DMS | ITR_DOC | CV01N |
| SAP Vendor Code (output) | LFA1 | LIFNR | XK01 |

#### 2. RFQ Creation → BAPI_RFQ_CREATE / ME41

| Portal Field | SAP Table | SAP Field | SAP Transaction |
|---|---|---|---|
| RFQ Reference No. | EKKO | EBELN | ME41 |
| Document Type | EKKO | BSART | ME41 |
| RFQ Description | EKKO | TXZ01 | ME41 |
| Quotation Deadline | EKKO | ANGDT | ME41 |
| Binding Period | EKKO | BNDDT | ME41 |
| Payment Terms | EKKO | ZTERM | ME41 |
| Purchasing Organization | EKKO | EKORG | ME41 |
| Purchasing Group | EKKO | EKGRP | ME41 |
| Company Code | EKKO | BUKRS | ME41 |
| Currency | EKKO | WAERS | ME41 |
| Vendor(s) Invited | EKKO | LIFNR | ME41 |
| Material Code (line) | EKPO | MATNR | ME41 |
| Material Description | EKPO | TXZ01 | ME41 |
| Quantity Required | EKPO | KTMNG | ME41 |
| Unit of Measure | EKPO | MEINS | ME41 |
| Plant | EKPO | WERKS | ME41 |
| Delivery Date | EKPO | EEIND | ME41 |
| Target Price | EKPO | NETPR | ME41 |

#### 3. Submit Bid / Quotation → ME47

| Portal Field | SAP Table | SAP Field | SAP Transaction |
|---|---|---|---|
| RFQ ID | EKKO | EBELN | ME47 |
| Vendor ID | EKKO | LIFNR | ME47 |
| Unit Price (per line) | EKPO | NETPR | ME47 |
| GST Rate | EKPO | MWSKZ (tax code) | ME47 |
| Tax Code mapped: 18%→G1, 12%→G2, 5%→G3, 28%→G4 | T007A | MWSKZ | — |
| Delivery Lead Time | EKKO | PLIFZ | ME47 |
| Freight | EKKO | COST_FREIGHT | ME47 |
| Validity Date | EKKO | BNDDT | ME47 |
| Incoterms | EKKO | INCO1 | ME47 |

#### 4. Award & PO Conversion → BAPI_INFORECORD_CREATE / ME58

| Portal Field | SAP Table | SAP Field | SAP Transaction |
|---|---|---|---|
| Awarded Vendor ID | A017 | LIFNR | ME14 |
| Material Code | A017 | MATNR | ME14 |
| Agreed Unit Price | A017 | NETPR | ME14 |
| Currency | A017 | WAERS | ME14 |
| Tax Code | A017 | MWSKZ | ME14 |
| Lead Time Days | A017 | PLIFZ | ME14 |
| PO Number (output) | EKKO | EBELN | ME58 |

#### 5. ASN / Inbound Delivery → BAPI_DELIVERY_CREATE_DN / VL31N

| Portal Field | SAP Table | SAP Field | SAP Transaction |
|---|---|---|---|
| PO Number | EKKO | EBELN | VL31N |
| Ship Date | LIKP | WADAT | VL31N |
| Carrier Name | LIKP | TDLNR | VL31N |
| Tracking Number | LIKP | LIFEX | VL31N |
| Vehicle Number | LIKP | EXTI2 | VL31N |
| SAP Inbound Delivery No. (output) | LIKP | VBELN | VL31N |
| Shipped Quantity (per line) | LIPS | LFIMG | VL31N |
| Reference PO Line | LIPS | POSNR | VL31N |

#### 6. Goods Receipt → MBGMCR03 IDoc / MIGO

| Portal Field | SAP Table | SAP Field | SAP Transaction |
|---|---|---|---|
| SAP MIGO Document No. (output) | MKPF | MBLNR | MIGO |
| PO Reference | MSEG | EBELN | MIGO |
| Inbound Delivery Ref. | MSEG | VBELN_IM | MIGO |
| Posting Date | MKPF | BUDAT | MIGO |
| Received Quantity | MSEG | MENGE | MIGO |
| Accepted Quantity | MSEG | ERFMG | MIGO |
| Rejected Quantity | MSEG | REJ_QTY | MIGO |
| Rejection Reason | MSEG | GRUND | MIGO |
| Posted By | MKPF | USNAM | MIGO |

#### 7. Invoice Verification → BAPI_INCOMINGINVOICE_CREATE / MIRO

| Portal Field | SAP Table | SAP Field | SAP Transaction |
|---|---|---|---|
| Invoice Indicator | RBKPV | INVOICE_IND | MIRO |
| Invoice Date | RBKPV | BLDAT | MIRO |
| Posting Date | RBKPV | BUDAT | MIRO |
| Invoice Number (Vendor Ref) | RBKPV | XBLNR | MIRO |
| Company Code | RBKPV | BUKRS | MIRO |
| Gross Amount | RBKPV | WRBTR | MIRO |
| Currency | RBKPV | WAERS | MIRO |
| SAP MIRO Doc No. (output) | RBKP | BELNR | MIRO |
| Line Item Amount | RBPOS | WRBTR | MIRO |
| PO Number (ref) | RBPOS | EBELN | MIRO |
| PO Line (ref) | RBPOS | EBELP | MIRO |
| Tax Code | RBPOS | MWSKZ | MIRO |
| Quantity | RBPOS | MENGE | MIRO |

#### 8. Payment Clearance → PAYEXT F110 IDoc

| Portal Field | SAP Table | SAP Field | SAP Transaction |
|---|---|---|---|
| Payment Run Date | REGUH | LAUFD | F110 |
| Payment Run ID | REGUH | LAUFI | F110 |
| Vendor ID | REGUH | LIFNR | F110 |
| SAP Payment Doc (output) | BKPF | BELNR | F110 |
| Payment Method | REGUH | UZAWE | F110 |
| Payment Amount | REGUH | WRBTR | F110 |
| Currency | REGUH | WAERS | F110 |
| Bank UTR Code | REGUH | BANK_TX_REF | F110 |
| Invoice Cleared | BSAK | BELNR | FBL1N |

---

## 8. RFQ Module Deep Dive

### RFQ Lifecycle State Machine

```
                    ┌──────────────┐
                    │    Draft     │
                    └──────┬───────┘
                           │ ME41 Publish
                           ▼
                    ┌──────────────┐
                    │ Bidding Open │◀──── reissueRFQ() ──┐
                    └──────┬───────┘                     │
                           │ Vendors Submit (ME47)        │
                           ▼                             │
                    ┌──────────────┐                     │
                    │  Submitted   │                     │
                    └──────┬───────┘                     │
                           │ ME48 Evaluation             │
                           ▼                             │
                    ┌──────────────┐                     │
                    │ Under Review │                     │
                    └──────┬───────┘                     │
                    ┌──────┴────────────────────┐        │
                    │                           │        │
                    ▼                           ▼        │
             ┌──────────┐               ┌───────────┐   │
             │ Awarded  │               │  Closed   │   │
             └──────┬───┘               └───────────┘   │
                    │ ME58 Convert                       │
                    ▼                                    │
             ┌──────────────┐                           │
             │ PO Generated │─────────────── cancelRFQ()┘
             └──────────────┘
```

### Sequence Diagram: Create RFQ (ME41)

```
Procurement Officer    RfqView.js           store-context.js         BAPI Console
        │                  │                       │                       │
        │── Fill Form ────▶│                       │                       │
        │                  │                       │                       │
        │── Submit ────────▶│                       │                       │
        │                  │── validate() ─────────│                       │
        │                  │── createRFQ(data) ────▶│                       │
        │                  │                       │── setState(rfqs[]) ───│
        │                  │                       │── logSAPEvent() ──────▶│
        │                  │                       │   type: 'BAPI'         │
        │                  │                       │   name: BAPI_RFQ_CREATE│
        │                  │                       │   payload: {           │
        │                  │                       │     EKKO: {...},       │
        │                  │                       │     T_RFQ_ITEMS: []   │
        │                  │                       │   }                    │
        │◀── setActiveProcTab('monitor') ──────────│                       │
        │                  │                       │── localStorage.set() ─│
```

### Sequence Diagram: Vendor Submit Bid (ME47)

```
Vendor           RfqView (me47 tab)     store-context.js         SAP Payload Console
  │                    │                       │                         │
  │── Select RFQ ─────▶│                       │                         │
  │── Fill Prices ─────▶│                       │                         │
  │── GST Rate ─────────▶│                       │                         │
  │── Submit ──────────▶│                       │                         │
  │                    │── handleBidSubmit() ──▶│                         │
  │                    │                       │── update rfqs[].bids[] ─│
  │                    │                       │── update rfqs[].status  │
  │                    │                       │   = 'Submitted'          │
  │                    │                       │── logSAPEvent()─────────▶│
  │                    │                       │   type: 'RFC'            │
  │                    │                       │   RFC_RFQ_SUBMIT_BID     │
  │                    │                       │   prices, gst, moq,      │
  │                    │                       │   freight, validity      │
  │◀── UI updates to monitor tab ─────────────│                         │
```

### Vendor Evaluation Scoring Formula (ME48)

```
Weighted Score = (Price Score × 0.40)
              + (Technical Score × 0.30)
              + (Delivery Score × 0.20)
              + (Vendor Rating × 0.10)

Where:
  Price Score    = (lowestTotalCost / vendorTotalCost) × 100
  Delivery Score = (shortestLeadTime / vendorLeadTime) × 100
  Technical Score = manually assigned (default 80-92)
  Vendor Rating   = historical rating stored in bid record
```

---

## 9. Authentication & Security

### Current State: ⚠️ No Authentication
The MVP has **no authentication layer**. All application data is stored in browser `localStorage` and any visitor accessing the URL has full access to all portal modules.

### Planned Authentication Architecture

```
POST /api/auth/register
  │── hash password (bcryptjs)
  │── save vendor to MongoDB
  └── return JWT token

POST /api/auth/login
  │── find vendor by email
  │── bcryptjs.compare(password, hash)
  │── if match: sign JWT(vendorId, role, exp: 1d)
  └── return { accessToken, refreshToken }

Protected Routes: Authorization: Bearer <JWT>
  ├── /api/rfqs/** → procurement & vendor roles
  ├── /api/purchase-orders/** → vendor role only
  ├── /api/invoices/** → vendor role only
  └── /api/admin/** → admin role only
```

### Security Vulnerabilities (Current)

| Severity | Issue | Location | Recommendation |
|---|---|---|---|
| 🔴 Critical | No authentication | Entire application | Implement JWT + bcrypt |
| 🔴 Critical | All state in localStorage — XSS accessible | store-context.js | Move to HttpOnly cookies + server sessions |
| 🟠 High | No input validation on any form | All View components | Add Zod or Joi schema validation |
| 🟠 High | SAP credentials would be in client-side if real RFC | store-context.js | All SAP calls must be server-side only |
| 🟡 Medium | CORS allows any localhost origin | server.js | Restrict to specific domain in production |
| 🟡 Medium | No rate limiting on Next.js routes | — | Add middleware |
| 🟡 Medium | MongoDB URI in plain .env | backend/.env | Use secrets manager (Vault/AWS Secrets) |
| 🟢 Low | Console exposes full SAP payload structures | BapiConsole.js | Disable in production builds |
| 🟢 Low | No HTTPS configured | — | Enforce TLS in production |

---

## 10. API Documentation

### Currently Live Endpoints (Express backend)

---

**GET /**
```
Purpose:  Root health check — confirms backend is running
Response: { message: "SAP Vendor Portal Backend Server is running!" }
Auth:     None
```

---

**GET /api/health**
```
Purpose:  Frontend-backend connectivity test, polled on app mount
Response: { status: "healthy", dbConnected: true, timestamp: "2026-..." }
Auth:     None
Error:    500 if DB unreachable
```

---

**GET /.well-known/appspecific/com.chrome.devtools.json**
```
Purpose:  Suppresses Chrome DevTools 404 console errors
Response: {}
Auth:     None
```

---

### Planned API Endpoints

**POST /api/auth/register**
```
Body:    { companyName, email, password, gstin, pan }
Response:{ token, vendor: { id, email, sapVendorCode } }
Errors:  400 Validation | 409 Already exists
```

**POST /api/rfqs**
```
Body:    { description, deadlineDate, items[], invitedVendors[] }
Response:{ rfq: { id, status: "Bidding Open", ... } }
Auth:    Bearer JWT (procurement role)
```

**POST /api/rfqs/:id/bid**
```
Body:    { unitPrices{}, gstRate, leadTime, freight, validityDate }
Response:{ bid: { vendorId, submittedAt, ... } }
Auth:    Bearer JWT (vendor role)
```

**POST /api/purchase-orders/:id/asn**
```
Body:    { shipDate, carrierName, trackingNumber, items[] }
Response:{ asn: { id, sapInboundDelivery, status: "In Transit" } }
Auth:    Bearer JWT (vendor role)
```

**POST /api/invoices**
```
Body:    { grnId, poId, invoiceNumber, invoiceDate, items[] }
Response:{ invoice: { id, sapMiroDoc, status: "Posted" } }
Auth:    Bearer JWT (vendor role)
```

---

## 11. Data Flow Architecture

### Complete Procure-to-Pay Lifecycle

```
┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐
│ VENDOR   │    │   RFQ    │    │QUOTATION │    │EVALUATION│    │   PO     │    │   ASN    │
│ONBOARDING│───▶│PUBLISHED │───▶│SUBMITTED │───▶│& AWARD   │───▶│GENERATED │───▶│DISPATCHED│
└──────────┘    └──────────┘    └──────────┘    └──────────┘    └──────────┘    └──────────┘
    BAPI              BAPI            RFC             BAPI           OData             BAPI
 VENDOR_CREATE     RFQ_CREATE    RFQ_SUBMIT_BID  INFORECORD_CREATE PO_SRV    DELIVERY_CREATE_DN
                                                                                       │
                                                                                       ▼
┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐
│ PAYMENT  │    │ INVOICE  │    │ 3-WAY    │    │   GRN    │    │  MIGO    │    │ INBOUND  │
│CLEARED   │◀───│ POSTED   │◀───│  MATCH   │◀───│GENERATED │◀───│ AUTO-RUN │◀───│DELIVERY  │
└──────────┘    └──────────┘    └──────────┘    └──────────┘    └──────────┘    └──────────┘
   IDoc              BAPI         Internal          IDoc            MIGO         (10 sec auto)
PAYEXT_F110    INCOMINGINVOICE    Validation    MBGMCR03_GRN     VL31N
  _PAYMENT        _CREATE                         IDoc
```

### Automated Workflow Timers

| Event | Trigger | Delay | Action |
|---|---|---|---|
| Auto-approve registration | `submitRegistration()` | 5 seconds | `approveRegistration()` |
| GRN auto-receive | `submitASN()` | 10 seconds | `receiveGoods()` / MIGO sim |
| F110 payment run | `submitInvoice()` | 12 seconds | `executePaymentRun()` |
| PO OData sync log | `awardVendorBid()` | 1 second | `logSAPEvent(ODATA)` |

---

## 12. File Management Architecture

### Current State
- **File inputs** exist in the ASN form (Packing List, Invoice Copy, Transport Document) and the Quotation form (Technical Documents)
- Files are stored **in browser memory only** (React `useState`) — they are not persisted or uploaded
- `multer ^2.1.1` is installed in the backend but no file upload routes are implemented

### Planned Upload Architecture

```
Browser                   Express (5000)           MongoDB / Storage
   │                           │                         │
   │── POST /api/upload ───────▶│                         │
   │   multipart/form-data      │── multer middleware ────│
   │                           │── save buffer           │
   │                           │── store GridFS/S3 ──────▶│
   │◀── { fileId, url } ───────│                         │
```

**Recommended storage**: AWS S3 or Cloudinary for document storage, with MongoDB storing file metadata (filename, S3 key, uploadedBy, uploadedAt, linkedDocId).

---

## 13. Notification Architecture

### Current: Simulated In-App Chat Notifications
All notifications are delivered via the `chats[]` state array — system-generated messages appear in the Communications module.

| Event | Sender | Message Example |
|---|---|---|
| Registration submitted | System | "Your registration is in the approval queue." |
| Registration approved | System | "Approved! SAP Vendor Code: VND-40013." |
| First PO released | Procurement | "Welcome aboard! PO released for review." |
| RFQ created | System | "RFQ published. Vendors invited to bid." |
| Quotation submitted | System | "Quotation for RFQ-2026-809 submitted." |
| RFQ awarded | Procurement | "PO-45000289xx generated and synced." |
| PO acknowledged | System | "PO acknowledged. You can now submit ASN." |
| ASN dispatched | Warehouse | "Inbound delivery created in SAP." |
| GRN received | Quality | "GRN synced. [Accepted/Discrepancy]." |
| Invoice posted | Finance | "MIRO Doc posted. Set for F110 clearing." |
| Payment cleared | Finance | "Payment cleared. Bank UTR: UTRxxxx." |

### Planned Notification Architecture (V2)
- **Email**: Nodemailer via SMTP/SendGrid for transactional notifications
- **Push notifications**: Socket.io broadcast to connected vendor sessions
- **SAP-triggered**: IDoc inbound trigger → webhook → portal notification

---

## 14. Deployment Architecture

### Current Environment
| Service | Host | Port |
|---|---|---|
| Next.js Frontend | localhost (dev) | 3000 |
| Express Backend | localhost (dev) | 5000 |
| MongoDB | Atlas Cloud (shared) | 27017 (TLS) |

### Recommended Production Deployment

```
┌─────────────────────────────────────────────────────┐
│                  Production (Cloud)                  │
│                                                     │
│  ┌───────────────┐     ┌─────────────────────────┐  │
│  │   Vercel CDN  │     │   Railway / Render       │  │
│  │   (Frontend)  │     │   (Backend Node.js)      │  │
│  │               │────▶│                         │  │
│  │ next build    │     │ node server.js          │  │
│  │ SSR + Edge    │     │ PORT=5000                │  │
│  └───────────────┘     └──────────┬──────────────┘  │
│                                   │                  │
│                                   ▼                  │
│                        ┌──────────────────────┐     │
│                        │   MongoDB Atlas M10+  │     │
│                        │   (Dedicated Cluster) │     │
│                        └──────────────────────┘     │
└─────────────────────────────────────────────────────┘
```

### Environment Variables Required for Production

```env
# Frontend (.env.production)
NEXT_PUBLIC_API_URL=https://api.vendorconnect.yourdomain.com

# Backend
PORT=5000
MONGO_URI=mongodb+srv://user:pass@cluster.mongodb.net/sap_vendor_portal
FRONTEND_URL=https://vendorconnect.yourdomain.com
NODE_ENV=production
JWT_SECRET=<strong-random-256-bit-secret>
JWT_REFRESH_SECRET=<different-strong-secret>
```

---

## 15. Infrastructure Architecture

### Current Infrastructure

```
Dev Machine (Windows)
├── Node.js v22.13.1
├── npm / npx
├── MongoDB Compass (local GUI)
└── Browser: Chrome
    ├── localhost:3000 (Next.js)
    └── localhost:5000 (Express)
```

### Recommended Production Infrastructure

```
Internet
   │
   ▼
Cloudflare (DNS + DDoS + CDN)
   │
   ├──▶ Vercel Edge Network
   │      └── Next.js App (Global CDN)
   │
   └──▶ Load Balancer (if needed)
          └── Railway / Render / EC2
                 └── Node.js (Express + Socket.io)
                        │
                        └── MongoDB Atlas M10 Cluster
                               ├── Primary (writes)
                               └── Secondary (reads)
```

---

## 16. Scalability Assessment

### Current Bottlenecks

| Layer | Bottleneck | Severity | Impact |
|---|---|---|---|
| **Frontend State** | All state in React Context + localStorage | 🔴 High | Single-user only; no multi-session, no sync |
| **Frontend State** | 1,309-line store-context.js — single file | 🟠 Medium | Maintenance burden |
| **Backend** | No API routes — all logic in frontend | 🔴 High | No server-side validation or persistence |
| **Database** | No Mongoose models defined | 🟠 Medium | Cannot persist data server-side |
| **Database** | No indexes defined | 🟡 Low | Will degrade with volume |
| **SAP** | All BAPI calls are simulated client-side | 🔴 High | Not production-usable without RFC layer |
| **Auth** | No authentication | 🔴 Critical | Single shared session |
| **Files** | No file persistence | 🟠 Medium | Uploaded docs lost on refresh |

### Scaling Strategy (V1 → V2)

**Phase 1 (Immediate — 1-4 weeks)**
- Migrate all business logic from `store-context.js` to Express API routes
- Define all Mongoose schemas and indexes
- Implement JWT authentication
- Add Zod validation on all API inputs

**Phase 2 (Near-term — 1-3 months)**
- Add Redis for session management and API caching
- Implement real SAP RFC/BAPI calls via SAP Node.js RFC SDK
- Add S3 for file storage
- Add WebSocket real-time PO/GRN push notifications

**Phase 3 (Scale — 3-12 months)**
- Multi-tenant architecture (one DB per company)
- Queue-based BAPI processing via Bull/RabbitMQ
- Horizontal scaling with PM2 cluster mode
- CDN for static assets

---

## 17. Security Audit

### Authentication
| Check | Status | Severity |
|---|---|---|
| Authentication implemented | ❌ Missing | 🔴 Critical |
| Password hashing (bcrypt) | ⚠️ Installed, unused | 🔴 Critical |
| JWT token management | ⚠️ Installed, unused | 🔴 Critical |
| Role-based access control (RBAC) | ❌ Missing | 🔴 Critical |
| Session expiry / refresh | ❌ Missing | 🟠 High |

### API Security
| Check | Status | Severity |
|---|---|---|
| CORS configured | ✅ localhost:3000 only | 🟢 Low |
| Helmet HTTP headers | ✅ Disabled CSP in dev | 🟡 Medium |
| Rate limiting (express-rate-limit) | ✅ 100 req/15 min | 🟢 Low |
| Input sanitization | ❌ Missing | 🟠 High |
| SQL/NoSQL injection protection | ⚠️ Mongoose helps, no explicit sanitize | 🟡 Medium |
| Request size limits | ❌ Not set | 🟡 Medium |

### Data Security
| Check | Status | Severity |
|---|---|---|
| HTTPS/TLS | ❌ Dev only, not enforced | 🟠 High |
| Secrets in .env | ✅ .env in .gitignore | 🟢 Low |
| MongoDB URI exposed in .env | ⚠️ Plain text | 🟡 Medium |
| GSTIN/PAN in localStorage | ⚠️ XSS risk | 🟠 High |
| SAP payloads in browser console | ⚠️ Visible to all users | 🟡 Medium |

---

## 18. Architecture Decision Records (ADR)

### ADR-001: React Context API over Redux
- **Decision**: Use React Context + useState instead of Redux/Zustand
- **Rationale**: Lower boilerplate for MVP; business logic co-located with state in one file
- **Tradeoff**: Context re-renders all consumers on any state change; not scalable beyond 2-3k lines
- **Future**: Migrate to Zustand or React Query + server state when API routes are live

### ADR-002: localStorage for State Persistence
- **Decision**: Persist entire application state to `localStorage` on every state change
- **Rationale**: Enables full session persistence without backend API (MVP demo use case)
- **Tradeoff**: XSS risk; 5MB localStorage limit; single browser/user only
- **Future**: Replace with server-side sessions + React Query cache when auth is implemented

### ADR-003: Simulated SAP BAPIs Client-Side
- **Decision**: Log SAP payload structures client-side rather than making real RFC calls
- **Rationale**: Enables demo without SAP system access; allows frontend-first development
- **Tradeoff**: Not production-usable; SAP integration must be re-implemented server-side
- **Future**: All logSAPEvent() calls to be replaced with backend API calls to an RFC proxy layer

### ADR-004: Single-Page Tab Router
- **Decision**: Use `activeTab` state string for navigation rather than Next.js dynamic routes
- **Rationale**: Simplest SPA pattern; avoids route complexity in early MVP
- **Tradeoff**: No deep-linking; browser back button doesn't navigate modules
- **Future**: Replace with Next.js App Router nested routes for proper URL addressability

### ADR-005: MongoDB Atlas over PostgreSQL
- **Decision**: Use MongoDB for the backend database
- **Rationale**: Flexible document model fits nested SAP procurement documents (PO with line items, bids with prices per line). Schema evolution without migrations during rapid MVP development.
- **Tradeoff**: Weaker ACID guarantees; complex joins require aggregation pipelines
- **Future**: Consider CockroachDB or Supabase if complex relational reporting is needed

### ADR-006: Next.js 16 (App Router)
- **Decision**: Use Next.js 16 with App Router and React Compiler enabled
- **Rationale**: Modern React 19 features, `'use client'` boundary control, built-in font/image optimization
- **Tradeoff**: Breaking changes from Next.js 13 conventions; React Compiler is experimental
- **Note**: Per AGENTS.md — this is NOT the standard Next.js. APIs differ from training data; always read `node_modules/next/dist/docs/`

---

## 19. AI/Automation Readiness Assessment

### Current AI Capabilities: None

The platform currently has no AI components. However, the data model and architecture are well-positioned to support AI features.

### AI Feature Readiness Matrix

| AI Feature | Data Available | Infrastructure Ready | Effort |
|---|---|---|---|
| **AI Procurement Assistant** | ✅ RFQ data, PO history | ❌ No LLM integration | Medium |
| **RFQ Copilot** (bid analysis) | ✅ Bid prices, lead times | ❌ No scoring API | Low — can extend ME48 |
| **Vendor Recommendation Engine** | ⚠️ Partial (rating, history) | ❌ No ML pipeline | High |
| **Spend Analytics Agent** | ✅ PO values, payment data | ❌ No warehouse | Medium |
| **Contract Intelligence Agent** | ❌ No contract docs | ❌ No document store | High |

### Required Architecture Changes for AI

1. **Vector Database** (Pinecone/Weaviate) — for semantic RFQ/bid matching
2. **LLM Integration** (OpenAI/Gemini API) — for procurement assistant chat
3. **Data Pipeline** — export state to data warehouse (Snowflake/BigQuery) for analytics
4. **ML Model Serving** — FastAPI Python service for vendor scoring model
5. **Document Processing** — PDF extraction for invoice/contract analysis (Textract/DocAI)

```
Frontend Chat → Express API → LLM Proxy → OpenAI/Gemini
                           → MongoDB (history)
                           → Vector DB (semantic search of RFQs)
```

---

## 20. Future-State Architecture: V2 Enterprise Blueprint

### Target Scale
- 100,000+ registered vendors
- Multi-tenant (one portal per buying organization)
- 50+ concurrent procurement cycles
- Real-time SAP S/4HANA integration
- AI-powered bid evaluation and spend analytics

```
                          INTERNET
                             │
                    ┌────────▼────────┐
                    │   Cloudflare    │
                    │   CDN + WAF     │
                    └────────┬────────┘
                             │
              ┌──────────────┼──────────────┐
              ▼              ▼              ▼
    ┌──────────────┐ ┌──────────────┐ ┌──────────────┐
    │  Vercel Edge │ │  API Gateway │ │  SAP BTP     │
    │  (Next.js)   │ │  (Kong/AWS)  │ │  Integration │
    │  Multi-tenant│ │  Rate limit  │ │  Suite       │
    │  SSR         │ │  Auth proxy  │ │  (RFC/BAPI)  │
    └──────────────┘ └──────┬───────┘ └──────┬───────┘
                            │                │
                    ┌───────▼───────────────▼──────┐
                    │    Microservices Layer         │
                    │                               │
                    │  ┌─────────┐ ┌─────────┐     │
                    │  │ Vendor  │ │   RFQ   │     │
                    │  │ Service │ │ Service │     │
                    │  └─────────┘ └─────────┘     │
                    │  ┌─────────┐ ┌─────────┐     │
                    │  │  PO/ASN │ │Invoice  │     │
                    │  │ Service │ │ Service │     │
                    │  └─────────┘ └─────────┘     │
                    │  ┌─────────┐ ┌─────────┐     │
                    │  │Payment  │ │  AI/ML  │     │
                    │  │ Service │ │ Service │     │
                    │  └─────────┘ └─────────┘     │
                    └───────────────┬───────────────┘
                                    │
                    ┌───────────────▼────────────────┐
                    │    Message Bus (RabbitMQ/Kafka) │
                    │    BAPI/IDoc async processing   │
                    └───────────────┬────────────────┘
                                    │
              ┌─────────────────────┼──────────────────────┐
              ▼                     ▼                       ▼
    ┌──────────────────┐ ┌──────────────────┐  ┌──────────────────┐
    │  MongoDB Atlas   │ │  Redis Cluster   │  │  Snowflake DWH   │
    │  (Sharded,       │ │  (Sessions,      │  │  (Analytics,     │
    │   Multi-tenant)  │ │   Cache, Queues) │  │   AI Training)   │
    └──────────────────┘ └──────────────────┘  └──────────────────┘
```

### V2 Key Changes from V1

| Concern | V1 (Current) | V2 (Target) |
|---|---|---|
| Architecture | Monolith frontend | Microservices |
| State | localStorage + Context | Server-side + React Query |
| Auth | None | Keycloak / Auth0 OIDC |
| SAP | Simulated client-side | Real RFC via SAP Node.js SDK |
| Database | No schemas | Sharded MongoDB + Redis |
| Real-time | Socket.io (basic) | Kafka event streaming |
| Multi-tenancy | Single vendor | Org-scoped data partitioning |
| Files | None | S3 + document AI pipeline |
| AI | None | LLM + Vector DB + ML scoring |
| Monitoring | None | Datadog / Grafana + Sentry |
| Deployment | localhost | Vercel + Railway + Kubernetes |
| CICD | None | GitHub Actions → staging → production |

---

## Appendix A: Complete File Inventory

| File | Size | Purpose |
|---|---|---|
| `src/app/page.js` | 332 lines | SPA orchestrator, all state wiring |
| `src/app/layout.js` | 34 lines | Root HTML layout, StoreProvider |
| `src/app/globals.css` | 108 lines | Design tokens, animations, scrollbars |
| `src/lib/store-context.js` | 1,309 lines | All business logic + SAP simulation |
| `src/lib/store.js` | 200 lines | Initial mock data (RFQs, logs, profile) |
| `src/lib/utils.ts` | 5 lines | cn() classname utility |
| `src/components/portal/RfqView.js` | 1,960 lines | Full RFQ lifecycle UI (103 KB) |
| `src/components/portal/PurchaseOrdersView.js` | 2,186 lines | PO lifecycle (118 KB) |
| `src/components/portal/DashboardView.js` | 506 lines | KPI dashboard |
| `src/components/portal/RegistrationView.js` | ~400 lines | Onboarding form |
| `src/components/portal/InvoiceProcessingView.js` | ~300 lines | MIRO interface |
| `src/components/portal/BapiConsole.js` | 87 lines | SAP payload debugger |
| `src/components/portal/Sidebar.js` | 114 lines | Navigation with badges |
| `src/components/portal/Header.js` | 42 lines | Top bar branding |
| `backend/server.js` | 50 lines | Express app + routes |
| `backend/config/db.js` | 11 lines | Mongoose connectDB() |
| `backend/.env` | — | PORT, MONGO_URI, FRONTEND_URL |
| `next.config.ts` | 9 lines | React Compiler enabled |
| `components.json` | — | shadcn/ui registry |

---

*Document generated: June 2026 · VendorConnect Portal Architecture v1.0*
