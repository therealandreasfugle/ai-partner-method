/**
 * site-loader.js
 *
 * Lets ONE deployed copy of the website template serve a different client site
 * per URL, with no rebuild. `brand-dna.js` stays the build-time baseline (it is
 * what the prebuild validator and inject-theme.mjs read); this module fetches a
 * generated config at page load and merges it into that same exported object
 * BEFORE React renders. Every component imports the same object reference, so
 * one merge updates all of them.
 *
 * URL contract:  /?site=<slug>   (alias ?slug=)
 * The slug is remembered in sessionStorage so in-app navigation to /about,
 * /services etc. keeps serving the same client without the query string.
 *
 * inject-theme.mjs normally bakes palette + fonts + <title> into the bundle at
 * build time. Because our config arrives at runtime instead, applyTheme()
 * mirrors that work against the live document. Its output format must stay
 * identical to inject-theme.mjs: `--primary: R G B` RGB triplets (Tailwind
 * reads them as rgb(var(--primary))), underscores in palette keys become
 * hyphens in CSS custom property names.
 */

import { brandDNA } from './brand-dna'
import { setAssetBase, setLogo } from './asset-base'

/**
 * Builds the brand wordmark as an inline SVG data URI.
 *
 * A hosted build has nowhere to write a per-client image file, and the photo
 * sets are shared per trade, so the one asset that must carry this specific
 * business's name is generated in the browser instead.
 */
/** Widest a wordmark may be before the header nav starts to crowd. */
const WORDMARK_MAX_WIDTH = 330
const WORDMARK_MAX_SIZE = 26
const WORDMARK_MIN_SIZE = 16

/**
 * Rendered width of the wordmark text, measured with the real font rather than
 * estimated. A per-character estimate was tried first and clipped the last
 * letter of "OKANAGAN STRENGTH COLLECTIVE": extra bold caps run wider than any
 * single average, and the SVG text then overflowed its own viewBox.
 *
 * Canvas does not apply CSS letter spacing, so that is subtracted by hand.
 */
function wordmarkWidth(name, size) {
  const canvas =
    wordmarkWidth.canvas || (wordmarkWidth.canvas = document.createElement('canvas'))
  const context = canvas.getContext('2d')
  const stack = `800 ${size}px "Plus Jakarta Sans", Helvetica, Arial, sans-serif`
  context.font = stack
  let measured = context.measureText(name).width - name.length * 0.5
  // The wordmark is built before the web font finishes downloading, so the
  // measurement usually comes from the Helvetica fallback, which is narrower
  // than Jakarta ExtraBold. Pad in that case. The box is only ever a container:
  // too wide leaves a little dead space, too narrow cuts the last letter off.
  const loaded =
    typeof document.fonts !== 'undefined' && document.fonts.check(`800 ${size}px "Plus Jakarta Sans"`)
  if (!loaded) measured *= 1.08
  return Math.ceil(measured) + 10
}

function makeWordmark(dna) {
  const company = dna.company || {}
  const full = String(
    (dna._display && dna._display.name) || company.name || ''
  ).toUpperCase().trim()
  if (!full) return ''

  // Never truncate: "Okanagan Strength Collective" sliced at 26 characters read
  // "OKANAGAN STRENGTH COLLECTI" in the header, which looks broken rather than
  // long. Shrink the type to fit, and only fall back to the short name when even
  // the smallest size cannot fit the header.
  // Step down a point at a time rather than scaling in one go: measured width is
  // not perfectly linear in font size, and one proportional guess still left the
  // last letter over the edge.
  const fit = (text) => {
    let size = WORDMARK_MAX_SIZE
    while (size > WORDMARK_MIN_SIZE && wordmarkWidth(text, size) > WORDMARK_MAX_WIDTH) {
      size -= 1
    }
    return size
  }

  let name = full
  let size = fit(name)
  if (wordmarkWidth(name, size) > WORDMARK_MAX_WIDTH) {
    const short = String(company.shortName || '').toUpperCase().trim()
    if (short && short.length < name.length) {
      name = short
      size = fit(name)
    }
  }

  const colour = (dna.palette && dna.palette.primary) || '#1E3A5F'
  const width = Math.max(160, wordmarkWidth(name, size))
  // The box stays 44 tall whatever the type size, so the header never reflows;
  // the baseline moves with the size to keep the text vertically centred.
  const baseline = Math.round(22 + size * 0.35)
  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} 44" ` +
    `width="${width}" height="44"><text x="0" y="${baseline}" ` +
    `font-family="Plus Jakarta Sans,Helvetica,Arial,sans-serif" font-size="${size}" ` +
    `font-weight="800" letter-spacing="-0.5" fill="${colour}">` +
    name.replace(/&/g, '&amp;').replace(/</g, '&lt;') +
    `</text></svg>`
  return 'data:image/svg+xml,' + encodeURIComponent(svg)
}

const SLUG_STORAGE_KEY = 'aipm-site-slug'

/** Where generated configs live. Overridable so the same bundle can point at a
 *  static folder locally and an API endpoint once this is hosted. */
export const CONFIG_BASE =
  (typeof window !== 'undefined' && window.__AIPM_CONFIG_BASE__) || '/configs'

export function resolveSlug() {
  if (typeof window === 'undefined') return null
  const params = new URLSearchParams(window.location.search)
  const fromUrl = params.get('site') || params.get('slug')
  if (fromUrl) {
    try {
      window.sessionStorage.setItem(SLUG_STORAGE_KEY, fromUrl)
    } catch {
      // Private-mode Safari throws on sessionStorage writes. The slug still
      // works for this page view via the query string; only cross-page
      // persistence is lost, so this is not worth surfacing to the visitor.
    }
    return fromUrl
  }
  try {
    return window.sessionStorage.getItem(SLUG_STORAGE_KEY)
  } catch {
    return null
  }
}

/**
 * Recursive merge where the incoming config wins.
 *
 * Arrays REPLACE rather than concatenate: a generated config listing three
 * services must not inherit the baseline's leftover fourth service. Null and
 * undefined incoming values are skipped so a partial config cannot blank out a
 * field the template needs.
 */
export function deepMerge(base, incoming) {
  if (!incoming || typeof incoming !== 'object') return base
  for (const [key, value] of Object.entries(incoming)) {
    if (value === null || value === undefined) continue
    const current = base[key]
    if (
      typeof value === 'object' &&
      !Array.isArray(value) &&
      typeof current === 'object' &&
      current !== null &&
      !Array.isArray(current)
    ) {
      deepMerge(current, value)
    } else {
      base[key] = value
    }
  }
  return base
}

function hexToRgbTriplet(hex) {
  const match = /^#?([0-9a-f]{6})$/i.exec(String(hex).trim())
  if (!match) return null
  const v = match[1]
  return [
    parseInt(v.slice(0, 2), 16),
    parseInt(v.slice(2, 4), 16),
    parseInt(v.slice(4, 6), 16),
  ].join(' ')
}

function loadFont(url) {
  if (!url) return
  const existing = document.querySelector(`link[data-aipm-font="${url}"]`)
  if (existing) return
  const link = document.createElement('link')
  link.rel = 'stylesheet'
  link.href = url
  link.setAttribute('data-aipm-font', url)
  document.head.appendChild(link)
}

/**
 * Applies everything inject-theme.mjs would have baked in at build time.
 * Safe to call with the baseline config; it simply re-asserts current values.
 */
export function applyTheme(dna) {
  if (typeof document === 'undefined') return
  const root = document.documentElement

  // Photo set and wordmark for this client. Both must be set before the first
  // render, since components read the binding at render time, not every paint.
  setAssetBase(dna.assets && dna.assets.base)
  setLogo((dna.assets && dna.assets.logo) || makeWordmark(dna))

  for (const [key, value] of Object.entries(dna.palette || {})) {
    const triplet = hexToRgbTriplet(value)
    if (triplet) root.style.setProperty(`--${key.replace(/_/g, '-')}`, triplet)
  }

  const type = dna.typography || {}
  if (type.heading) root.style.setProperty('--font-heading', type.heading)
  if (type.body) root.style.setProperty('--font-body', type.body)
  loadFont(type.headingFontUrl)
  loadFont(type.bodyFontUrl)

  if (dna.theme_mode) root.setAttribute('data-theme-mode', dna.theme_mode)

  const meta = dna.meta || {}
  if (meta.title) document.title = meta.title
  if (meta.description) {
    let tag = document.querySelector('meta[name="description"]')
    if (!tag) {
      tag = document.createElement('meta')
      tag.setAttribute('name', 'description')
      document.head.appendChild(tag)
    }
    tag.setAttribute('content', meta.description)
  }
}

/**
 * States plainly that this is a draft, and what the full build adds.
 *
 * Deliberately says nothing about how fast it was made. Claiming it took a
 * minute destroys the price anchor before the proposal is even opened, invites
 * "so why am I paying for this", and throws away the reciprocity of having
 * clearly done work for them up front.
 *
 * It also sells the growth system rather than a website, because the website is
 * the part competitors can match.
 *
 * Only renders when the config was generated (`_generated` is present), so a
 * real client's site never carries it.
 */
/**
 * Tags the wrapper of every LARGE stock photo so the CSS badge can sit on it.
 *
 * Size is the whole reason this is JavaScript. A CSS-only rule matched every
 * image from the shared photo set, including the 40px chat avatar, and stamped
 * "Placeholder photo" across it. Anything under 140px wide is skipped.
 *
 * Re-runs on DOM changes because this is a single page app: navigating to
 * another page swaps the images out entirely.
 */
function markPlaceholderPhotos() {
  const MIN_WIDTH = 140
  // "Is this a full bleed hero" cannot be a fixed pixel width: 900 is right on a
  // desktop and wrong on a 390px phone, where the hero is only 390 across and
  // the badge went back over the enquiry form. Measure against the viewport.
  const heroWidth = () => Math.min(900, window.innerWidth * 0.9)
  const apply = () => {
    const large = heroWidth()
    document.querySelectorAll('img').forEach((img) => {
      const source = img.currentSrc || img.src || ''
      if (!source.includes('/trades/')) return
      const parent = img.parentElement
      if (!parent) return
      if (img.clientWidth && img.clientWidth < MIN_WIDTH) {
        parent.classList.remove('aipm-ph')
        return
      }
      if (img.clientWidth >= MIN_WIDTH) {
        parent.classList.add('aipm-ph')
        // A hero photo is full bleed with the headline, the bullets and the
        // enquiry form sitting on top of it, so a badge in the dead centre lands
        // across all three and the page reads as broken. Corner it instead.
        // Gallery cards have nothing on them, so centred is right there.
        parent.classList.toggle('aipm-ph-lg', img.clientWidth >= large)
      }
    })
  }
  apply()
  let queued = false
  const observer = new MutationObserver(() => {
    if (queued) return
    queued = true
    requestAnimationFrame(() => { queued = false; apply() })
  })
  observer.observe(document.body, { childList: true, subtree: true })
  window.addEventListener('resize', apply)
  // Images that arrive after first paint have zero width until they load.
  window.addEventListener('load', apply)
  setTimeout(apply, 1200)
}

function mountDemoBanner(dna) {
  if (!dna._generated || document.getElementById('aipm-demo-bar')) return

  const demo = dna._demo || {}
  const company = (dna.company && dna.company.shortName) || 'you'
  const bar = document.createElement('div')
  bar.id = 'aipm-demo-bar'
  bar.setAttribute('role', 'note')
  bar.innerHTML = `
    <div class="aipm-demo-inner">
      <div class="aipm-demo-head">
        <span class="aipm-demo-dot"></span>
        <span class="aipm-demo-tag">Draft preview</span>
      </div>
      <p class="aipm-demo-text">
        <strong>We built this for ${company}. What you are looking at is the shop window.</strong>
        <span class="aipm-demo-more"> The part that makes the money sits behind it: every
        enquiry hits your phone within seconds and gets chased by email, text and call
        until it turns into a booked job, and every job you finish turns into a Google
        review and a referral. Add your own photos and this is your whole growth system.</span>
      </p>
      ${demo.proposalUrl
        ? `<a class="aipm-demo-cta" href="${demo.proposalUrl}">See the full system &rsaquo;</a>`
        : ''}
    </div>
    <div class="aipm-demo-stripe"></div>`

  // Deliberately loud, and deliberately NOT in the site's design language. It
  // is sticky, full-bleed gold on black type, with a hazard stripe underneath,
  // so it reads as a notice laid over the page rather than a section of it.
  // A subtle bar gets mistaken for site furniture and the message is missed.
  // NOT position:sticky. The template sets `body{overflow-x:hidden}`, which makes
  // body a scroll container and silently stops sticky children from pinning to
  // the viewport. Fixed works regardless, and the body padding below compensates
  // for the space it no longer occupies in flow.
  //
  // Mobile stays static: the message wraps to ~170px there, and pinning that
  // over a 844px screen would bury the site it is meant to be introducing.
  const style = document.createElement('style')
  style.textContent = `
    #aipm-demo-bar{position:fixed;top:0;left:0;right:0;z-index:9999;
      background:#EAB308;color:#140F00;
      font-family:"Plus Jakarta Sans",-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;
      box-shadow:0 6px 26px rgba(0,0,0,.34)}
    body{padding-top:var(--aipm-demo-h,0px)}
    /* A real element rather than ::after. As a pseudo-element it was excluded
       from the bar's measured height, so the nav offset came out 7px short and
       the navigation sat tucked under the banner. */
    .aipm-demo-stripe{height:5px;background:repeating-linear-gradient(
      135deg,#140F00 0 11px,#EAB308 11px 22px);opacity:.85}
    .aipm-demo-inner{max-width:1520px;margin:0 auto;padding:13px 32px;display:flex;
      align-items:center;gap:18px;flex-wrap:wrap}
    .aipm-demo-head{display:flex;align-items:center;gap:9px;flex-shrink:0}
    .aipm-demo-dot{width:9px;height:9px;border-radius:50%;background:#140F00;
      animation:aipmPulse 1.6s ease-in-out infinite}
    @keyframes aipmPulse{0%,100%{opacity:.28}50%{opacity:1}}
    .aipm-demo-tag{font-weight:800;font-size:12px;letter-spacing:.19em;
      text-transform:uppercase;white-space:nowrap}
    .aipm-demo-text{margin:0;font-size:14px;line-height:1.5;flex:1 1 340px;
      color:rgba(20,15,0,.82)}
    .aipm-demo-text strong{font-weight:800;color:#140F00}
    .aipm-demo-cta{background:#140F00;color:#EAB308;font-size:13.5px;font-weight:800;
      text-decoration:none;white-space:nowrap;padding:11px 20px;border-radius:999px;
      flex-shrink:0;transition:transform .18s ease}
    .aipm-demo-cta:hover{transform:translateY(-1px)}
    @media(max-width:760px){
      .aipm-demo-inner{padding:10px 16px;gap:8px}
      .aipm-demo-text{font-size:12.5px;flex-basis:100%;order:3;line-height:1.4}
      .aipm-demo-cta{order:2;margin-left:auto;padding:8px 14px;font-size:12px}
      /* The full explanation runs to ~170px on a phone, which would pin a third
         of the screen permanently. The headline sentence carries the message,
         and the proposal link carries the detail. */
      .aipm-demo-more{display:none}
    }
    @media(prefers-reduced-motion:reduce){.aipm-demo-dot{animation:none;opacity:1}}

    /* Placeholder photo marking.
       The photos are a stock set chosen to suit the trade, not this business's
       own work. Left unmarked, an owner assumes we put pictures of somebody
       else's jobs on their site, which reads as careless. Marked, it becomes an
       obvious thing we swap for their real photos.

       The class is applied by JS rather than a :has() selector because the
       badge has to skip small images. A pure CSS rule stamped the label across
       the 40px chat avatar. */
    .aipm-ph{position:relative}
    .aipm-ph::after{
      content:"Placeholder photo\\A Your real photos get curated around your business";
      white-space:pre-line;text-align:center;
      position:absolute;left:50%;top:50%;transform:translate(-50%,-50%) rotate(-6deg);
      background:rgba(20,15,0,.74);color:#EAB308;font-family:"Plus Jakarta Sans",
        -apple-system,BlinkMacSystemFont,sans-serif;font-weight:800;font-size:19px;
      letter-spacing:.1em;text-transform:uppercase;line-height:1.9;
      padding:14px 26px;border:2px solid rgba(234,179,8,.62);border-radius:9px;
      pointer-events:none;z-index:3;max-width:88%;
      box-shadow:0 10px 34px rgba(0,0,0,.4)}
    /* Hero badge sits low on the right: the left is where the headline, the
       bullets and the review chip live, and they run to different depths from
       one business to the next. The 92px lift keeps it off the chat widget
       pinned to the bottom right of the viewport. */
    .aipm-ph-lg::after{
      left:auto;right:26px;bottom:92px;top:auto;
      transform:rotate(-3deg);transform-origin:right bottom;
      font-size:14px;letter-spacing:.08em;line-height:1.7;padding:11px 18px;
      max-width:min(430px,54%)}
    @media(max-width:760px){
      .aipm-ph::after{font-size:14px;padding:11px 16px;letter-spacing:.07em;line-height:1.8}
      .aipm-ph-lg::after{left:16px;right:16px;bottom:16px;font-size:12px;padding:9px 13px;max-width:none}
    }
    @media(max-width:420px){
      .aipm-ph::after{font-size:11.5px;padding:9px 12px}
    }`

  document.head.appendChild(style)
  document.body.insertBefore(bar, document.body.firstChild)

  // The template's real navbar is a `position:fixed; top:0` <nav> inside a
  // zero-height <header> wrapper, so it lands underneath this banner and is
  // hidden completely. Push the NAV itself down by the banner height. Targeting
  // the header wrapper does nothing, because the wrapper is not what is pinned.
  // Remeasured on resize since the banner text wraps to two lines when narrow.
  // offsetHeight, not getBoundingClientRect().height: the rect excluded the
  // ::after hazard stripe and reported 66px against a real 73px box, leaving the
  // navigation tucked 7px underneath the banner.
  const offsetNav = () => {
    document.documentElement.style.setProperty('--aipm-demo-h', `${bar.offsetHeight}px`)
  }
  const navStyle = document.createElement('style')
  navStyle.textContent =
    `header nav.fixed,header > nav{top:var(--aipm-demo-h,0px)!important}`
  document.head.appendChild(navStyle)
  markPlaceholderPhotos()

  offsetNav()
  window.addEventListener('resize', offsetNav)
  // Fonts landing late change the wrap, so remeasure once they are ready.
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(offsetNav)
  // A one-off measurement is taken before the hazard stripe and web font have
  // settled, which left the nav 7px too high and clipped by the banner. Watch
  // the element instead so the offset always matches its real height.
  if (typeof ResizeObserver === 'function') new ResizeObserver(offsetNav).observe(bar)
}

/**
 * Two sources, in order.
 *
 * 1. The live store, which is where anything built by the CRM button lands.
 *    A site created ten seconds ago is readable immediately, with no rebuild
 *    and no deploy.
 * 2. A static file in this bundle, which covers the demo sites baked in at
 *    build time and works even if the store is unreachable.
 *
 * Read access to the store is public and read-only by policy, so the key below
 * is safe in a browser bundle: it can select rows and nothing else.
 */
const STORE_URL = 'https://YOUR_SUPABASE_PROJECT_REF.supabase.co'
const STORE_KEY =
  (typeof window !== 'undefined' && window.__AIPM_STORE_KEY__) || ''

async function fetchConfig(slug) {
  if (STORE_KEY) {
    try {
      const response = await fetch(
        `${STORE_URL}/rest/v1/sites?slug=eq.${encodeURIComponent(slug)}&select=config`,
        {
          headers: { apikey: STORE_KEY, Authorization: `Bearer ${STORE_KEY}` },
          cache: 'no-store',
        }
      )
      if (response.ok) {
        const rows = await response.json()
        if (rows && rows.length && rows[0].config) return rows[0].config
      }
    } catch {
      // Fall through to the bundled file rather than failing the page.
    }
  }
  const response = await fetch(`${CONFIG_BASE}/${encodeURIComponent(slug)}.json`, {
    cache: 'no-store',
  })
  if (!response.ok) return null
  return response.json()
}

/**
 * Fetches and applies the client config. Always resolves: a missing or broken
 * config falls back to the baseline site rather than rendering nothing, because
 * a stale demo beats a white screen in front of an audience.
 */
export async function loadSiteConfig() {
  const slug = resolveSlug()
  if (!slug) {
    applyTheme(brandDNA)
    return { slug: null, source: 'baseline' }
  }

  try {
    const config = await fetchConfig(slug)
    if (!config) throw new Error('no config found for this slug')
    deepMerge(brandDNA, config)
    applyTheme(brandDNA)
    mountDemoBanner(brandDNA)
    return { slug, source: 'generated' }
  } catch (error) {
    console.warn(
      `[site-loader] no config for "${slug}", showing baseline site:`,
      error.message
    )
    applyTheme(brandDNA)
    return { slug, source: 'fallback', error: error.message }
  }
}
