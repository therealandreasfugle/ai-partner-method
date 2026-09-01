import { brandDNA } from '../config/brand-dna';
import CornerOverlay from './CornerOverlay';

export default function Blog() {
  const posts = brandDNA.blog_posts.slice(0, 3);

  return (
    <section className="relative py-16 overflow-hidden bg-navy-slate">

      {/* Rule 58: per-client corner overlays. */}
      <CornerOverlay position="top-left" size={320} />
      <CornerOverlay position="bottom-right" size={320} />

      <div className="relative max-w-7xl mx-auto px-8 grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
        {/* Left heading */}
        <div>
          <p className="text-gold font-body font-semibold text-xs uppercase tracking-[0.2em] mb-3">
            {brandDNA.copy.blog.label}
          </p>
          <h2 className="font-heading font-bold text-white uppercase leading-none text-5xl mb-0">
            {brandDNA.copy.blog.heading}
          </h2>
          <span className="line-gold block w-12 mt-4" />
          <p className="text-cool font-body text-sm leading-relaxed mt-4 max-w-2xl">
            {brandDNA.copy.blog.body}
          </p>
        </div>
      </div>

      {/* Cards */}
      <div className="relative max-w-7xl mx-auto px-8 mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
        {posts.map((post) => (
          <div key={post.slug} className="card-elevated-dark overflow-hidden flex flex-col bg-navy" style={{ border: '1px solid rgba(100,116,139,0.25)' }}>
            {/* Cover renders only when the post has one, and a failed load
                collapses the whole media area: a hidden img inside a reserved
                aspect-video box left a giant white void on live builds. */}
            {post.cover && (
              <div className="overflow-hidden aspect-video">
                <img
                  src={post.cover}
                  alt={post.title}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                  onError={(e) => { const el = e.target; el.onerror = null; const box = el.parentElement; if (box) box.style.display = 'none'; el.removeAttribute('src'); }}
                />
              </div>
            )}
            <div className="p-5 flex flex-col flex-1">
              <div className="text-[10px] text-gold font-body uppercase mb-2 tracking-wide font-semibold">{post.date} · {post.category}</div>
              <h3 className="font-heading font-bold text-white text-base uppercase leading-tight mb-2">{post.title}</h3>
              <p className="text-cool font-body text-xs leading-relaxed mb-4 flex-1">{post.excerpt}</p>
              <a href="#" className="inline-flex items-center gap-1 font-body font-bold text-gold text-xs hover:gap-2 transition-all">
                Read More
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7"/></svg>
              </a>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
