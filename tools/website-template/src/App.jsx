import './index.css'
import { useEffect } from 'react'
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import Layout from './components/Layout'
import HomePage from './pages/HomePage'
import AboutPage from './pages/AboutPage'
import ServicesPage from './pages/ServicesPage'
import ServiceDetailPage from './pages/ServiceDetailPage'
import GalleryPage from './pages/GalleryPage'
import ServiceAreasPage from './pages/ServiceAreasPage'
import LocationDetailPage from './pages/LocationDetailPage'
import BlogPage from './pages/BlogPage'
import BlogPostPage from './pages/BlogPostPage'
import FinancingPage from './pages/FinancingPage'
import ContactPage from './pages/ContactPage'
import ThankYouPage from './pages/ThankYouPage'

/**
 * ScrollToHash — fires on initial mount AND on every route/hash change.
 * Without this, an inbound URL like https://site.com/#about silently lands
 * at the top of the homepage instead of the Founder section, because React
 * Router doesn't auto-scroll to hash anchors on initial load.
 *
 * Behaviour:
 *   - URL has hash: requestAnimationFrame -> scroll smoothly to #id
 *   - URL has no hash, route changed: jump to top (instant, not smooth)
 *
 * Lesson 09-build Rule 50.
 */
function ScrollToHash() {
  const { pathname, hash } = useLocation();
  useEffect(() => {
    if (!hash) {
      window.scrollTo({ top: 0, behavior: 'auto' });
      return;
    }
    const id = hash.slice(1);
    // Wait one frame so React has rendered the matching DOM element
    requestAnimationFrame(() => {
      const el = document.getElementById(id);
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }, [pathname, hash]);
  return null;
}

export default function App() {
  return (
    <BrowserRouter>
      <ScrollToHash />
      <Layout>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/services" element={<ServicesPage />} />
          <Route path="/services/:slug" element={<ServiceDetailPage />} />
          <Route path="/gallery" element={<GalleryPage />} />
          <Route path="/service-areas" element={<ServiceAreasPage />} />
          <Route path="/service-area/:slug" element={<LocationDetailPage />} />
          <Route path="/blog" element={<BlogPage />} />
          <Route path="/blog/:slug" element={<BlogPostPage />} />
          <Route path="/financing" element={<FinancingPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/thank-you" element={<ThankYouPage />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  )
}
