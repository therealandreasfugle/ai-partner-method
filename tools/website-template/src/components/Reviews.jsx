import { useState, useEffect } from 'react';
import Ticker from './Ticker';
import { brandDNA } from '../config/brand-dna';
import CornerOverlay from './CornerOverlay';

const Stars = () => (
  <div className="flex gap-0.5 text-yellow-400">
    {[1,2,3,4,5].map(i => <span key={i} className="text-sm">&#9733;</span>)}
  </div>
);

const GoogleIcon = () => (
  <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
  </svg>
);

const FacebookIcon = () => (
  <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24" fill="#1877F2">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
  </svg>
);

// Source-string -> platform icon resolver. New review shape uses lowercase
// keys ("google" | "facebook") per 05-copy-deck.md Rule 2; legacy capitalised
// labels ("Google Reviews" | "Facebook Reviews") are still tolerated so older
// per-client brand-dna files don't crash on render.
function sourceLabel(src) {
  if (!src) return 'Google';
  const s = String(src).toLowerCase();
  if (s.includes('facebook')) return 'Facebook';
  return 'Google';
}

function ReviewCard({ review }) {
  const name = review.author || review.name || 'Verified Customer';
  const isFacebook = sourceLabel(review.source) === 'Facebook';
  return (
    <div className="card-elevated-dark border border-steel/25 h-full flex flex-col bg-navy-slate">
      <div className="flex items-center justify-between mb-3 p-6 pb-0">
        <div className="flex items-center gap-2">
          {isFacebook ? <FacebookIcon /> : <GoogleIcon />}
          <Stars />
          <span className="font-body font-bold text-sm text-white">{(review.rating || brandDNA.reviews.rating).toFixed ? (review.rating || brandDNA.reviews.rating).toFixed(1) : brandDNA.reviews.rating.toFixed(1)}</span>
        </div>
        <div className="font-serif text-gold leading-none" style={{ fontSize: 52, opacity: 0.35 }}>"</div>
      </div>
      <p className="text-cool font-body text-sm leading-relaxed mb-5 italic flex-1 px-6">"{review.text}"</p>
      <div className="flex items-center gap-3 pt-4 border-t border-steel/25 px-6 pb-6">
        {/* Rule 59: avatar tile initial renders pure white with a subtle
            black-soft drop-shadow so the letter stays crisp on the per-client
            accent gradient (green, gold, copper, amber, etc.). Default navy
            text-fill vanished on accent-tinted gradients. */}
        <div
          className="w-9 h-9 flex items-center justify-center font-heading font-bold text-sm flex-shrink-0"
          style={{
            background: 'linear-gradient(135deg, rgb(var(--accent-light)) 0%, rgb(var(--accent)) 40%, rgb(var(--accent-dark)) 65%, rgb(var(--accent-light)) 100%)',
            color: '#FFFFFF',
            textShadow: '0 1px 2px rgba(0,0,0,0.35)',
          }}
        >
          {name.charAt(0)}
        </div>
        <div>
          <div className="font-heading font-bold text-sm text-white">{name}</div>
          <div className="font-body text-xs text-steel">{isFacebook ? 'Facebook Review' : 'Google Review'}</div>
        </div>
      </div>
    </div>
  );
}

export default function Reviews() {
  const [current, setCurrent] = useState(0);
  const [isDesktop, setIsDesktop] = useState(false);
  const reviews = brandDNA.reviews.items || [];
  if (reviews.length === 0) return null;

  useEffect(() => {
    const check = () => setIsDesktop(window.innerWidth >= 1024);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  const visibleCount = isDesktop ? 3 : 1;
  const maxIndex = reviews.length - visibleCount;

  const prev = () => setCurrent(c => Math.max(0, c - 1));
  const next = () => setCurrent(c => Math.min(maxIndex, c + 1));

  return (
    <section className="relative overflow-hidden bg-navy">

      {/* Rule 58: per-client corner overlays tinted with the accent at low
          opacity. Replaces the legacy hardcoded grey polygons that ignored
          per-client palette. */}
      <CornerOverlay position="top-left" size={320} />
      <CornerOverlay position="bottom-right" size={320} />

      <div className="relative max-w-7xl mx-auto px-8 pt-12">
        <p className="text-gold font-body font-semibold text-xs uppercase tracking-[0.2em] mb-3">{brandDNA.copy.reviews.label}</p>
        <h2 className="font-heading font-bold text-white uppercase leading-none text-5xl">
          {brandDNA.copy.reviews.heading}
        </h2>
        <p className="text-cool font-body text-sm leading-relaxed mt-4 max-w-2xl">
          {brandDNA.copy.reviews.body}
        </p>
      </div>

      {/* Summary statement */}
      <div className="relative max-w-7xl mx-auto px-8 mt-6 mb-2 text-center">
        <p className="text-white font-heading font-bold text-sm uppercase tracking-wider">
          {brandDNA.copy.reviews.summary}
        </p>
      </div>

      {/* Carousel */}
      <div className="relative max-w-7xl mx-auto px-8 mt-5">
        <div className="flex items-center gap-4">

          {/* Prev arrow (desktop; mobile arrows live below the card) */}
          <button
            onClick={prev}
            disabled={current === 0}
            aria-label="Previous reviews"
            className="hidden lg:flex flex-shrink-0 w-10 h-10 items-center justify-center text-cool hover:text-white hover:border-gold disabled:opacity-25 disabled:cursor-default transition-all bg-navy-slate"
            style={{ border: '1px solid rgba(100,116,139,0.4)' }}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          {/* Cards. Desktop: paged 3-up grid. Mobile: native finger-swipe
              snap strip of every review (modern, no buttons needed). */}
          <div className="flex-1">
            <div className="hidden lg:grid lg:grid-cols-3 gap-5">
              {reviews.slice(current, current + 3).map((review, i) => (
                <ReviewCard key={current + i} review={review} />
              ))}
            </div>
            <div className="lg:hidden flex overflow-x-auto snap-x snap-mandatory gap-[12px] pb-[6px] -mx-[16px] px-[16px] carousel-scroll">
              {reviews.map((review, i) => (
                <div key={i} className="w-[85%] max-w-[335px] flex-shrink-0 snap-center">
                  <ReviewCard review={review} />
                </div>
              ))}
            </div>
          </div>

          {/* Next arrow (desktop) */}
          <button
            onClick={next}
            disabled={current >= maxIndex}
            aria-label="Next reviews"
            className="hidden lg:flex flex-shrink-0 w-10 h-10 items-center justify-center text-cool hover:text-white hover:border-gold disabled:opacity-25 disabled:cursor-default transition-all bg-navy-slate"
            style={{ border: '1px solid rgba(100,116,139,0.4)' }}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        {/* Dot indicators */}
        <div className="hidden lg:flex items-center justify-center gap-2 mt-6">
          {Array.from({ length: maxIndex + 1 }).map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              aria-label={`Go to review ${i + 1}`}
              className={`h-2 transition-all duration-200 ${
                i === current ? 'w-5' : 'w-2 hover:opacity-70'
              }`}
              style={{ background: i === current ? 'rgb(var(--accent))' : '#64748B' }}
            />
          ))}
        </div>
      </div>

      {/* See All buttons. Equal width on mobile: two centered ghost buttons
          of different widths read as misaligned when stacked. */}
      <div className="relative max-w-7xl mx-auto px-8 mt-8 mb-10 flex flex-col items-center gap-[10px] lg:flex-row lg:justify-center lg:gap-4">
        <a
          href={brandDNA.contact.googleMapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="w-[268px] lg:w-auto flex items-center justify-center gap-2 px-[16px] py-[11px] lg:px-5 lg:py-2.5 text-xs font-body font-bold uppercase tracking-wider text-cool hover:text-white hover:border-gold transition-colors bg-navy-slate"
          style={{ border: '1px solid rgba(100,116,139,0.4)' }}
        >
          <GoogleIcon />
          See All Google Reviews
        </a>
        <a
          href={brandDNA.social.facebookReviews}
          target="_blank"
          rel="noopener noreferrer"
          className="w-[268px] lg:w-auto flex items-center justify-center gap-2 px-[16px] py-[11px] lg:px-5 lg:py-2.5 text-xs font-body font-bold uppercase tracking-wider text-cool hover:text-white hover:border-gold transition-colors bg-navy-slate"
          style={{ border: '1px solid rgba(100,116,139,0.4)' }}
        >
          <FacebookIcon />
          See All Facebook Reviews
        </a>
      </div>

      <div className="relative mt-0" style={{ zIndex: 1 }}>
        <Ticker />
      </div>
    </section>
  );
}
