import { brandDNA } from '../config/brand-dna';
import { motion, useReducedMotion } from 'framer-motion';
import BackgroundPattern from './BackgroundPattern';
import HeroForm from './HeroForm';

/**
 * Hero, archetype switch.
 *
 * brandDNA.layout.hero picks the composition. All three share the same photo,
 * overlay, copy, rating pills, and HeroForm, so the conversion path is constant
 * and only the arrangement changes:
 *   split-form       text left, lead form right. Bold, direct. (default)
 *   full-bleed       centered headline over the photo, form centered below.
 *   editorial-split  airy editorial headline left, form right, lighter overlay.
 *
 * Entrance motion is gated on prefers-reduced-motion. The LCP photo is eager +
 * high priority and never animated.
 */

const glassPill = {
  background: 'rgba(255,255,255,0.09)',
  border: '1px solid rgba(255,255,255,0.16)',
  backdropFilter: 'blur(10px)',
  WebkitBackdropFilter: 'blur(10px)',
};

function HeroFade({ children, delay = 0, className = '' }) {
  const reduce = useReducedMotion();
  if (reduce) return <div className={className}>{children}</div>;
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1], delay }}
      style={{ willChange: 'transform, opacity' }}
    >
      {children}
    </motion.div>
  );
}

function HeroBackground({ position = '50% 30%', overlayTop = 0.55, overlayMid = 0.45, overlayBottom = 0.75 }) {
  return (
    <div className="absolute inset-0 w-full h-full" style={{ zIndex: 1 }}>
      <picture>
        <source media="(max-width: 768px)" srcSet="/hero-image-mobile.webp" type="image/webp" />
        <source srcSet="/hero-image.webp" type="image/webp" />
        <img
          src="/hero-image.webp"
          alt={brandDNA.copy?.hero?.imageAlt || `${brandDNA.company.name}, ${brandDNA.address.city}`}
          className="w-full h-full object-cover"
          style={{ objectPosition: position }}
          loading="eager"
          fetchPriority="high"
          onError={(e) => { e.target.style.display = 'none'; }}
        />
      </picture>
      <div
        className="absolute inset-0"
        style={{ background: `linear-gradient(to bottom, rgba(15,23,42,${overlayTop}) 0%, rgba(15,23,42,${overlayMid}) 50%, rgba(15,23,42,${overlayBottom}) 100%)` }}
      />
    </div>
  );
}

function Eyebrow({ align = 'left' }) {
  return (
    <p className={`eyebrow text-gold font-body text-xs mb-4 ${align === 'center' ? 'text-center' : ''}`}>
      {brandDNA.copy.hero.eyebrow}
    </p>
  );
}

function Headline({ fontSize, upper = true, align = 'left' }) {
  return (
    <h1
      className={`font-heading font-bold text-white leading-none mb-0 ${upper ? 'uppercase' : ''} ${align === 'center' ? 'text-center' : ''}`}
      style={{ fontSize, textShadow: '0 1px 2px rgba(15, 23, 42, 0.6)' }}
    >
      {brandDNA.copy.hero.headline}
    </h1>
  );
}

function Subhead({ align = 'left', maxW = 'max-w-sm' }) {
  return (
    <p
      className={`text-sm font-body leading-relaxed mb-6 ${maxW} ${align === 'center' ? 'mx-auto text-center' : ''}`}
      style={{ color: '#FFFFFF', textShadow: '0 1px 2px rgba(15, 23, 42, 0.6)' }}
    >
      {brandDNA.copy.hero.subheadline}
    </p>
  );
}

function RatingPills({ align = 'left' }) {
  // Mobile: 2-up grid so both pills share one row (stacked pills ate ~120px
  // of the first screen). Desktop keeps the inline flex row.
  return (
    <div className={`grid grid-cols-2 gap-[8px] mb-6 max-w-[400px] lg:max-w-none lg:flex lg:items-center lg:gap-2 lg:flex-wrap ${align === 'center' ? 'mx-auto lg:mx-0 lg:justify-center' : 'lg:justify-start'}`}>
      <a href={brandDNA.contact.googleMapsUrl} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center lg:justify-start gap-[6px] lg:gap-1.5 px-[8px] py-[8px] lg:px-3 lg:py-1.5 transition-all hover:border-gold" style={glassPill}>
        <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24">
          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
        </svg>
        <div>
          <div className="flex items-center gap-1">
            <span className="font-bold text-xs text-white">{brandDNA.reviews.rating.toFixed(1)}</span>
            <div className="flex text-yellow-400 text-xs leading-none">&#9733;&#9733;&#9733;&#9733;&#9733;</div>
            <span className="text-white/50 text-[10px]">({brandDNA.reviews.googleCount})</span>
          </div>
          <div className="text-[10px] text-white/55 leading-none">{brandDNA.reviews.googleLabel}</div>
        </div>
      </a>
      <a href={brandDNA.social.facebook} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center lg:justify-start gap-[6px] lg:gap-1.5 px-[8px] py-[8px] lg:px-3 lg:py-1.5 transition-all hover:border-gold" style={glassPill}>
        <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24" fill="#1877F2">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
        </svg>
        <div>
          <div className="flex items-center gap-1">
            <span className="font-bold text-xs text-white">{brandDNA.reviews.rating.toFixed(1)}</span>
            <div className="flex text-yellow-400 text-xs leading-none">&#9733;&#9733;&#9733;&#9733;&#9733;</div>
            <span className="text-white/50 text-[10px]">({brandDNA.reviews.facebookCount})</span>
          </div>
          <div className="text-[10px] text-white/55 leading-none">{brandDNA.reviews.facebookLabel}</div>
        </div>
      </a>
    </div>
  );
}

function TrustChips() {
  return (
    <div className="flex flex-col gap-2">
      {brandDNA.copy.heroTrustChips.map((claim) => (
        <div key={claim} className="flex items-center gap-2">
          <div className="w-[18px] h-[18px] flex items-center justify-center flex-shrink-0 theme-keep-dark bg-navy-slate" style={{ border: '1px solid rgba(100,116,139,0.5)' }}>
            <svg className="w-[11px] h-[11px] text-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <span className="text-white/80 text-sm font-body font-semibold">{claim}</span>
        </div>
      ))}
    </div>
  );
}

const SECTION_CLASS = 'hero-section relative overflow-hidden flex flex-col bg-navy theme-keep-dark';

function HeroSplitForm() {
  return (
    <section id="hero" className={SECTION_CLASS}>
      <BackgroundPattern motif={brandDNA.shape_motif} opacity={0.3} color="white" />
      <HeroBackground />
      <div className="relative flex flex-col lg:flex-row flex-1 max-w-7xl mx-auto w-full px-4 sm:px-8 pt-24 pb-10 lg:pt-0 lg:items-center lg:gap-14" style={{ zIndex: 5 }}>
        <HeroFade className="text-left lg:flex-1 lg:py-20" delay={0.05}>
          <Eyebrow />
          <Headline fontSize="clamp(33px, 5vw, 76px)" />
          <span className="line-gold block w-16 mt-4 mb-5" />
          <Subhead />
          <RatingPills />
          <TrustChips />
        </HeroFade>
        <HeroFade className="mt-8 lg:mt-0 lg:w-[420px] lg:flex-shrink-0 lg:py-16" delay={0.18}>
          <HeroForm />
        </HeroFade>
      </div>
    </section>
  );
}

function HeroFullBleed() {
  return (
    <section id="hero" className={SECTION_CLASS}>
      <BackgroundPattern motif={brandDNA.shape_motif} opacity={0.28} color="white" />
      <HeroBackground position="50% 42%" overlayTop={0.5} overlayMid={0.42} overlayBottom={0.82} />
      <div className="relative flex-1 flex flex-col items-center justify-center text-center max-w-3xl mx-auto w-full px-4 sm:px-8 pt-28 pb-12" style={{ zIndex: 5 }}>
        <HeroFade delay={0.05}>
          <Eyebrow align="center" />
          <Headline fontSize="clamp(36px, 6vw, 84px)" align="center" />
          <span className="line-gold block w-16 mx-auto mt-5 mb-6" />
          <Subhead align="center" maxW="max-w-md" />
          <RatingPills align="center" />
        </HeroFade>
        <HeroFade className="w-full max-w-lg mt-8" delay={0.18}>
          <HeroForm />
        </HeroFade>
      </div>
    </section>
  );
}

function HeroEditorialSplit() {
  return (
    <section id="hero" className={SECTION_CLASS}>
      <BackgroundPattern motif={brandDNA.shape_motif} opacity={0.26} color="white" />
      <HeroBackground position="50% 35%" overlayTop={0.48} overlayMid={0.4} overlayBottom={0.72} />
      <div className="relative flex flex-col lg:flex-row flex-1 max-w-7xl mx-auto w-full px-4 sm:px-8 pt-24 pb-10 lg:pt-0 lg:items-center lg:gap-16" style={{ zIndex: 5 }}>
        <HeroFade className="text-left lg:flex-1 lg:py-24" delay={0.05}>
          <Eyebrow />
          <Headline fontSize="clamp(42px, 5.6vw, 82px)" upper={false} />
          <span className="line-gold block w-20 mt-6 mb-6" />
          <Subhead maxW="max-w-md" />
          <RatingPills />
        </HeroFade>
        <HeroFade className="mt-8 lg:mt-0 lg:w-[440px] lg:flex-shrink-0 lg:py-16" delay={0.18}>
          <HeroForm />
        </HeroFade>
      </div>
    </section>
  );
}

export default function Hero() {
  const variant = brandDNA.layout?.hero || 'split-form';
  if (variant === 'full-bleed') return <HeroFullBleed />;
  if (variant === 'editorial-split') return <HeroEditorialSplit />;
  return <HeroSplitForm />;
}
