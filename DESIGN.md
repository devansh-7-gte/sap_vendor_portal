---
name: Kinetic Industrial Console
description: High-density, high-contrast industrial SAP self-service portal style guide
colors:
  primary: "#059669"
  secondary: "#c8c6c9"
  accent: "#059669"
  neutral-bg: "#09090b"
  neutral-fg: "#fafafa"
  card-bg: "#131315"
  border: "#27272a"
  border-em: "#3f3f46"
  destructive: "#e11d48"
  warning: "#d97706"
  sidebar-bg: "#0e0e10"
  muted-fg: "#71717a"
typography:
  display:
    fontFamily: "Inter, sans-serif"
    fontSize: "1.5rem"
    fontWeight: 600
    lineHeight: 1.3
    letterSpacing: "-0.02em"
  body:
    fontFamily: "Inter, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: 1.4
    letterSpacing: "normal"
  mono:
    fontFamily: "'JetBrains Mono', monospace"
    fontSize: "0.8125rem"
    fontWeight: 500
rounded:
  sm: "0px"
  md: "0px"
  lg: "0px"
  xl: "0px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "12px"
  lg: "16px"
  xl: "24px"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "#000000"
    rounded: "0px"
    padding: "8px 16px"
  button-primary-hover:
    backgroundColor: "#047857"
  input-field:
    backgroundColor: "{colors.neutral-bg}"
    textColor: "{colors.neutral-fg}"
    rounded: "0px"
    border: "1px solid {colors.border-em}"
    padding: "6px 12px"
---

# Design System: VendorConnect Portal

## 1. Overview

**Creative North Star: "Kinetic Industrial Console"**

VendorConnect is an industrial-strength self-service portal for Indian manufacturing procurement. Its visual system reflects precision, high data density, and operational focus. Rejecting both the soft, low-contrast SaaS aesthetic and the dated SAP Fiori look, the Kinetic Industrial Console utilizes a pure black foundation, stark zinc borders, and an electric green accent to maximize legibility and minimize eye strain under harsh factory lighting.

The system conveys authority and speed, operating more like a high-end technical terminal or a Bloomberg console than a standard web app.

**Key Characteristics:**
- **Zero-Radius Corners:** All elements have 0px border-radius to enforce a sharp, precise, structural aesthetic.
- **High-Contrast Dark Mode:** True black (#09090b) backgrounds with near-white text to cut through screen glare.
- **Density:** Highly compact layouts, reduced padding (based on a strict 4px grid), and reduced row heights (32px - 40px) to maximize data per square inch.
- **Dual-Font System:** Inter for UI chrome; JetBrains Mono for all tabular data, compliance statuses (GST/TDS/MSME), and BAPI payloads.

## 2. Colors

A strictly functional palette leveraging high-contrast ratios. 

### Foundation
- **Base Background:** Pure Black (`#09090b`). Used for the app canvas and input fields.
- **Surface Background:** Dark Zinc (`#131315` to `#18181b`). Used for cards, tables, and sidebars to slightly offset them from the base.

### Borders
- **Standard Border:** Zinc (`#27272a`). The structural skeleton of the UI.
- **Emphasis Border:** Lighter Zinc (`#3f3f46`). Used for interactive elements (inputs) or active states.

### Accents & Typography
- **Primary Accent / Success:** Electric Green (`#059669`). Used sparingly for primary actions, active status pulses, and success indicators.
- **Primary Text:** Near-White (`#fafafa`).
- **Secondary Text / Labels:** Muted Zinc (`#71717a`).
- **Critical Error:** Crimson (`#e11d48`).
- **Warning / Pending:** Amber (`#d97706`).

## 3. Typography

**Chrome/UI Font:** Inter, sans-serif
**Data/Console Font:** JetBrains Mono, monospace

**Character:** Highly legible, dense, and technically rigorous.

### Hierarchy
- **Headline** (Semibold (600), 1.5rem, 1.3): Page titles. Capped at 24px to preserve vertical density.
- **Title** (Semibold (600), 1.125rem, 1.4): Section headers, card titles.
- **Body** (Regular (400), 0.875rem (14px), 1.4): Standard prose and general text.
- **Data Mono** (Medium (500), 0.8125rem (13px), 1.2): ALL tabular data, numeric values, IDs, and compliance codes. `tabular-nums` must be enabled.
- **Label Caps** (Bold (700), 0.625rem (10px), uppercase, tracking 0.05em): Table headers, micro-labels, and tiny metadata.

## 4. Elevation

**The Flat Terminal Rule.** There are NO shadows in this design system. Depth is conveyed exclusively through tonal background shifts and explicit 1px borders. When a modal or popover opens, it relies on a stark border and a slightly lighter surface color (`#18181b`) rather than a dropshadow.

## 5. Components

### Data Tables
- **Borders:** 1px solid bottom borders (`#27272a`) on rows. No vertical dividers inside the row, but the table itself is boxed in a 1px border.
- **Row Hover:** Shift background to `#18181b`.
- **Text:** All cell data uses the `Data Mono` typography style.

### Buttons
- **Shape:** 0px radius (sharp corners).
- **Primary:** Electric Green (`#059669`) background with Black (`#000000`) text. Bold.
- **Secondary:** Transparent background, 1px Zinc (`#3f3f46`) border, near-white text. Hover shifts background to `#18181b`.
- **Ghost:** No border, muted text, turns near-white on hover.

### Status Badges (GST, TDS, MSME)
- **Style:** Compact, rectangular tags (`0px` radius).
- **Text:** `Data Mono` or `Label Caps`.
- **Colors:** Dark background (`#131315`), with a 1px border matching the semantic color (Green for active/success, Amber for pending/warning, Red for error, Zinc for neutral/not applicable).

### Inputs / Fields
- **Style:** Pure Black (`#09090b`) background, `0px` corners, 1px Emphasis border (`#3f3f46`). 
- **Focus:** Border snaps to Electric Green (`#059669`) or pure white (`#ffffff`). No blurry focus rings.

## 6. Do's and Don'ts

### Do:
- **Do** use `JetBrains Mono` for ALL numbers, amounts, IDs, and dates to ensure vertical alignment.
- **Do** rely on explicit 1px borders for structure.
- **Do** make primary actions pop with Electric Green against the black canvas.
- **Do** keep padding extremely tight (e.g., 4px/8px) to maximize data density.

### Don't:
- **Don't** use border-radius. Ever. 0px everywhere.
- **Don't** use drop shadows. Use border colors and background tints to show elevation.
- **Don't** use soft grays or low-contrast text. Maintain high contrast.
- **Don't** clutter with icons unless absolutely necessary; let the monospaced data speak for itself.
