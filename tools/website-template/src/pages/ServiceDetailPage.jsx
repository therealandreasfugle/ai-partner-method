import { useParams, Link, Navigate } from 'react-router-dom';
import CTABanner from '../components/CTABanner';
import Ticker from '../components/Ticker';
import FAQAccordion from '../components/FAQAccordion';
import CornerOverlay from '../components/CornerOverlay';
import { brandDNA } from '../config/brand-dna';

// Per-service rich detail (heroTitle / subtitle / description / image / benefits /
// included / process / faq / related) lives in brandDNA.services[i]. The optional
// fields below render only when populated. Per-client builds can ship services
// with only the base { slug, name, blurb } and the page degrades gracefully.
const serviceNames = brandDNA.services.reduce((acc, s) => {
  acc[s.slug] = s.name.split(' ').map((w) => w.charAt(0) + w.slice(1).toLowerCase()).join(' ');
  return acc;
}, {});

export default function ServiceDetailPage() {
  const { slug } = useParams();

  const found = brandDNA.services.find((s) => s.slug === slug);
  if (!found) return <Navigate to="/services" replace />;
  // Service shape: base { slug, name, blurb } + optional rich fields.
  // Page degrades gracefully when a per-client service ships base-only.
  const service = {
    title: found.name.split(' ').map((w) => w.charAt(0) + w.slice(1).toLowerCase()).join(' '),
    heroTitle: found.heroTitle || found.name,
    subtitle: found.subtitle || '',
    description: found.description || found.blurb || '',
    image: found.image || `/work/${(brandDNA.previous_projects && brandDNA.previous_projects[0] && brandDNA.previous_projects[0].filename) || 'project1.webp'}`,
    benefits: found.benefits || [],
    included: found.included || [],
    process: found.process || [],
    faq: found.faq || [],
    related: found.related || [],
    body: found.body || '',
  };

  // Render Stage 6 copy-deck body into the page. Recognises:
  //   - <!-- SUBSERVICE_START: Title --> ... <!-- SUBSERVICE_END --> markers
  //     wrap each enclosed range in a visually-distinct sub-service zone
  //     (gold rule above, eyebrow label, larger heading) so an umbrella
  //     service page reads as zones, not one stacked stream.
  //   - ## headings, - bulleted lists, *emphasis* spans, **bold** runs.
  //   - Defensively SKIPS any h2 whose text matches faq / frequently asked /
  //     common questions / service faq. Even if the parser missed stripping
  //     the FAQ block, the renderer drops the heading so the FAQAccordion
  //     below remains the single source of truth.
  const FAQ_HEADING_RE = /^(faq|frequently asked questions?|common questions?|service faq)\s*$/i;
  const SUB_START_RE = /^<!--\s*SUBSERVICE_START:\s*(.+?)\s*-->$/;
  const SUB_END_RE = /^<!--\s*SUBSERVICE_END\s*-->$/;

  const renderBlock = (block, key) => {
    const t = block.trim();
    if (!t) return null;
    if (t.startsWith('## ')) {
      const heading = t.replace(/^##\s+/, '').replace(/\*([^*]+)\*/g, '$1').trim();
      if (FAQ_HEADING_RE.test(heading)) return null;
      return (
        <h2 key={key} className="font-heading font-bold text-white uppercase text-2xl mt-10 mb-4 leading-tight">
          {heading}
        </h2>
      );
    }
    if (t.startsWith('- ')) {
      const items = t.split(/\n- /).map((s) => s.replace(/^- /, '').trim()).filter(Boolean);
      return (
        <ul key={key} className="flex flex-col gap-2 mb-6">
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
    // Paragraph: support both *italic* emphasis and **bold** runs.
    const parts = t.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g).filter(Boolean);
    return (
      <p key={key} className="text-cool text-sm leading-relaxed mb-5">
        {parts.map((seg, k) => {
          if (seg.startsWith('**') && seg.endsWith('**')) {
            return <strong key={k} className="text-white font-semibold">{seg.slice(2, -2)}</strong>;
          }
          if (seg.startsWith('*') && seg.endsWith('*')) {
            return <em key={k} className="text-white font-semibold not-italic">{seg.slice(1, -1)}</em>;
          }
          return seg;
        })}
      </p>
    );
  };

  const renderBody = () => {
    if (!service.body) return null;
    const rawBlocks = service.body.trim().split(/\n\s*\n/);
    // Walk blocks once, grouping any range between SUBSERVICE_START and
    // SUBSERVICE_END into a single styled sub-service zone.
    const out = [];
    let i = 0;
    let zoneIdx = 0;
    while (i < rawBlocks.length) {
      const t = rawBlocks[i].trim();
      const startMatch = t.match(SUB_START_RE);
      if (startMatch) {
        const title = startMatch[1];
        const inner = [];
        i += 1;
        while (i < rawBlocks.length && !SUB_END_RE.test(rawBlocks[i].trim())) {
          inner.push(renderBlock(rawBlocks[i], `sub-${zoneIdx}-${i}`));
          i += 1;
        }
        // Skip the END marker if found
        if (i < rawBlocks.length) i += 1;
        out.push(
          <div
            key={`zone-${zoneIdx}`}
            className="mt-12 pt-10"
            style={{ borderTop: '1px solid rgb(var(--accent) / 0.3)' }}
          >
            <p className="text-gold font-body font-semibold text-xs uppercase tracking-[0.2em] mb-3">SUB-SERVICE</p>
            <h2 className="font-heading font-bold text-white uppercase text-3xl mb-6 leading-tight">
              {title}
            </h2>
            {inner}
          </div>
        );
        zoneIdx += 1;
        continue;
      }
      // Defensively swallow stray END markers
      if (SUB_END_RE.test(t)) { i += 1; continue; }
      out.push(renderBlock(rawBlocks[i], `b-${i}`));
      i += 1;
    }
    return (
      <section className="relative py-16 bg-grid bg-navy">
        <div className="max-w-4xl mx-auto px-8">
          {out}
        </div>
      </section>
    );
  };

  return (
    <>
      {/* Page Hero */}
      <section className="relative overflow-hidden flex flex-col justify-end bg-navy theme-keep-dark" style={{ minHeight: '52vh' }}>
        <div className="absolute inset-0 w-full h-full" style={{ zIndex: 1 }}>
          <img
            src="/hero-image.webp"
            alt={service.title}
            className="w-full h-full object-cover"
            style={{ objectPosition: '50% 40%' }}
            onError={(e) => { e.target.src = '/work/project1.webp'; }}
          />
          <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, rgba(15,23,42,0.55) 0%, rgba(15,23,42,0.92) 100%)' }} />
        </div>
        <div className="relative px-8 py-14 max-w-7xl mx-auto w-full" style={{ zIndex: 5 }}>
          <div className="flex items-center gap-2 text-cool text-xs font-semibold uppercase tracking-widest mb-4">
            <Link to="/" className="hover:text-white transition-colors">Home</Link>
            <span className="text-gold">›</span>
            <Link to="/services" className="hover:text-white transition-colors">Services</Link>
            <span className="text-gold">›</span>
            <span className="text-white">{service.title}</span>
          </div>
          <p className="text-gold font-body font-semibold text-xs uppercase tracking-[0.2em] mb-3">{service.subtitle}</p>
          <h1 className="font-heading font-bold text-white uppercase leading-none text-5xl lg:text-6xl mb-4">
            {service.heroTitle}
          </h1>
          <span className="line-gold block w-16 mb-4" />
          <p className="text-white text-sm max-w-xl leading-relaxed font-body" style={{ textShadow: '0 1px 2px rgba(15, 23, 42, 0.6)' }}>{service.description}</p>
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

      {/* Rich body from copy-deck (Stage 6) */}
      {renderBody()}

      {/* Benefits + Included */}
      {(service.benefits.length > 0 || service.included.length > 0) && (
      <section className="relative py-16 bg-grid bg-navy">
        <div className="max-w-7xl mx-auto px-8 grid grid-cols-1 lg:grid-cols-2 gap-10">
          {/* Key benefits */}
          <div>
            <p className="text-gold font-body font-semibold text-xs uppercase tracking-[0.2em] mb-3">WHY {brandDNA.company.shortName.toUpperCase()}</p>
            <h2 className="font-heading font-bold text-white uppercase text-3xl leading-tight mb-6">
              WHY {brandDNA.company.shortName.toUpperCase()} FOR<br />{service.title.toUpperCase()}
            </h2>
            <div className="flex flex-col gap-4">
              {service.benefits.map((b, i) => (
                <div key={i} className="card-elevated-dark flex items-start gap-4 p-4 bg-navy-slate" style={{ border: '1px solid rgba(100,116,139,0.25)' }}>
                  <div className="w-8 h-8 flex items-center justify-center flex-shrink-0 font-heading font-bold text-sm text-navy" style={{ background: 'linear-gradient(135deg, rgb(var(--accent-light)) 0%, rgb(var(--accent)) 40%, rgb(var(--accent-dark)) 65%, rgb(var(--accent-light)) 100%)' }}>
                    {i + 1}
                  </div>
                  <p className="text-cool text-sm leading-relaxed pt-1">{b}</p>
                </div>
              ))}
            </div>
          </div>

          {/* What's included */}
          <div>
            <p className="text-gold font-body font-semibold text-xs uppercase tracking-[0.2em] mb-3">SCOPE OF WORK</p>
            <h2 className="font-heading font-bold text-white uppercase text-3xl leading-tight mb-6">
              WHAT'S INCLUDED
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {service.included.map((item, i) => (
                <div key={i} className="card-elevated-dark flex items-start gap-3 p-4 bg-navy-slate" style={{ border: '1px solid rgba(100,116,139,0.25)' }}>
                  <div className="w-4 h-4 flex items-center justify-center flex-shrink-0 mt-0.5" style={{ background: 'rgb(var(--accent) / 0.15)', border: '1px solid rgb(var(--accent) / 0.3)' }}>
                    <svg className="w-2.5 h-2.5 text-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className="text-cool text-sm leading-snug">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
      )}

      {/* Process */}
      {service.process.length > 0 && (
      <section className="relative overflow-hidden py-20 bg-grid bg-navy-slate">
        {/* Rule 58: per-client corner overlays. */}
        <CornerOverlay position="top-left" size={320} />
        <CornerOverlay position="bottom-right" size={320} />

        <div className="relative max-w-5xl mx-auto px-8">
          <div className="text-center mb-12">
            <p className="text-gold font-body font-semibold text-xs uppercase tracking-[0.2em] mb-3">THE PROCESS</p>
            <h2 className="font-heading font-bold text-white uppercase text-5xl leading-tight mb-3">
              HOW IT WORKS
            </h2>
            <span className="line-gold block w-12 mx-auto mt-3 mb-4" />
            <p className="text-cool text-sm max-w-lg mx-auto">Simple, transparent, owner-managed from the first call to the final handshake.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {service.process.map((step) => (
              <div key={step.num} className="card-elevated-dark flex flex-col gap-3 p-5 bg-navy" style={{ border: '1px solid rgba(100,116,139,0.25)' }}>
                <div className="w-10 h-10 flex items-center justify-center font-heading font-bold text-sm text-navy" style={{ background: 'linear-gradient(135deg, rgb(var(--accent-light)) 0%, rgb(var(--accent)) 40%, rgb(var(--accent-dark)) 65%, rgb(var(--accent-light)) 100%)' }}>
                  {step.num}
                </div>
                <div className="font-heading font-bold text-white uppercase text-base tracking-wide leading-tight">{step.title}</div>
                <p className="text-cool text-xs leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      )}

      {/* FAQ */}
      {service.faq.length > 0 && (
      <section className="relative py-16 bg-grid bg-navy">
        <div className="max-w-3xl mx-auto px-8">
          <p className="text-gold font-body font-semibold text-xs uppercase tracking-[0.2em] mb-3 text-center">{brandDNA.copy.faq.label}</p>
          <h2 className="font-heading font-bold text-white uppercase text-4xl leading-tight mb-2 text-center">
            COMMON QUESTIONS
          </h2>
          <span className="line-gold block w-12 mx-auto mt-3 mb-8" />
          <FAQAccordion items={service.faq} />
        </div>
      </section>
      )}

      <Ticker />

      {/* Related Services */}
      {service.related.length > 0 && (
      <section className="relative py-16 bg-navy-slate">
        <div className="max-w-5xl mx-auto px-8">
          <p className="text-gold font-body font-semibold text-xs uppercase tracking-[0.2em] mb-3 text-center">EXPLORE MORE</p>
          <h2 className="font-heading font-bold text-white uppercase text-3xl leading-tight mb-8 text-center">
            YOU MAY ALSO NEED
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {service.related.map((relSlug) => (
              <Link
                key={relSlug}
                to={`/services/${relSlug}`}
                className="group flex flex-col gap-2 p-6 transition-all bg-navy"
                style={{ border: '1px solid rgba(100,116,139,0.25)' }}
                onMouseEnter={(e) => e.currentTarget.style.borderColor = 'rgb(var(--accent))'}
                onMouseLeave={(e) => e.currentTarget.style.borderColor = 'rgba(100,116,139,0.25)'}
              >
                <div className="font-heading font-bold text-white uppercase group-hover:text-gold transition-colors">
                  {serviceNames[relSlug] || relSlug}
                </div>
                <div className="text-xs text-gold font-semibold mt-auto flex items-center gap-1">
                  Learn more
                  <svg className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
      )}

      <CTABanner />
    </>
  );
}
