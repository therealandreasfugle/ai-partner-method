import { useState } from 'react';
import { Link } from 'react-router-dom';
import CTABanner from '../components/CTABanner';
import Ticker from '../components/Ticker';
import CornerOverlay from '../components/CornerOverlay';
import { brandDNA } from '../config/brand-dna';

// All page copy is sourced from `brandDNA.pages.financing`. The expected shape:
//   brandDNA.pages.financing = {
//     label,         // hero eyebrow
//     heading,       // hero H1 (string or array of lines)
//     intro,         // hero intro paragraph
//     processLabel,  // section eyebrow for the steps section
//     processHeading,
//     processIntro,
//     steps: [{ num, title, desc }],
//     optionsLabel,
//     optionsHeading,
//     optionsIntro,
//     options: [{ name, headline, details, tag, highlight }],
//     calloutTitle,
//     calloutBody,
//     faqLabel,
//     faqHeading,
//     faq: [{ q, a }],
//     ctaFootnote,
//   }
// TODO (Stage 10.1): populate `brandDNA.pages.financing` from client data so all
// of the below fallback placeholders disappear in the merged output.
const financing = (brandDNA.pages && brandDNA.pages.financing) || {};
const heroImage = (brandDNA.previous_projects && brandDNA.previous_projects[0] && brandDNA.previous_projects[0].image) || null;
const heroImageAlt = (brandDNA.previous_projects && brandDNA.previous_projects[0] && brandDNA.previous_projects[0].imgAlt) || (brandDNA.copy && brandDNA.copy.hero && brandDNA.copy.hero.imageAlt) || '';

const headingLines = Array.isArray(financing.heading)
  ? financing.heading
  : (financing.heading ? [financing.heading] : ['HEADING LINE ONE', 'HEADING LINE TWO']);

const steps = Array.isArray(financing.steps) ? financing.steps : [];
const options = Array.isArray(financing.options) ? financing.options : [];
const faqs = Array.isArray(financing.faq) ? financing.faq : [];

export default function FinancingPage() {
  const [openFaq, setOpenFaq] = useState(null);

  return (
    <>
      {/* Page Hero */}
      <section className="relative overflow-hidden flex flex-col justify-end bg-navy theme-keep-dark" style={{ minHeight: '50vh' }}>
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
            <span className="text-white">Financing</span>
          </div>
          <p className="text-gold font-body font-semibold text-xs uppercase tracking-[0.2em] mb-3">
            {financing.label || 'PAGE EYEBROW'}
          </p>
          <h1 className="font-heading font-bold text-white uppercase leading-none text-5xl lg:text-6xl mb-4">
            {headingLines.map((line, idx) => (
              <span key={idx}>
                {line}
                {idx < headingLines.length - 1 && <br />}
              </span>
            ))}
          </h1>
          <span className="line-gold block w-16 mb-4" />
          <p className="text-white text-sm max-w-xl leading-relaxed font-body" style={{ textShadow: '0 1px 2px rgba(15, 23, 42, 0.6)' }}>
            {financing.intro || 'Page intro paragraph goes here.'}
          </p>
          <div className="flex flex-wrap gap-3 mt-6">
            <Link to="/contact" className="btn-gold font-heading font-bold text-sm uppercase px-6 py-3 tracking-widest text-navy">
              {(brandDNA.copy && brandDNA.copy.buttonText) || 'GET STARTED'} →
            </Link>
          </div>
        </div>
      </section>

      {/* How It Works */}
      {steps.length > 0 && (
        <section className="relative py-16 bg-grid bg-navy">
          <div className="max-w-5xl mx-auto px-8">
            <div className="text-center mb-10">
              <p className="text-gold font-body font-semibold text-xs uppercase tracking-[0.2em] mb-3">
                {financing.processLabel || 'THE PROCESS'}
              </p>
              <h2 className="font-heading font-bold text-white uppercase text-4xl leading-tight mb-2">
                {financing.processHeading || 'HOW IT WORKS'}
              </h2>
              <span className="line-gold block w-12 mx-auto mt-3 mb-4" />
              <p className="text-cool text-sm max-w-md mx-auto">
                {financing.processIntro || 'Section intro goes here.'}
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {steps.map((s) => (
                <div key={s.num} className="card-elevated-dark flex flex-col gap-3 p-5 bg-navy-slate" style={{ border: '1px solid rgba(100,116,139,0.25)' }}>
                  <div className="w-10 h-10 flex items-center justify-center font-heading font-bold text-sm flex-shrink-0 text-navy" style={{ background: 'linear-gradient(135deg, rgb(var(--accent-light)) 0%, rgb(var(--accent)) 40%, rgb(var(--accent-dark)) 65%, rgb(var(--accent-light)) 100%)' }}>
                    {s.num}
                  </div>
                  <div className="font-heading font-bold text-white uppercase text-sm tracking-wide leading-tight">{s.title}</div>
                  <p className="text-cool text-xs leading-relaxed">{s.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Options */}
      {options.length > 0 && (
        <section className="relative overflow-hidden py-16 bg-grid bg-navy-slate">
          {/* Rule 58: per-client corner overlays. */}
          <CornerOverlay position="top-left" size={320} />
          <CornerOverlay position="bottom-right" size={320} />
          <div className="relative max-w-5xl mx-auto px-8">
            <div className="text-center mb-10">
              <p className="text-gold font-body font-semibold text-xs uppercase tracking-[0.2em] mb-3">
                {financing.optionsLabel || 'YOUR OPTIONS'}
              </p>
              <h2 className="font-heading font-bold text-white uppercase text-4xl leading-tight mb-2">
                {financing.optionsHeading || 'OPTIONS'}
              </h2>
              <span className="line-gold block w-12 mx-auto mt-3 mb-4" />
              <p className="text-cool text-sm max-w-md mx-auto">
                {financing.optionsIntro || 'Options intro goes here.'}
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              {options.map((o) => (
                <div
                  key={o.name}
                  className="card-elevated-dark flex flex-col gap-3 p-6 bg-navy"
                  style={{
                    border: o.highlight ? '2px solid rgb(var(--accent))' : '1px solid rgba(100,116,139,0.25)',
                    borderTop: o.highlight ? '2px solid rgb(var(--accent))' : '1px solid rgba(100,116,139,0.25)',
                  }}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="font-heading font-bold text-white uppercase text-base leading-tight">{o.name}</div>
                    {o.tag && (
                      <span className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 flex-shrink-0" style={{ background: o.highlight ? 'rgb(var(--accent) / 0.2)' : 'rgba(100,116,139,0.2)', color: o.highlight ? 'rgb(var(--accent))' : '#94A3BB', border: `1px solid ${o.highlight ? 'rgb(var(--accent) / 0.3)' : 'rgba(100,116,139,0.3)'}` }}>
                        {o.tag}
                      </span>
                    )}
                  </div>
                  <p className="text-gold text-sm font-semibold leading-snug">{o.headline}</p>
                  <p className="text-cool text-xs leading-relaxed">{o.details}</p>
                </div>
              ))}
            </div>

            {/* Optional callout block */}
            {(financing.calloutTitle || financing.calloutBody) && (
              <div className="mt-8 p-5 flex items-start gap-4 bg-navy" style={{ border: '1px solid rgba(100,116,139,0.25)', borderLeft: '2px solid rgb(var(--accent))' }}>
                <div className="w-9 h-9 flex items-center justify-center flex-shrink-0" style={{ background: 'rgb(var(--accent) / 0.1)', border: '1px solid rgb(var(--accent) / 0.3)' }}>
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="rgb(var(--accent))" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.955 11.955 0 003 10c0 5.592 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.25-8.25-3.286z" />
                  </svg>
                </div>
                <div>
                  {financing.calloutTitle && (
                    <div className="font-heading font-bold text-white uppercase text-sm tracking-wide mb-1">
                      {financing.calloutTitle}
                    </div>
                  )}
                  {financing.calloutBody && (
                    <p className="text-cool text-xs leading-relaxed">{financing.calloutBody}</p>
                  )}
                </div>
              </div>
            )}

            <div className="text-center mt-10">
              <Link to="/contact" className="btn-gold inline-block font-heading font-bold text-base uppercase px-10 py-3.5 tracking-widest text-navy">
                {(brandDNA.copy && brandDNA.copy.buttonText) || 'GET STARTED'}
              </Link>
              {financing.ctaFootnote && (
                <p className="text-steel text-xs mt-4">{financing.ctaFootnote}</p>
              )}
            </div>
          </div>
        </section>
      )}

      <Ticker />

      {/* FAQ */}
      {faqs.length > 0 && (
        <section className="relative py-16 bg-grid bg-navy">
          <div className="max-w-3xl mx-auto px-8">
            <p className="text-gold font-body font-semibold text-xs uppercase tracking-[0.2em] mb-3 text-center">
              {financing.faqLabel || (brandDNA.copy && brandDNA.copy.faq && brandDNA.copy.faq.label) || 'FAQ'}
            </p>
            <h2 className="font-heading font-bold text-white uppercase text-4xl leading-tight mb-2 text-center">
              {financing.faqHeading || 'FAQ'}
            </h2>
            <span className="line-gold block w-12 mx-auto mt-3 mb-8" />
            <div className="flex flex-col gap-3">
              {faqs.map((item, i) => (
                <div
                  key={i}
                  className="overflow-hidden transition-all duration-200 bg-navy-slate"
                  style={{
                    border: `1px solid ${openFaq === i ? 'rgb(var(--accent))' : 'rgba(100,116,139,0.25)'}`,
                    borderTop: openFaq === i ? '2px solid rgb(var(--accent))' : '1px solid rgba(100,116,139,0.25)',
                  }}
                >
                  <button
                    className="w-full flex items-center justify-between gap-4 px-6 py-5 text-left"
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  >
                    <span className="font-heading font-bold text-white text-sm uppercase tracking-wide leading-tight">{item.q}</span>
                    <div
                      className="w-8 h-8 flex items-center justify-center flex-shrink-0 transition-all duration-200"
                      style={{
                        background: openFaq === i ? 'linear-gradient(135deg, rgb(var(--accent-light)) 0%, rgb(var(--accent)) 40%, rgb(var(--accent-dark)) 65%, rgb(var(--accent-light)) 100%)' : 'rgba(100,116,139,0.2)',
                        transform: openFaq === i ? 'rotate(45deg)' : 'rotate(0deg)',
                      }}
                    >
                      <svg className="w-4 h-4" style={{ color: openFaq === i ? '#0F172A' : '#94A3BB' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16M4 12h16" />
                      </svg>
                    </div>
                  </button>
                  {openFaq === i && (
                    <div className="px-6 pb-5" style={{ borderTop: '1px solid rgba(100,116,139,0.2)' }}>
                      <p className="text-cool text-sm leading-relaxed pt-4">{item.a}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      <CTABanner />
    </>
  );
}
