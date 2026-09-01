import { Link } from 'react-router-dom';
import { brandDNA } from '../config/brand-dna';

// Company column omits Service Areas (it gets its own column with each city
// listed) to avoid duplication.
const companyLinks = [
  { label: 'Home', to: '/' },
  { label: 'About Us', to: '/about' },
  { label: 'Our Work', to: '/gallery' },
  { label: 'Financing', to: '/financing' },
  { label: 'Blog', to: '/blog' },
  { label: 'Contact', to: '/contact' },
];

const serviceLinks = brandDNA.services.slice(0, 7).map((s) => ({
  label: s.name.split(' ').map((w) => w.charAt(0) + w.slice(1).toLowerCase()).join(' '),
  to: `/services/${s.slug}`,
}));

const PhoneIcon = () => (
  <svg className="w-[16px] h-[16px] flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="rgb(var(--accent))" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
  </svg>
);

const MailIcon = () => (
  <svg className="w-[16px] h-[16px] flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="rgb(var(--accent))" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
  </svg>
);

const LocationIcon = () => (
  <svg className="w-[16px] h-[16px] flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="rgb(var(--accent))" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
  </svg>
);

// Per-platform SVG paths. We render an icon ONLY if brandDNA.social[key]
// has a non-empty URL, so an unset platform never produces a dead icon.
const SOCIAL_ICON_MAP = {
  facebook: 'M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z',
  instagram: 'M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z',
  youtube: 'M23.495 6.205a3.007 3.007 0 0 0-2.088-2.088c-1.87-.501-9.396-.501-9.396-.501s-7.507-.01-9.396.501A3.007 3.007 0 0 0 .527 6.205a31.247 31.247 0 0 0-.522 5.805 31.247 31.247 0 0 0 .522 5.783 3.007 3.007 0 0 0 2.088 2.088c1.868.502 9.396.502 9.396.502s7.506 0 9.396-.502a3.007 3.007 0 0 0 2.088-2.088 31.247 31.247 0 0 0 .5-5.783 31.247 31.247 0 0 0-.5-5.805zM9.609 15.601V8.408l6.264 3.602z',
  twitter: 'M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z',
  linkedin: 'M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.063 2.063 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z',
  tiktok: 'M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z',
};

const slugify = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

export default function Footer() {
  const scrollToForm = () => {
    const el = document.getElementById('quote') || document.getElementById('cta-form');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <footer className="theme-keep-dark bg-navy">
      {/* Gold top accent line */}
      <div className="line-gold w-full" />

      <div className="max-w-7xl mx-auto px-8 py-[32px] lg:py-12 grid grid-cols-2 lg:grid-cols-5 gap-[18px] lg:gap-8">
        {/* Brand col. Text lockup, NOT the logo image: the light-variant logo
            has navy lettering that disappears on the navy footer (live builds
            showed only the mark + gold sub-line, which read as broken). */}
        <div className="lg:col-span-1">
          <Link to="/" className="inline-flex flex-col mb-3">
            <span className="font-heading font-bold theme-keep-white text-white text-[17px] uppercase tracking-wide leading-none">
              {brandDNA.company.name.split(' ')[0]}
            </span>
            {brandDNA.company.name.split(' ').length > 1 && (
              <span className="font-heading font-semibold text-gold text-[10px] uppercase tracking-[0.25em] leading-none mt-[5px]">
                {brandDNA.company.name.split(' ').slice(1).join(' ')}
              </span>
            )}
          </Link>
          <p className="text-steel font-body text-[13px] leading-relaxed mb-[10px]">
            {brandDNA.company.tagline}
          </p>
          {/* Social icons. Render ONLY platforms with a non-empty URL set in
              brandDNA.social. Icon stroke uses currentColor so the global
              light-theme override paints them navy on white footer, gold on
              hover. */}
          <div className="flex items-center gap-3">
            {Object.entries(brandDNA.social || {}).map(([platform, url]) => {
              if (!url || !SOCIAL_ICON_MAP[platform]) return null;
              return (
                <a
                  key={platform}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={platform}
                  className="footer-social-icon w-[36px] h-[36px] flex items-center justify-center transition-colors bg-navy-slate"
                  style={{ border: '1px solid rgba(100,116,139,0.25)' }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgb(var(--accent) / 0.15)';
                    e.currentTarget.style.borderColor = 'rgb(var(--accent) / 0.4)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = '';
                    e.currentTarget.style.borderColor = 'rgba(100,116,139,0.25)';
                  }}
                >
                  <svg className="w-[16px] h-[16px]" viewBox="0 0 24 24" fill="currentColor">
                    <path d={SOCIAL_ICON_MAP[platform]} />
                  </svg>
                </a>
              );
            })}
          </div>
        </div>

        {/* Services links */}
        <div>
          <h4 className="font-heading font-bold text-white uppercase text-sm tracking-wider mb-[10px]">SERVICES</h4>
          <ul className="flex flex-col gap-[6px]">
            {serviceLinks.map((link) => (
              <li key={link.label}>
                <Link to={link.to} className="text-steel font-body text-[13px] hover:text-white transition-colors flex items-center gap-1.5">
                  <span className="text-gold">+</span> {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Service Areas links, every city the brand covers, linked to
            /service-area/<slug>. Sourced from brandDNA.serviceAreas (canonical
            12-city list). */}
        <div>
          <h4 className="font-heading font-bold text-white uppercase text-sm tracking-wider mb-[10px]">SERVICE AREAS</h4>
          <ul className="flex flex-col gap-[6px]">
            {(brandDNA.serviceAreas || []).slice(0, 12).map((city) => (
              <li key={city}>
                <Link
                  to={`/service-area/${slugify(city)}`}
                  className="text-steel font-body text-[13px] hover:text-white transition-colors flex items-center gap-1.5"
                >
                  <span className="text-gold">+</span> {city}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Company links */}
        <div>
          <h4 className="font-heading font-bold text-white uppercase text-sm tracking-wider mb-[10px]">COMPANY</h4>
          <ul className="flex flex-col gap-[6px]">
            {companyLinks.map((link) => (
              <li key={link.label}>
                <Link to={link.to} className="text-steel font-body text-[13px] hover:text-white transition-colors flex items-center gap-1.5">
                  <span className="text-gold">+</span> {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Contact + CTA */}
        <div className="col-span-2 lg:col-span-1">
          <h4 className="font-heading font-bold text-white uppercase text-sm tracking-wider mb-[10px]">GET IN TOUCH</h4>
          <div className="flex flex-col gap-[10px] mb-[14px]">
            <div className="flex items-start gap-2">
              <LocationIcon />
              <div className="text-steel font-body text-[13px] leading-relaxed">
                {brandDNA.address.full}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <PhoneIcon />
              <a href={`tel:${brandDNA.contact.phoneTelLink}`} className="text-cool font-body text-xs hover:text-white transition-colors">
                {brandDNA.contact.phone}
              </a>
            </div>
            <div className="flex items-center gap-2">
              <MailIcon />
              <a href={`mailto:${brandDNA.contact.email}`} className="text-cool font-body text-xs hover:text-white transition-colors">
                {brandDNA.contact.email}
              </a>
            </div>
          </div>
          {brandDNA.copy.footerCta && (
            <p className="font-heading font-bold text-white text-sm uppercase tracking-wide mb-3">
              {brandDNA.copy.footerCta}
            </p>
          )}
          <button
            onClick={scrollToForm}
            className="btn-gold inline-block font-heading font-bold text-[13px] uppercase px-[18px] py-[11px] tracking-widest text-navy"
          >
            {brandDNA.copy.buttonText}
          </button>
        </div>
      </div>

      {/* Trust stack row */}
      <div className="border-t px-8 py-[14px]" style={{ borderColor: 'rgba(100,116,139,0.15)' }}>
        <div className="max-w-7xl mx-auto flex items-center justify-center gap-x-[22px] gap-y-[8px] sm:gap-x-[36px] flex-wrap">
          <div className="flex items-center gap-2">
            <svg className="w-[16px] h-[16px]" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            <span className="text-steel font-body text-[13px]">{brandDNA.reviews.googleStat}</span>
          </div>
          <div className="flex items-center gap-2">
            <svg className="w-[16px] h-[16px]" viewBox="0 0 24 24" fill="#1877F2">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
            </svg>
            <span className="text-steel font-body text-[13px]">{brandDNA.reviews.facebookStat}</span>
          </div>
          <div className="flex items-center gap-2">
            <svg className="w-[16px] h-[16px]" fill="none" viewBox="0 0 24 24" stroke="rgb(var(--accent))" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.955 11.955 0 003 10c0 5.592 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.25-8.25-3.286z" />
            </svg>
            <span className="text-steel font-body text-[13px]">License #{brandDNA.company.licenseNumber}</span>
          </div>
        </div>
      </div>

      {/* Copyright bar */}
      <div className="py-3 px-8 bg-navy-dark">
        <div className="max-w-7xl mx-auto flex items-center justify-between flex-wrap gap-2">
          <p className="text-steel font-body text-[13px]">
            {brandDNA.copy.copyright}
          </p>
          <p className="text-steel font-body text-[13px]">
            Designed with love by <span className="text-gold">{brandDNA.credit.agency}</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
