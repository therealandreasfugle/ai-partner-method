import { brandDNA } from '../config/brand-dna';
import AvailableDot from './AvailableDot';

// Rule 61 (supersedes Rule 45): the mobile sticky bar must read as TWO
// independent CTAs, not a single gold split-button. The left half (Call Now)
// uses a near-white background with dark navy text, the right half (form CTA)
// keeps the metallic accent gradient with white text per Rule 47/62. Both
// halves render at every breakpoint without time-gating.
//
// Rule 56 (refresh): the available-now dot ALWAYS renders on the Call Now
// half (top-right absolute pin) so the office hours signal stays visible at
// every viewport, including 375px. It pulses green within business hours and
// goes grey + static outside hours.
export default function MobileCtaBar() {
  const scrollToForm = () => {
    const el = document.getElementById('quote') || document.getElementById('cta-form');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 shadow-2xl bg-navy">
      {/* Rule 56 note: the standalone availability strip is gone on mobile to
          give content back ~40px; the per-button dot on the Call half below
          carries the signal (still driven by useAvailableNow). */}

      {/* Dual sticky CTAs. Rule 61: visually distinct halves, both always
          render. Left = light treatment (white bg, navy text), right =
          metallic accent (gold gradient, white text). */}
      <div className="grid grid-cols-2" style={{ borderTop: '1px solid rgba(15,23,42,0.2)' }}>
        <a
          href={`tel:${brandDNA.contact.phoneTelLink}`}
          className="relative flex items-center justify-center gap-[8px] py-[15px] font-heading font-bold text-[13px] uppercase tracking-wider"
          aria-label={`Call ${brandDNA.contact.phone}`}
          style={{
            background: '#FFFFFF',
            color: 'rgb(var(--primary))',
            borderRight: '1px solid rgba(15,23,42,0.18)',
          }}
        >
          {/* Rule 56 (refresh): per-button dot pin so the indicator is
              attached to the Call Now half itself, not only the strip. */}
          <span className="absolute top-2 right-2">
            <AvailableDot size="sm" label={false} variant="dark" />
          </span>
          <svg className="w-[16px] h-[16px] flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
          </svg>
          Call Now
        </a>
        <button
          onClick={scrollToForm}
          className="btn-gold flex items-center justify-center py-[15px] font-heading font-bold text-[13px] uppercase tracking-wider"
          style={{ color: '#FFFFFF', textShadow: '0 1px 2px rgba(15, 23, 42, 0.45)' }}
        >
          {brandDNA.copy.buttonText}
        </button>
      </div>
    </div>
  );
}
