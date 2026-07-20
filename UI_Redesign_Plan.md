# SAP Vendor Portal — UI Redesign Implementation Plan
### Adopt the Super Admin Console design system, zero functional change

---

## 0. Objective & Non-Negotiables

Restyle `sap_vendor_portal-master` (Next.js 16, App Router, Tailwind v4, JSX) to match the **Super Admin Console (SAC)** design language exactly — while changing **zero** functionality.

**Hard constraints:**
- No changes to: API calls, fetch/axios logic, socket.io handlers, state management, event handlers, routing, form submission logic, data transformations, validation, auth flows, props/data contracts between components.
- Only changes to: `className` strings, CSS files, design tokens, JSX markup *structure* where purely presentational (wrappers, icons, layout containers), and new presentational-only shared components.
- Every screen must render identical data and support identical interactions before/after.

---

## 1. Source of Truth — SAC Design System Extraction

The SAC design system lives in three files. These are the canon; extract them verbatim, then adapt to Tailwind v4 syntax.

### 1.1 Design tokens (`apps/console-web/src/index.css` → `:root` / `.dark`)

**Light theme — "Minimalist Luxury" (warm stone neutrals):**

| Token | Value | Role |
|---|---|---|
| base | `#F5F5F4` | App background |
| surface | `#FFFFFF` | Cards, sidebar |
| surface2 | `#E7E5E4` | Hover fill / row hover |
| border | `#E7E5E4` | Default border |
| border-subtle | `#F0EFEE` | Alternating table tint |
| border-em | `#D6D3D1` | Emphasis border |
| text-primary | `#1C1917` | Headings, values |
| text-secondary | `#78716C` | Body |
| text-tertiary | `#A8A29E` | Muted/labels |
| primary action | `#1C1917` (light) / `#3B82F6` (dark) | Buttons, focus rings — via `--color-emerald-*` vars |

**Dark theme — "Monochrome Slate":** base `#121212`, surface `#1E1E1E`, surface2/border `#2D2D2D`, border-subtle `#252525`, border-em `#3A3A3A`, text `#E1E1E1` / `#888888` / `#555555`, primary action `#3B82F6`.

All tokens are stored as RGB triplets (`--color-*-rgb`) to support Tailwind opacity modifiers. Preserve this pattern.

### 1.2 Component classes (`@layer components` in index.css) — port ALL of these

- `.card` — `bg-surface rounded-xl border border-border shadow-[0_1px_4px_rgba(10,15,46,0.08)]`
- `.metric-panel` — card + `p-5 flex flex-col gap-1` (KPI tiles)
- `.btn` base + variants: `.btn-v` (primary fill, white text, hover opacity-90), `.btn-o` (outline/secondary), `.btn-r` (**destructive = red outline only, never filled**), `.btn-g` (success tint), `.btn-amber` (warning tint). Shape: `px-3.5 py-[7px] rounded-md text-xs font-semibold`.
- `.status-badge` + full variant set (`-active`, `-suspended`, `-trial`, `-pending`, `-warn`, `-info`, `-cooling`, `-revoked`) — pill `rounded-[20px]`, `text-[11px] font-semibold font-mono tracking-[0.3px]`, tinted bg + tinted border + colored text, with `.dark` overrides.
- `.plan-badge-*` chips (starter/pro/enterprise) — repurpose for vendor tiers/categories.
- `.chip` — `text-[11px] font-semibold px-2 py-0.5 rounded-md font-mono`.
- `.skip-link` accessibility pattern.

### 1.3 Global element styling (`@layer base`)

- **Tables** (this is the SAC signature — port exactly): borderless cells with bottom `border-border`, header row in tertiary uppercase micro-text, row hover fills `surface2` with 4px-radius corner rounding on first/last cell, even rows tinted `rgba(border-subtle, 0.25)`, last row no border, `transition: background-color 0.15s`.
- **Inputs**: `bg-base border border-border rounded-md px-[11px] py-[7px] text-[13px]`, focus = border-color → primary action color (no ring box-shadow), placeholder tertiary.
- **Scrollbars**: 5px, track = base, thumb = border-em, hover = tertiary; thinner 4px transparent-track variant inside sidebar nav.

### 1.4 UI primitives (`packages/ui/src/*`) — re-create as JSX in the portal

- `Page` — page shell: `p-6`, header row `text-[22px] font-bold` title + optional right-side action, `mb-6`.
- `KPI` — metric-panel: micro label, `text-2xl font-bold tabular-nums` value, optional emerald delta + muted sub-line, `animate-fadeUp` entrance.
- `DataTable` — thead/tbody structure relying on the global table CSS; supports empty state.
- `Sidebar` — 220px, collapsible to 60px (`transition-all duration-200`), `bg-surface border-r border-border`, grouped nav with group labels, lucide icons at `size={16}`, active item = surface2 fill + primary text, footer with user identity.
- `Modal`, `Spinner`, `TableSkeleton`, `Chip`, `HealthDot`, `MiniBar` — port patterns as needed.
- `colors.ts` pattern — status→class-name mapper functions (pure, JIT-safe literal strings). Recreate as `src/lib/statusColors.js` mapping the portal's domain statuses (PO status, invoice status, payment status, RFQ status, MSME compliance, onboarding stage) to `.status-badge-*` classes.

### 1.5 Motion & typography

- `animate-fadeUp` keyframe entrance on panels; 150ms color transitions everywhere; 200ms sidebar collapse. Nothing bouncy — restrained, utilitarian.
- Type scale: 22px bold page titles, 13px body/inputs, 12px secondary, 11px mono badges/labels, uppercase tracking on table headers and micro-labels. `tabular-nums` on ALL numeric data (amounts, counts, dates in tables).

---

## 2. Target Codebase Inventory (what gets restyled)

The portal currently uses a **SAP Fiori theme** (`#004080` steel blue, `#f0f4f8` background, 0.25rem radius, `zoom: 1.25`, aggressive `!important` input overrides). All of that is replaced.

### 2.1 Foundation files
| File | Action |
|---|---|
| `src/app/globals.css` | Full rewrite: SAC tokens in Tailwind v4 `@theme`/`:root` form, `.dark` block, `@layer base` table/input/scrollbar styles, `@layer components` class library, fadeUp keyframes. **Remove** `zoom: 1.25`, remove all `!important` input hacks (replaced by SAC base-layer input styles). Keep shadcn variable names aliased to SAC values so existing `bg-background`, `text-muted-foreground`, `border-border` classes resolve to SAC colors without touching every file first. |
| `src/app/layout.jsx` | Body classes → `bg-base text-text-primary`; add skip-link; wire optional `.dark` class toggle. |
| `src/components/ui/button.tsx` | Re-map CVA variants to `.btn-v/.btn-o/.btn-r/.btn-g` styles. Same variant names/props → zero call-site changes. |

### 2.2 New presentational primitives — `src/components/ui/`
Create `Page.jsx`, `KPICard.jsx`, `StatusBadge.jsx`, `Card.jsx`, `Modal.jsx`, `Spinner.jsx`, `TableSkeleton.jsx`, `EmptyState.jsx` + `src/lib/statusColors.js`. These are additive; adopt them screen-by-screen.

### 2.3 Layout chrome
- `src/components/portal/Sidebar.jsx` → SAC sidebar: 220px/60px collapsible, grouped nav, active-state styling, footer identity block. **Keep the exact nav items, hrefs, active-route logic, and any permission gating.**
- `src/components/portal/Header.jsx` → flatten to SAC style: surface bg, bottom border, compact; keep all interactive elements (search, notifications, user menu) functionally intact.
- `src/components/portal/PortalLayout.jsx` → `flex` shell on `bg-base`.

### 2.4 Screens (restyle in this order — foundations cascade)

**Wave 1 — chrome + dashboard:** `PortalLayout`, `Sidebar`, `Header`, `DashboardView` (portal + features/dashboard), `OverviewView`. KPI rows become `metric-panel` grids; recharts recolored to token palette (primary action color for series, `border-em` grid lines, `surface` tooltips).

**Wave 2 — table-heavy views (biggest win, mostly automatic once global table CSS lands):** `POsView`, `PurchaseOrdersView`, `InvoicesView`, `InvoiceProcessingView`, `RFQsView`, `RfqView`, `PaymentsView`, `PaymentTrackingView`, `PaymentList`, `AccountStatement`, `TDSDocuments`. Replace ad-hoc status pills with `StatusBadge` + `statusColors.js`.

**Wave 3 — payment suite:** `PaymentDashboard`, `PaymentDetailPage`, `PaymentAdviceCenter`, `MSMEPaymentMonitor`, and `payment/components/DesignComponents.jsx` (this file is a local mini design system — rewrite its internals to emit SAC classes; its exported API stays identical so consumers need no edits).

**Wave 4 — remaining views:** `AnalyticsView`, `ReportsAnalyticsView`, `PerformanceView`, `ChatsView`, `CommunicationsView`, `BapiConsole` (mono font, console-style card), `OnboardingView`, `RegistrationView`, `ProfileView` equivalents, `admin/page.jsx`.

**Wave 5 — auth & standalone pages:** `sign-in`, `sign-up`, `registration`, root `page.jsx` — centered `.card` on `bg-base`, SAC inputs/buttons. Remove `auth-mode` body-class CSS hacks.

**Wave 6 — shared:** `FileUploadZone` (dashed `border-em`, hover surface2), `SkeletonLoader` (token-based shimmer), `ToastNotification` (surface card, left status-color accent, slide-in), `ErrorBoundary` fallback card.

### 2.5 Explicitly out of scope
`workflow/`, server/Express code, `mongodb_data/`, API routes, `src/lib` business logic, package upgrades (stay on Tailwind v4/Next 16 — translate SAC's v3 preset into v4 `@theme` syntax rather than downgrading).

---

## 3. Tailwind v3 → v4 Translation Notes

SAC uses a v3 preset with `withOpacity()` helpers; the portal is v4. Translate as:

```css
@theme inline {
  --color-base: rgb(var(--color-base-rgb));
  --color-surface: rgb(var(--color-surface-rgb));
  --color-surface2: rgb(var(--color-surface2-rgb));
  --color-border-em: rgb(var(--color-border-em-rgb));
  --color-text-primary: rgb(var(--color-text-primary-rgb));
  /* ...etc, alongside aliased shadcn names (--color-background: var(--color-base)) */
}
```
Define the `--color-*-rgb` triplets in `:root`/`.dark` exactly as SAC does. `@layer base` / `@layer components` blocks port with minimal edits (v4 supports `@apply` in layers). No safelist needed if `statusColors.js` returns only literal class names (keep SAC's convention).

---

## 4. Execution Protocol (per file)

1. Read the file fully; list every interactive element and data binding.
2. Restyle classNames/markup only; never touch handlers, hooks, effects, fetches, conditionals that gate data.
3. Diff-review: verify the diff contains no logic lines (search diff for `fetch|axios|useState|useEffect|onSubmit|socket|router` — any hit must be a pure move, not an edit).
4. Render-check the route in the browser (light + dark), test the primary interaction (sort/filter/submit/open modal).
5. Commit per wave with message `ui(wave-N): <screens>`.

---

## 5. Verification & Acceptance

- **Functional parity:** every route loads; every form submits; every table sorts/filters/paginates; sockets/toasts/modals behave identically. Grep-audit: diffs contain zero changes to imports of data modules, hook bodies, or handler logic.
- **Visual parity with SAC:** side-by-side screenshot pass per screen against SAC equivalents — tokens, table treatment, badge shapes, button variants, sidebar behavior, spacing rhythm (p-6 pages, gap-4/6 grids, p-5 cards).
- **UX quality bar:** visible focus states on all interactive elements; skip link; hover feedback ≤150ms; skeletons (not spinners) for table loads; empty states on every list; `tabular-nums` on all numeric columns; no layout shift on sidebar collapse; keyboard-operable modals (Esc close, focus trap preserved if present).
- **No regressions:** `npm run build` passes; no console errors; Lighthouse a11y ≥ pre-redesign score.

---

## 6. Risks & Mitigations

| Risk | Mitigation |
|---|---|
| Removing `zoom: 1.25` shifts perceived sizing everywhere | Intentional — SAC's denser 13px scale replaces it. Review each screen at 100% zoom during Wave 1–2. |
| Global `!important` input CSS removal breaks odd inputs | SAC base-layer input styles are broader and cleaner; sweep every form in Wave 5 verification. |
| `DesignComponents.jsx` consumers depend on prop-driven styling | Keep its exported component signatures byte-identical; change only internals. |
| Recharts hardcoded hex colors clash with theme | Centralize a `chartTheme.js` reading token values; swap per chart in Waves 1/4. |
| Dark mode never existed in the portal | Ship tokens for both; light is default. Dark toggle optional — tokens make it nearly free. |
