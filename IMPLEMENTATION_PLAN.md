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

---

## Phase 6 — Authorization, auth-flow gaps, and remaining dead code

Source: follow-up audit of the vendor-facing UI, `PortalProvider`, and the backend authorization surface (2026-07-21). Phases 1–5 above closed out the stub-wiring and test-coverage work; this phase addresses gaps that are structural rather than cosmetic — most importantly, **there is currently no authorization model at all**: every authenticated vendor can list, approve, and reject every other vendor's registration.

### Implementation Brief

**Problem.** `backend/middleware/auth.js` (`protect`) only checks that a JWT is valid — it attaches `req.vendor` but never checks *what kind* of vendor it is, because the `Vendor` model has no role field at all. `backend/routes/vendor.routes.js:31-33` mounts `listVendors` / `approveVendor` / `rejectVendor` behind the same `protect` middleware as every vendor-self-service route. The `/admin` frontend page ([src/app/admin/page.jsx](src/app/admin/page.jsx)) is reachable by any signed-in user; it isn't hidden behind a role check because there's no role to check. This is the highest-severity gap in the app: any vendor account can approve/reject competitors' SAP onboarding.

A secondary but related issue: several controllers resolve "which vendor is this request for" via `getVendorId(req)` ([vendor.controller.js:9-11](backend/controllers/vendor.controller.js#L9-L11)), which falls back through `req.vendorId → req.clerkUserId → x-vendor-id header → 'mock_vendor_id'`. The header fallback is already gated to non-production by `protect` ([auth.js:14](backend/middleware/auth.js#L14)), so it isn't exploitable once `NODE_ENV=production` is actually set — but several frontend call sites still read/send `x-vendor-id` from `localStorage` as if it were the source of truth (e.g. [DashboardView.jsx:202](src/features/dashboard/components/DashboardView.jsx#L202), [FileUploadZone.jsx:25](src/components/shared/FileUploadZone.jsx#L25), [portal-context.js:75](src/lib/portal-context.js#L75)), and the `'mock_vendor_id'` literal ships as a silent final fallback in both frontend and backend. This should be cleaned up so identity always resolves from the verified JWT server-side, with no client-suppliable override, before this app is ever pointed at a real deployment.

Third, the auth flow itself is missing standard account-recovery and session-expiry handling, and there are a few leftover dead files from the pre-migration UI that Phase 1 didn't catch.

### Tasks

**6a. Add a role model and gate admin routes (highest priority)** — done
- [x] Add a `role` field to `backend/models/Vendor.js` (enum: `'vendor' | 'admin'`, default `'vendor'`).
- [x] Add an `authorize(...roles)` middleware in `backend/middleware/auth.js` that checks `req.vendor.role` after `protect` has run.
- [x] Apply `authorize('admin')` to `GET /api/vendors` (list), `PUT /api/vendors/:id/approve`, and `PUT /api/vendors/:id/reject` in `backend/routes/vendor.routes.js`.
- [x] **Admin provisioning:** env-var bootstrap — `ADMIN_BOOTSTRAP_EMAILS` (comma-separated, checked case-insensitively) in `backend/controllers/auth.controller.js`'s `register`. Any email in that list gets `role: 'admin'` on first registration; documented in `backend/.env.example`. There's no other path to the admin role (register is the only signup endpoint, and it never accepts a client-supplied `role`), so this is safe as long as the env var is unset/removed after the intended admin(s) sign up.
- [x] Frontend: `src/app/admin/page.jsx` now reads `profileHook.profile.role` (from `usePortal()`) and redirects non-admins to `/` via `router.replace`. Also switched its vendor-list/approve/reject calls from raw unauthenticated `fetch` to `apiClient`, which attaches the `Authorization: Bearer` JWT — those calls would otherwise 401/403 now that the routes are gated. This is a UX redirect only; the real boundary is the server-side `authorize('admin')` middleware.
- [x] Backend tests: `backend/tests/vendor.test.js` — added a test asserting a non-admin vendor gets 403 from all three admin endpoints, updated the existing approve/reject/list tests to use an admin token (new `createAdminVendor` test helper in `backend/tests/helpers.js`), and added two tests covering the `ADMIN_BOOTSTRAP_EMAILS` bootstrap path. Full backend suite: 39/39 passing. `npm run build` (frontend) also passes.

**6b. Remove client-suppliable vendor identity** — done
- [x] Stop sending `x-vendor-id` from the frontend. Removed from all four call sites that sent it (the plan's DashboardView.jsx/FileUploadZone.jsx examples plus two more found in the same pattern): `src/lib/api-client.js` (the shared client used by every `apiClient.*` call — this was the biggest offender, guessing `clerkId` from three different localStorage keys), `src/features/dashboard/components/DashboardView.jsx` (bulk invoice download), `src/components/shared/FileUploadZone.jsx` (upload/delete), and `src/features/payments/components/PaymentTrackingView.jsx` (statement download). All of these already send the `Authorization: Bearer` JWT, which is what `protect` actually uses server-side — confirmed via `backend/routes/index.js` (every data route is mounted behind `protect`) and `backend/controllers/upload.controller.js`'s `getVendorId` (checks `req.clerkUserId`, set from the verified JWT, before the header).
- [x] Removed the `'mock_vendor_id'` fallback literal from `portal-context.js:75`: the WebSocket-init `useEffect` now reads `vendorId = profileHook.profile?.vendorId` and returns early (waits, since `profileHook.profile?.vendorId` is already a dependency and will re-run when it loads) if either the token or vendorId is missing, instead of substituting `localStorage.getItem('clerk_user_id') || 'mock_vendor_id'`. Also removed the equivalent dead fallback in `src/lib/socket.js`'s `initSocket` (`vendorId || localStorage.getItem('clerk_user_id')`) since it now always receives a real id from its one caller. Confirmed via `backend/server.js:64-85` that the Socket.io handshake already derives `socket.clerkUserId` from the verified JWT when a token is present — the client-sent `vendorId` in the auth payload was already inert for authenticated users, only mattering for the dev-only unauthenticated fallback path.
- [x] Confirmed via new backend tests (`backend/tests/auth-middleware.test.js`, 3 tests) that the `x-vendor-id` dev fallback in `auth.js`'s `protect` is: (1) usable with no JWT under test/dev `NODE_ENV`, (2) rejected with 401 once `NODE_ENV=production` even with a valid `x-vendor-id` header and no token, (3) rejected with 401 when neither is present. The explanatory dev/test-only comment above the fallback in `auth.js` was already added in 6a. Full backend suite: 42/42 passing. `npm run build` and `npm test` (frontend, 15/15) also pass.

**6c. Auth-flow completeness** — done
- [x] Add forgot-password / reset-password: `POST /api/auth/forgot-password` (issues a SHA-256-hashed, 1-hour-expiring token; no mail service is configured, so the reset link is logged via `logger.info` instead) and `POST /api/auth/reset-password` (`backend/controllers/auth.controller.js`, `backend/validators/auth.validator.js`, `backend/models/Vendor.js` — new `resetPasswordToken`/`resetPasswordExpires` fields, both `select: false`). Always returns a generic success message on `forgot-password` regardless of whether the email exists, so the endpoint can't be used to enumerate registered vendors. Corresponding `/forgot-password` and `/reset-password` frontend pages added and linked from `sign-in/page.jsx`'s password field; both routes wired into the auth-page detection in `PortalLayout.jsx` and `portal-context.js` (centered layout, no forced redirect-to-sign-in for unauthenticated visitors). Covered by `backend/tests/password-reset.test.js` (9 tests: unknown email, known email token issuance, malformed email 400, full reset→login-with-new-password flow, garbage token, expired token, already-consumed token).
- [x] **Already implemented** — `src/lib/api-client.js`'s `request()` already had a 401 interceptor (clears `jwt_token`/`clerk_user_id`/`sap_vendor_profile_data` and redirects to `/sign-in`, skipping the redirect on public auth pages). Extended its "don't redirect" allowlist to also cover the two new `/forgot-password` and `/reset-password` pages.
- [x] Replaced the client-generated `mock_vendor_${random}` id in `sign-up/page.jsx` — removed the vendorId state, input field, and "Re-generate" button entirely; the frontend no longer sends a `vendorId` in the register payload. `backend/controllers/auth.controller.js`'s `register` now assigns one server-side (`generateVendorId()`, format `VND-#####`, retried on collision) whenever the client doesn't supply one — `vendorId` was made optional in `registerSchema` rather than removed outright, so existing test/dev fixtures that still pass an explicit id keep working. Freshly self-registered (no client vendorId) accounts now start at `Draft` status, matching `RegistrationView.jsx`'s existing `isDraft` handling for accounts that still need to complete and submit the full onboarding form. Covered by two new tests in `backend/tests/auth.test.js` (auto-generated vendorId format + Draft status; distinct ids across successive registrations).
- [x] Full suite check: backend 51/51 passing, frontend `npm test` 15/15 passing, `npm run build` compiles all 17 routes (15 previous + `/forgot-password` + `/reset-password`).

**6d. Delete remaining orphaned files** — done (Phase 1 missed these — none are imported by any `page.jsx` or other live file, confirmed via repo-wide grep on 2026-07-21 and re-confirmed on 2026-07-22 immediately before deletion):
- [x] `src/components/portal/payment/PaymentDashboard.jsx`
- [x] `src/components/portal/payment/PaymentDetailPage.jsx`
- [x] `src/components/portal/payment/utils/dataUtils.js` (mock payment/TDS/MSME data generators, only consumed by the two files above)
- [x] `src/features/profile/components/OnboardingView.jsx`
- [x] `src/features/dashboard/components/OverviewView.jsx`
- [x] `src/features/rfq/components/RFQsView.jsx` (already flagged as dead in Phase 2, task 48 — deferred pending user confirmation; confirmed dead again here, deleted)
- [x] Re-ran `npm run build` after deletion — compiled successfully, all 17 routes generated, no regressions.

**6e. UX polish (lower priority, do after 6a–6d)** — done
- [x] Replaced remaining `alert()`/`confirm()` calls in `src/app/admin/page.jsx`: approve now opens a `Modal`-based confirm dialog (`approveModal` state, mirroring the existing `rejectModal` pattern) instead of `window.confirm`, and all success/error/validation feedback (`handleApproveConfirm`, `handleRejectSubmit`) now goes through `usePortal().addToast` instead of `window.alert`. `ToastNotification` is already mounted app-wide from `PortalProvider` (in `layout.jsx`), so no extra wiring was needed for it to render on `/admin`.
- [x] Dev-gated `handleResetDatabase` ("Reset ERP Database") instead of removing it, since it's genuinely useful in local/dev — confirmed it only clears `localStorage` keys and calls `window.location.reload()` (`useDashboard.js`'s `clearAllState`); it never calls a backend endpoint, so it was never actually capable of resetting a real database despite the label. Gated behind `process.env.NODE_ENV !== 'production'` at both of its UI entry points: `src/components/portal/Sidebar.jsx` (both the collapsed icon-only and expanded button variants) and `src/components/ui/CommandPalette.jsx` (the `act-reset` command entry is omitted from `actionItems` entirely in production builds).
- [x] Added a notifications bell in `Header.jsx`: `src/lib/portal-context.js`'s `addToast` now also appends to a capped (30-entry) `notifications` history array (independent from the auto-dismissing `toasts` array already used by `ToastNotification`), each entry carrying `read`/`timestamp`. Exposed `notifications`, `markNotificationsRead`, `clearNotifications` via `usePortal()`. `Header.jsx` renders a bell icon with an unread-count badge and a click-outside-aware dropdown listing recent notifications (type icon, message, relative time), so toast events fired while the user isn't looking aren't lost once the 5s auto-dismiss timer clears them from `ToastNotification`.
- [x] `npm run build` (17 routes) and `npm test` (15/15, frontend Vitest suite) both pass after these changes.

**Effort:** 6a ~1 day (model change + middleware + route wiring + tests), 6b ~0.5 day, 6c ~1 day, 6d ~1 hour, 6e ~0.5 day. **~3 days total.**
**Risk:** 6a is medium risk — it's an auth model change touching every admin code path and needs a migration/bootstrap story for existing vendor documents (they'll all default to `role: 'vendor'`, so at least one document needs manual promotion). 6b–6d are low risk (additive/deletion only, no schema changes). 6e is low risk, UI-only.

**Suggested order:** 6a before anything else touches `/admin` — it's the actual security gap. 6d can run in parallel any time (independent cleanup). 6b and 6c can follow once 6a is merged.
