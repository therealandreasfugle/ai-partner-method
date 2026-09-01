import { brandDNA } from '../config/brand-dna';
import FAQAccordion from './FAQAccordion';
import CornerOverlay from './CornerOverlay';

export default function FAQ() {
  return (
    <section className="relative py-20 overflow-hidden bg-grid bg-navy">

      {/* Gold top line */}
      <div className="absolute top-0 left-0 right-0 line-gold" />

      {/* Rule 58: per-client corner overlays. */}
      <CornerOverlay position="top-left" size={320} />
      <CornerOverlay position="bottom-right" size={320} />

      <div className="relative max-w-3xl mx-auto px-8">

        {/* Logo + accent lines */}
        <div className="flex items-center justify-center gap-4 mb-8">
          <div className="flex-1 h-px" style={{ background: 'rgb(var(--accent) / 0.35)' }} />
          <div className="px-4 py-2 bg-navy-slate" style={{ border: '1px solid rgb(var(--accent) / 0.2)' }}>
            <img src="/logo.webp" alt={brandDNA.company.name} className="w-28 h-auto" onError={(e) => { const el = e.target; el.onerror = () => { el.onerror = null; el.style.display = 'none'; }; el.src = '/logo.svg'; }} />
          </div>
          <div className="flex-1 h-px" style={{ background: 'rgb(var(--accent) / 0.35)' }} />
        </div>

        <p className="text-gold font-body font-semibold text-xs uppercase tracking-[0.2em] text-center mb-2">
          {brandDNA.copy.faq.label}
        </p>
        <h2 className="font-heading font-bold text-white uppercase text-5xl text-center mb-10 leading-tight">
          {brandDNA.copy.faq.heading}
        </h2>

        <FAQAccordion items={brandDNA.faq} />

      </div>
    </section>
  );
}
