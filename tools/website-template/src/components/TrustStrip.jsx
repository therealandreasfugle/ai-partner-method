import { brandDNA } from '../config/brand-dna';
import BackgroundPattern from './BackgroundPattern';

export default function TrustStrip() {
  return (
    <div className="relative bg-navy-slate">
      <BackgroundPattern motif={brandDNA.shape_motif} opacity={0.3} color="white" />

      {/* Floating claims pill, overlaps section above */}
      <div
        className="flex justify-center px-4 sm:px-8"
        style={{ marginTop: '-21px', position: 'relative', zIndex: 10 }}
      >
        <div
          className="w-full md:w-auto overflow-hidden theme-keep-dark"
          style={{
            background: 'rgba(15,23,42,0.80)',
            border: '1px solid rgb(var(--accent) / 0.25)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            boxShadow: '0 8px 24px rgba(0,0,0,0.45)',
          }}
        >
          {/* Mobile: 2-column grid, left-aligned rows. Pinned px sizes (the
              doubled spacing scale makes raw utilities balloon here) and NO
              text-center: centered wrapping made the four claims rag unevenly. */}
          <div className="grid grid-cols-2 gap-x-[6px] md:hidden px-[10px] py-[6px]">
            {brandDNA.copy.trustClaims.map((claim) => (
              <div key={claim} className="flex items-center justify-start gap-[8px] px-[8px] py-[9px]">
                <svg className="w-[14px] h-[14px] flex-shrink-0 text-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
                <span className="font-heading font-bold text-white text-[10.5px] uppercase tracking-wide leading-[1.3] text-left">{claim}</span>
              </div>
            ))}
          </div>

          {/* Desktop: horizontal row with dividers */}
          <div className="hidden md:flex items-center">
            {brandDNA.copy.trustClaims.map((claim, i) => (
              <div key={claim} className="flex items-center">
                <div className="flex items-center gap-1.5 px-5 py-2.5">
                  <svg className="w-3 h-3 flex-shrink-0 text-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="font-heading font-bold text-white text-xs uppercase tracking-wider whitespace-nowrap">{claim}</span>
                </div>
                {i < brandDNA.copy.trustClaims.length - 1 && (
                  <div className="h-5 w-px flex-shrink-0" style={{ background: 'rgb(var(--accent) / 0.3)' }} />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Trust badges, mobile: stacked rows. Rule 57: badges render at a
          minimum 64px height on mobile so the manufacturer credential is
          actually legible. mix-blend-mode multiply lets the badge sit cleanly
          on either light or dark section backgrounds. */}
      {brandDNA.trust_badges && brandDNA.trust_badges.length > 0 && (
        <div className="md:hidden px-8 py-6">
          <div className="flex justify-center items-center gap-8 flex-wrap">
            {brandDNA.trust_badges.map((b) => (
              <img
                key={b.filename}
                src={`/badges/${b.filename}`}
                alt={b.alt}
                className="w-auto object-contain"
                style={{ minHeight: 64, height: 64, mixBlendMode: 'multiply' }}
                onError={(e) => { e.target.style.display = 'none'; }}
              />
            ))}
          </div>
        </div>
      )}

      {/* Trust badges, desktop: single horizontal row. Rule 57: minimum 88px
          height on desktop. */}
      {brandDNA.trust_badges && brandDNA.trust_badges.length > 0 && (
        <div className="hidden md:block py-5 overflow-x-auto">
          <div className="flex items-center justify-center px-8">
            {brandDNA.trust_badges.map((badge, i, arr) => (
              <div key={badge.filename} className="flex items-center">
                <div className="flex items-center justify-center px-8 py-1 flex-shrink-0">
                  <img
                    src={`/badges/${badge.filename}`}
                    alt={badge.alt}
                    className="w-auto object-contain"
                    style={{ minHeight: 88, height: 88, mixBlendMode: 'multiply' }}
                    onError={(e) => { e.target.style.display = 'none'; }}
                  />
                </div>
                {i < arr.length - 1 && (
                  <div className="h-16 w-px flex-shrink-0" style={{ background: 'rgba(100,116,139,0.35)' }} />
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Press logos / text-only credentials, fallback when no manufacturer cert badges */}
      {(!brandDNA.trust_badges || brandDNA.trust_badges.length === 0) && brandDNA.press_logos && brandDNA.press_logos.length > 0 && (
        <div className="px-6 py-8">
          <p className="font-heading font-bold text-gold text-[10px] uppercase tracking-[0.3em] text-center mb-4">
            AS FEATURED IN & CREDENTIALED BY
          </p>
          {/* Mobile: stacked */}
          <div className="md:hidden flex flex-col items-center gap-3">
            {brandDNA.press_logos.map((p) => (
              <span
                key={p.label}
                className="font-heading font-bold text-white text-xs uppercase tracking-wider text-center px-4 py-2"
                style={{ background: 'rgba(15,23,42,0.55)', border: '1px solid rgb(var(--accent) / 0.25)' }}
              >
                {p.label}
              </span>
            ))}
          </div>
          {/* Desktop: horizontal row with dividers */}
          <div className="hidden md:flex items-center justify-center flex-wrap gap-x-8 gap-y-3 max-w-5xl mx-auto">
            {brandDNA.press_logos.map((p, i, arr) => (
              <div key={p.label} className="flex items-center">
                <span className="font-heading font-bold text-white text-xs uppercase tracking-wider whitespace-nowrap">
                  {p.label}
                </span>
                {i < arr.length - 1 && (
                  <div className="h-5 w-px flex-shrink-0 ml-8" style={{ background: 'rgb(var(--accent) / 0.3)' }} />
                )}
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
