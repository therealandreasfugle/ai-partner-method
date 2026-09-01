import { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { brandDNA } from '../config/brand-dna';
import AvailableDot from './AvailableDot';

const serviceItems = brandDNA.services.map((s) => ({ label: s.name, slug: s.slug }));

const navLinks = [
  { label: 'Home', to: '/' },
  { label: 'About', to: '/about' },
  { label: 'Services', to: '/services', dropdown: 'services' },
  { label: 'Gallery', to: '/gallery' },
  { label: 'Service Areas', to: '/service-areas' },
  { label: 'Financing', to: '/financing' },
  { label: 'Blog', to: '/blog' },
  { label: 'Contact', to: '/contact' },
];

// Rule 62: nav CTA buttons render white text on the accent gradient at every
// breakpoint, with a navy drop-shadow so the letters stay crisp on green /
// gold / amber accents in both desktop and mobile-collapsed nav variants.
const navCtaTextStyle = {
  color: '#FFFFFF',
  textShadow: '0 1px 2px rgba(15, 23, 42, 0.45)',
};

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileServicesOpen, setMobileServicesOpen] = useState(false);
  const [servicesOpen, setServicesOpen] = useState(false);
  const dropdownRef = useRef(null);
  const location = useLocation();

  useEffect(() => {
    setMobileOpen(false);
    setServicesOpen(false);
    setMobileServicesOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setServicesOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const scrollToForm = () => {
    const el = document.getElementById('quote') || document.getElementById('cta-form');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  const isActive = (to) => {
    if (to === '/') return location.pathname === '/';
    return location.pathname.startsWith(to);
  };

  return (
    // Rule 54: nav element keeps a solid bg-navy in dark theme and bg-white/90
    // with backdrop-blur in light theme (handled by the light-theme override)
    // so the logo never reads against the hero photo behind it. Position
    // relative + z-index lift on the inner row keeps the logo above the hero.
    <nav className="fixed top-0 left-0 right-0 z-50 shadow-lg bg-navy">
      {/* Thin gold accent line at very top */}
      <div className="line-gold w-full" />

      <div className="max-w-7xl mx-auto px-[14px] lg:px-4 flex items-center h-[56px] lg:h-[64px] gap-[10px] lg:gap-4">
        {/* Logo. Rule 54: relative + z-index 20 so the wordmark sits ABOVE the
            hero section and the height cap (h-12 md:h-14) keeps the logo
            inside the nav bar even when the source SVG is tall. */}
        <Link to="/" className="flex-shrink-0 relative" style={{ zIndex: 20 }}>
          <img
            src="/logo.webp"
            alt={brandDNA.company.name}
            className="h-[34px] max-w-[42vw] object-contain lg:h-[40px] lg:max-w-none w-auto"
            onError={(e) => {
              const el = e.target;
              el.onerror = () => { el.onerror = null; el.style.display = 'none'; };
              el.src = '/logo.svg';
            }}
          />
        </Link>

        {/* Desktop nav */}
        <div className="hidden lg:flex items-center gap-5 ml-auto">
          {navLinks.map((link) =>
            link.dropdown === 'services' ? (
              <div key={link.label} className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setServicesOpen(!servicesOpen)}
                  className={`font-body font-semibold text-sm flex items-center gap-0.5 whitespace-nowrap transition-colors pb-[4px] ${
                    isActive(link.to)
                      ? 'text-white border-b-2 border-gold'
                      : 'text-cool hover:text-white border-b-2 border-transparent'
                  }`}
                >
                  {link.label}
                  <svg className={`w-3 h-3 ml-0.5 text-steel transition-transform ${servicesOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {servicesOpen && (
                  <div className="absolute top-full left-0 mt-2 w-56 shadow-2xl border border-steel/30 py-2 z-50 bg-navy-slate">
                    <Link
                      to="/services"
                      className="block px-4 py-2 text-xs font-body font-bold text-gold uppercase tracking-wider hover:bg-navy transition-colors border-b border-steel/20 mb-1"
                    >
                      All Services →
                    </Link>
                    {serviceItems.map((s) => (
                      <Link
                        key={s.slug}
                        to={`/services/${s.slug}`}
                        className="block px-4 py-1.5 text-xs font-body font-semibold text-cool hover:text-white hover:bg-navy transition-colors"
                      >
                        {s.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <Link
                key={link.label}
                to={link.to}
                className={`font-body font-semibold text-sm whitespace-nowrap transition-colors pb-[4px] ${
                  isActive(link.to)
                    ? 'text-white border-b-2 border-gold'
                    : 'text-cool hover:text-white border-b-2 border-transparent'
                }`}
              >
                {link.label}
              </Link>
            )
          )}

          {/* Phone with available-now indicator. Rule 56 (amended): the dot
              renders ONLY with its label (2xl+). A label-less dot next to the
              phone number read as a stray grey blob at narrower widths. */}
          <a href={`tel:${brandDNA.contact.phoneTelLink}`} className="flex items-center gap-2 ml-1 pb-[4px] border-b-2 border-transparent">
            <span className="hidden 2xl:inline-flex">
              <AvailableDot size="sm" label={true} />
            </span>
            <span className="font-body font-semibold text-sm text-cool whitespace-nowrap">{brandDNA.contact.phone}</span>
          </a>

          {/* Locked phrase: SOP allows only "__REQUIRED__CTA_PRIMARY__" as the
              primary CTA across the entire site. Sourced from
              brandDNA.copy.buttonText, which defaults to that exact string.
              Rule 62: white text + drop shadow so letters stay crisp on the
              metallic accent gradient. */}
          <button
            onClick={scrollToForm}
            className="btn-gold nav-cta font-heading font-bold text-xs uppercase px-5 py-2.5 tracking-wider ml-1 whitespace-nowrap"
            style={navCtaTextStyle}
          >
            {brandDNA.copy.buttonText}
          </button>
        </div>

        {/* Mobile: CTA between logo and hamburger. Rule 56 (amended): below
            sm the dot renders nowhere in the bar; a label-less dot next to
            CALL NOW read as stray debris at 390px. The availability signal
            still carries via the sm+ labelled slot and inside the expanded
            hamburger menu. Rule 62 keeps the text white + shadow. */}
        <div className="lg:hidden ml-auto mr-[8px] flex items-center gap-[8px]">
          <a
            href={`tel:${brandDNA.contact.phoneTelLink}`}
            className="hidden sm:inline-flex"
            aria-label="Call now"
          >
            <AvailableDot size="sm" label={true} />
          </a>
          <a
            href={`tel:${brandDNA.contact.phoneTelLink}`}
            className="flex items-center gap-[6px] font-heading font-bold text-xs uppercase px-[10px] py-[6px] tracking-wider whitespace-nowrap"
            style={{
              background: 'linear-gradient(135deg, rgb(var(--accent-light)) 0%, rgb(var(--accent)) 40%, rgb(var(--accent-dark)) 65%, rgb(var(--accent-light)) 100%)',
              ...navCtaTextStyle,
            }}
          >
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
            Call Now
          </a>
        </div>

        {/* Mobile hamburger */}
        <button
          className="lg:hidden text-white p-[8px] -mr-[6px] flex-shrink-0"
          aria-label="Menu"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          <svg className="w-[24px] h-[24px]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={mobileOpen ? 'M6 18L18 6M6 6l12 12' : 'M4 6h16M4 12h16M4 18h16'} />
          </svg>
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="lg:hidden border-t border-steel/20 px-4 py-3 flex flex-col gap-0.5 bg-navy">
          {/* Rule 56 (refresh): when the hamburger expands, surface the
              available-now indicator inside the menu so the signal carries
              over to the expanded mobile nav. */}
          <div className="py-2 border-b border-steel/20">
            <AvailableDot size="sm" label={true} />
          </div>
          {navLinks.map((link) =>
            link.dropdown === 'services' ? (
              <div key={link.label}>
                <button
                  onClick={() => setMobileServicesOpen(!mobileServicesOpen)}
                  className="w-full text-left font-body font-semibold text-sm py-2.5 border-b border-steel/20 flex items-center justify-between text-cool hover:text-white"
                >
                  {link.label}
                  <svg className={`w-3 h-3 transition-transform ${mobileServicesOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {mobileServicesOpen && (
                  <div className="pl-3 py-1 flex flex-col gap-0.5">
                    {serviceItems.map((s) => (
                      <Link
                        key={s.slug}
                        to={`/services/${s.slug}`}
                        className="text-xs font-body font-semibold py-1.5 text-steel hover:text-white"
                      >
                        · {s.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <Link
                key={link.label}
                to={link.to}
                className="font-body font-semibold text-sm py-2.5 border-b border-steel/20 last:border-b-0 text-cool hover:text-white"
              >
                {link.label}
              </Link>
            )
          )}
          {/* Rule 62: collapsed nav CTA also uses white text + shadow */}
          <button
            onClick={() => { scrollToForm(); setMobileOpen(false); }}
            className="mt-2 btn-gold font-heading font-bold text-sm uppercase px-4 py-2.5 tracking-wider text-center w-full"
            style={navCtaTextStyle}
          >
            {brandDNA.copy.buttonText}
          </button>
        </div>
      )}
    </nav>
  );
}
