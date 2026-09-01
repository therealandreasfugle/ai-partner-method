import { useState } from 'react';
import { Link } from 'react-router-dom';
import CTABanner from '../components/CTABanner';
import { brandDNA } from '../config/brand-dna';

// Derive gallery photos from brandDNA.previous_projects (populated by Stage 10.1
// asset-copy step). Each entry is { filename, type, alt, category? }. Videos are
// skipped here; the lightbox shows still images only.
const photos = (brandDNA.previous_projects || [])
  .filter((p) => p && p.filename && p.type !== 'video')
  .map((p) => ({
    src: `/work/${p.filename}`,
    alt: p.alt || `${brandDNA.company.name} project`,
    caption: p.caption || p.alt || `${brandDNA.company.name} project`,
    category: p.category || 'Projects',
  }));

// Build the filter pills from unique categories present in the data. If every
// project shares the same category there's no point showing a filter row.
const uniqueCategories = Array.from(new Set(photos.map((p) => p.category)));
const categories = uniqueCategories.length > 1 ? ['All', ...uniqueCategories] : [];

export default function GalleryPage() {
  const [activeCategory, setActiveCategory] = useState('All');
  const [lightbox, setLightbox] = useState(null);

  const filtered = activeCategory === 'All'
    ? photos
    : photos.filter((p) => p.category === activeCategory);

  const currentIndex = lightbox !== null ? filtered.findIndex((p) => p.src === lightbox.src) : -1;

  const openLightbox = (photo) => setLightbox(photo);
  const closeLightbox = () => setLightbox(null);
  const prevPhoto = () => {
    const prev = (currentIndex - 1 + filtered.length) % filtered.length;
    setLightbox(filtered[prev]);
  };
  const nextPhoto = () => {
    const next = (currentIndex + 1) % filtered.length;
    setLightbox(filtered[next]);
  };

  return (
    <>
      {/* Page Hero */}
      <section className="relative overflow-hidden flex flex-col justify-end bg-navy theme-keep-dark" style={{ minHeight: '50vh' }}>
        <div className="absolute inset-0 w-full h-full" style={{ zIndex: 1 }}>
          <img
            src="/hero-image.webp"
            alt={`${brandDNA.company.name} Gallery`}
            className="w-full h-full object-cover"
            style={{ objectPosition: '50% 35%' }}
          />
          <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, rgba(15,23,42,0.55) 0%, rgba(15,23,42,0.88) 100%)' }} />
        </div>
        <div className="relative px-8 py-14 max-w-7xl mx-auto w-full" style={{ zIndex: 5 }}>
          <div className="flex items-center gap-2 text-cool text-xs font-semibold uppercase tracking-widest mb-4">
            <Link to="/" className="hover:text-white transition-colors">Home</Link>
            <span className="text-gold">›</span>
            <span className="text-white">Our Work</span>
          </div>
          <p className="text-gold font-body font-semibold text-xs uppercase tracking-[0.2em] mb-3">{brandDNA.copy.gallery.label}</p>
          <h1 className="font-heading font-bold text-white uppercase leading-none text-5xl lg:text-6xl mb-4">
            OUR COMPLETED<br />PROJECTS
          </h1>
          <span className="line-gold block w-16 mb-4" />
          <p className="text-white text-sm max-w-xl leading-relaxed font-body" style={{ textShadow: '0 1px 2px rgba(15, 23, 42, 0.6)' }}>
            {brandDNA.copy.gallery.body}
          </p>
        </div>
      </section>

      {/* Filter + Grid */}
      <section className="relative py-16 bg-grid bg-navy">
        <div className="max-w-7xl mx-auto px-8">
          {/* Filter tabs (only render when multiple categories exist) */}
          {categories.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-10">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`font-heading font-bold text-xs uppercase tracking-widest px-5 py-2.5 transition-all ${
                    activeCategory === cat
                      ? 'btn-gold text-navy'
                      : 'text-cool hover:text-white bg-navy-slate'
                  }`}
                  style={activeCategory === cat
                    ? {}
                    : { border: '1px solid rgba(100,116,139,0.35)' }
                  }
                >
                  {cat}
                </button>
              ))}
            </div>
          )}

          {/* Empty state when no project photos are supplied */}
          {photos.length === 0 && (
            <div className="text-center py-24 text-cool text-sm max-w-xl mx-auto">
              <p className="font-heading font-bold text-white uppercase text-lg mb-3">PROJECT GALLERY COMING SOON</p>
              <p>Call us for project photos and references from work in your area.</p>
            </div>
          )}

          {/* Grid */}
          {photos.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {filtered.map((photo, i) => (
                <div
                  key={`${photo.src}-${i}`}
                  className="card-elevated-dark group cursor-pointer overflow-hidden"
                  style={{ border: '1px solid rgba(100,116,139,0.25)' }}
                  onClick={() => openLightbox(photo)}
                >
                  <div className="relative overflow-hidden" style={{ paddingBottom: '68%' }}>
                    <img
                      src={photo.src}
                      alt={photo.alt}
                      className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{ background: 'rgba(15,23,42,0.55)' }}>
                      <div className="w-12 h-12 flex items-center justify-center" style={{ background: 'rgb(var(--accent) / 0.85)' }}>
                        <svg className="w-5 h-5 text-navy" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                        </svg>
                      </div>
                    </div>
                  </div>
                  <div className="px-4 py-3 flex items-center justify-between bg-navy-slate">
                    <div className="text-xs font-bold text-white uppercase tracking-wide">{photo.caption}</div>
                    {categories.length > 0 && (
                      <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 text-gold" style={{ background: 'rgb(var(--accent) / 0.15)', border: '1px solid rgb(var(--accent) / 0.2)' }}>
                        {photo.category}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {photos.length > 0 && filtered.length === 0 && (
            <div className="text-center py-20 text-steel text-sm">No photos in this category yet. Check back soon.</div>
          )}
        </div>
      </section>

      {/* Lightbox */}
      {lightbox && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(6,12,24,0.95)' }}
          onClick={closeLightbox}
        >
          <div className="relative max-w-4xl w-full" onClick={(e) => e.stopPropagation()}>
            <button
              className="absolute -top-12 right-0 text-white/70 hover:text-white transition-colors"
              onClick={closeLightbox}
            >
              <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <div className="overflow-hidden" style={{ boxShadow: '0 40px 80px rgba(0,0,0,0.6)', border: '1px solid rgba(100,116,139,0.25)' }}>
              <img
                src={lightbox.src}
                alt={lightbox.alt}
                className="w-full object-contain"
                style={{ maxHeight: '80vh' }}
              />
            </div>

            <div className="flex items-center justify-between mt-4 px-2">
              <div className="text-white/80 text-sm font-semibold">{lightbox.caption}</div>
              <div className="text-white/50 text-xs">{currentIndex + 1} / {filtered.length}</div>
            </div>

            {filtered.length > 1 && (
              <>
                <button
                  className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-14 w-10 h-10 flex items-center justify-center text-white transition-colors bg-navy-slate"
                  style={{ border: '1px solid rgba(100,116,139,0.4)' }}
                  onClick={prevPhoto}
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <button
                  className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-14 w-10 h-10 flex items-center justify-center text-white transition-colors bg-navy-slate"
                  style={{ border: '1px solid rgba(100,116,139,0.4)' }}
                  onClick={nextPhoto}
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </>
            )}
          </div>
        </div>
      )}

      <CTABanner />
    </>
  );
}
