import { Link } from 'react-router-dom';
import Services from '../components/Services';
import SpecialOffers from '../components/SpecialOffers';
import CTABanner from '../components/CTABanner';
import Ticker from '../components/Ticker';
import CornerOverlay from '../components/CornerOverlay';
import { brandDNA } from '../config/brand-dna';

// All page copy is sourced from `brandDNA.pages.services`. The expected shape:
//   brandDNA.pages.services = {
//     label,    // hero eyebrow (falls back to brandDNA.copy.services.label)
//     heading,  // hero H1 (falls back to brandDNA.copy.services.heading)
//     intro,    // hero intro paragraph (falls back to brandDNA.copy.services.body)
//     list: [{ slug, title, subtitle, body, features: [], image, imgAlt }],
//   }
// Each featured item's `image` should be a path the project ships (typically a
// brandDNA.previous_projects[*].image). If missing, no image renders.
// TODO (Stage 10.1): populate `brandDNA.pages.services.list` from client data
// so the placeholder copy below disappears in the merged output.
const servicesPage = (brandDNA.pages && brandDNA.pages.services) || {};
const heroImage = (brandDNA.previous_projects && brandDNA.previous_projects[0] && brandDNA.previous_projects[0].image) || null;
const heroImageAlt = (brandDNA.previous_projects && brandDNA.previous_projects[0] && brandDNA.previous_projects[0].imgAlt) || `${(brandDNA.company && brandDNA.company.name) || ''} Services`;

const heroLabel = servicesPage.label || (brandDNA.copy && brandDNA.copy.services && brandDNA.copy.services.label) || 'SERVICES';
const heroHeading = servicesPage.heading || (brandDNA.copy && brandDNA.copy.services && brandDNA.copy.services.heading) || 'OUR SERVICES';
const heroIntro = servicesPage.intro || (brandDNA.copy && brandDNA.copy.services && brandDNA.copy.services.body) || 'Service overview goes here.';

const featured = Array.isArray(servicesPage.list) ? servicesPage.list : [];

export default function ServicesPage() {
  return (
    <>
      {/* Page Hero */}
      <section className="relative overflow-hidden flex flex-col justify-end bg-navy theme-keep-dark" style={{ minHeight: '52vh' }}>
        <div className="absolute inset-0 w-full h-full" style={{ zIndex: 1 }}>
          {heroImage && (
            <img
              src={heroImage}
              alt={heroImageAlt}
              className="w-full h-full object-cover"
              style={{ objectPosition: '50% 40%' }}
            />
          )}
          <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, rgba(15,23,42,0.55) 0%, rgba(15,23,42,0.88) 100%)' }} />
        </div>
        <div className="relative px-8 py-14 max-w-7xl mx-auto w-full" style={{ zIndex: 5 }}>
          <div className="flex items-center gap-2 text-cool text-xs font-semibold uppercase tracking-widest mb-4">
            <Link to="/" className="hover:text-white transition-colors">Home</Link>
            <span className="text-gold">›</span>
            <span className="text-white">Services</span>
          </div>
          <p className="text-gold font-body font-semibold text-xs uppercase tracking-[0.2em] mb-3">{heroLabel}</p>
          <h1 className="font-heading font-bold text-white uppercase leading-none text-5xl lg:text-6xl mb-4">
            {heroHeading}
          </h1>
          <span className="line-gold block w-16 mb-4" />
          <p className="text-white text-sm max-w-xl leading-relaxed font-body" style={{ textShadow: '0 1px 2px rgba(15, 23, 42, 0.6)' }}>
            {heroIntro}
          </p>
        </div>
      </section>

      {/* Service Cards Grid */}
      <Services />

      {/* Featured Services. Alternating bg-navy / bg-navy-slate so the
          light-theme override flips both surfaces to white / off-white. The
          inline-style hardcoded backgrounds bypassed the class override and
          left this whole page navy in light mode. */}
      {featured.map((s, i) => {
        const imgRight = i % 2 === 1;
        const features = Array.isArray(s.features) ? s.features : [];
        return (
          <section
            key={s.slug || i}
            className={`relative overflow-hidden ${i % 2 === 0 ? 'bg-navy' : 'bg-navy-slate'}`}
          >
            {/* Rule 58: per-client corner overlays. */}
            <CornerOverlay position={i % 2 === 0 ? 'bottom-right' : 'top-left'} size={320} />

            <div className="relative grid grid-cols-1 lg:grid-cols-2">
              {/* Image left */}
              {!imgRight && s.image && (
                <div className="hidden lg:block relative overflow-hidden" style={{ minHeight: 480 }}>
                  <img
                    src={s.image}
                    alt={s.imgAlt || s.title || ''}
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                </div>
              )}

              {/* Text */}
              <div className="px-8 lg:px-14 py-14 flex flex-col justify-center">
                {s.subtitle && (
                  <p className="text-gold font-body font-semibold text-xs uppercase tracking-[0.2em] mb-3">{s.subtitle}</p>
                )}
                <h2 className="font-heading font-bold text-white uppercase text-4xl leading-tight mb-4">
                  {s.title || 'Service title goes here'}
                </h2>
                <span className="line-gold block w-12 mb-5" />
                <p className="text-cool text-sm leading-relaxed mb-5 max-w-md">
                  {s.body || 'Service description goes here.'}
                </p>
                {features.length > 0 && (
                  <ul className="flex flex-col gap-2 mb-6">
                    {features.map((b) => (
                      <li key={b} className="flex items-start gap-2.5 text-sm text-cool">
                        <div className="w-4 h-4 flex items-center justify-center flex-shrink-0 mt-0.5 bg-navy-slate" style={{ border: '1px solid rgba(100,116,139,0.5)' }}>
                          <svg className="w-2.5 h-2.5 text-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                        {b}
                      </li>
                    ))}
                  </ul>
                )}
                <div className="flex flex-wrap gap-3">
                  {s.slug && (
                    <Link
                      to={`/services/${s.slug}`}
                      className="btn-gold font-heading font-bold text-sm uppercase px-6 py-3 tracking-widest text-navy"
                    >
                      LEARN MORE →
                    </Link>
                  )}
                  <Link
                    to="/contact"
                    className="btn-outline font-heading font-bold text-sm uppercase px-6 py-3 tracking-wider"
                  >
                    {(brandDNA.copy && brandDNA.copy.buttonText) || 'GET STARTED'}
                  </Link>
                </div>
              </div>

              {/* Image right */}
              {imgRight && s.image && (
                <div className="hidden lg:block relative overflow-hidden" style={{ minHeight: 480 }}>
                  <img
                    src={s.image}
                    alt={s.imgAlt || s.title || ''}
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                </div>
              )}

              {/* Mobile image */}
              {s.image && (
                <div className="lg:hidden relative h-56 overflow-hidden">
                  <img
                    src={s.image}
                    alt={s.imgAlt || s.title || ''}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
            </div>
          </section>
        );
      })}

      <Ticker />
      <SpecialOffers />
      <CTABanner />
    </>
  );
}
