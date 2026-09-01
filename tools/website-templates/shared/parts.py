"""Shared HTML fragment builders for template generation."""
ARROW_R = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>'
ARROW_D = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M7 17 17 7M8 7h9v9"/></svg>'
DIAG    = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M7 17 17 7M8 7h9v9"/></svg>'
PLUS    = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M5 12h14"/><path d="M12 5v14"/></svg>'
STAR    = '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="m12 2 3 6.6 7 .9-5.1 4.8 1.3 7L12 18l-6.2 3.3 1.3-7L2 9.5l7-.9z"/></svg>'
BURGER  = ('<svg class="icon-open" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" aria-hidden="true"><path d="M4 9h16M4 15h16"/></svg>'
           '<svg class="icon-close" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18"/></svg>')

def btn(href, label, kind='primary', ik='secondary', arrow=ARROW_R):
    return (f'<a class="btn btn--arrow {kind}-button" href="{href}">'
            f'<span class="btn__label">{label}</span>'
            f'<span class="btn__icon {ik}-button">{arrow}</span></a>')

def plain_btn(href, label, kind='primary'):
    return f'<a class="btn {kind}-button" href="{href}" data-letters>{label}</a>'

def head(title, desc, theme_color, og_image=None, extra=''):
    og = f'\n<meta property="og:image" content="{og_image}">' if og_image else ''
    return f'''<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{title}</title>
<meta name="description" content="{desc}">
<meta property="og:title" content="{title.split(':')[0]}">
<meta property="og:description" content="{desc}">
<meta property="og:type" content="website">{og}
<meta name="theme-color" content="{theme_color}">
<link rel="icon" href="../../favicon.svg" type="image/svg+xml">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:opsz,wght@14..32,100..900&display=swap">{extra}
<link rel="stylesheet" href="../../core/tokens.css">
<link rel="stylesheet" href="../../core/core.css">
<link rel="stylesheet" href="theme.css">
</head>
<body>

<div class="ambient" aria-hidden="true"><span class="b1"></span><span class="b2"></span><span class="b3"></span></div>
'''

def nav(brand, links, cta_href, cta_label, variant='navbar--bar', card=True, use_arrow=True):
    panel = '\n    '.join(f'<a href="{h}">{l} {DIAG}</a>' for l, h in links)
    inline = '\n      '.join(f'<a href="{h}">{l}</a>' for l, h in links)
    cta = btn(cta_href, cta_label) if use_arrow else plain_btn(cta_href, cta_label)
    bar_cls = 'navbar__bar card' if card else 'navbar__bar'
    return f'''
<nav class="navbar {variant}" aria-label="Main">
  <div class="navbar__panel" id="nav-panel">
    {panel}
  </div>
  <div class="{bar_cls}">
    <a class="navbar__brand" href="#top">{brand}</a>
    <div class="navbar__links">
      {inline}
    </div>
    <div class="navbar__actions">
      {cta}
      <button class="navbar__toggle card" type="button" aria-expanded="false" aria-controls="nav-panel" aria-label="Open menu">{BURGER}</button>
    </div>
  </div>
</nav>

<main id="top">
'''

def section_head(eyebrow, h2, lede=None, extra=''):
    l = f'\n        <p>{lede}</p>' if lede else ''
    e = f'\n        <div class="eyebrow card"><p>{eyebrow}</p></div>' if eyebrow else ''
    return f'''      <div class="section-head reveal">{e}
        <h2>{h2}</h2>{l}{extra}
      </div>'''

def accordion(pairs):
    items = '\n'.join(f'''        <div class="accordion__item card" data-open="false">
          <button class="accordion__trigger" type="button">
            <h3>{q}</h3>
            <span class="badge-num" aria-hidden="true">{PLUS}</span>
          </button>
          <div class="accordion__panel"><div><p>{a}</p></div></div>
        </div>''' for q, a in pairs)
    return f'      <div class="accordion reveal" data-accordion>\n{items}\n      </div>'

def testimonial(quote, name, role, img):
    return f'''          <article class="testimonial card shadow-xl">
            <div class="testimonial__stars" aria-label="5 out of 5 stars">{STAR*5}</div>
            <p>{quote}</p>
            <div class="testimonial__author">
              <img src="{img}" alt="" loading="lazy">
              <div><strong>{name}</strong><span>{role}</span></div>
            </div>
          </article>'''

def person(img, name, role):
    return f'''        <article class="person-card card shadow-xl">
          <img src="{img}" alt="{name}, {role}" loading="lazy">
          <div class="person-card__body"><h3>{name}</h3><p>{role}</p></div>
        </article>'''

def footer(brand, cols, legal, links=(('Privacy Policy','#contact'),('Terms of Service','#contact'))):
    col_html = '\n'.join(
        '        <div><h3>' + title + '</h3><ul>\n' +
        '\n'.join(f'          <li><a href="{h}">{l}</a></li>' for l, h in items) +
        '\n        </ul></div>' for title, items in cols)
    legal_links = ''.join(f'<a href="{h}">{l}</a>' for l, h in links)
    return f'''
</main>

<footer class="site-footer">
  <div class="wrap">
    <div class="footer-top">
      <p class="footer-brand">{brand}</p>
      <div class="footer-nav">
{col_html}
      </div>
    </div>
    <div class="footer-legal-bar">
      <span>{legal}</span>
      <div>{legal_links}</div>
    </div>
  </div>
</footer>

<script src="../../core/core.js"></script>
</body>
</html>
'''

def form(button_label, fields=None, placeholder='Tell us about your project...'):
    fields = fields or [('text','name','Full Name','name'),('email','email','Email Address','email')]
    inputs = '\n'.join(
        f'            <input type="{t}" name="{n}" placeholder="{p}" autocomplete="{ac}" required>'
        for t, n, p, ac in fields)
    return f'''          <form class="form" data-form>
{inputs}
            <textarea name="message" placeholder="{placeholder}" required></textarea>
            <button class="primary-button" type="submit">{button_label}</button>
            <p class="form__status" role="status" aria-live="polite"></p>
          </form>'''
