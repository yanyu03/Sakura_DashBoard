---
name: Strawberry Milkshake Faculty Workspace
colors:
  surface: '#fff7fa'
  surface-dim: '#ffc9fb'
  surface-bright: '#fff7fa'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#ffeffa'
  surface-container: '#ffe7fa'
  surface-container-high: '#ffdffa'
  surface-container-highest: '#ffd6fa'
  on-surface: '#340538'
  on-surface-variant: '#534344'
  inverse-surface: '#4c1d4f'
  inverse-on-surface: '#ffebfa'
  outline: '#857274'
  outline-variant: '#d8c1c3'
  surface-tint: '#8f4953'
  primary: '#8f4953'
  on-primary: '#ffffff'
  primary-container: '#fda4af'
  on-primary-container: '#793741'
  inverse-primary: '#ffb2bb'
  secondary: '#a43073'
  on-secondary: '#ffffff'
  secondary-container: '#fc79bd'
  on-secondary-container: '#76014e'
  tertiary: '#635b6e'
  on-tertiary: '#ffffff'
  tertiary-container: '#c3b9cf'
  on-tertiary-container: '#50495b'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#ffd9dc'
  primary-fixed-dim: '#ffb2bb'
  on-primary-fixed: '#3b0613'
  on-primary-fixed-variant: '#73323d'
  secondary-fixed: '#ffd8e7'
  secondary-fixed-dim: '#ffafd3'
  on-secondary-fixed: '#3d0026'
  on-secondary-fixed-variant: '#85145a'
  tertiary-fixed: '#e9def5'
  tertiary-fixed-dim: '#cdc2d9'
  on-tertiary-fixed: '#1e1929'
  on-tertiary-fixed-variant: '#4a4456'
  background: '#fff7fa'
  on-background: '#340538'
  surface-variant: '#ffd6fa'
typography:
  headline-xl:
    fontFamily: Bricolage Grotesque
    fontSize: 3rem
    fontWeight: '700'
    lineHeight: 3.5rem
    letterSpacing: -0.03em
  headline-xl-mobile:
    fontFamily: Bricolage Grotesque
    fontSize: 2rem
    fontWeight: '700'
    lineHeight: 2.5rem
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Bricolage Grotesque
    fontSize: 2.25rem
    fontWeight: '700'
    lineHeight: 2.75rem
    letterSpacing: -0.02em
  headline-lg-mobile:
    fontFamily: Bricolage Grotesque
    fontSize: 1.75rem
    fontWeight: '700'
    lineHeight: 2.25rem
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Bricolage Grotesque
    fontSize: 1.75rem
    fontWeight: '600'
    lineHeight: 2.25rem
  headline-sm:
    fontFamily: Bricolage Grotesque
    fontSize: 1.25rem
    fontWeight: '600'
    lineHeight: 1.75rem
  body-lg:
    fontFamily: DM Sans
    fontSize: 1.125rem
    fontWeight: '400'
    lineHeight: 1.75rem
  body-md:
    fontFamily: DM Sans
    fontSize: 1rem
    fontWeight: '400'
    lineHeight: 1.5rem
  body-sm:
    fontFamily: DM Sans
    fontSize: 0.875rem
    fontWeight: '400'
    lineHeight: 1.25rem
  label-md:
    fontFamily: DM Sans
    fontSize: 0.875rem
    fontWeight: '600'
    lineHeight: 1.25rem
    letterSpacing: 0.01em
  label-sm:
    fontFamily: DM Sans
    fontSize: 0.75rem
    fontWeight: '600'
    lineHeight: 1rem
    letterSpacing: 0.02em
rounded:
  sm: 0.5rem
  DEFAULT: 1rem
  md: 1.5rem
  lg: 2rem
  xl: 3rem
  full: 9999px
spacing:
  gutter: 1.5rem
  gutter-sm: 1rem
  gutter-lg: 2rem
  margin: 2rem
  margin-mobile: 1rem
  margin-desktop: 3rem
  space-xs: 0.375rem
  space-sm: 0.75rem
  space-md: 1.25rem
  space-lg: 2rem
  space-xl: 3rem
---

## Brand & Style

This design system blends high-density administrative rigor with an expressive, bubbly neo-grotesque sensibility. Crafted specifically for educators, academic coordinators, and faculty leads, it subverts clinical, sterile school software by embracing a sweet, optimistic "strawberry milkshake & sakura blossom" visual identity. 

The aesthetic is Tactile & Playful Neo-Grotesque with subtle frosted-glass overlays. It brings joy, calm, and clarity to heavy academic tasks—such as lesson planning, grade entry, and student attendance tracking. The visual mood evokes warm ceramic mugs, pastel gel pens, and organized stationery, transforming daily teaching administration into an inviting, low-stress sanctuary while preserving crystal-clear pedagogical clarity and data density.

## Colors

The palette grounds high-energy pastel strawberry pinks with deep, dignified plum tones to ensure rigorous contrast, meet WCAG AAA legibility benchmarks for grading tables, and maintain a comforting touch.

- **Primary (`#FDA4AF` - Sakura Blossom Tint):** Applied to active toggles, highlighted states, and prominent surface fills.
- **Secondary (`#F472B6` - Strawberry Glaze):** Used for focal action elements, callouts, and key interaction triggers.
- **Tertiary (`#F3E8FF` - Soft Lavender Mist):** Serves as contextual accents, badge fills, and secondary state distinction.
- **Neutral Deep Plums (`#4C1D4F` & `#831843`):** Deliver sharp, high-contrast text rendering on light surfaces without the starkness of pure black.
- **Canvas Base (`#FFF7F9`):** A warm whipped-cream tint that eliminates harsh screen glare during long grading sessions.

## Typography

The type pairing pairs the exuberant, idiosyncratic curves of **Bricolage Grotesque** with the clean, legible geometry of **DM Sans**.

Headings celebrate character with tight tracking, ink-trap-inspired details, and friendly punchiness, bringing personality to course titles, dashboard welcomes, and module headers. Body copy and analytical labels leverage DM Sans for uncompromised scannability across dense attendance rosters, curriculum schedules, and grade books.

## Layout & Spacing

The layout model balances breathable negative space with compact academic tooling. Workspaces utilize a responsive 12-column dynamic grid on desktop and tablet, shifting to a unified single-column flow on mobile viewports.

Outer canvases prioritize generous margins (`margin-desktop: 3rem`) to frame workspaces like curated personal desks. Internal component groups rely on a consistent 4px/8px baseline multiples (`space-xs` through `space-xl`) to establish an orderly rhythm between dense grade inputs and modular classroom widgets.

## Elevation & Depth

Visual hierarchy uses plush, layered ambient depth rather than stark grey dropshadows. 

- **Plush Soft Tinting:** Shadows use low-opacity strawberry syrup tones (`rgba(131, 24, 67, 0.06)` to `rgba(131, 24, 67, 0.12)`) paired with wide blur radiuses (16px to 32px), creating buoyant, cloud-like cards.
- **Frosted Milk Glass (Glassmorphism):** Secondary toolbars and navigation drawers incorporate translucent backgrounds (`rgba(255, 247, 249, 0.85)`) over dynamic backdrop blurs (`backdrop-filter: blur(16px)`), overlaid with 1px border strokes tinted in `#FCE7F3`.
- **Surface Elevation Steps:**
  - Base layer: Background canvas (`#FFF7F9`).
  - Level 1: Static cards and workspace modules (`#FFFFFF` with subtle 1px `#FCE7F3` borders).
  - Level 2: Interactive hover states, quick modals, and floating action pods.

## Shapes

Embracing roundedness level `3` (Pill-shaped), geometry is rounded, soft, and friendly. Standard buttons, pills, filter tags, and search bars adopt full capsule contours.

Major container surfaces, such as lesson cards and weekly schedules, sport ultra-rounded contours (`rounded-2xl` to `rounded-3xl` equivalent to 2rem to 3rem corner radius). This playful geometry eliminates sharp tension from the interface, replacing institutional coldness with tactile softness.

## Components

### Buttons
- **Primary:** Full pill capsule shape, background `#FDA4AF`, text `#4C1D4F` (semi-bold), resting with a soft strawberry ambient blur. On hover, shifts to `#FB7185` with an interactive 2px tactile dip.
- **Secondary:** Frosted white capsule (`rgba(255, 255, 255, 0.9)`), bordered with 1.5px `#FCE7F3`, text `#831843`.
- **Tertiary:** Borderless pastel lilac wash (`#F3E8FF`), text `#581C87`.

### Chips & Badges
- Pill-shaped status indicators featuring pastel fills: `#FCE7F3` for in-progress classes, `#F3E8FF` for curriculum reviews, and `#DCFCE7` (soft mint) for submitted grades. All badges utilize `label-sm` in bold deep plum.

### Input Fields & Search Bars
- Generously padded capsule inputs with `#FFFFFF` background and 1.5px `#FCE7F3` border. Focus ring transitions into a gentle 3px outer glow in `#FDA4AF` with deep plum text (`#4C1D4F`).

### Cards & Modular Tiles
- Designed as plush ceramic slabs: rounded corners (`2rem`), 1px outer stroke of `#FCE7F3`, resting on `#FFFFFF`. Padding adheres to `space-lg` internally to ensure roomy, unhurried interactions.

### Checkboxes & Radios
- Bulbous, rounded-rect checkboxes and circular pill radios. Checked states display solid `#FB7185` with crisp white tick marks and subtle bounce micro-animations.

### Academic-Specific: Lesson Timetable & Attendance Trackers
- Pill-shaped attendee pods featuring circular avatar bubbles, quick one-tap status toggles (Present / Late / Excused) styled with pastel milkshake color codings, providing an interface that is both enjoyable and operationally swift.