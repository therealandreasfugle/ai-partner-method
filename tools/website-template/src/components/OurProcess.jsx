import Ticker from './Ticker';
import BackgroundPattern from './BackgroundPattern';
import { brandDNA } from '../config/brand-dna';

const firstProjectImage = () => {
  const projects = brandDNA.previous_projects || [];
  const candidate = projects[2] || projects[1] || projects[0];
  if (candidate && candidate.filename) return `/work/${candidate.filename}`;
  return null;
};

const fallbackProjectImage = () => {
  const projects = brandDNA.previous_projects || [];
  const candidate = projects[0];
  if (candidate && candidate.filename) return `/work/${candidate.filename}`;
  return null;
};

export default function OurProcess() {
  const processImage = firstProjectImage();
  const processFallback = fallbackProjectImage();
  const processCopy = (brandDNA.copy && brandDNA.copy.process) || {};
  const steps = brandDNA.process_steps || [];
  const imageAlt = `${brandDNA.company.name} team at work in ${brandDNA.address.city}`;

  return (
    <section className="relative overflow-hidden bg-navy">
      <BackgroundPattern motif={brandDNA.shape_motif} opacity={0.3} color="white" />
      <Ticker />

      {/* Mobile image */}
      {processImage && (
        <div className="lg:hidden relative h-52 overflow-hidden">
          <img
            src={processImage}
            alt={imageAlt}
            className="w-full h-full object-cover"
            style={{ objectPosition: '50% 40%' }}
            onError={(e) => { if (processFallback) { e.target.src = processFallback; } else { e.target.style.display = 'none'; } }}
          />
          <div className="absolute inset-x-0 bottom-0 h-20" style={{ background: 'linear-gradient(to top, #F5F7FA, transparent)' }} />
        </div>
      )}

      <div className="relative grid grid-cols-1 lg:grid-cols-2">

        {/* Left: full-bleed image (desktop only) */}
        {processImage && (
          <div className="hidden lg:block relative overflow-hidden" style={{ minHeight: 540 }}>
            <img
              src={processImage}
              alt={imageAlt}
              className="absolute inset-0 w-full h-full object-cover"
              style={{ objectPosition: '50% 40%' }}
              onError={(e) => { if (processFallback) { e.target.src = processFallback; } else { e.target.style.display = 'none'; } }}
            />
            {/* Right-edge fade */}
            <div className="absolute inset-y-0 right-0 w-44" style={{ background: 'linear-gradient(to right, transparent, #F5F7FA)' }} />
            {/* Bottom badge */}
            {(processCopy.badgeText || processCopy.badgeSubtext) && (
              <div className="absolute bottom-0 left-0 p-4 pr-48" style={{ background: 'linear-gradient(to top, rgba(15,23,42,0.9) 0%, transparent 100%)' }}>
                {processCopy.badgeText && (
                  <div className="font-heading font-bold text-white text-lg uppercase">{processCopy.badgeText}</div>
                )}
                {processCopy.badgeSubtext && (
                  <div className="font-body text-cool text-xs">{processCopy.badgeSubtext}</div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Right: steps content */}
        <div className="px-8 lg:pl-10 lg:pr-16 pt-12 pb-12">
          {processCopy.label && (
            <p className="text-gold font-body font-semibold text-xs uppercase tracking-[0.2em] mb-3">
              {processCopy.label}
            </p>
          )}
          {processCopy.heading && (
            <h2 className="font-heading font-bold text-white uppercase leading-none text-5xl mb-3">
              {processCopy.heading}
            </h2>
          )}
          <span className="line-gold block w-12 mb-5" />
          {processCopy.body && (
            <p className="text-cool font-body text-sm leading-relaxed mb-7">
              {processCopy.body}
            </p>
          )}

          {steps.length > 0 && (
            <div className="grid grid-cols-1 gap-3">
              {steps.map((step) => (
                <div
                  key={step.n}
                  className="card-elevated-dark flex items-center gap-[13px] lg:gap-4 px-[15px] lg:px-4 py-[13px] lg:py-4 cursor-default transition-all group bg-navy-slate"
                  style={{ border: '1px solid rgba(100,116,139,0.25)' }}
                >
                  {/* Rule 60: step number renders white with a black-soft shadow
                      so the digit stays crisp on the per-client accent gradient. */}
                  <div
                    className="w-10 h-10 flex items-center justify-center flex-shrink-0 font-heading font-bold text-xl"
                    style={{
                      background: 'linear-gradient(135deg, rgb(var(--accent-light)) 0%, rgb(var(--accent)) 40%, rgb(var(--accent-dark)) 65%, rgb(var(--accent-light)) 100%)',
                      color: '#FFFFFF',
                      textShadow: '0 1px 2px rgba(0,0,0,0.35)',
                    }}
                  >
                    {step.n}
                  </div>
                  <span className="font-heading font-bold text-white text-sm uppercase tracking-wide leading-tight">{step.title}: {step.body}</span>
                </div>
              ))}
            </div>
          )}

          {/* Risk-reversal line */}
          {processCopy.riskReversal && (
            <p className="text-steel font-body text-xs italic mt-5">
              {processCopy.riskReversal}
            </p>
          )}

          {/* CTA */}
          <button
            onClick={() => {
              const el = document.getElementById('quote') || document.getElementById('cta-form');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }}
            className="btn-gold mt-5 font-heading font-bold text-sm uppercase px-6 py-3 tracking-widest text-navy"
          >
            {brandDNA.copy.buttonText} →
          </button>
        </div>

      </div>
      <Ticker />
    </section>
  );
}
