"""Emit the common theme blocks so each template only writes what is unique."""

def tokens(d, extra=''):
    lines = '\n'.join(f'  {k}: {v};' for k, v in d.items())
    return f''':root {{
{lines}
}}

@media (width >= 1536px) {{ :root {{ --section-head-size: var(--text-7xl); }} }}
{extra}
'''

def dark_card():
    return '''
.card {
  background: linear-gradient(to bottom right,
    color-mix(in srgb, var(--card) 95%, transparent),
    color-mix(in srgb, var(--card) 68%, transparent));
  border-color: color-mix(in srgb, var(--foreground) 10%, transparent);
}
'''

def centered_hero(title_size='var(--text-8xl)', lede_width='52ch'):
    return f'''
/* --- Hero ---------------------------------------------------------------- */

.hero {{ position: relative; padding-top: 9rem; padding-bottom: 4rem; }}

.hero__inner {{
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.15rem;
  text-align: center;
}}

.hero__title {{
  max-width: 20ch;
  font-size: {title_size};
  line-height: 1.05;
  font-weight: 700;
  letter-spacing: -0.025em;
}}

.hero__lede {{ max-width: {lede_width}; font-size: var(--text-xl); line-height: 1.45; opacity: 0.75; }}
.hero__actions {{ display: flex; flex-wrap: wrap; justify-content: center; gap: 0.75rem; margin-top: 0.5rem; }}
.hero__note {{ font-size: var(--text-base); opacity: 0.6; }}

.hero__stage {{ margin-top: 3rem; padding: 0.75rem; border-radius: var(--radius); }}
.hero__stage img {{ width: 100%; aspect-ratio: 16 / 9; object-fit: cover; border-radius: calc(var(--radius) - 0.25rem); }}

@media (width <= 768px) {{
  .hero {{ padding-top: 7.5rem; }}
  .hero__title {{ font-size: var(--text-7xl); max-width: 15ch; }}
}}
'''

def cta_band():
    return '''
/* --- Contact ---------------------------------------------------------------- */

.cta-band { display: flex; flex-direction: column; align-items: center; gap: 1.15rem; text-align: center; padding-block: 5rem; }
.cta-band h2 { max-width: 22ch; font-size: var(--text-6xl); line-height: 1.08; letter-spacing: -0.02em; text-wrap: balance; }
.cta-band p { max-width: 46ch; font-size: var(--text-lg); line-height: 1.5; opacity: 0.75; }
.cta-band__actions { display: flex; flex-wrap: wrap; justify-content: center; gap: 0.75rem; }
'''

def blog_cards():
    return '''
/* --- Blog cards -------------------------------------------------------------- */

.post-card { padding: 0.75rem; border-radius: var(--radius); }

.post-card img {
  width: 100%;
  aspect-ratio: 16 / 10;
  object-fit: cover;
  border-radius: calc(var(--radius) - 0.5rem);
  transition: transform 0.5s ease-out;
}

.post-card:hover img { transform: scale(1.04); }
.post-card__body { display: flex; flex-direction: column; gap: 0.6rem; padding: 1.15rem 0.6rem 0.5rem; }
.post-card__body h3 { font-size: var(--text-2xl); line-height: 1.25; }
.post-card__body > p { font-size: var(--text-lg); line-height: 1.45; opacity: 0.75; }

.post-card__meta { display: flex; align-items: center; gap: 0.6rem; margin-top: 0.4rem; font-size: var(--text-base); opacity: 0.65; }
.post-card__meta img { width: 1.75rem; height: 1.75rem; border-radius: 50%; aspect-ratio: 1; }
'''

def footer_block(bg='var(--card)', on_dark=True):
    border = 'color-mix(in srgb, var(--foreground) 12%, transparent)' if on_dark else 'rgba(255,255,255,0.22)'
    return f'''
/* --- Footer -------------------------------------------------------------------- */

.site-footer {{ border-radius: var(--radius) var(--radius) 0 0; background: {bg}; color: var(--foreground); padding-block: 4rem; }}
.footer-top {{ display: grid; grid-template-columns: 1fr auto; gap: 3rem; align-items: start; }}
.footer-brand {{ font-size: var(--text-5xl); font-weight: 700; letter-spacing: -0.02em; }}
.footer-nav {{ display: grid; grid-template-columns: repeat(3, minmax(9rem, auto)); gap: 2.5rem; }}
.footer-nav h3 {{ font-size: var(--text-base); font-weight: 500; opacity: 0.55; margin-bottom: 1rem; }}
.footer-nav ul {{ display: flex; flex-direction: column; gap: 0.75rem; }}
.footer-nav a {{ font-size: var(--text-lg); transition: color 0.2s, opacity 0.2s; }}
.footer-nav a:hover {{ color: var(--accent); }}

.footer-legal-bar {{
  display: flex; justify-content: space-between; gap: 1rem; flex-wrap: wrap;
  margin-top: 3rem; padding-top: 1.5rem;
  border-top: 1px solid {border};
  font-size: var(--text-base); opacity: 0.6;
}}
.footer-legal-bar div {{ display: flex; gap: 1.25rem; }}

@media (width <= 768px) {{
  .footer-top {{ grid-template-columns: minmax(0, 1fr); gap: 2rem; }}
  .footer-nav {{ grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 1.5rem; }}
}}
'''
