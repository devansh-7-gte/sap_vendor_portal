# Implementation Plan — Closing Incomplete Work

Source: audit of `src/` and `backend/` for stubs, dead code, and missing tests (see chat history). No backend routes/controllers were found incomplete — all gaps are in the frontend and in test coverage.

---

## Phase 1 — Cleanup (low risk, do first)

Removes confusion about which files are "real" before any new work touches them.

- [x] Delete orphaned pre-migration components (unused, superseded by `src/features/*`):
  - `src/components/portal/DashboardView.jsx`
  - `src/components/portal/AnalyticsView.jsx`
  - `src/components/portal/POsView.jsx`
  - ~~`src/components/portal/ToastNotification.jsx`~~ — **KEPT**: verified it's actively imported and rendered by `src/lib/portal-context.js` (the app-wide provider used in `layout.jsx`), so it is not orphaned. Plan's assumption was incorrect.
  - `src/components/portal/payment/AccountStatement.jsx`
  - `src/components/portal/payment/MSMEPaymentMonitor.jsx`
  - `src/components/portal/payment/PaymentAdviceCenter.jsx`
  - `src/components/portal/payment/PaymentList.jsx`
  - `src/components/portal/payment/TDSDocuments.jsx`
- [x] Delete orphaned live-tree duplicates (not imported by any `page.jsx`):
  - `src/features/dashboard/components/ChatsView.jsx` (superseded by `CommunicationsView.jsx`)
  - `src/features/payments/components/PaymentsView.jsx` (superseded by `PaymentTrackingView.jsx`)
- [x] Grepped the repo for imports of each path above before deleting, to confirm zero remaining references.
- [x] Ran `npm run build` after deletion — compiled successfully, all 13 routes generated.

**Effort:** ~1 hour. **Risk:** low (verify no-import first).

---

## Phase 2 — Wire the RFQ lifecycle to real backend calls (highest priority)

This is the core workflow of the portal and is currently UI-only — every action is an `alert()`, nothing persists.

File: `src/features/rfq/components/RfqView.jsx`

- [x] **Backend audit finding:** `backend/routes/rfq.routes.js` + `backend/controllers/rfq.controller.js` already implement the full lifecycle (create, cancel, reissue, submitBid, evaluate, award→PO). The frontend actions in `RfqView.jsx` were already calling these real endpoints via `rfqHook`/`rfqService` — the only gap was that every action followed a real backend call with a hardcoded `alert()` instead of a toast, and errors were silently swallowed (`.catch(() => null)`), so failures were invisible to the user. No new backend endpoints were needed.
- [x] `src/features/rfq/services/rfqService.js` — removed the error-swallowing `.catch(() => null)` on mutating calls so failures propagate.
- [x] `src/features/rfq/hooks/useRFQs.js` — `submitBid`, `createRFQ`, `awardVendorBid`, `reissueRFQ`, `cancelRFQ` now return `{ success, error, ... }` instead of silently catching and returning nothing.
- [x] `src/lib/portal-context.js` — added `handleCreateRFQ`, `handleReissueRFQ`, `handleCancelRFQ`, and updated `handleBidSubmit`/`awardVendorBidWrapper` to be async and call `addToast('success'|'error', ...)` based on the real backend result.
- [x] Line ~419 — **Create RFQ**: `confirmAndPublishRFQ` now awaits the real create call; toast (success/failure) fires from `portal-context.js`; form only resets and the draft only clears on success — on failure the user's input is preserved so they can retry.
- [x] Line ~482 — **Submit Quotation (bid)**: same pattern — awaits `handleBidSubmit`, toasts via `portal-context.js`, preserves the form on failure.
- [x] Line ~550 — **Convert RFQ to PO (award)**: `triggerPOConversion` awaits `awardVendorBid`; the old unconditional "BAPI_PO_CREATE Sync Complete" alert is gone — the toast now only fires (with the real PO id) when the backend actually created the PO, and shows an error toast otherwise.
- [x] Line ~1163 — **Reissue RFQ**: awaits the real backend call; toast reflects actual outcome.
- [x] Line ~1176 — **Cancel RFQ**: awaits the real backend call; toast reflects actual outcome; confirmation dialog kept.
- [x] Line ~1500 — **Save Quotation Draft**: now persists `quoteForm` to `localStorage` (`sap_vendor_portal_quote_draft`) and is restored on mount; cleared automatically after a successful submit.
- [x] Line ~1955 — **Save RFQ Draft**: now persists `rfqForm` + `addedItems` to `localStorage` (`sap_vendor_portal_rfq_draft`) and is restored on mount; cleared automatically after a successful create.
- [x] `src/features/rfq/components/RFQsView.jsx:96` — **investigated, left unchanged**: this component is not imported by any `page.jsx` or any other file (confirmed via repo-wide grep) — it's dead/orphaned code the original audit missed, superseded by the bidding UI now embedded in `RfqView.jsx`. Wiring its alert would have no effect since it's unreachable. Recommend deleting it in a future cleanup pass alongside Phase 1 (needs a user decision since Phase 1 is marked done).

**Effort:** ~0.5 day (all backend endpoints already existed; the work was toast/error-handling wiring plus draft persistence, not new endpoint construction).
**Risk:** low — no backend changes; verified request/response shapes match existing controller contracts.

---

## Phase 3 — Wire Payments and Dashboard stub actions

File: `src/features/payments/components/PaymentTrackingView.jsx`
- [x] **Backend audit finding:** no CSV export, dispute/query, or Form 16A document-generation endpoints exist. `GET /api/reports/statement` (PDF) and `POST /api/chats` (Communications Hub) already exist and were reused where applicable. The `Document` model's `linkedTo` enum has no TDS/Form16A option, and the on-screen TDS certificate registry is illustrative mock data, not a real filing record — so there is nothing genuine to download.
- [x] Line ~336 — **Filters pane button removed** (not "wired"): the search box + From/To date + Method dropdown directly above the table already implement real, working client-side filtering (`filteredPayments`/`filteredTds`) — the "Filters" button was a redundant dead stub sitting next to already-functional filters, so it was deleted rather than building a second parallel filter UI.
- [x] Line ~345 — **Ledger export**: implemented as a real client-side CSV export (`handleExportLedger`) of `filteredPayments`, so it respects whatever search/date/method filters are currently applied. No backend CSV endpoint existed to call instead.
- [x] Line ~496 — **Raise inquiry**: now calls `portal.dashboardHook.sendChatMessage(...)` (the real `POST /api/chats` endpoint) with a message referencing the UTR/invoice, then toasts success/failure — no dedicated dispute endpoint exists, so this reaches a human via the real Communications Hub instead.
- [x] Line ~609 — **Form 16A download**: no backend can generate or serve this file, so rather than faking a download, the button now sends a real chat message requesting the certificate (same `sendChatMessage` path) and is relabeled "Request Certificate" so it doesn't claim to do something it can't.

File: `src/features/dashboard/components/DashboardView.jsx`
- [x] Line ~176 — **`handleBulkAction`**: now async; `Acknowledge` calls the real `PUT /api/pos/:id/acknowledge` per selected id that matches a PO (via `portal.poHook.acknowledgePO`, updated to return `{success, error}` instead of swallowing errors); `Download` calls the real `GET /api/reports/invoice/:id` PDF endpoint per selected id that matches an invoice. Both paths toast a success/failure count via `portal.addToast`. Ids in the shared selection that don't match either dataset are silently skipped and counted as failures.
- [x] `src/features/purchase-order/hooks/usePOs.js` — `acknowledgePO` now returns `{ success, error }` instead of only logging to console, matching the Phase 2 error-propagation pattern.

**Effort:** ~1 day (backend endpoints were mostly missing for this phase's original scope; work was re-routing to genuinely existing endpoints plus one client-side CSV builder).
**Risk:** low — no backend changes; `npm run build` passes.

---

## Phase 4 — Replace simulated SAP sync with real integration (or explicit mock boundary)

File: `src/lib/portal-context.js`
- [x] Line ~307 — "Fallback refresh for GRN/MIGO simulation": confirmed backend (`backend/controllers/po.controller.js` `submitASN`) genuinely fakes goods receipt via a 10s `setTimeout` with `[SIMULATOR]` logs — no real SAP GRN/MIGO integration exists. Labeled the frontend fallback timer with a `// MOCK —` comment explaining it just refreshes state after the backend's fake timer fires, so it isn't mistaken for production polling logic later.
- [x] Line ~360 — "Payment simulation": same finding — `backend/controllers/invoice.controller.js` `submitInvoice` fakes the payment run via a 12s `setTimeout` (`[SIMULATOR]` logs). Same `// MOCK —` treatment applied.
- [ ] Real SAP integration is out of scope for this pass (no SAP-side requirements/contract available). Tracked as a separate, larger effort outside this plan — revisit when SAP-side polling/webhook contract is defined.

**Effort:** 0.5 day for the mock-labeling pass; real integration is a separate scoped project.
**Risk:** low for labeling; high/unknown for real integration (external dependency).

---

## Phase 5 — Test coverage (currently zero)

- [x] Root `package.json`: `npm test` runs Vitest (`vitest.config.mjs`; tests matched under `src/**/*.test.{js,jsx}` so the Jest backend suite stays separate).
- [x] `backend/package.json`: `npm test` runs Jest + Supertest against a test app harness (`backend/tests/testApp.js` — real routes + errorHandler, no sockets/CORS/rate-limit) with `mongodb-memory-server` (`backend/tests/setup.js`). `--forceExit` is needed because `submitRegistration` schedules a 5s auto-approve `setTimeout`.
- [x] Priority targets covered:
  1. `backend/tests/auth.test.js` (register/login/me: 201+token, dup 409, zod 400s, 401s) and `backend/tests/vendor.test.js` (profile CRUD, nested legacy address/bank flattening, submit/approve/reject flow, admin list filtering) — 36 backend tests total.
  2. `backend/tests/rfq.test.js` — full lifecycle: sequential id generation, invited-vendor filtering, bid validation (missing line price, past deadline, closed bidding), GST→tax-code mapping, evaluation scoring math, award→PO creation with bid pricing, double-award/no-bid rejection, cancel/reissue.
  3. `validateField` extracted from `RegistrationView.jsx` into `src/features/profile/validation.js` (pure module, no behavior change) and covered by `src/features/profile/validation.test.js` (15 tests: required fields + PIN/email/phone/PAN/GSTIN/account/IFSC formats).
  4. Route smoke tests **deferred**: every `page.jsx` renders through `usePortal()`, so smoke tests need a mocked PortalProvider (fetch + socket.io) — scaffold exists to add them later.
- [x] `.github/workflows/test.yml` runs both suites on PRs and pushes to master.

**Bugs found & fixed by these tests (minimal fixes, verified by the suite):**
- `rfq.controller.js` `submitBid`: `vendor` was referenced before its `const` declaration (TDZ) — any bid from a non-invited vendor crashed with a 500. Vendor lookup hoisted.
- `auth.controller.js` / `vendor.controller.js`: register/login responses leaked the bcrypt password hash (`select: false` doesn't strip fields on `create()` or `+password` queries). `formatVendorResponse` now deletes `password`.

**Known quirk documented, not changed:** the first submitted bid flips RFQ status to `Submitted`, which blocks any second vendor from bidding (`Bidding is closed`). Tests seed multi-bid scenarios directly via the model. Worth a product decision later.

**Effort:** 1 week for initial scaffolding + priority-1/2 coverage; ongoing after that.
**Risk:** low (additive, no behavior change).

---

## Suggested Order

1. Phase 1 (cleanup) — quick, de-risks everything after it.
2. Phase 2 (RFQ wiring) — highest business value, do while context is fresh.
3. Phase 5 test scaffolding started in parallel with Phase 2 (write tests for RFQ actions as they're wired, rather than after).
4. Phase 3 (Payments/Dashboard stubs).
5. Phase 4 (mock labeling now; real SAP integration scoped separately later).

## Open Questions Before Starting Phase 2/3

- Do backend endpoints for RFQ create/publish/convert-to-PO/reissue/cancel already exist under a different name, or do they need to be built from scratch?
- Is there a real document-storage backend for Form 16A / ledger exports, or does that need to be added?
- Is real SAP GRN/MIGO/payment integration in scope for this phase of work, or should it stay mocked for now?
