---
name: make-interfaces-feel-better
description: >
  Apply micro-detail polish principles to UI code. Use when an interface looks
  correct but feels off — covers border radius, shadows, animations, typography,
  hit areas, and performance. Based on Emil Kowalski's design engineering philosophy.
license: MIT
metadata:
  source: boraoztunc/skills (Emil Kowalski principles)
---

# Details That Make Interfaces Feel Better

Great interfaces feel right because of small details that compound. Apply these when building or reviewing UI code.

## The 16 Principles

### 1. Concentric Border Radius
`outer radius = inner radius + padding`
Mismatched radii on nested elements is the most common thing that makes UIs feel off.

### 2. Optical Over Geometric Alignment
When geometric centering looks off, align optically. Buttons with icons, play triangles, and asymmetric icons all need manual adjustment — trust your eye, not the math.

### 3. Shadows Over Borders
Layer multiple transparent `box-shadow` values for natural depth. Shadows adapt to any background; solid borders don't.
```css
box-shadow: 0 1px 2px rgba(0,0,0,0.06), 0 4px 12px rgba(0,0,0,0.08);
```

### 4. Interruptible Animations
Use CSS transitions for interactive state changes — they can be interrupted mid-animation. Reserve keyframes for staged sequences that run once.

### 5. Split and Stagger Enter Animations
Don't animate a single container. Break content into semantic chunks and stagger each with ~100ms delay.

### 6. Subtle Exit Animations
Use a small fixed `translateY` instead of full height collapse. Exits should be softer than enters.

### 7. Contextual Icon Animations
Animate icons with `opacity`, `scale`, and `blur` — not `display:none` toggling.
- Scale: `0.25` → `1`
- Opacity: `0` → `1`
- Blur: `4px` → `0px`
- Easing: `cubic-bezier(0.2, 0, 0, 1)`
- With framer-motion: `{ type: "spring", duration: 0.3, bounce: 0 }`

### 8. Font Smoothing
```css
* { -webkit-font-smoothing: antialiased; }
```
Apply to root on macOS for crisper text.

### 9. Tabular Numbers
```css
.counter { font-variant-numeric: tabular-nums; }
```
For any dynamically updating numbers — prevents layout shift.

### 10. Text Wrapping
```css
h1, h2, h3 { text-wrap: balance; }
p { text-wrap: pretty; }
```

### 11. Image Outlines
```css
img { outline: 1px solid rgba(0,0,0,0.06); }
```
Consistent depth, especially on white backgrounds.

### 12. Scale on Press
```css
button:active { transform: scale(0.96); }
```
Always `0.96`. Never smaller than `0.95` — uncanny below that.

### 13. Skip Animation on Page Load
With framer-motion: `<AnimatePresence initial={false}>` — prevents enter animations firing on first render.

### 14. Never Use `transition: all`
```css
/* Bad */
transition: all 0.2s ease;
/* Good */
transition-property: scale, opacity;
transition-duration: 0.2s;
```

### 15. Use `will-change` Sparingly
Only for `transform`, `opacity`, `filter`. Never `will-change: all`.

### 16. Minimum Hit Area
Interactive elements need at least 40×40px hit area. Extend with pseudo-element if the visible element is smaller.

---

## Common Mistakes → Fixes

| Mistake | Fix |
|---|---|
| Same border radius on parent and child | `outerRadius = innerRadius + padding` |
| Icons look off-center | Adjust optically, or fix SVG viewBox |
| Hard edges between sections | Layered `box-shadow` with transparency |
| Jarring enter/exit animations | Split, stagger enters; soften exits |
| Numbers cause layout shift | `tabular-nums` |
| Heavy text on macOS | `antialiased` on root |
| Animation plays on page load | `initial={false}` on AnimatePresence |
| `transition: all` | Specify exact properties |
| Tiny tap targets | Pseudo-element to 40×40px |

---

## Review Checklist

- [ ] Nested rounded elements use concentric border radius
- [ ] Icons optically centered
- [ ] Shadows used instead of borders
- [ ] Enter animations split and staggered
- [ ] Exit animations subtle
- [ ] Dynamic numbers use tabular-nums
- [ ] Font smoothing applied to root
- [ ] Headings use `text-wrap: balance`
- [ ] Images have subtle outlines
- [ ] Buttons use `scale(0.96)` on press
- [ ] No `transition: all`
- [ ] `will-change` only on transform/opacity/filter
- [ ] Interactive elements have 40×40px hit area
