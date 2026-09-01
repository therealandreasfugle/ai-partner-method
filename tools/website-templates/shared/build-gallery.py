#!/usr/bin/env python3
"""Regenerate the gallery grid from templates.json.
A template counts as live when templates/<slug>/index.html exists."""
import json, os, re

ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
data = json.load(open(os.path.join(ROOT, 'shared/templates.json'), encoding='utf-8'))

def card(it):
    slug, name, desc = it['slug'], it['name'], it['desc']
    live = os.path.exists(os.path.join(ROOT, 'templates', slug, 'index.html'))
    thumb = os.path.join(ROOT, 'shared/thumbs', slug + '.png')
    if live and os.path.exists(thumb):
        shot = f'<img src="shared/thumbs/{slug}.png" alt="{name} template" loading="lazy">'
    else:
        shot = ('<div class="tpl__swatch">' +
                ''.join(f'<span style="background:{c}"></span>' for c in it['sw']) + '</div>')
    tag = ('<span class="tag tag--live">Live</span>' if live
           else '<span class="tag tag--queued">In build</span>')
    if live:
        return (f'      <a class="tpl" href="templates/{slug}/">\n'
                f'        <div class="tpl__shot">{shot}</div>\n'
                f'        <div class="tpl__body">\n          <h3>{name}</h3>\n'
                f'          <p>{desc}</p>\n          {tag}\n        </div>\n      </a>')
    return (f'      <div class="tpl">\n        <div class="tpl__shot">{shot}</div>\n'
            f'        <div class="tpl__body">\n          <h3>{name}</h3>\n'
            f'          <p>{desc}</p>\n          {tag}\n        </div>\n      </div>')

groups = []
live_count = 0
for g in data['groups']:
    cards = '\n\n'.join(card(i) for i in g['items'])
    live_count += sum(1 for i in g['items']
                      if os.path.exists(os.path.join(ROOT, 'templates', i['slug'], 'index.html')))
    groups.append(f'''  <section class="group">
    <div class="group__head">
      <h2>{g['title']}</h2>
      <p>{g['note']}</p>
    </div>
    <div class="grid">

{cards}

    </div>
  </section>''')

body = '\n\n'.join(groups)
p = os.path.join(ROOT, 'index.html')
s = open(p, encoding='utf-8').read()
s = re.sub(r'<main class="shell">.*?</main>', '<main class="shell">\n\n' + body + '\n\n</main>', s, flags=re.S)
total = sum(len(g['items']) for g in data['groups'])
s = re.sub(r'<div class="stat"><strong>\d+</strong><span>Templates</span></div>',
           f'<div class="stat"><strong>{total}</strong><span>Templates</span></div>', s)
open(p, 'w', encoding='utf-8').write(s)
print(f'gallery rebuilt: {live_count}/{total} live')
