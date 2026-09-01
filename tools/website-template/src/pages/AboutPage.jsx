import { Link } from 'react-router-dom';
import Founder from '../components/Founder';
import TrustStrip from '../components/TrustStrip';
import CTABanner from '../components/CTABanner';
import Ticker from '../components/Ticker';
import CornerOverlay from '../components/CornerOverlay';
import { brandDNA } from '../config/brand-dna';

const aboutCopy = (brandDNA.pages && brandDNA.pages.about) || {};
const founderCopy = (brandDNA.copy && brandDNA.copy.founder) || {};

// Stats render from brandDNA.pages.about.stats[] when populated. Otherwise we
// emit nothing — no baked-in numbers.
const stats = aboutCopy.stats || [];

// Values render from brandDNA.pages.about.values[] when populated. Each entry
// expects { title, text, iconPath? }. We render a generic shield icon when no
// iconPath is supplied so the layout still works niche-agnostic.
const values = aboutCopy.values || [];

const defaultValueIcon = (
  <svg className="w-6 h-6" style={{ color: '#0F172A' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.955 11.955 0 003 10c0 5.592 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.25-8.25-3.286z" />
  </svg>
);

const renderValueIcon = (v) => {
  if (v && v.iconPath) {
    return (
      <svg className="w-6 h-6" style={{ color: '#0F172A' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={v.iconPath} />
      </svg>
    );
  }
  return defaultValueIcon;
};

const firstProjectPath = () => {
  const p = (brandDNA.previous_projects || [])[0];
  return p && p.filename ? `/work/${p.filename}` : null;
};

export default function AboutPage() {
  const heroHeadline = aboutCopy.heroHeadline || '';
  const heroLabel = aboutCopy.heroLabel || founderCopy.label || 'ABOUT US';
  const founder = (brandDNA.team && brandDNA.team.founder) || {};
  const founderFirst = founder.name ? founder.name.split(' ')[0] : 'our team';
  const fallbackProject = firstProjectPath();

  return (
    <>
      {/* Page Hero */}
      <section
        className="relative overflow-hidden flex flex-col justify-end bg-navy theme-keep-dark"
        style={{ minHeight: '52vh' }}
      >
        <div className="absolute inset-0 w-full h-full" style={{ zIndex: 1 }}>
          <img
            src="/hero-image.webp"
            alt={`${brandDNA.company.name} team`}
            className="w-full h-full object-cover"
            style={{ objectPosition: '50% 30%' }}
            onError={(e) => { if (fallbackProject) { e.target.src = fallbackProject; } else { e.target.style.display = 'none'; } }}
          />
          <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, rgba(15,23,42,0.55) 0%, rgba(15,23,42,0.88) 100%)' }} />
        </div>
        <div className="relative px-8 py-14 max-w-7xl mx-auto w-full" style={{ zIndex: 5 }}>
          <div className="flex items-center gap-2 text-cool text-xs font-semibold uppercase tracking-widest mb-4">
            <Link to="/" className="hover:text-white transition-colors">Home</Link>
            <span className="text-gold">›</span>
            <span className="text-white">About Us</span>
          </div>
          {heroLabel && (
            <p className="text-gold font-body font-semibold text-xs uppercase tracking-[0.2em] mb-3">{heroLabel}</p>
          )}
          {heroHeadline && (
            <h1 className="font-heading font-bold text-white uppercase leading-none text-5xl lg:text-6xl mb-4 whitespace-pre-line">
              {heroHeadline}
            </h1>
          )}
          <span className="line-gold block w-16 mb-4" />
          {brandDNA.company.description && (
            <p className="text-white text-sm max-w-xl leading-relaxed font-body" style={{ textShadow: '0 1px 2px rgba(15, 23, 42, 0.6)' }}>
              {brandDNA.company.description}
            </p>
          )}
        </div>
      </section>

      <TrustStrip />

      {/* Stats Strip. Uses .stats-card-value class so the metallic-silver
          number gradient (invisible on white) flips to solid navy in light
          mode. The class lives in index.css. */}
      {stats.length > 0 && (
        <section className="py-10 bg-navy-slate" style={{ borderBottom: '1px solid rgba(100,116,139,0.2)' }}>
          <div className="max-w-7xl mx-auto px-8">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {stats.map((s) => (
                <div key={s.label} className="card-elevated-dark flex flex-col items-center text-center gap-2 p-5 bg-navy" style={{ border: '1px solid rgba(100,116,139,0.25)' }}>
                  <div className="stats-card-value font-heading font-bold text-3xl leading-none">{s.value}</div>
                  <div className="text-cool text-xs uppercase tracking-wide font-semibold leading-tight">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Our Story */}
      <section className="relative overflow-hidden bg-grid bg-navy">
        {/* Rule 58: per-client corner overlays. */}
        <CornerOverlay position="top-left" size={320} />
        <CornerOverlay position="bottom-right" size={320} />

        <div className="relative grid grid-cols-1 lg:grid-cols-2">
          {/* Left: content */}
          <div className="relative px-8 lg:pl-16 lg:pr-8 py-16">
            {aboutCopy.storyLabel && (
              <p className="text-gold font-body font-semibold text-xs uppercase tracking-[0.2em] mb-3">{aboutCopy.storyLabel}</p>
            )}
            {aboutCopy.storyHeading && (
              <h2 className="font-heading font-bold text-white uppercase leading-none text-5xl mb-5 whitespace-pre-line">
                {aboutCopy.storyHeading}
              </h2>
            )}
            <span className="line-gold block w-12 mb-5" />
            <div className="flex flex-col gap-4 text-cool text-sm leading-relaxed max-w-lg">
              {founderCopy.para1 && <p>{founderCopy.para1}</p>}
              {founderCopy.para2 && <p>{founderCopy.para2}</p>}
              {aboutCopy.storyClosing && <p>{aboutCopy.storyClosing}</p>}
            </div>
            <div className="flex flex-wrap gap-3 mt-7">
              <Link to="/contact" className="btn-gold font-heading font-bold text-sm uppercase px-6 py-3 tracking-widest text-navy">
                {brandDNA.copy.buttonText}
              </Link>
              {aboutCopy.secondaryButton && (
                <Link to="/gallery" className="btn-outline font-heading font-bold text-sm uppercase px-6 py-3 tracking-wider">
                  {aboutCopy.secondaryButton}
                </Link>
              )}
            </div>
          </div>

          {/* Right: full-bleed image */}
          <div className="hidden lg:block relative overflow-hidden" style={{ minHeight: 560 }}>
            <img
              src="/owner.webp"
              alt={founder.name ? `${founder.name}, Founder of ${brandDNA.company.name}` : `${brandDNA.company.name} founder`}
              className="absolute inset-0 w-full h-full object-cover"
              style={{ objectPosition: '50% 15%' }}
              onError={(e) => { if (fallbackProject) { e.target.src = fallbackProject; } else { e.target.style.display = 'none'; } }}
            />
            <div className="absolute inset-y-0 left-0 w-44" style={{ background: 'linear-gradient(to right, #0F172A, transparent)' }} />
            <div className="absolute bottom-0 left-0 right-0 px-8 py-4" style={{ background: 'linear-gradient(to top, rgba(15,23,42,0.95) 0%, transparent 100%)' }}>
              {founder.displayName && (
                <div className="font-heading font-bold text-white text-lg uppercase">{founder.displayName}</div>
              )}
              {founder.title && (
                <div className="text-gold text-xs">{founder.title}</div>
              )}
            </div>
          </div>
        </div>

        {/* Mobile image */}
        <div className="lg:hidden relative h-64 overflow-hidden">
          <img
            src="/owner.webp"
            alt={founder.name ? `${founder.name}, Founder of ${brandDNA.company.name}` : `${brandDNA.company.name} founder`}
            className="w-full h-full object-cover"
            style={{ objectPosition: '50% 15%' }}
            onError={(e) => { if (fallbackProject) { e.target.src = fallbackProject; } else { e.target.style.display = 'none'; } }}
          />
          <div className="absolute inset-x-0 bottom-0 h-24" style={{ background: 'linear-gradient(to top, #0F172A, transparent)' }} />
        </div>
      </section>

      {/* Founder / Vision + Mission */}
      <Founder />

      {/* Meet the Team — only renders when team_group_photo or team_members
          are populated. Avoids a lonely empty section for clients with no
          team imagery. */}
      {(brandDNA.team_group_photo || (brandDNA.team_members && brandDNA.team_members.length > 0)) && (
        <section className="relative py-20 overflow-hidden bg-grid bg-navy">
          <div className="relative max-w-6xl mx-auto px-8">
            <div className="text-center mb-10">
              {aboutCopy.crewLabel && (
                <p className="text-gold font-body font-semibold text-xs uppercase tracking-[0.2em] mb-3">{aboutCopy.crewLabel}</p>
              )}
              {aboutCopy.crewHeading && (
                <h2 className="font-heading font-bold text-white uppercase text-5xl leading-tight mb-3">
                  {aboutCopy.crewHeading}
                </h2>
              )}
              <span className="line-gold block w-12 mx-auto mt-3 mb-6" />
              {aboutCopy.crewBody && (
                <p className="text-cool text-sm max-w-xl mx-auto leading-relaxed">
                  {aboutCopy.crewBody}
                </p>
              )}
            </div>
            {brandDNA.team_group_photo && (
              <div className="relative overflow-hidden mb-8" style={{ boxShadow: '0 24px 64px rgba(0,0,0,0.45)' }}>
                <img
                  src={`/team/${brandDNA.team_group_photo}`}
                  alt={`The ${brandDNA.company.name} team`}
                  className="w-full h-auto object-cover"
                  style={{ maxHeight: 520 }}
                  onError={(e) => { e.target.style.display = 'none'; }}
                />
                {aboutCopy.crewCaption && (
                  <div className="absolute inset-x-0 bottom-0 px-6 py-4" style={{ background: 'linear-gradient(to top, rgba(15,23,42,0.95), transparent)' }}>
                    <p className="font-heading font-bold text-white text-lg uppercase tracking-wider">
                      {aboutCopy.crewCaption}
                    </p>
                  </div>
                )}
              </div>
            )}
            {brandDNA.team_members && brandDNA.team_members.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {brandDNA.team_members.map((m, i) => (
                  <div key={`${m.name || m.filename || i}`} className="card-elevated-dark p-4 bg-navy text-center" style={{ border: '1px solid rgba(100,116,139,0.25)' }}>
                    {m.filename && (
                      <img
                        src={`/team/${m.filename}`}
                        alt={m.name || 'Team member'}
                        className="w-24 h-24 object-cover mx-auto mb-3"
                        onError={(e) => { e.target.style.display = 'none'; }}
                      />
                    )}
                    {m.name && (
                      <div className="font-heading font-bold text-white text-sm uppercase tracking-wide">{m.name}</div>
                    )}
                    {m.role && (
                      <div className="text-cool text-xs mt-1">{m.role}</div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      {/* Core Values */}
      {values.length > 0 && (
        <section className="relative py-20 overflow-hidden bg-grid bg-navy-slate">
          {/* Rule 58: per-client corner overlays. */}
          <CornerOverlay position="top-left" size={320} />
          <CornerOverlay position="bottom-right" size={320} />

          <div className="relative max-w-5xl mx-auto px-8 text-center">
            {aboutCopy.valuesLabel && (
              <p className="text-gold font-body font-semibold text-xs uppercase tracking-[0.2em] mb-3">{aboutCopy.valuesLabel}</p>
            )}
            {aboutCopy.valuesHeading && (
              <h2 className="font-heading font-bold text-white uppercase text-5xl leading-tight mb-3">
                {aboutCopy.valuesHeading}
              </h2>
            )}
            <span className="line-gold block w-12 mx-auto mt-3 mb-10" />
            {aboutCopy.valuesIntro && (
              <p className="text-cool text-sm mb-10 max-w-xl mx-auto leading-relaxed">
                {aboutCopy.valuesIntro.replace('{{founderFirst}}', founderFirst)}
              </p>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              {values.map((v) => (
                <div
                  key={v.title}
                  className="card-elevated-dark flex flex-col items-center text-center py-8 px-6 gap-4 bg-navy"
                  style={{ border: '1px solid rgba(100,116,139,0.25)', borderTop: '2px solid rgb(var(--accent))' }}
                >
                  <div className="w-12 h-12 flex items-center justify-center flex-shrink-0" style={{ background: 'linear-gradient(135deg, rgb(var(--accent-light)) 0%, rgb(var(--accent)) 40%, rgb(var(--accent-dark)) 65%, rgb(var(--accent-light)) 100%)' }}>
                    {renderValueIcon(v)}
                  </div>
                  <div className="font-heading font-bold text-white uppercase tracking-wider text-base">{v.title}</div>
                  <p className="text-cool text-xs leading-relaxed">{v.text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      <Ticker />
      <CTABanner />
    </>
  );
}
