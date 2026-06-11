# Frontend Architecture Transition Guide — Modular Enterprise Patterns
> **Classification**: Internal Technical Blueprint · **Date**: June 2026

This document outlines the architectural transition of the **VendorConnect Portal** from a monolithic client-side context state machine (`store-context.js`) to a scalable, domain-driven **Enterprise-Grade React/Next.js Architecture**. 

---

## 1. Architectural Philosophy

The monolithic state model is split into decoupled layers to achieve:
1. **Separation of Concerns (SoC)**: Presentation code is strictly decoupled from state queries, REST clients, and socket loggers.
2. **Domain Encapsulation**: State, hooks, services, and sub-views relating to specific P2P transactions are grouped within dedicated domain boundaries (`features/`).
3. **Optimized Render Overhead**: Removing transactional data arrays from the global context prevents unnecessary full-page rendering cycles when updates occur (e.g. chat messages or logging).

---

## 2. Directory Structure

The codebase is structured under the following pattern:

```
src/
├── app/                              ← Next.js App Router (Layouts and Shell providers)
│   ├── layout.js                     ← App container, mounts GlobalShellProvider
│   ├── page.js                       ← Portal SPA Tab Controller
│   └── globals.css                   ← Fiori themes and transitions
│
├── components/                       ← Shared UI components (no transaction logic)
│   ├── portal/
│   │   ├── Header.js                 ← Top nav, system status
│   │   ├── Sidebar.js                ← Left sidebar, navigation items
│   │   └── BapiConsole.js            ← Floating SAP Payload logs drawer
│   └── ui/
│       └── button.js                 ← shadcn primitives
│
├── features/                         ← Domain-driven feature modules
│   ├── profile/                      ← Onboarding & Registration (xk01)
│   │   ├── components/               ← Subcomponents & Views
│   │   │   ├── RegistrationView.js
│   │   │   └── OnboardingView.js
│   │   ├── hooks/                    ← Custom React hooks for profile transactions
│   │   │   └── useProfile.js
│   │   └── services/                 ← Axios/Fetch REST API clients
│   │       └── profileService.js
│   │
│   ├── rfq/                          ← Quotations & Bidding (me41/47/48)
│   │   ├── components/
│   │   │   ├── RfqView.js
│   │   │   └── RFQsView.js
│   │   ├── hooks/
│   │   │   └── useRFQs.js
│   │   └── services/
│   │       └── rfqService.js
│   │
│   ├── purchase-order/               ← Orders, Inbound Deliveries, Receipts (me21n/migo)
│   │   ├── components/
│   │   │   └── PurchaseOrdersView.js
│   │   ├── hooks/
│   │   │   └── usePOs.js
│   │   └── services/
│   │       └── poService.js
│   │
│   ├── billing/                      ← MIRO Invoice Processing (miro)
│   │   ├── components/
│   │   │   ├── InvoiceProcessingView.js
│   │   │   └── InvoicesView.js
│   │   ├── hooks/
│   │   │   └── useInvoices.js
│   │   └── services/
│   │       └── invoiceService.js
│   │
│   ├── payments/                     ← Cleared Payments & TDS (f110/fbl1n)
│   │   ├── components/
│   │   │   ├── PaymentTrackingView.js
│   │   │   └── PaymentsView.js
│   │   ├── hooks/
│   │   │   └── usePayments.js
│   │   └── services/
│   │       └── paymentService.js
│   │
│   └── dashboard/                    ← Analytics, Scorecards, & Global Communication
│       ├── components/
│       │   ├── DashboardView.js
│       │   ├── CommunicationsView.js
│       │   ├── PerformanceView.js
│       │   ├── OverviewView.js
│       │   └── ChatsView.js
│       ├── hooks/
│       │   └── useDashboard.js
│       └── services/
│           └── dashboardService.js
│
└── lib/                              ← Core utilities & configurations
    ├── api-client.js                 ← Unified fetch client with interceptors
    ├── shell-context.js              ← Minimal global shell context (Tab index, SAP logs)
    └── utils.js                      ← Layout helper functions
```

---

## 3. Data Flow Architecture

```
┌────────────────────────────────────────────────────────────────────────┐
│                              PRESENTATION                              │
│                                                                        │
│                      PaymentTrackingView (UI)                          │
└──────────────────────────────────┬─────────────────────────────────────┘
                                   │
┌──────────────────────────────────▼─────────────────────────────────────┐
│                            CUSTOM HOOKS LAYER                          │
│                                                                        │
│        usePayments() ← tracks local payments, loading, error states     │
└──────────────────────────────────┬─────────────────────────────────────┘
                                   │ Uses service client
┌──────────────────────────────────▼─────────────────────────────────────┐
│                            SERVICES LAYER                              │
│                                                                        │
│   paymentService.js ← maps endpoints and payloads to standard JSON     │
└──────────────────────────────────┬─────────────────────────────────────┘
                                   │ Fetches
┌──────────────────────────────────▼─────────────────────────────────────┐
│                            API CLIENT UTILS                            │
│                                                                        │
│        apiClient.js ← manages base URL, tokens, request/response logs  │
└──────────────────────────────────┬─────────────────────────────────────┘
                                   │ HTTP
                                   ▼
                             Node.js Backend
```

---

## 4. Migration Strategy

To execute this migration without breaking the application:
1. **API Client & Shell Setup**: Establish `api-client.js` and `shell-context.js` containing the layout-level shell contexts.
2. **Move Views and Forms**: Move code files from `src/components/portal/` to target folders in `src/features/`.
3. **Implement Services and Custom Hooks**: Write hooks containing transaction operations and state transitions, matching properties expected by each view.
4. **App Integration**: Update the root `page.js` to route and render components from feature modules.
