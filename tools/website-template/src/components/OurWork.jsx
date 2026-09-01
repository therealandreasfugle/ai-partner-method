import { useState, useRef } from 'react';
import { brandDNA } from '../config/brand-dna';
import CornerOverlay from './CornerOverlay';

const projects = brandDNA.previous_projects.map((p) => ({
  src: `/work/${p.filename}`,
  alt: p.alt,
  type: p.type,
}));

function MediaItem({ project, className, onClick, style }) {
  const videoRef = useRef(null);

  if (project.type === 'video') {
    return (
      <div className={`relative overflow-hidden cursor-pointer ${className}`} style={style} onClick={onClick}>
        <video
          ref={videoRef}
          src={project.src}
          className="w-full h-full object-cover"
          muted
          loop
          playsInline
          autoPlay
        />
      </div>
    );
  }

  return (
    <div className={`overflow-hidden cursor-pointer ${className}`} style={style} onClick={onClick}>
      <img
        src={project.src}
        alt={project.alt}
        className="w-full h-full object-cover"
        onError={(e) => { const el = e.target; el.onerror = null; if (el.parentElement) el.parentElement.style.background = '#1E293B'; el.style.visibility = 'hidden'; el.removeAttribute('src'); }}
      />
    </div>
  );
}

export default function OurWork() {
  const [active, setActive] = useState(0);

  const prev = () => setActive(i => (i - 1 + projects.length) % projects.length);
  const next = () => setActive(i => (i + 1) % projects.length);

  return (
    <section className="relative py-16 overflow-hidden bg-grid bg-navy-slate">

      {/* Rule 58: per-client corner overlays. */}
      <CornerOverlay position="top-left" size={320} />
      <CornerOverlay position="bottom-right" size={320} />

      <div className="relative max-w-5xl mx-auto px-8 text-center mb-8">
        <p className="text-gold font-body font-semibold text-xs uppercase tracking-[0.2em] mb-3">{brandDNA.copy.gallery.label}</p>
        <h2 className="font-heading font-bold text-white uppercase text-4xl leading-tight">
          {brandDNA.copy.gallery.heading}
        </h2>
        <span className="line-gold block w-12 mx-auto my-4" />
        <p className="text-cool font-body text-sm max-w-3xl mx-auto">
          {brandDNA.copy.gallery.body}
        </p>
      </div>

      {/* Carousel */}
      <div className="relative max-w-6xl mx-auto px-[16px] md:px-10 lg:px-12">
        {/* Mobile: finger-swipe strip with snap + a peek of the next photo.
            The old single-card + edge arrows rendered the arrows as half
            off-screen slabs at 390px. Cards need explicit width +
            flex-shrink-0 (min-w % does not cap width in a scroll strip). */}
        <div className="md:hidden flex overflow-x-auto snap-x snap-mandatory gap-[12px] -mx-[16px] px-[16px] pb-[6px] carousel-scroll">
          {projects.map((p, i) => (
            <MediaItem
              key={i}
              project={p}
              className="w-[85%] max-w-[335px] flex-shrink-0 snap-center shadow-2xl"
              style={{ border: '1px solid rgba(100,116,139,0.25)', height: 210 }}
            />
          ))}
        </div>

        {/* Desktop: 3-panel carousel */}
        <div className="hidden md:flex gap-4 items-center justify-center">
          {projects.map((p, i) => {
            const isCenter = i === active;
            const isAdjacent = Math.abs(i - active) === 1;
            if (!isCenter && !isAdjacent) return null;
            return (
              <MediaItem
                key={i}
                project={p}
                className={`transition-all duration-300 flex-shrink-0 ${
                  isCenter ? 'w-[420px] h-[280px] z-10' : 'w-[280px] h-[200px] opacity-50 z-0 scale-95'
                }`}
                style={{
                  boxShadow: isCenter ? '0 20px 50px rgba(0,0,0,0.6), 0 4px 16px rgba(0,0,0,0.4)' : 'none',
                  border: isCenter ? '1px solid rgb(var(--accent) / 0.3)' : '1px solid rgba(100,116,139,0.15)',
                }}
                onClick={() => setActive(i)}
              />
            );
          })}
        </div>

        {/* Prev arrow */}
        <button
          onClick={prev}
          className="absolute left-0 top-1/2 -translate-y-1/2 w-10 h-10 hidden md:flex items-center justify-center text-cool hover:text-white transition-all bg-navy"
          style={{ border: '1px solid rgba(100,116,139,0.35)' }}
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <button
          onClick={next}
          className="absolute right-0 top-1/2 -translate-y-1/2 w-10 h-10 hidden md:flex items-center justify-center text-cool hover:text-white transition-all bg-navy"
          style={{ border: '1px solid rgba(100,116,139,0.35)' }}
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* Dots */}
      <div className="hidden md:flex justify-center gap-[8px] mt-6">
        {projects.map((_, i) => (
          <button
            key={i}
            onClick={() => setActive(i)}
            className="h-[8px] transition-all duration-200"
            style={{
              width: i === active ? 20 : 8,
              background: i === active ? 'rgb(var(--accent))' : '#64748B',
            }}
          />
        ))}
      </div>
    </section>
  );
}
