import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { brandDNA } from './config/brand-dna'
import { loadSiteConfig } from './config/site-loader'

// App is imported dynamically further down, and that is load-bearing.
//
// Several components read config at MODULE scope rather than inside their
// render function, e.g. Ticker.jsx builds its marquee items and Footer.jsx
// builds its service links as top-level consts. Those run once, when the module
// is first imported. A static `import App from './App.jsx'` here would evaluate
// the whole component tree before the awaited config had landed, so those
// constants would capture the baseline client's values and a plumber's site
// would ship a roofing ticker and roofing footer links.
//
// Importing App only after loadSiteConfig() resolves guarantees every module
// initialises against the hydrated config.

// GA4: loads only when the client's Measurement ID is set, so unconfigured
// builds ship zero third-party requests. Runs after the client config is
// merged, because the measurement ID can arrive with that config.
function startAnalytics() {
  const ga4 = brandDNA.analytics && brandDNA.analytics.ga4MeasurementId
  if (!ga4) return
  const s = document.createElement('script')
  s.async = true
  s.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(ga4)}`
  document.head.appendChild(s)
  window.dataLayer = window.dataLayer || []
  function gtag() { window.dataLayer.push(arguments) }
  window.gtag = gtag
  gtag('js', new Date())
  gtag('config', ga4)
}

// EMBED MODE. The proposal shows this site inside an iframe that is rendered at
// 1440px and scaled down with a CSS transform. Anything that repaints inside
// that iframe forces the browser to re-rasterise the whole scaled layer, and we
// have three things doing it forever: the nav CTA's infinite entice and sheen
// animations, the chat bubble's infinite pulse ring, and backdrop blurs on the
// navbar, hero, form and CTA band. Together they made the proposal page stutter
// while scrolling, which was reported.
//
// The site is on a different origin from the proposal, so the parent cannot
// reach in and stop them. Instead the proposal asks for embed=1 and we mark the
// document, then index.css switches those effects off. Nothing is hidden and no
// layout moves: the same page renders, it just stops repainting every frame.
// Opening the site full size has no flag, so a real visitor still gets the lot.
function markEmbedded() {
  try {
    const params = new URLSearchParams(window.location.search)
    if (params.get('embed') === '1') document.documentElement.classList.add('is-embedded')
  } catch {
    // A malformed query string is not worth failing a page render over.
  }
}

// The client config MUST land before the first render: every component reads
// brandDNA at render time, so mounting first would paint the baseline site and
// then visibly repaint into the client's. loadSiteConfig never rejects.
markEmbedded()
loadSiteConfig().then(async (result) => {
  window.__AIPM_SITE__ = result
  startAnalytics()
  const { default: App } = await import('./App.jsx')
  createRoot(document.getElementById('root')).render(
    <StrictMode>
      <App />
    </StrictMode>,
  )
})
