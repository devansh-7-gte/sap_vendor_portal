---
name: VendorConnect Design System
description: Industrial-strength SAP self-service portal style guide
colors:
  primary: "#004080"
  secondary: "#e1ebf4"
  accent: "#0a6ed1"
  neutral-bg: "#f0f4f8"
  neutral-fg: "#1c1c1c"
  card-bg: "#ffffff"
  border: "#d2d5d8"
  destructive: "#bb0000"
  sidebar-bg: "#eff3f8"
  amber-hover: "#f59e0b"
typography:
  display:
    fontFamily: "-apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, Helvetica, Arial, sans-serif"
    fontSize: "1.75rem"
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: "tight"
  body:
    fontFamily: "-apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, Helvetica, Arial, sans-serif"
    fontSize: "0.95rem"
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: "normal"
rounded:
  sm: "2.4px"
  md: "3.2px"
  lg: "4px"
  xl: "5.6px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "16px"
  lg: "24px"
  xl: "32px"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "#ffffff"
    rounded: "{rounded.lg}"
    padding: "8px 16px"
  button-primary-hover:
    backgroundColor: "{colors.accent}"
  input-field:
    backgroundColor: "#ffffff"
    textColor: "{colors.neutral-fg}"
    rounded: "{rounded.sm}"
    padding: "4px 8px"
---

# Design System: VendorConnect Portal

## 1. Overview

**Creative North Star: "The Steel Scaffold"**

VendorConnect is an industrial-strength self-service portal for Indian manufacturing procurement. Its visual system reflects structural reliability, operational transparency, and high efficiency. Rejecting the overly rounded, low-contrast, soft-shadow conventions of standard SaaS tools, VendorConnect utilizes crisp grid lines, high-contrast typography, and a compact layout density inspired by classic enterprise SAP Fiori screens but reimagined for a modern React environment.

The system is designed to convey confidence and clarity to suppliers and procurement officers alike, especially under various factory-floor screen conditions.

**Key Characteristics:**
- Crisp borders and sharp corners (4px standard radius) instead of heavy pill rounded elements.
- Clean grid lines and high contrast (≥4.5:1 text contrast) for readability.
- Clear BAPI/RFC payload representation to enforce transparency.
- A restrained, steel-blue color foundation offset by purposeful status highlights.

## 2. Colors

A restrained enterprise palette that prioritizes visibility and status clarity over decorative tints.

### Primary
- **Classic SAP Steel Blue** (#004080): Used for primary branding elements, headers, and major primary action triggers.

### Secondary
- **Light Fiori Blue** (#e1ebf4): Used as a subtle background tint for active states, highlighted list rows, and secondary layout anchors.

### Neutral
- **High-Contrast Gray** (#1c1c1c): Canonical color for body copy, headings, and functional UI icons.
- **Soft Slate-Blue Background** (#f0f4f8): The canvas color across all portal dashboards.
- **Grid Border Slate** (#d2d5d8): The distinct grid border color used to structure data tables and layout boundaries.
- **Sidebar Ice** (#eff3f8): Tinted sidebar neutral separating portal navigation from main content.

### Named Rules
**The Steel Border Rule.** Grid lines and division borders are explicit and visible (1px, #d2d5d8). Never use shadows to suggest boundary divisions; use concrete lines to structure layout cells.
**The Amber Highlight Rule.** Mapped black hover interactions and borders must transition cleanly to Amber-500 (#f59e0b) to provide high-visibility state signals.

## 3. Typography

**Display Font:** System Sans-Serif (-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif)
**Body Font:** System Sans-Serif (-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif)

**Character:** Highly legible, clean, and optimized for dense tabular layout structures.

### Hierarchy
- **Display** (Bold (700), 1.75rem, 1.2): Used sparingly for high-level module landing headers.
- **Headline** (Semibold (600), 1.25rem, 1.3): Section-level titles and modal headers.
- **Title** (Semibold (600), 1rem, 1.4): Table headers, card sub-headers, and major field labels.
- **Body** (Regular (400), 0.95rem, 1.5): Standard descriptive prose, cell text, and input content (max length ~75ch).
- **Label** (Medium (500), 0.75rem, 1.2, uppercase where applicable): Badges, BAPI log logs, and micro-actions.

### Named Rules
**The Content Constraint Rule.** To maintain legibility in long descriptions or onboarding notes, body copy must never exceed a maximum line length of 75 characters (75ch).

## 4. Elevation

The visual layout is flat-by-default to reflect the structural precision of "The Steel Scaffold". Depth is conveyed through background color contrast and explicit borders rather than depth blur or dropshadows.

### Named Rules
**The Flat Canvas Rule.** Surfaces must remain flat and flush against the background (#f0f4f8) at rest. Drop shadows must only be utilized for transient UI layers (e.g. active dropdown menus, absolute payload consoles) to indicate modal layering.

## 5. Components

### Buttons
- **Shape:** Crisp corners (4px radius).
- **Primary:** Classic SAP Steel Blue (#004080) background with bold white text. Padding is exactly 8px top/bottom and 16px left/right.
- **Hover / Focus:** Transitions to Standard Blue Accent (#0a6ed1) with standard CSS animations.
- **Secondary / Secondary-Hover:** Soft light Fiori blue (#e1ebf4) background transitioning to a slightly deeper blue tint on hover.

### Cards / Containers
- **Corner Style:** Sharp 4px borders.
- **Background:** Solid white (#ffffff) to stand out clearly from the gray-blue slate background.
- **Border:** Bound by a distinct 1px border (#d2d5d8). No shadows.

### Inputs / Fields
- **Style:** Pure white (#ffffff) background, sharp 2px corners, and Grid Border Slate (#d2d5d8) boundaries. Height is exactly 2rem.
- **Focus:** Transitions border color to Standard Blue Accent (#0a6ed1) with a matching subtle focus ring.

### Navigation
- **Style:** Sidebar navigation uses Ice Slate (#eff3f8) background. Active links are marked with Classic Steel Blue (#004080) text indicators and a Light Fiori Blue (#e1ebf4) background fill.

## 6. Do's and Don'ts

### Do:
- **Do** use explicit 1px borders (#d2d5d8) to separate table cells, headers, and dashboard blocks.
- **Do** ensure all input fields maintain standard 2rem heights and sharp corners for fast keyboard navigation.
- **Do** label BAPI log capsules with distinct semantic color badges (Emerald for Success, Red for Failure).

### Don't:
- **Don't** use decorative purple/violet gradients or neon accents.
- **Don't** use card shadows at rest; keep layouts flat to align with Fiori density principles.
- **Don't** use fuzzy low-contrast light gray typography; keep text colors at High-Contrast Gray (#1c1c1c) or higher.
