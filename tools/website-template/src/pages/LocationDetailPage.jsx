import { useParams, Link, Navigate } from 'react-router-dom';
import CTABanner from '../components/CTABanner';
import Ticker from '../components/Ticker';
import { brandDNA } from '../config/brand-dna';

// Render a copy-deck markdown body. Splits on double-newlines and detects:
//  - "## " H2 headings    -> styled section heading
//  - "- " bullet items    -> grouped bulleted list
//  - "**...**" bold spans -> inline gold callout
//  - everything else      -> paragraph
function MarkdownBody({ body }) {
  if (!body) return null;
  const blocks = body.trim().split(/\n\s*\n/);
  return (
    <div className="prose-location max-w-none">
      {blocks.map((block, i) => {
        const trimmed = block.trim();
        if (trimmed.startsWith('## ')) {
          return (
            <h2 key={i} className="font-heading font-bold text-white uppercase text-2xl mt-10 mb-4 leading-tight">
              {trimmed.replace(/^##\s+/, '').replace(/\*([^*]+)\*/g, '$1')}
            </h2>
          );
        }
        if (trimmed.startsWith('- ')) {
          const items = trimmed.split(/\n- /).map((s) => s.replace(/^- /, '').trim()).filter(Boolean);
          return (
            <ul key={i} className="flex flex-col gap-2 mb-6">
              {items.map((item, j) => (
                <li key={j} className="flex items-start gap-3 text-cool text-sm leading-relaxed">
                  <div className="w-4 h-4 flex items-center justify-center flex-shrink-0 mt-1 bg-navy-slate" style={{ border: '1px solid rgb(var(--accent) / 0.5)' }}>
                    <svg className="w-2.5 h-2.5 text-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          );
        }
        return (
          <p key={i} className="text-cool text-sm leading-relaxed mb-5">
            {trimmed.split(/(\*[^*]+\*)/g).map((seg, k) =>
              seg.startsWith('*') && seg.endsWith('*')
                ? <em key={k} className="text-white font-semibold not-italic">{seg.slice(1, -1)}</em>
                : seg
            )}
          </p>
        );
      })}
    </div>
  );
}

export default function LocationDetailPage() {
  const { slug } = useParams();
  const pages = brandDNA.location_pages || [];
  const page = pages.find((p) => p.slug === slug);
  if (!page) return <Navigate to="/service-areas" replace />;

  const adjacent = (page.adjacent_cities || []).filter(Boolean);
  const ldCopy = (brandDNA.pages && brandDNA.pages.locationDetail) || {};
  const eyebrow = page.eyebrow || ldCopy.eyebrow || '';
  const nearbyLabel = ldCopy.nearbyLabel || 'NEARBY AREAS WE SERVE';

  return (
    <>
      {/* Page Hero */}
      <section className="relative overflow-hidden flex flex-col justify-end bg-navy theme-keep-dark" style={{ minHeight: '50vh' }}>
        <div className="absolute inset-0 w-full h-full" style={{ zIndex: 1 }}>
          <img
            src="/hero-image.webp"
            alt={`${brandDNA.company.name} in ${page.city}`}
            className="w-full h-full object-cover"
            style={{ objectPosition: '50% 40%' }}
            onError={(e) => { e.target.style.display = 'none'; }}
          />
          <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, rgba(15,23,42,0.55) 0%, rgba(15,23,42,0.92) 100%)' }} />
        </div>
        <div className="relative px-8 py-14 max-w-7xl mx-auto w-full" style={{ zIndex: 5 }}>
          <div className="flex items-center gap-2 text-cool text-xs font-semibold uppercase tracking-widest mb-4">
            <Link to="/" className="hover:text-white transition-colors">Home</Link>
            <span className="text-gold">›</span>
            <Link to="/service-areas" className="hover:text-white transition-colors">Service Areas</Link>
            <span className="text-gold">›</span>
            <span className="text-white">{page.city}</span>
          </div>
          {eyebrow && (
            <p className="text-gold font-body font-semibold text-xs uppercase tracking-[0.2em] mb-3">
              {eyebrow}
            </p>
          )}
          <h1 className="font-heading font-bold text-white uppercase leading-none text-5xl lg:text-6xl mb-4">
            {page.headline || page.city.toUpperCase()}
          </h1>
          <span className="line-gold block w-16 mb-4" />
          {page.subheadline && (
            <p className="text-white text-sm max-w-2xl leading-relaxed font-body" style={{ textShadow: '0 1px 2px rgba(15, 23, 42, 0.6)' }}>{page.subheadline}</p>
          )}
          <div className="flex flex-wrap gap-3 mt-6">
            <Link to="/contact" className="btn-gold font-heading font-bold text-sm uppercase px-6 py-3 tracking-widest text-navy">
              {brandDNA.copy.buttonText}
            </Link>
            <a href={`tel:${brandDNA.contact.phoneTelLink}`} className="btn-outline font-heading font-bold text-sm uppercase px-6 py-3 tracking-wider">
              CALL {brandDNA.contact.phone}
            </a>
          </div>
        </div>
      </section>

      {/* Body content */}
      <section className="relative py-16 bg-grid bg-navy">
        <div className="max-w-4xl mx-auto px-8">
          <MarkdownBody body={page.body} />

          {adjacent.length > 0 && (
            <div className="mt-12 pt-8" style={{ borderTop: '1px solid rgba(100,116,139,0.2)' }}>
              <p className="text-gold font-body font-semibold text-xs uppercase tracking-[0.2em] mb-4">
                {nearbyLabel}
              </p>
              <div className="flex flex-wrap gap-3">
                {adjacent.map((city) => {
                  const citySlug = city.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
                  return (
                    <Link
                      key={city}
                      to={`/service-area/${citySlug}`}
                      className="font-heading font-bold text-white text-xs uppercase tracking-wider px-4 py-2 transition-colors hover:text-gold"
                      style={{ background: 'rgba(15,23,42,0.55)', border: '1px solid rgb(var(--accent) / 0.3)' }}
                    >
                      {city}
                    </Link>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </section>

      <Ticker />
      <CTABanner />
    </>
  );
}
