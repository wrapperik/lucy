# Style Guide

## Colors

### Backgrounds
- **App**: `#0c1015`
- **Card**: `#151c24`
- **Card Elevated**: `#1a2230`
- **Card Inner**: `#1e2a36`

### Accent (Warm Amber/Copper)
- **Primary**: `#c8956c`
- **Light**: `#dbb08a`
- **Dark**: `#a87a52`
- **Glow**: `rgba(200, 149, 108, 0.12)`
- **Glow Strong**: `rgba(200, 149, 108, 0.25)`

### Text
- **Primary**: `#e8e4df`
- **Secondary**: `#94a0ae`
- **Muted**: `#5c6878`
- **Accent**: Uses `--accent` above

### Borders
- **Subtle**: `rgba(255, 255, 255, 0.05)`
- **Card**: `rgba(255, 255, 255, 0.07)`

---

## Fonts

- **Body**: `'Inter'`, system-ui, -apple-system, sans-serif
- **Mono**: `'Space Mono'`, monospace
- **Serif**: `'Playfair Display'`, Georgia, serif

---

## Gradients

### Accent Gradient
```css
linear-gradient(135deg, #dbb08a, #c8956c)
```

### Dark Accent Gradient
```css
linear-gradient(135deg, #dbb08a, #a87a52)
```

### Card Background
```css
linear-gradient(160deg, #1a2230 0%, #151c24 100%)
```

### Text Gradient
```css
linear-gradient(135deg, #dbb08a, #c8956c)
```

---

## Spacing & Sizing

- **Card Border Radius**: `20px`
- **Inner Border Radius**: `16px`
- **Pill Radius**: `999px`
- **Nav Height**: `80px`

---

## Shadows

**Card Shadow**:
```css
0 4px 32px rgba(0, 0, 0, 0.35), 0 0 48px rgba(30, 64, 120, 0.05)
```

---

## Animations

- **Fade In Up**: `fadeInUp` - 0.6s ease-out
- **Float**: `float` - 3.5s ease-in-out infinite (±5px vertical)
- **Pulse Glow**: `pulse-glow` - 2.5s ease-in-out infinite (0.5→1 opacity)
- **Shimmer**: `shimmer` - 3s ease-in-out infinite
- **Spin Slow**: `spin-slow` - 8s linear infinite

---

## Glass Effect

```css
background: rgba(12, 16, 21, 0.88);
backdrop-filter: blur(24px);
-webkit-backdrop-filter: blur(24px);
```

---

## Usage

Import design tokens as CSS variables in your components:
```css
color: var(--text-primary);
background: var(--bg-card);
border-color: var(--border-card);
```

Use utility classes:
- `.glass` → blurred background
- `.text-gradient` → gradient text effect
- `.pb-safe` → safe padding for bottom nav
- `.animate-fade-in-up` → fade in animation
- `.animate-float` → floating animation
