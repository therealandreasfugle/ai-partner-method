import { brandDNA } from '../config/brand-dna';
import CornerOverlay from './CornerOverlay';

const offerIcons = [
  (
    <svg className="w-[38px] h-[38px]" fill="none" viewBox="0 0 24 24" stroke="rgb(var(--accent))" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.955 11.955 0 003 10c0 5.592 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.25-8.25-3.286z" />
    </svg>
  ),
  (
    <svg className="w-[38px] h-[38px]" fill="none" viewBox="0 0 24 24" stroke="rgb(var(--accent))" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0112 13.489a50.702 50.702 0 017.74-3.342M6.75 15a.75.75 0 100-1.5.75.75 0 000 1.5zm0 0v-3.675A55.378 55.378 0 0112 8.443m-7.007 11.55A5.981 5.981 0 006.75 15.75v-1.5" />
    </svg>
  ),
  (
    <svg className="w-[38px] h-[38px]" fill="none" viewBox="0 0 24 24" stroke="rgb(var(--accent))" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
    </svg>
  ),
];

const fallbackIcon = (
  <svg className="w-[38px] h-[38px]" fill="none" viewBox="0 0 24 24" stroke="rgb(var(--accent))" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.955 11.955 0 003 10c0 5.592 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.25-8.25-3.286z" />
  </svg>
);

export default function SpecialOffers() {
  return (
    <section
      className="relative py-20 overflow-hidden bg-grid bg-stripe bg-navy"
    >
      {/* Rule 58: per-client corner overlays. */}
      <CornerOverlay position="top-left" size={320} />
      <CornerOverlay position="bottom-right" size={320} />

      <div className="relative max-w-5xl mx-auto px-8 text-center">
        <p className="text-gold font-body font-semibold text-xs uppercase tracking-[0.2em] mb-3">
          {brandDNA.copy.offers.label}
        </p>
        <h2 className="font-heading font-bold text-white uppercase text-5xl leading-tight mb-3">
          {brandDNA.copy.offers.heading}
        </h2>
        <span className="line-gold block w-12 mx-auto mb-6" />
        <p className="text-cool font-body text-sm mb-10 max-w-xl mx-auto leading-relaxed">
          {brandDNA.copy.offers.body}
        </p>

        {brandDNA.special_offers.length === 1 ? (
          // Single offer: centered statement block, NOT a lonely card
          <div className="max-w-2xl mx-auto mb-8">
            <div className="inline-flex items-center justify-center mb-6">
              <div className="w-[64px] h-[64px] flex items-center justify-center" style={{ background: 'linear-gradient(135deg, rgb(var(--accent-light)) 0%, rgb(var(--accent)) 40%, rgb(var(--accent-dark)) 65%, rgb(var(--accent-light)) 100%)' }}>
                <span className="text-navy">{offerIcons[0] || fallbackIcon}</span>
              </div>
            </div>
            <p className="font-heading font-bold text-white uppercase tracking-widest text-3xl mb-4">
              {brandDNA.special_offers[0].label}
            </p>
            <p className="text-cool font-body text-base leading-relaxed max-w-lg mx-auto">
              {brandDNA.special_offers[0].description || brandDNA.copy.offers.body}
            </p>
          </div>
        ) : brandDNA.special_offers.length === 2 ? (
          // 2 offers: cards layout with max-width so they stay center-justified
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8 max-w-3xl mx-auto">
            {brandDNA.special_offers.map((g, i) => (
              <div
                key={g.label}
                className="card-elevated-dark flex flex-col items-center justify-center py-[22px] lg:py-[30px] px-[14px] gap-[10px] lg:gap-[14px] border border-steel/25 bg-navy-slate"
              >
                {offerIcons[i] || fallbackIcon}
                <div className="font-heading font-bold text-white uppercase tracking-widest text-sm">
                  {g.label}
                </div>
              </div>
            ))}
          </div>
        ) : (
          // 3+ offers: standard 3-column grid
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            {brandDNA.special_offers.map((g, i) => (
              <div
                key={g.label}
                className="card-elevated-dark flex flex-col items-center justify-center py-[22px] lg:py-[30px] px-[14px] gap-[10px] lg:gap-[14px] border border-steel/25 bg-navy-slate"
              >
                {offerIcons[i] || fallbackIcon}
                <div className="font-heading font-bold text-white uppercase tracking-widest text-sm">
                  {g.label}
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="py-[12px] px-[16px] border-l-4 bg-navy-slate" style={{ borderColor: 'rgb(var(--accent))' }}>
          <p className="font-body font-semibold text-cool text-sm">
            {brandDNA.copy.offers.detail}
          </p>
        </div>
      </div>
    </section>
  );
}
