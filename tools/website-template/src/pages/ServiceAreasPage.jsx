import { Link } from 'react-router-dom';
import CTABanner from '../components/CTABanner';
import Ticker from '../components/Ticker';
import CornerOverlay from '../components/CornerOverlay';
import { brandDNA } from '../config/brand-dna';

const saCopy = (brandDNA.pages && brandDNA.pages.serviceAreas) || {};

// Cities served. brandDNA.serviceAreas is a flat array of uppercase strings
// populated by Stage 10.1 from research / strategy data. We render them under
// a single heading and let the responsive grid handle visual hierarchy. No
// fake region grouping (the schema doesn't carry region metadata).
const cities = brandDNA.serviceAreas || [];

// Coverage highlights render from brandDNA.pages.serviceAreas.coverageHighlights[]
// when populated. Each entry expects { title, text, iconPath? }. We render a
// generic checkmark when no iconPath is supplied.
const coverageHighlights = saCopy.coverageHighlights || [];

const defaultHighlightIcon = (
  <svg className="w-6 h-6" style={{ color: '#0F172A' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
  </svg>
);

const renderHighlightIcon = (h) => {
  if (h && h.iconPath) {
    return (
      <svg className="w-6 h-6" style={{ color: '#0F172A' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={h.iconPath} />
      </svg>
    );
  }
  return defaultHighlightIcon;
};

export default function ServiceAreasPage() {
  return (
    <>
      {/* Page Hero */}
      <section className="relative overflow-hidden flex flex-col justify-end bg-navy theme-keep-dark" style={{ minHeight: '50vh' }}>
        <div className="absolute inset-0 w-full h-full" style={{ zIndex: 1 }}>
          <img
            src="/hero-image.webp"
            alt={`${brandDNA.address.city} service area`}
            className="w-full h-full object-cover"
            style={{ objectPosition: '50% 40%' }}
            onError={(e) => { e.target.style.display = 'none'; }}
          />
          <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, rgba(15,23,42,0.55) 0%, rgba(15,23,42,0.88) 100%)' }} />
        </div>
        <div className="relative px-8 py-14 max-w-7xl mx-auto w-full" style={{ zIndex: 5 }}>
          <div className="flex items-center gap-2 text-cool text-xs font-semibold uppercase tracking-widest mb-4">
            <Link to="/" className="hover:text-white transition-colors">Home</Link>
            <span className="text-gold">›</span>
            <span className="text-white">Service Areas</span>
          </div>
          <p className="text-gold font-body font-semibold text-xs uppercase tracking-[0.2em] mb-3">{brandDNA.copy.serviceAreas.label}</p>
          <h1 className="font-heading font-bold text-white uppercase leading-none text-5xl lg:text-6xl mb-4">
            {brandDNA.copy.serviceAreas.heading}
          </h1>
          <span className="line-gold block w-16 mb-4" />
          <p className="text-white text-sm max-w-xl leading-relaxed font-body" style={{ textShadow: '0 1px 2px rgba(15, 23, 42, 0.6)' }}>
            {brandDNA.copy.serviceAreas.body}
          </p>
        </div>
      </section>

      {/* Coverage Highlights */}
      {coverageHighlights.length > 0 && (
        <section className="py-12 bg-navy-slate" style={{ borderBottom: '1px solid rgba(100,116,139,0.2)' }}>
          <div className="max-w-5xl mx-auto px-8">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              {coverageHighlights.map((h) => (
                <div key={h.title} className="card-elevated-dark flex flex-col items-center text-center gap-3 p-6 bg-navy" style={{ border: '1px solid rgba(100,116,139,0.25)' }}>
                  <div className="w-12 h-12 flex items-center justify-center flex-shrink-0" style={{ background: 'linear-gradient(135deg, rgb(var(--accent-light)) 0%, rgb(var(--accent)) 40%, rgb(var(--accent-dark)) 65%, rgb(var(--accent-light)) 100%)' }}>
                    {renderHighlightIcon(h)}
                  </div>
                  <div className="font-heading font-bold text-white uppercase text-base">{h.title}</div>
                  <p className="text-cool text-xs leading-relaxed">{h.text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Map + Areas */}
      <section className="relative py-16 bg-grid bg-navy">
        <div className="max-w-7xl mx-auto px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">
            {/* Left */}
            <div>
              {saCopy.mapLabel && (
                <p className="text-gold font-body font-semibold text-xs uppercase tracking-[0.2em] mb-3">{saCopy.mapLabel}</p>
              )}
              {saCopy.mapHeading && (
                <h2 className="font-heading font-bold text-white uppercase text-4xl leading-tight mb-4">
                  {saCopy.mapHeading}
                </h2>
              )}
              <span className="line-gold block w-12 mb-5" />
              {saCopy.mapBody && (
                <p className="text-cool text-sm mb-8 leading-relaxed max-w-lg">
                  {saCopy.mapBody}
                </p>
              )}

              {/* Cities we serve, single grouped grid */}
              {saCopy.citiesHeading && (
                <div className="font-heading font-bold text-white uppercase text-sm tracking-wider mb-3 flex items-center gap-2">
                  <div className="w-1 h-4 flex-shrink-0 bg-gold" />
                  {saCopy.citiesHeading}
                </div>
              )}
              {cities.length > 0 ? (
                <ul className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-1.5">
                  {cities.map((city) => {
                    const citySlug = String(city).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
                    const hasPage = (brandDNA.location_pages || []).some((p) => p.slug === citySlug);
                    const inner = (
                      <>
                        <svg className="w-3 h-3 flex-shrink-0 text-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
                        </svg>
                        {city}
                      </>
                    );
                    return (
                      <li key={city} className="flex items-center gap-2 text-cool text-xs">
                        {hasPage ? (
                          <Link to={`/service-area/${citySlug}`} className="flex items-center gap-2 hover:text-gold transition-colors">
                            {inner}
                          </Link>
                        ) : inner}
                      </li>
                    );
                  })}
                </ul>
              ) : (
                saCopy.citiesEmpty && (
                  <p className="text-cool text-xs">
                    {saCopy.citiesEmpty}
                  </p>
                )
              )}

              {saCopy.citiesFallback && (
                <div className="mt-8 p-4" style={{ background: 'rgb(var(--accent) / 0.08)', border: '1px solid rgb(var(--accent) / 0.2)' }}>
                  <p className="text-xs text-cool font-semibold leading-relaxed">
                    {saCopy.citiesFallback}{' '}
                    <a href={`tel:${brandDNA.contact.phoneTelLink}`} className="text-gold hover:text-white transition-colors">{brandDNA.contact.phone}</a>
                  </p>
                </div>
              )}
            </div>

            {/* Right: map */}
            {brandDNA.contact.mapsEmbedUrl && (
              <div>
                <div className="overflow-hidden sticky top-24" style={{ boxShadow: '0 20px 60px rgba(0,0,0,0.45)', height: 500, border: '1px solid rgba(100,116,139,0.25)' }}>
                  <iframe
                    title={`${brandDNA.company.name} Service Area`}
                    src={brandDNA.contact.mapsEmbedUrl}
                    className="w-full h-full border-0"
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      <Ticker />

      {/* Ready to Start */}
      <section className="relative overflow-hidden py-16 bg-grid bg-navy-slate">
        {/* Rule 58: per-client corner overlays. */}
        <CornerOverlay position="top-left" size={320} />
        <CornerOverlay position="bottom-right" size={320} />
        <div className="relative max-w-3xl mx-auto px-8 text-center">
          {saCopy.readyLabel && (
            <p className="text-gold font-body font-semibold text-xs uppercase tracking-[0.2em] mb-3">{saCopy.readyLabel}</p>
          )}
          {saCopy.readyHeading && (
            <h2 className="font-heading font-bold text-white uppercase text-5xl leading-tight mb-4 whitespace-pre-line">
              {saCopy.readyHeading}
            </h2>
          )}
          <span className="line-gold block w-12 mx-auto mb-5" />
          {saCopy.readyBody && (
            <p className="text-cool text-sm leading-relaxed mb-8 max-w-lg mx-auto">
              {saCopy.readyBody}
            </p>
          )}
          <div className="flex flex-wrap gap-4 justify-center">
            <Link to="/contact" className="btn-gold font-heading font-bold text-base uppercase px-8 py-3.5 tracking-widest text-navy">
              {brandDNA.copy.buttonText}
            </Link>
            <a href={`tel:${brandDNA.contact.phoneTelLink}`} className="btn-outline font-heading font-bold text-base uppercase px-8 py-3.5 tracking-wider">
              CALL {brandDNA.contact.phone}
            </a>
          </div>
        </div>
      </section>

      <CTABanner />
    </>
  );
}
