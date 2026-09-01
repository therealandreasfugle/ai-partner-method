import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { brandDNA } from './config/brand-dna'

// GA4: loads only when the client's Measurement ID is set in brand-dna.js, so
// unconfigured builds ship zero third-party requests.
const ga4 = brandDNA.analytics && brandDNA.analytics.ga4MeasurementId
if (ga4) {
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

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
