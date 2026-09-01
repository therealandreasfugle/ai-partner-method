import Ticker from './Ticker';
import { brandDNA } from '../config/brand-dna';

// Generic fallback icon. Per-service icons can ship via brandDNA.services[i].iconPath
// (an SVG `d` attribute string) so the template stays niche-agnostic.
const fallbackIcon = (
  <svg viewBox="0 0 24 24" className="w-[22px] h-[22px]" fill="none" stroke="rgb(var(--accent))" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.955 11.955 0 003 10c0 5.592 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.25-8.25-3.286z" />
  </svg>
);

const renderIcon = (service) => {
  if (service && service.iconPath) {
    return (
      <svg viewBox="0 0 24 24" className="w-[22px] h-[22px]" fill="none" stroke="rgb(var(--accent))" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d={service.iconPath} />
      </svg>
    );
  }
  return fallbackIcon;
};

const firstProjectImage = () => {
  const projects = brandDNA.previous_projects || [];
  const candidate = projects[1] || projects[0];
  if (candidate && candidate.filename) return `/work/${candidate.filename}`;
  return null;
};

export default function Services() {
  const services = brandDNA.services || [];
  const servicesCopy = (brandDNA.copy && brandDNA.copy.services) || {};
  const projectImage = firstProjectImage();
  const imageAlt = `${brandDNA.company.name} team at work`;

  return (
    <section className="relative overflow-hidden bg-navy">
      <Ticker />

      {/* Mobile image */}
      {projectImage && (
        <div className="lg:hidden relative h-52 overflow-hidden">
          <img
            src={projectImage}
            alt={imageAlt}
            className="w-full h-full object-cover"
            style={{ objectPosition: '50% 40%' }}
            onError={(e) => { e.target.style.display = 'none'; }}
          />
          <div className="absolute inset-x-0 bottom-0 h-20" style={{ background: 'linear-gradient(to top, #F5F7FA, transparent)' }} />
        </div>
      )}

      {/* Desktop: image left | content right */}
      <div className="relative grid grid-cols-1 lg:grid-cols-2">

        {/* Left: image with right-side fade (desktop only) */}
        {projectImage && (
          <div className="hidden lg:block relative overflow-hidden" style={{ minHeight: 580 }}>
            <img
              src={projectImage}
              alt={imageAlt}
              className="absolute inset-0 w-full h-full object-cover"
              style={{ objectPosition: '50% 40%' }}
              onError={(e) => { e.target.style.display = 'none'; }}
            />
            {/* Right-edge fade */}
            <div className="absolute inset-y-0 right-0 w-44" style={{ background: 'linear-gradient(to right, transparent, #F5F7FA)' }} />
          </div>
        )}

        {/* Right: content */}
        <div className="px-8 pt-8 pb-4 flex flex-col justify-center">
          <div className="mb-4">
            <img src="/logo.webp" alt={brandDNA.company.name} className="w-44 h-auto" onError={(e) => { e.target.style.display = 'none'; }} />
          </div>

          {servicesCopy.label && (
            <p className="text-gold font-body font-semibold text-xs uppercase tracking-[0.2em] mb-2">
              {servicesCopy.label}
            </p>
          )}
          {servicesCopy.heading && (
            <h2 className="font-heading font-bold text-white uppercase text-4xl leading-tight mb-3">
              {servicesCopy.heading}
            </h2>
          )}
          <span className="line-gold block w-12 mb-5" />
          {servicesCopy.body && (
            <p className="text-cool font-body text-sm mb-8 max-w-lg">
              {servicesCopy.body}
            </p>
          )}

          {services.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-[10px]">
              {services.map((s) => (
                <div
                  key={s.slug || s.name}
                  className="card-elevated-dark flex items-center gap-[10px] p-[14px] cursor-pointer transition-all group border-l-2 bg-navy-slate"
                  style={{ border: '1px solid rgba(100,116,139,0.3)', borderLeft: '2px solid rgb(var(--accent))' }}
                >
                  <div className="flex-shrink-0 flex items-center justify-center">
                    {renderIcon(s)}
                  </div>
                  <span className="font-heading font-bold text-white text-xs uppercase leading-tight">{s.name}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="mt-8">
        <Ticker />
      </div>
    </section>
  );
}
