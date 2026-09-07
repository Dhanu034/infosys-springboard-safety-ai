---
name: BuildSure AI
colors:
  surface: '#101415'
  surface-dim: '#101415'
  surface-bright: '#363a3b'
  surface-container-lowest: '#0b0f10'
  surface-container-low: '#191c1e'
  surface-container: '#1d2022'
  surface-container-high: '#272a2c'
  surface-container-highest: '#323537'
  on-surface: '#e0e3e5'
  on-surface-variant: '#bbc9cd'
  inverse-surface: '#e0e3e5'
  inverse-on-surface: '#2d3133'
  outline: '#859397'
  outline-variant: '#3c494c'
  surface-tint: '#2fd9f4'
  primary: '#8aebff'
  on-primary: '#00363e'
  primary-container: '#22d3ee'
  on-primary-container: '#005763'
  inverse-primary: '#006877'
  secondary: '#ffb77d'
  on-secondary: '#4d2600'
  secondary-container: '#fd8b00'
  on-secondary-container: '#603100'
  tertiary: '#68f5b8'
  on-tertiary: '#003824'
  tertiary-container: '#46d89d'
  on-tertiary-container: '#005a3d'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#a2eeff'
  primary-fixed-dim: '#2fd9f4'
  on-primary-fixed: '#001f25'
  on-primary-fixed-variant: '#004e5a'
  secondary-fixed: '#ffdcc3'
  secondary-fixed-dim: '#ffb77d'
  on-secondary-fixed: '#2f1500'
  on-secondary-fixed-variant: '#6e3900'
  tertiary-fixed: '#6ffbbe'
  tertiary-fixed-dim: '#4edea3'
  on-tertiary-fixed: '#002113'
  on-tertiary-fixed-variant: '#005236'
  background: '#101415'
  on-background: '#e0e3e5'
  surface-variant: '#323537'
typography:
  headline-xl:
    fontFamily: Inter
    fontSize: 40px
    fontWeight: '800'
    lineHeight: 48px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Inter
    fontSize: 30px
    fontWeight: '700'
    lineHeight: 38px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  mono-label:
    fontFamily: JetBrains Mono
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0.05em
  bilingual-label-ta:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  headline-lg-mobile:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '700'
    lineHeight: 32px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  unit: 4px
  gutter: 24px
  margin-edge: 32px
  container-max: 1440px
---

## Brand & Style

The design system is engineered for **BuildSure AI**, a high-stakes construction risk intelligence platform. The aesthetic is defined as **Industrial Precision Glassmorphism**—a hybrid style that marries the rugged, high-visibility world of heavy industry with the sophisticated, data-dense requirements of an AI command center.

The brand personality is authoritative, vigilant, and technically advanced. It targets project managers and safety officers who require "heads-up display" (HUD) clarity. The interface utilizes architectural textures, blueprint-inspired grid backdrops, and subtle 45-degree hazard patterns to evoke a sense of structural integrity. Surfaces are treated as semi-translucent slate panels, creating a layered environment that feels deep and expansive.

## Colors

The palette is anchored in a **Deep Midnight Navy** background to minimize eye strain during long monitoring sessions. 

- **Primary (Electric Cyan):** Reserved for AI-driven insights, active agent states, and "future-forward" data points.
- **Secondary (Construction Orange):** Used for "High-Risk" warnings and call-to-action elements that require immediate attention.
- **Surface (Slate-Blue Glass):** Used for containers, cards, and navigation panels, utilizing 80-90% opacity to reveal background grid textures.
- **Status Indicators:** Use **Signal Red** for critical failures and **Emerald Green** for site clearance/safe zones.
- **Neutral:** A warm off-white is used for primary text to ensure high legibility against dark backgrounds.

## Typography

This design system uses a dual-font approach to balance human readability with machine precision.

- **Primary Sans (Inter):** Chosen for its exceptional legibility and neutral, high-performance character. Headlines use heavier weights (700-800) to mimic industrial signage.
- **Technical Mono (JetBrains Mono):** Used for AI coordinates, telemetry data, timestamps, and status codes. This reinforces the "Command Center" aesthetic.
- **Bilingual Support:** For Tamil labels, use the equivalent weight in Inter (or a system-fallback that matches Inter's x-height) at a slightly reduced scale (around 90% of English size) when used as secondary captions to maintain visual hierarchy.

## Layout & Spacing

The layout is built on a **12-column rigid grid** inspired by architectural drafting. 

- **Grid Lines:** A subtle 24px background grid (0.05 opacity Cyan) should be visible in the "workspace" areas.
- **Rhythm:** A strict 4px base unit ensures alignment. Components should generally use 16px or 24px padding to maintain an "airy" yet structured feel.
- **Breakpoints:**
  - **Desktop (1280px+):** 12 columns, 24px gutters, 32px margins.
  - **Tablet (768px - 1279px):** 8 columns, 16px gutters, 24px margins.
  - **Mobile (<767px):** 4 columns, 12px gutters, 16px margins. Cards stack vertically, and blueprint textures are simplified to avoid visual noise.

## Elevation & Depth

Elevation in this design system is achieved through **Tonal Layering and Glassmorphism** rather than traditional drop shadows.

1.  **Level 0 (Floor):** Background #0B121E with a blueprint grid overlay.
2.  **Level 1 (Panels):** Surface #162032 with a 1px inner stroke (#FFFFFF at 0.1 opacity) to define edges.
3.  **Level 2 (Active/Floating):** Use a Backdrop Blur (12px to 20px) and a slightly brighter stroke (#22D3EE at 0.3 opacity) to indicate focused AI agents or active risk alerts.
4.  **Hazards:** Elements indicating high risk use a subtle 45-degree orange-and-transparent stripe pattern in the header or footer of the component.

## Shapes

The shape language is **Structured & Controlled**. 

- **Corner Radius:** A consistent 0.75rem (12px) is used for cards and primary containers to soften the industrial edge while maintaining a professional, architectural feel.
- **Interactive Elements:** Small buttons and input fields use a 0.5rem (8px) radius. 
- **Status Pills:** Use a full pill-shape (radius 9999px) to contrast against the rectangular grid of the dashboard.
- **Accents:** 45-degree chamfered corners (clipped corners) may be used on "AI Command" buttons to emphasize the futuristic, tactical theme.

## Components

- **Risk Cards:** 12px rounded corners, Slate-Blue glass background. Must include a "Risk Header" with a 4px left-border accent color (Orange/Red/Green) and a Monospace ID tag (e.g., SITE-A102).
- **Control Buttons:** High-contrast backgrounds. Primary buttons use Electric Cyan with black text for maximum visibility. Secondary buttons use ghost-borders with white text.
- **Bilingual Badges:** Dual-language labels (English/Tamil) should be stacked vertically within badges, with Tamil rendered in a 10px mono-label style beneath the English text.
- **AI Status Feed:** Monospaced list items with a "pulse" dot indicator in the primary color. Items are separated by 1px slate dividers.
- **Input Fields:** Darker than the surface (#0B121E), with a 1px border that glows Electric Cyan upon focus. Use monospaced fonts for numerical entries (e.g., GPS coordinates or floor numbers).
- **Technical Overlays:** Tactical crosshairs and hairline-thin coordinate markers should appear on map views and 3D architectural renders to maintain the "Command Center" aesthetic.