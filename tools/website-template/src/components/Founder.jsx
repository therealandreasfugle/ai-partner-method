import { useState } from 'react';
import { brandDNA } from '../config/brand-dna';

// Right-column photo fallback chain (per 09-build.md Rule 19 + brief A8):
//   1. /owner.webp (the single-owner portrait, when present)
//   2. /team/{team_group_photo} (the team group photo, when present)
//   3. nothing, right column hides cleanly via the photoOk gate
//
// The build script writes only ONE of these per client. When the owner photo
// is missing, copy_assets() leaves /owner.webp absent and the onError flips
// photoOk false; the team-group fallback below picks up the slack.
export default function Founder() {
  const [photoOk, setPhotoOk] = useState(true);
  const [fallbackOk, setFallbackOk] = useState(Boolean(brandDNA.team_group_photo));
  const teamPhotoUrl = brandDNA.team_group_photo
    ? `/team/${brandDNA.team_group_photo}`
    : null;
  const showOwner = photoOk;
  const showTeamFallback = !photoOk && teamPhotoUrl && fallbackOk;
  const captionCity = brandDNA.address?.city || '';
  return (
    <section id="about" className="relative overflow-hidden bg-grid bg-navy">

      {/* Thin gold top line */}
      <div className="line-gold w-full" />

      {/* ── Meet the Founders ── */}
      <div className="relative max-w-7xl mx-auto px-8 pt-16 pb-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

        {/* Left: text */}
        <div>
          <p className="text-gold font-body font-semibold text-xs uppercase tracking-[0.2em] mb-4">
            {brandDNA.copy.founder.label}
          </p>
          <h2 className="font-heading font-bold text-white uppercase leading-none mb-0" style={{ fontSize: 'clamp(36px, 4vw, 54px)' }}>
            {brandDNA.copy.founder.heading}
          </h2>
          <span className="line-gold block w-12 my-5" />
          <p className="text-cool font-body text-sm leading-relaxed mb-4">
            {brandDNA.copy.founder.para1}
          </p>
          <p className="text-cool font-body text-sm leading-relaxed mb-7">
            {brandDNA.copy.founder.para2}
          </p>
          <button
            className="btn-outline font-heading font-bold text-sm uppercase px-6 py-3 tracking-wider text-white"
            style={{ border: '1px solid #C0C6CF', background: 'transparent' }}
          >
            LEARN MORE ABOUT US →
          </button>
        </div>

        {/* Right: founder photo with overlays. When owner.webp is absent the
            build deletes it cleanly and we fall through to the team group
            photo as the visible person-anchor (Rule 36 + brief A8). */}
        {(showOwner || showTeamFallback) && (
        <div className="relative">
          <div className="relative" style={{ maxWidth: 480 }}>

            {/* Owner photo. object-position: center 25% so the face lands in
                the upper third regardless of where the source crop placed the
                head. Height capped at 480px so a tall portrait isn't
                elongated. */}
            <div className="overflow-hidden">
              {showOwner ? (
                <img
                  src="/owner.webp"
                  alt={`${brandDNA.team.founder.name}, Founder of ${brandDNA.company.name}`}
                  className="w-full object-cover"
                  style={{ height: 480, objectPosition: 'center 25%', display: 'block', boxShadow: '0 24px 64px rgba(0,0,0,0.55), 0 6px 20px rgba(0,0,0,0.3)' }}
                  onError={() => setPhotoOk(false)}
                />
              ) : (
                <img
                  src={teamPhotoUrl}
                  alt={`${brandDNA.company.name} crew in ${captionCity || 'the field'}`}
                  className="w-full object-cover"
                  style={{ height: 480, objectPosition: 'center 35%', display: 'block', boxShadow: '0 24px 64px rgba(0,0,0,0.55), 0 6px 20px rgba(0,0,0,0.3)' }}
                  onError={() => setFallbackOk(false)}
                />
              )}
            </div>

            {/* Caption strip. When falling through to the team photo, the
                caption reads as a crew anchor instead of the founder's name. */}
            <div className="px-5 py-3 bg-navy-slate">
              {showOwner ? (
                <>
                  <div className="font-heading font-bold text-white text-base uppercase">{brandDNA.team.founder.displayName}</div>
                  <div className="font-body text-cool text-xs">{brandDNA.team.founder.title}</div>
                </>
              ) : (
                <>
                  <div className="font-heading font-bold text-white text-base uppercase">{`OUR ${captionCity ? captionCity.toUpperCase() + ' ' : ''}CREW`}</div>
                  <div className="font-body text-cool text-xs">Local, owner-led, accountable on every job.</div>
                </>
              )}
            </div>

            {/* Floating stat card, partially overlaps bottom-left corner of photo */}
            <div
              className="text-navy"
              style={{
                position: 'absolute',
                bottom: 18,
                left: 18,
                background: 'linear-gradient(135deg, rgb(var(--accent-light)) 0%, rgb(var(--accent)) 40%, rgb(var(--accent-dark)) 65%, rgb(var(--accent-light)) 100%)',
                padding: '16px 22px',
                boxShadow: '0 12px 36px rgba(0,0,0,0.55), 0 3px 10px rgba(0,0,0,0.35)',
                zIndex: 10,
              }}
            >
              <div className="font-heading font-bold leading-none" style={{ fontSize: 40 }}>{brandDNA.team.founder.yearsExp}</div>
              <div className="font-body text-[10px] uppercase tracking-wider leading-tight mt-1.5" style={{ color: 'rgba(15,23,42,0.8)' }}>
                {brandDNA.team.founder.expLabel}
              </div>
            </div>

          </div>
        </div>
        )}
      </div>

      {/* ── Vision & Mission ── */}
      <div className="relative max-w-6xl mx-auto px-8 pb-16 grid grid-cols-1 md:grid-cols-2 gap-5">

        {/* Vision card */}
        <div
          className="vision-mission-card overflow-hidden p-6"
        >
          <div className="flex items-center gap-3 mb-4">
            <div
              className="w-9 h-9 flex items-center justify-center flex-shrink-0"
              style={{ background: 'rgb(var(--accent) / 0.1)', border: '1px solid rgb(var(--accent) / 0.3)' }}
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="rgb(var(--accent))" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <span className="font-heading font-bold text-white uppercase tracking-wider text-sm">{brandDNA.copy.founder.visionLabel}</span>
            <div className="flex-1 h-px" style={{ background: 'rgb(var(--accent) / 0.2)' }} />
          </div>
          <p className="text-cool font-body text-sm leading-relaxed">
            {brandDNA.copy.founder.vision}
          </p>
        </div>

        {/* Mission card */}
        <div
          className="vision-mission-card overflow-hidden p-6"
        >
          <div className="flex items-center gap-3 mb-4">
            <div
              className="w-9 h-9 flex items-center justify-center flex-shrink-0"
              style={{ background: 'rgb(var(--accent) / 0.1)', border: '1px solid rgb(var(--accent) / 0.3)' }}
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="rgb(var(--accent))" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" />
              </svg>
            </div>
            <span className="font-heading font-bold text-white uppercase tracking-wider text-sm">{brandDNA.copy.founder.missionLabel}</span>
            <div className="flex-1 h-px" style={{ background: 'rgb(var(--accent) / 0.2)' }} />
          </div>
          <p className="text-cool font-body text-sm leading-relaxed">
            {brandDNA.copy.founder.mission}
          </p>
        </div>

      </div>

    </section>
  );
}
