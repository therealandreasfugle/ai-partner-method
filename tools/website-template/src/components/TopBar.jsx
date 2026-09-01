import { brandDNA } from '../config/brand-dna'
import AvailableDot from './AvailableDot'

const PhoneIcon = () => (
  <svg className="inline w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
  </svg>
);

const MailIcon = () => (
  <svg className="inline w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
  </svg>
);

// Rule 56 (refresh): the available-now dot is ALWAYS visible inside the
// TopBar. It pulses green within business hours and goes grey + static
// outside hours, so the indicator is never missing from the surface.
export default function TopBar() {
  return (
    <div className="hidden lg:block text-white text-sm py-2 px-4 bg-navy-dark">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-1.5 sm:gap-0">
        <span className="font-body text-sm text-center sm:text-left text-cool flex items-center flex-wrap gap-x-2 gap-y-1">
          <AvailableDot size="sm" label={true} />
          <span className="text-steel">·</span>
          <span>
            {brandDNA.copy.topBar.cta}{' '}
            <a href={`tel:${brandDNA.contact.phoneTelLink}`} className="font-semibold ml-1 hover:text-white transition-colors text-gold">
              <PhoneIcon />{brandDNA.contact.phone}
            </a>
          </span>
        </span>
        <div className="flex items-center gap-3 sm:gap-6">
          <a href={`mailto:${brandDNA.contact.email}`} className="hidden sm:inline text-sm text-steel hover:text-white transition-colors">
            <MailIcon />{brandDNA.contact.email}
          </a>
          <button
            onClick={() => {
              const el = document.getElementById('quote') || document.getElementById('cta-form');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }}
            className="btn-gold font-body font-bold text-xs sm:text-sm px-3 sm:px-4 py-1.5 uppercase tracking-wider text-navy"
          >
            {brandDNA.copy.buttonText}
          </button>
        </div>
      </div>
    </div>
  );
}
