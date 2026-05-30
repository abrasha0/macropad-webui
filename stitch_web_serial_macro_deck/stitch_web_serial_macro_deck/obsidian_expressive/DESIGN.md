---
name: Cyber-Tactile Industrial
colors:
  surface: '#131315'
  surface-dim: '#131315'
  surface-bright: '#39393b'
  surface-container-lowest: '#0e0e10'
  surface-container-low: '#1b1b1d'
  surface-container: '#201f22'
  surface-container-high: '#2a2a2c'
  surface-container-highest: '#353437'
  on-surface: '#e5e1e4'
  on-surface-variant: '#cac3d8'
  inverse-surface: '#e5e1e4'
  inverse-on-surface: '#313032'
  outline: '#948ea1'
  outline-variant: '#494455'
  surface-tint: '#cdbdff'
  primary: '#cdbdff'
  on-primary: '#370096'
  primary-container: '#7c4dff'
  on-primary-container: '#fcf6ff'
  inverse-primary: '#6833ea'
  secondary: '#ffb1c0'
  on-secondary: '#660028'
  secondary-container: '#e00161'
  on-secondary-container: '#fff6f6'
  tertiary: '#00daf3'
  on-tertiary: '#00363d'
  tertiary-container: '#007e8d'
  on-tertiary-container: '#ebfcff'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#e8deff'
  primary-fixed-dim: '#cdbdff'
  on-primary-fixed: '#20005f'
  on-primary-fixed-variant: '#4f00d0'
  secondary-fixed: '#ffd9df'
  secondary-fixed-dim: '#ffb1c0'
  on-secondary-fixed: '#3f0016'
  on-secondary-fixed-variant: '#90003c'
  tertiary-fixed: '#9cf0ff'
  tertiary-fixed-dim: '#00daf3'
  on-tertiary-fixed: '#001f24'
  on-tertiary-fixed-variant: '#004f58'
  background: '#131315'
  on-background: '#e5e1e4'
  surface-variant: '#353437'
  surface-high: '#2a2a2c'
  terminal-black: '#0e0e10'
  outline-glow: rgba(124, 77, 255, 0.3)
typography:
  headline-lg:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.01em
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  label-md:
    fontFamily: Geist
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0.05em
  code-sm:
    fontFamily: JetBrains Mono
    fontSize: 13px
    fontWeight: '400'
    lineHeight: 18px
rounded:
  sm: 0.5rem
  DEFAULT: 1rem
  md: 1.5rem
  lg: 2rem
  xl: 3rem
  full: 9999px
spacing:
  unit: 8px
  gutter: 16px
  container-padding: 24px
  margin-desktop: 40px
  margin-mobile: 16px
---

## Brand & Style
The brand identity is a fusion of **Glassmorphism** and **Technical Brutalism**, designed specifically for hardware enthusiasts and developers. It evokes a "hacker-space" aesthetic: professional but edgy, precise yet expressive. 

The emotional response should be one of "high-fidelity control." The UI uses deep charcoal surfaces contrasted with glowing neon accents (Cyan, Magenta, Violet) to simulate an illuminated hardware interface. Elements feel physical through the use of translucent "glass" panels, subtle pulsing animations, and glowing states that mimic hardware LEDs.

## Colors
The palette is rooted in a deep, near-black neutral base (`#0e0e10`) to provide maximum contrast for functional color roles. 

- **Primary (Violet):** Used for primary actions, branding, and "listening" states. It carries a signature glow.
- **Secondary (Pink/Magenta):** Reserved for "active" or "selected" hardware states and critical event logs.
- **Tertiary (Cyan):** Used for system status indicators, "connected" pulses, and terminal accents.
- **Surface Strategy:** Uses a tiered "Surface Container" model where depth is indicated by increasing lightness (e.g., higher panels are lighter than the background).

## Typography
The system uses a tri-font strategy to differentiate information types:
- **Inter** handles the primary UI hierarchy and body text, providing a neutral, clean base.
- **Geist** is used for functional labels and meta-information, giving a technical, condensed feel to headers and buttons.
- **JetBrains Mono** is strictly for data, keycaps, and terminal output, reinforcing the hardware/code relationship.

Larger headlines use aggressive negative letter-spacing for a "tight" industrial look, while labels use expanded spacing for legibility in all-caps.

## Layout & Spacing
The layout uses a **split-pane fluid model** with fixed-width sidebars. 
- **Navigation:** Fixed at 256px (w-64).
- **Workspace:** The main area is divided vertically (55/45 split) to balance the visual canvas with the data-heavy terminal.
- **Grids:** Internal components (like the key grid) use a strict 8px (unit) based spacing system.
- **Safe Areas:** A generous 40px margin is applied to the main workspace to prevent the technical density from feeling cluttered.

## Elevation & Depth
Depth is created through a combination of **Glassmorphism** and **Colored Glows**:
- **Base Layer:** The darkest `#0e0e10` background represents the bottom-most canvas.
- **Panels:** Raised containers use `#201f22` with subtle `border-outline-variant/30` borders. 
- **Glass Effect:** Interactive floating panels utilize `backdrop-blur-md` with semi-transparent backgrounds to maintain context.
- **Luminescence:** Instead of traditional black shadows, interactive elements use **tinted outer glows** matching their functional color (e.g., a violet glow for the primary button).

## Shapes
The shape language is "Hyper-Rounded." 
- **Standard UI Elements:** Use a 16px (1rem) radius.
- **Buttons and Nav Items:** Use full "Pill" shapes (rounded-full) to provide a friendly, touchable contrast to the sharp, dark industrial colors.
- **Hardware Metaphors:** Keycaps use a specific `rounded-[16px]` to mimic physical high-profile keys.
- **Interactive Nodes:** The rotary encoder and status pips use perfect circles to signify physical points of interaction.

## Components
- **Buttons:** Primary buttons are pill-shaped with a solid `primary-container` fill and a matching colored drop-shadow. Active states should "pulse" or increase glow intensity.
- **Keycaps:** These are stylized cards with `surface-variant` backgrounds, inner shadows, and centered `JetBrains Mono` labels. Selected keys swap to `secondary` color with a 105% scale transform.
- **Terminal:** Housed in a `surface-container-lowest` block. Text is color-coded by log level: [SYS] is Cyan, [EVT] is Magenta, [RX] is Violet.
- **Nav Links:** Use a "ghost" style that transitions to a pill-shaped `surface-container-high` background on hover. The active state is indicated by the `primary` text color.
- **Input/Binders:** Listening states for inputs use a `border-2` stroke and a continuous pulse animation to grab user attention.