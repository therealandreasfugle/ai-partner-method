import Ticker from './Ticker';
import BackgroundPattern from './BackgroundPattern';
import { brandDNA } from '../config/brand-dna';
import CornerOverlay from './CornerOverlay';

const reasonIcons = [
  (
    <svg className="w-[26px] h-[26px]" fill="none" viewBox="0 0 24 24" stroke="rgb(var(--accent))" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 15.803a7.5 7.5 0 0010.607 10.607z" />
    </svg>
  ),
  (
    <svg className="w-[26px] h-[26px]" fill="none" viewBox="0 0 24 24" stroke="rgb(var(--accent))" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
    </svg>
  ),
  (
    <svg className="w-[26px] h-[26px]" fill="none" viewBox="0 0 24 24" stroke="rgb(var(--accent))" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.955 11.955 0 003 10c0 5.592 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.25-8.25-3.286z" />
    </svg>
  ),
  (
    <svg className="w-[26px] h-[26px]" fill="none" viewBox="0 0 24 24" stroke="rgb(var(--accent))" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z" />
    </svg>
  ),
  (
    <svg className="w-[26px] h-[26px]" fill="none" viewBox="0 0 24 24" stroke="rgb(var(--accent))" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
    </svg>
  ),
  (
    <svg className="w-[26px] h-[26px]" fill="none" viewBox="0 0 24 24" stroke="rgb(var(--accent))" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
    </svg>
  ),
];

const fallbackIcon = (
  <svg className="w-[26px] h-[26px]" fill="none" viewBox="0 0 24 24" stroke="rgb(var(--accent))" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.955 11.955 0 003 10c0 5.592 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.25-8.25-3.286z" />
  </svg>
);

export default function WhyChooseUs() {
  return (
    <section className="relative overflow-hidden bg-grid bg-navy-slate">
      <BackgroundPattern motif={brandDNA.shape_motif} opacity={0.3} color="white" />

      {/* Rule 58: per-client corner overlays. */}
      <CornerOverlay position="top-left" size={320} />
      <CornerOverlay position="bottom-right" size={320} />

      {/* Mobile image */}
      <div className="lg:hidden relative h-52 overflow-hidden">
        <img
          src={`/work/${(brandDNA.previous_projects && brandDNA.previous_projects[2] && brandDNA.previous_projects[2].filename) || (brandDNA.previous_projects && brandDNA.previous_projects[0] && brandDNA.previous_projects[0].filename) || 'project1.webp'}`}
          alt={`${brandDNA.company.name} completed project in ${brandDNA.address.city}`}
          className="w-full h-full object-cover"
          style={{ objectPosition: '50% 20%' }}
          onError={(e) => { e.target.onerror = null; e.target.src = '/hero-image.webp'; }}
        />
        <div className="absolute inset-x-0 bottom-0 h-20" style={{ background: 'linear-gradient(to top, #F5F7FA, transparent)' }} />
      </div>

      <div className="relative grid grid-cols-1 lg:grid-cols-2">
        {/* Left: content */}
        <div className="relative px-8 lg:pl-16 lg:pr-8 py-16">
          <p className="text-gold font-body font-semibold text-xs uppercase tracking-[0.2em] mb-3">
            {brandDNA.copy.whyChoose.label}
          </p>
          <h2 className="font-heading font-bold text-white uppercase leading-none text-5xl mb-3">
            {brandDNA.copy.whyChoose.heading}
          </h2>
          <span className="line-gold block w-12 mb-6" />
          <p className="text-cool font-body text-sm leading-relaxed mb-8">
            {brandDNA.copy.whyChoose.body}
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {brandDNA.why_choose_us.map((title, i) => (
              <div
                key={title}
                className="card-elevated-dark flex items-center gap-[12px] p-[14px] lg:p-4 bg-navy"
                style={{ border: '1px solid rgba(100,116,139,0.25)' }}
              >
                <div className="flex-shrink-0 w-[44px] h-[44px] flex items-center justify-center" style={{ background: 'rgb(var(--accent) / 0.10)' }}>
                  {reasonIcons[i] || fallbackIcon}
                </div>
                <div className="font-heading font-bold text-white text-sm uppercase leading-tight">
                  {title}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: full-bleed image (desktop only) */}
        <div className="hidden lg:block relative overflow-hidden" style={{ minHeight: 640 }}>
          <img
            src={`/work/${(brandDNA.previous_projects && brandDNA.previous_projects[2] && brandDNA.previous_projects[2].filename) || (brandDNA.previous_projects && brandDNA.previous_projects[0] && brandDNA.previous_projects[0].filename) || 'project1.webp'}`}
            alt={`${brandDNA.company.name} completed project in ${brandDNA.address.city}`}
            className="absolute inset-0 w-full h-full object-cover"
            style={{ objectPosition: '50% 20%' }}
            onError={(e) => { e.target.onerror = null; e.target.src = '/hero-image.webp'; }}
          />
          {/* Left-edge fade */}
          <div className="absolute inset-y-0 left-0 w-44" style={{ background: 'linear-gradient(to right, #F5F7FA, transparent)' }} />
        </div>
      </div>

      <Ticker />
    </section>
  );
}
