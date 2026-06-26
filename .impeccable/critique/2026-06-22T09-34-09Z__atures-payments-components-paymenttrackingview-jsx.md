---
timestamp: 2026-06-22T09-34-09Z
slug: atures-payments-components-paymenttrackingview-jsx
---
# Critique: PaymentTrackingView.jsx

## Design Health Score

| # | Heuristic | Score | Key Issue |
|---|-----------|-------|-----------|
| 1 | Visibility of System Status | 1 | No loading skeletons or indicators; no progress flow representing payment clearing lifecycle. |
| 2 | Match System / Real World | 2 | Uses raw terms (e.g., Miro Doc, UTR, 194C) without context or tooltips for suppliers. |
| 3 | User Control and Freedom | 1 | Clicking filters, date selectors, and export buttons triggers mock alert dialogs. No navigation back or clear control. |
| 4 | Consistency and Standards | 2 | Implements custom read-only fields that look like form inputs instead of tabular data, unlike typical ledgers. |
| 5 | Error Prevention | 2 | Fallback mock data hides actual API/connection failures from the vendor. |
| 6 | Recognition Rather Than Recall | 1 | Lacks a list/table view; users cannot search, filter, or select from multiple payments. |
| 7 | Flexibility and Efficiency | 1 | No bulk downloads, batch queries, keyboard shortcuts, or pagination controls are available. |
| 8 | Aesthetic and Minimalist Design | 2 | Centered layout leaves 70% of desktop screens blank, yet overflows and clips on mobile viewports. |
| 9 | Error Recovery | 1 | Zero retry buttons, error banners, or system recovery triggers on API load failures. |
| 10 | Help and Documentation | 0 | No links, tooltips, or instructions regarding TDS Form 16A withholding rules. |
| **Total** | | **13/40** | **Poor (Core Experience Broken)** |

---

## Anti-Patterns Verdict

* **LLM Assessment**: The page lacks a tabular ledger—a fundamental requirement for payment tracking. Instead, it displays a single payment transaction wrapped in an inefficient, center-aligned 2-column key-value grid that mimics a configuration form rather than an tracking ledger.
* **Deterministic Scan**: Found **1 advisory issue**:
  - `design-system-color` (Line 35): Literal text color `#292524` in `SapReadOnlyField` is outside the `DESIGN.md` design system palette.
* **Visual Overlays**: No live browser overlay is active as mutation tests were bypassed to optimize token usage.

---

## Overall Impression
The payment tracking screen feels incomplete. Rather than acting as a self-service settlement ledger, it mimics a read-only settings page showing details of a single transaction. A complete overhaul replacing this form layout with a dense, searchable, and filterable table is required.

---

## What's Working
- **Compliance Integration**: Displays crucial India-specific compliance parameters such as PAN, TAN, and TDS Section 194C withholding.
- **Tab Layout Separation**: Clean tab division between the clearing ledger status and Form 16A tax certificates.

---

## Priority Issues

### [P0] Missing Transaction Ledger Table
- **Why it matters**: Vendors cannot view, compare, or scroll through their payment history; only one single transaction is visible.
- **Fix**: Replace the static key-value form fields with a responsive, paginated SAP Fiori style data table displaying UTR, Invoice, PO, Date, Gross, Net, and clearing status.
- **Suggested command**: `/impeccable shape PaymentTrackingView.jsx`

### [P0] Lack of Payment Journey Traceability
- **Why it matters**: Suppliers cannot track how an invoice transitions from approval to treasury check/NEFT run, leading to high support ticket volume.
- **Fix**: Introduce a horizontal P2P progress tracker mapping `Invoice Received → Invoice Approved → F110 Run Scheduled → Payment Cleared (NEFT/RTGS)`.
- **Suggested command**: `/impeccable craft PaymentTrackingView.jsx`

### [P1] Mock Action Alerts
- **Why it matters**: Clicking Date range, Filters, and Export alerts static text dialogs, which feels like a mock mockup rather than a functional portal.
- **Fix**: Wire up actual filter states and integrate dropdown list selectors for Fiscal Year, Withholding Section, and Quarter.
- **Suggested command**: `/impeccable harden PaymentTrackingView.jsx`

### [P1] Hardcoded Inline Styles and Colors
- **Why it matters**: Hardcoded `#292524`, `#F5F5F5`, and `#d1d5db` values bypass Tailwind classes, breaking theme consistency and custom styling overrides.
- **Fix**: Remove inline styles from `SapReadOnlyField` and use semantic Tailwind utility classes matching `DESIGN.md`.
- **Suggested command**: `/impeccable polish PaymentTrackingView.jsx`

---

## Persona Red Flags

### Alex (Power User)
- **Red Flag**: Alex cannot bulk-download payment advices or search by UTR. He must open transactions one-by-one to retrieve Form 16A certificates.

### Jordan (First-Timer)
- **Red Flag**: Jordan is confused by acronyms like "F110 run", "194C", "TAN", and "UTR" with zero informational icons or helper tooltips.

### Sam (Accessibility-Dependent)
- **Red Flag**: Text labels utilize a tiny `text-[9.5px]` font size which is illegible on low-contrast screens. The page lacks tab focus accessibility.

---

## Minor Observations
- Action buttons ("Raise Query", "Download") use generic styling and have no loading states or disable indicators.
- File icon for downloadable certificates uses green (`text-emerald-600`) which is hardcoded and conflicts with the blue/slate design system anchors.

---

## Questions to Consider
- What if the main ledger page opened with a dense summary table of all settlements, and clicking a row opened this detailed panel in a sliding side drawer or expandable row?
- Should the treasury clearing parameter group include bank routing numbers and direct links to the relevant commercial invoices?
