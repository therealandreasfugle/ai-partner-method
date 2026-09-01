/** @type {import('tailwindcss').Config} */
//
// Foundation tokens for the website factory baseline template. Per-client
// theming is handled by scripts/inject-theme.mjs, which rewrites the :root
// CSS variables in src/index.css from brand-dna.js without touching this
// file. Foundation values (type scale, spacing, shadows, easings) are
// niche-agnostic and ship with every template.
//
// Type scale follows the synthesised research's modular pattern: body 1.25
// ratio (14 → 18), heading 1.333 ratio (24 → 100) on desktop. Spacing follows
// an 8pt grid with named tokens for section gaps and card padding. Shadows
// use a 2-layer ambient + direct pattern per the research. Easings include
// the premium curves (cubic-bezier(0.16, 1, 0.3, 1) etc.) alongside the
// legacy spring-bounce for niches that opt into the "energetic" motion preset.
//
// Source: research/_framework/web-design-research-2026-05.md, tactics 3, 4,
// 5, 11, 12, 15.

export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          DEFAULT: 'rgb(var(--primary) / <alpha-value>)',
          dark: 'rgb(var(--primary-dark) / <alpha-value>)',
          slate: 'rgb(var(--primary-slate) / <alpha-value>)',
        },
        gold: {
          DEFAULT: 'rgb(var(--accent) / <alpha-value>)',
          light: 'rgb(var(--accent-light) / <alpha-value>)',
          dark: 'rgb(var(--accent-dark) / <alpha-value>)',
        },
        steel: 'rgb(var(--neutral-dim) / <alpha-value>)',
        cool: 'rgb(var(--neutral) / <alpha-value>)',
        silver: 'rgb(var(--silver) / <alpha-value>)',
        ink: 'rgb(var(--ink) / <alpha-value>)',
        // Backwards-compat single-tone aliases
        accent: 'rgb(var(--accent) / <alpha-value>)',
        primary: 'rgb(var(--primary) / <alpha-value>)',
      },
      fontFamily: {
        // The actual font family string is rewritten by inject-theme.mjs
        // (it edits the @import url(...) at the top of src/index.css) so the
        // first family name in each stack here just needs to match
        // brandDNA.typography.heading / .body. Default stack favours
        // variable-font display + humanist sans body per the research.
        // First slot is the per-client face via CSS var (inject-theme.mjs sets
        // --font-heading / --font-body from brandDNA.typography); the rest are
        // fallbacks during font swap. This is why a client's fonts apply.
        heading: ['var(--font-heading)', 'Oswald', 'Impact', 'serif'],
        body: ['var(--font-body)', 'Inter', 'sans-serif'],
      },
      // ── Modular type scale (research tactics 3, 4) ──
      // Body scale (1.25 ratio): 14 → 18. Display scale (1.333 ratio): 24 → 100.
      // Each entry: [fontSize, { lineHeight }]
      fontSize: {
        // Body sizes (1.25 ratio)
        xs: ['12px', { lineHeight: '1.5' }],
        sm: ['14px', { lineHeight: '1.55' }],
        base: ['16px', { lineHeight: '1.6' }],
        lg: ['18px', { lineHeight: '1.6' }],
        xl: ['20px', { lineHeight: '1.5' }],
        // Display sizes (1.333 ratio), tight line-heights per tactic 4
        '2xl': ['24px', { lineHeight: '1.25' }],
        '3xl': ['32px', { lineHeight: '1.2' }],
        '4xl': ['42px', { lineHeight: '1.15' }],
        '5xl': ['56px', { lineHeight: '1.1' }],
        '6xl': ['75px', { lineHeight: '1.05' }],
        '7xl': ['96px', { lineHeight: '1.05' }],
        // Named display tokens (use these for hero / page-level headlines)
        'display-sm': ['42px', { lineHeight: '1.1', letterSpacing: '-0.02em' }],
        'display-md': ['56px', { lineHeight: '1.05', letterSpacing: '-0.025em' }],
        'display-lg': ['75px', { lineHeight: '1.05', letterSpacing: '-0.025em' }],
        'display-xl': ['96px', { lineHeight: '1.05', letterSpacing: '-0.03em' }],
      },
      // ── 8pt spacing scale (research tactic 12) ──
      spacing: {
        '0.5': '4px',
        '1': '8px',
        '1.5': '12px',
        '2': '16px',
        '3': '24px',
        '4': '32px',
        '6': '48px',
        '8': '64px',
        '12': '96px',
        '16': '128px',
        '24': '192px',
        // Named section tokens
        'card-pad': '32px',
        'section-gap': '96px',
        'section-gap-lg': '128px',
      },
      // ── Premium tracking / leading utilities (tactics 4, 5) ──
      letterSpacing: {
        eyebrow: '0.12em',
        'eyebrow-wide': '0.16em',
        display: '-0.025em',
        'display-tight': '-0.03em',
      },
      lineHeight: {
        display: '1.05',
        'display-tight': '1.1',
        body: '1.6',
      },
      // ── Layered shadows (tactic 15: ambient + direct, not single drop) ──
      boxShadow: {
        card: '0 1px 2px rgb(0 0 0 / 0.06), 0 24px 48px rgb(0 0 0 / 0.08)',
        'card-lg': '0 2px 4px rgb(0 0 0 / 0.08), 0 32px 64px rgb(0 0 0 / 0.10)',
        floating: '0 4px 8px rgb(0 0 0 / 0.10), 0 48px 96px rgb(0 0 0 / 0.14)',
        // Border-emphasis variant adds a 1px translucent edge
        'card-edge': '0 0 0 1px rgb(0 0 0 / 0.05), 0 1px 2px rgb(0 0 0 / 0.06), 0 24px 48px rgb(0 0 0 / 0.08)',
      },
      // ── Premium easings (tactic 11) ──
      transitionTimingFunction: {
        'premium-out': 'cubic-bezier(0.16, 1, 0.3, 1)',
        'premium-in': 'cubic-bezier(0.7, 0, 0.84, 0)',
        'premium-in-out': 'cubic-bezier(0.83, 0, 0.17, 1)',
        // Legacy spring-bounce kept only for niches that opt into the
        // "energetic" motion preset (niche-playbook/motion-preset.json)
        'spring-bounce': 'cubic-bezier(0.34, 1.56, 0.64, 1)',
      },
      // ── Max paragraph width per editorial print rule (tactic Ty5) ──
      maxWidth: {
        prose: '68ch',
      },
    },
  },
  plugins: [],
}
