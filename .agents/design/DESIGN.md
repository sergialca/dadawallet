---
name: Cybernetic Financial Terminal
colors:
  surface: '#00161d'
  surface-dim: '#00161d'
  surface-bright: '#003f4d'
  surface-container-lowest: '#001016'
  surface-container-low: '#001f27'
  surface-container: '#00232c'
  surface-container-high: '#002f3a'
  surface-container-highest: '#003a47'
  on-surface: '#b7ebfd'
  on-surface-variant: '#bac9cc'
  inverse-surface: '#b7ebfd'
  inverse-on-surface: '#003642'
  outline: '#849396'
  outline-variant: '#3b494c'
  surface-tint: '#00daf0'
  primary: '#c6f7ff'
  on-primary: '#00363d'
  primary-container: '#00e7fe'
  on-primary-container: '#00646e'
  inverse-primary: '#006874'
  secondary: '#a8eaff'
  on-secondary: '#003641'
  secondary-container: '#03d5fd'
  on-secondary-container: '#00596b'
  tertiary: '#e7eeff'
  on-tertiary: '#00315f'
  tertiary-container: '#b9d3ff'
  on-tertiary-container: '#005aa7'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#95f1ff'
  primary-fixed-dim: '#00daf0'
  on-primary-fixed: '#001f24'
  on-primary-fixed-variant: '#004f57'
  secondary-fixed: '#b1ecff'
  secondary-fixed-dim: '#27d8ff'
  on-secondary-fixed: '#001f27'
  on-secondary-fixed-variant: '#004e5e'
  tertiary-fixed: '#d4e3ff'
  tertiary-fixed-dim: '#a6c8ff'
  on-tertiary-fixed: '#001c3a'
  on-tertiary-fixed-variant: '#004786'
  background: '#00161d'
  on-background: '#b7ebfd'
  surface-variant: '#003a47'
typography:
  display-lg:
    fontFamily: Inter
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 56px
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.01em
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  data-lg:
    fontFamily: JetBrains Mono
    fontSize: 18px
    fontWeight: '500'
    lineHeight: 24px
  data-sm:
    fontFamily: JetBrains Mono
    fontSize: 13px
    fontWeight: '400'
    lineHeight: 18px
    letterSpacing: 0.02em
  label-caps:
    fontFamily: Inter
    fontSize: 11px
    fontWeight: '700'
    lineHeight: 16px
    letterSpacing: 0.1em
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  unit: 4px
  container-padding: 24px
  gutter: 16px
  component-gap-sm: 8px
  component-gap-md: 16px
---

## Brand & Style
The design system embodies a vibrant, cybernetic aesthetic tailored for rapid-fire financial execution. It targets professional traders and decentralized finance enthusiasts who demand technical precision fused with a futuristic, high-contrast atmosphere.

The style is a hybrid of **Glassmorphism** and **High-Contrast Digital Minimalism**. It relies on deep cyan-tinted neutral surfaces, vibrant neon-cyan and blue accents, and sharp, data-dense layouts. The emotional response is one of calculated control, high stakes, and technological superiority. Visual cues include subtle scanlines, glows that mimic CRT phosphor, and ultra-thin borders that define "hard-surface" UI modules.

## Colors
The palette is rooted in an electric, cyan-tinted "Deep Night" background to maximize the luminosity of functional accents. 

- **Primary (Electric Cyan):** Used for critical action paths, active states, and brand-defining glows.
- **Secondary (Neon Azure):** Utilized for interactive triggers, secondary data points, and accents.
- **Tertiary (Deep Tech Blue):** Used for deep structural depth, contrast framing, and supporting highlights.
- **Sentiment Colors:** Success (Bullish Green) and Error (Bearish Red) are highly saturated to ensure instant cognitive recognition during high-volatility trading.
- **Surfaces:** Cyan-slate provides the mid-tier elevation for containers and cards, creating a clear hierarchy against the dark background.

## Typography
The system uses **Inter** for its extreme legibility and systematic feel across all UI labels and body text. For numerical data, transaction hashes, and price tickers, **JetBrains Mono** is introduced to provide a "developer-tool" precision and ensure tabular figures align perfectly.

Headlines should remain tight and impactful. Labels use increased letter-spacing and uppercase styling to evoke a cockpit-instrumentation feel. On mobile, display sizes scale down by 20%, while data-density remains high to facilitate one-handed trading.

## Layout & Spacing
This design system utilizes a **Fixed Grid** on desktop (1440px max-width) and a **Fluid Grid** on mobile. The spacing rhythm is based on a strict **4px increment** to maintain a compact, technical layout.

- **Desktop:** 12-column grid with 16px gutters. Heavy use of "Panels" that occupy fixed sidebars for order books and history.
- **Mobile:** 4-column grid with 16px side margins.
- **Density:** High. Content should be packed efficiently, using dividers rather than large whitespace gaps to separate data streams.

## Elevation & Depth
Depth is achieved through **Glassmorphism** and **Z-axis Layering**, rather than traditional shadows.

1.  **Base (0):** Deep Cyan-Night solid background.
2.  **Surface (1):** Cyan Slate with a 1px border.
3.  **Floating (2):** Cyan Slate with a backdrop-blur (12px) and an Electric Cyan outer glow (4px blur, 10% opacity).
4.  **Overlays:** 40% opacity black tint with 20px blur to isolate modals.

Borders are critical: use 1px solid lines with low-opacity whites or brand colors to define edges in the dark environment.

## Shapes
The shape language is "Soft-Tech." Buttons and containers use a subtle **4px (0.25rem)** corner radius to maintain a crisp, engineered look without appearing overly aggressive. 

- **Interactive Elements:** 4px radius.
- **Status Pills:** Fully rounded (pill) for contrast against structural blocks.
- **Data Cards:** 8px radius for internal nesting.

## Components
- **Buttons:** Primary buttons use a solid Electric Cyan fill with a high-contrast dark label. Secondary buttons use a "Ghost" style: 1px Neon Azure border and Azure text. Active states trigger a "neon bloom" (outer glow).
- **Inputs:** Dark backgrounds with a bottom-only 2px border that illuminates into Cyan when focused. Labels are positioned above in `label-caps`.
- **Trading Cards:** Modular blocks with 1px low-opacity borders. Headers should include a 2px vertical accent bar of the Brand Secondary color.
- **Status Chips:** Small, high-contrast badges using `data-sm`. Bullish (Success) and Bearish (Error) chips use a 10% opacity background fill of their respective colors with 100% opacity text.
- **Order Book:** Alternating row highlights using 2% white overlay. Price text utilizes `data-lg` for maximum visibility.
- **Terminals:** Monospaced logs should be wrapped in a container with a subtle scanline pattern overlay (linear-gradient).