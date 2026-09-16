# Locara Design System & UI Architecture

This design system defines the visual language, theme architecture, interaction patterns, and token system for **Locara**, a cultural commerce and heritage shop discovery platform.

---

## 1. Core Design Philosophy

- **Modern Cultural Minimalism**: Balancing the richness of traditional heritage bazaars with clean, modern editorial layouts.
- **Micro-Interactions**: Meaningful spring physics, hover scale transitions, and responsive active states (powered by Framer Motion).
- **Dual Aesthetic Theme Engine**:
  - **Light Theme**: Editorial **White + Warm Beige / Caramel** luxury.
  - **Dark Theme**: High-contrast **Pitch Black + Deep Crimson / Ruby Red** blend.
- **Performance & Fluidity**: Hardware-accelerated CSS transforms, fluid clamp typography, and smooth scrolling.

---

## 2. Theme Architecture & Color Tokens

### A. Light Theme (White + Warm Beige)
Crafted for an airy, elegant, high-end editorial experience reminiscent of fine art books and curated architectural catalogs.

| Token | CSS Variable | Value / Hex | Purpose |
|---|---|---|---|
| **Background Root** | `--bg` | `#FAF7F2` | Warm porcelain cream canvas |
| **Subtle Surface** | `--bg-subtle` | `#F4ECE1` | Soft warm beige section background |
| **Card Surface** | `--bg-card` | `#FFFFFF` | Crisp pure white card component surface |
| **Card Secondary** | `--bg-card2` | `#FBF8F4` | Slightly tinted beige auxiliary container |
| **Card Hover** | `--bg-card-hover` | `#F6EDE0` | Subtle sand hover state |
| **Header & Nav** | `--bg-header` / `--bg-nav` | `rgba(250, 247, 242, 0.92)` | Frosted white & cream glassmorphism |
| **Pill / Badge** | `--bg-pill` | `#F0E6D8` | Soft beige badge pill background |
| **Text Heading** | `--fg-heading` | `#120E0B` | Deep jet espresso |
| **Text Body** | `--fg` | `#1F1A16` | Warm obsidian black |
| **Text Secondary** | `--fg-secondary` | `#4A3E34` | Taupe walnut |
| **Text Muted** | `--fg-muted` | `#7E6C5C` | Sepia sand |
| **Primary Accent** | `--primary` | `#B87333` | Rich heritage caramel / warm copper |
| **Border** | `--border` | `#E6DDD0` | Warm beige hairline border |
| **Active Border** | `--border-active`| `#B87333` | Caramel highlight border |
| **Shadows** | `--shadow-sm/md/lg` | `rgba(74, 62, 52, 0.08)` | Soft warm diffused ambient shadows |

---

### B. Dark Theme (Pitch Black + Ruby Crimson Blend)
Crafted for an immersive, futuristic nocturnal luxury experience with deep obsidian blacks and glowing ruby/crimson accents.

| Token | CSS Variable | Value / Hex | Purpose |
|---|---|---|---|
| **Background Root** | `--bg` | `#09090B` | Pitch obsidian black canvas |
| **Subtle Surface** | `--bg-subtle` | `#0E0C10` | Deep carbon black surface |
| **Card Surface** | `--bg-card` | `#121015` | Dark carbon obsidian card component |
| **Card Secondary** | `--bg-card2` | `#191520` | Elevated dark ruby-tinted container |
| **Card Hover** | `--bg-card-hover` | `#231A29` | Rich dark plum/obsidian hover state |
| **Header & Nav** | `--bg-header` / `--bg-nav` | `rgba(9, 9, 11, 0.90)` | Deep obsidian frosted glassmorphism |
| **Pill / Badge** | `--bg-pill` | `rgba(225, 29, 72, 0.12)` | Subtle ruby translucent badge |
| **Text Heading** | `--fg-heading` | `#FFFFFF` | Pure crisp diamond white |
| **Text Body** | `--fg` | `#F8FAFC` | Diamond silver white |
| **Text Secondary** | `--fg-secondary` | `#E2E8F0` | Soft platinum silver |
| **Text Muted** | `--fg-muted` | `#94A3B8` | Cool slate ash |
| **Primary Accent** | `--primary` | `#E11D48` | Vivid Ruby Crimson Red |
| **Border** | `--border` | `rgba(225, 29, 72, 0.20)` | Subtle luminous crimson border |
| **Active Border** | `--border-active`| `#FF2E56` | Radiant neon ruby active border |
| **Shadow Glow** | `--shadow-glow` | `rgba(225, 29, 72, 0.40)` | Crimson neon edge glow |

---

## 3. Typography Scale

```css
--font-sans: 'Plus Jakarta Sans', system-ui, sans-serif;
--font-serif: 'Playfair Display', 'Cormorant Garamond', serif;
--font-mono: 'JetBrains Mono', monospace;
```

- **Headings & Display**: `Playfair Display` serif for timeless sophistication.
- **Body & Controls**: `Plus Jakarta Sans` for crisp legibility across all screen sizes.
- **Prices & Metadata**: `JetBrains Mono` for tabular alignment and crisp numeric contrast.

---

## 4. Component Patterns

### 1. Interactive Theme Toggle (`<ThemeToggle />`)
- Positioned in Explorer Header, Merchant Header, and Navigation.
- Smooth spring animation switching between sun (caramel/beige) and moon (crimson/ruby).
- Persisted automatically to `localStorage` and synced with system preferences.

### 2. Shop & Product Cards
- Smooth hover elevation (`-3px` transform, glowing border transition).
- Responsive grid (2 columns on mobile, 4 columns on desktop) and linear list view.
- Real-time Open/Closed badge indicators.

### 3. Glassmorphism Navigation & Modals
- `backdrop-filter: blur(20px)`
- Adaptable to light mode (frosted white backing) and dark mode (frosted obsidian backing).

---

## 5. Installed Skills & Reference Guides

The following 23 design and interaction skills from `claudedesignskills` are installed in `.agents/skills` and `.claude/skills`:

1. `modern-web-design` — Meta-skill for 2024-2025 modern web design patterns and architecture.
2. `motion-framer` — Complex Framer Motion gesture physics and layout transitions.
3. `animated-component-libraries` — Accessible animated component primitives.
4. `gsap-scrolltrigger` — High-performance scrollytelling and pin sequences.
5. `threejs-webgl` & `react-three-fiber` — 3D interactive canvases and WebGL shaders.
6. `lightweight-3d-effects` — Lightweight canvas and CSS 3D parallax effects.
7. `lottie-animations` — Vector motion animations.
8. `animejs` — Micro-interaction timeline orchestrations.
9. `scroll-reveal-libraries` — Viewport scroll triggers and staggered reveals.
10. `locomotive-scroll` — Inertial virtual scroll integration.
11. `spline-interactive` & `rive-interactive` — Interactive 3D/2D vector runtimes.
12. `barba-js`, `pixijs-2d`, `babylonjs-engine`, `playcanvas-engine`, etc.
