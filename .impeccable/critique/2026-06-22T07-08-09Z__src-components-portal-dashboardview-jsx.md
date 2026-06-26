---
target: DashboardView.jsx
total_score: 24
p0_count: 0
p1_count: 2
timestamp: 2026-06-22T07-08-09Z
slug: src-components-portal-dashboardview-jsx
---
# Design Critique: DashboardView.jsx

## Design Health Score

| # | Heuristic | Score | Key Issue |
|---|-----------|-------|-----------|
| 1 | Visibility of System Status | 3/4 | Standard indicators are present, but no loading or skeleton states are defined for async data fetching. |
| 2 | Match System / Real World | 4/4 | Indian formatting (₹ Lakhs) and domain-specific terms (GSTIN, TDS, F110) match manufacturing realities. |
| 3 | User Control and Freedom | 2/4 | No way to dismiss alerts or close the welcome/shortcut banner. |
| 4 | Consistency and Standards | 2/4 | Hardcoded Tailwind colors (e.g. `bg-blue-950`, `bg-stone-850`) deviate from the variables in `globals.css`. |
| 5 | Error Prevention | 2/4 | Links in notifications just switch tabs without deep-linking to the specific item causing the alert. |
| 6 | Recognition Rather Than Recall | 4/4 | All critical KPIs and recent documents are displayed directly on load with clear text labels. |
| 7 | Flexibility and Efficiency | 2/4 | Lack of keyboard shortcuts, search boxes, or filters on dashboard list components. |
| 8 | Aesthetic and Minimalist Design | 2/4 | Visual noise in the Welcome Banner due to crowded actions; font sizes are too small (down to `8px`/`9px`). |
| 9 | Error Recovery | 2/4 | Alert messages note warnings but do not offer direct correction or recovery paths. |
| 10 | Help and Documentation | 1/4 | No help links or inline documentation guides exist on the dashboard. |
| **Total** | | **24/40** | **Acceptable** |

## Anti-Patterns Verdict

*   **LLM assessment**: The page has a solid Fiori-inspired grid structure, but it displays signs of AI-generated layout crowding. The welcome banner has too many responsibilities (branding, credentials, and six quick shortcuts). The typography sizing defaults to micro-text (`text-[8px]`, `text-[9px]`, `text-[10px]`) to cram data, violating readability.
*   **Deterministic scan**: Automated scan completed cleanly with no rule violations.
*   **Visual overlays**: No visual overlays injected.

## Overall Impression
The dashboard provides a functional overview of the procurement lifecycle, but it suffers from excessive layout crowding, low-contrast text sizing, and inconsistent color token usage. The single biggest opportunity is to simplify the welcome banner, enlarge the typography to acceptable limits (minimum `12px`), and transition from hardcoded colors to CSS custom properties.

## What's Working
1. **Domain Terminology Alignment**: Terms like GSTIN, UTR Code, and TDS align perfectly with Indian procurement and corporate finance realities.
2. **Visual Feedback Statuses**: Badges use appropriate Fiori-like statuses (`Acknowledged`, `ASN Submitted`, `Match Warning`).
3. **KPI Visualizations**: The progress bars for OTIF and Quality Acceptance are clear and quick to scan.

## Priority Issues

*   **[P1] Micro-Typography Readability**
    *   *Why it matters*: Text sizes down to `8px` (`text-[8px]`) and `9px` in the shortcuts and date stamps are unreadable on standard industrial monitors.
    *   *Fix*: Set the minimum text size to `12px` (`text-xs`) or use standard typography sizes from `DESIGN.md`.
    *   *Suggested command*: `/impeccable typeset`

*   **[P1] Inconsistent Color Tokens**
    *   *Why it matters*: Hardcoded classes like `bg-blue-950`, `bg-stone-850`, and `border-stone-250` bypass the theme variables defined in `globals.css` (`--primary`, `--secondary`, `--border`). This breaks theming.
    *   *Fix*: Replace with semantic variables, e.g. `bg-primary`, `border-border`, and theme-aligned classes.
    *   *Suggested command*: `/impeccable colorize`

*   **[P2] Welcome Banner Crowding**
    *   *Why it matters*: Cramming six shortcut icon buttons inside the welcome card creates high cognitive load and makes mobile layouts wrap awkwardly.
    *   *Fix*: Split the shortcuts into a standalone "Quick Actions" toolbar underneath the banner.
    *   *Suggested command*: `/impeccable layout`

*   **[P2] Hardcoded Mock Data vs Empty States**
    *   *Why it matters*: The list view loops over hardcoded arrays, failing to handle cases where there are no active purchase orders or invoices.
    *   *Fix*: Add standard empty states showing "No recent orders" with a call to action.
    *   *Suggested command*: `/impeccable onboard`

## Persona Red Flags

*   **Sam (Accessibility-Dependent User)**: Focus states are missing on interactive list items (recent PO numbers, invoice links). Screen size zooming to 200% will break the dense 2x2 alerts layout. Text contrast on sub-labels is below the 4.5:1 ratio.
*   **Riley (Stress Tester)**: Empty states are not handled. If `state.pos` or `state.invoices` is empty, the dashboard defaults to hardcoded rows instead of showing a structural empty slate.

## Minor Observations
- The pulse animation on the "Active" vendor state badge is helpful, but the pulse animation on the "Overdue" PO badge in the list is too aggressive and distracting.
- Breadcrumbs are missing from the dashboard view.
