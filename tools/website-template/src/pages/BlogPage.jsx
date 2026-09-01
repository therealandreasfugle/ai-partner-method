import { Link } from 'react-router-dom';
import CTABanner from '../components/CTABanner';
import { brandDNA } from '../config/brand-dna';

export const blogPosts = brandDNA.blog_posts;

const categories = brandDNA.blog_categories;

export default function BlogPage() {
  const featured = blogPosts.find((p) => p.featured);
  const rest = blogPosts.filter((p) => !p.featured);

  return (
    <>
      {/* Page Hero */}
      <section className="relative overflow-hidden flex flex-col justify-end bg-navy theme-keep-dark" style={{ minHeight: '45vh' }}>
        <div className="absolute inset-0 w-full h-full" style={{ zIndex: 1 }}>
          <img
            src="/hero-image.webp"
            alt={`${brandDNA.company.name} Blog`}
            className="w-full h-full object-cover"
            style={{ objectPosition: '50% 40%' }}
            onError={(e) => { e.target.src = '/work/project1.webp'; }}
          />
          <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, rgba(15,23,42,0.55) 0%, rgba(15,23,42,0.88) 100%)' }} />
        </div>
        <div className="relative px-8 py-14 max-w-7xl mx-auto w-full" style={{ zIndex: 5 }}>
          <div className="flex items-center gap-2 text-cool text-xs font-semibold uppercase tracking-widest mb-4">
            <Link to="/" className="hover:text-white transition-colors">Home</Link>
            <span className="text-gold">›</span>
            <span className="text-white">Blog</span>
          </div>
          <p className="text-gold font-body font-semibold text-xs uppercase tracking-[0.2em] mb-3">{brandDNA.pages.blog.label}</p>
          <h1 className="font-heading font-bold text-white uppercase leading-none text-5xl lg:text-6xl mb-4">
            {brandDNA.pages.blog.heading}
          </h1>
          <span className="line-gold block w-16 mb-4" />
          <p className="text-white text-sm max-w-xl leading-relaxed font-body" style={{ textShadow: '0 1px 2px rgba(15, 23, 42, 0.6)' }}>
            {brandDNA.pages.blog.intro}
          </p>
        </div>
      </section>

      <section className="relative py-16 bg-grid bg-navy">
        <div className="max-w-7xl mx-auto px-8">

          {/* Featured post */}
          {featured && (
            <div className="mb-12">
              <p className="text-gold font-body font-semibold text-xs uppercase tracking-[0.2em] mb-4">{brandDNA.copy.blog.featuredLabel}</p>
              <Link to={`/blog/${featured.slug}`} className="group card-elevated-dark block overflow-hidden bg-navy-slate" style={{ border: '1px solid rgba(100,116,139,0.25)' }}>
                <div className="grid grid-cols-1 lg:grid-cols-2">
                  <div className="relative overflow-hidden" style={{ minHeight: 300 }}>
                    <img
                      src={featured.cover}
                      alt={featured.title}
                      className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      onError={(e) => { e.target.src = '/work/project1.webp'; }}
                    />
                  </div>
                  <div className="p-8 flex flex-col justify-center">
                    <div className="flex items-center gap-3 mb-4">
                      <span className="text-[10px] font-black uppercase tracking-widest px-3 py-1 text-gold" style={{ background: 'rgb(var(--accent) / 0.15)', border: '1px solid rgb(var(--accent) / 0.2)' }}>
                        {featured.category}
                      </span>
                      <span className="text-steel text-xs">{featured.readTime}</span>
                    </div>
                    <h2 className="font-heading font-bold text-white uppercase text-3xl leading-tight mb-3 group-hover:text-gold transition-colors">
                      {featured.title}
                    </h2>
                    <p className="text-cool text-sm leading-relaxed mb-5">{featured.excerpt}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-steel text-xs">{featured.date}</span>
                      <span className="text-gold text-sm font-bold flex items-center gap-1">
                        Read more
                        <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            </div>
          )}

          {/* Category filter */}
          <div className="flex flex-wrap gap-2 mb-8">
            {categories.map((cat) => (
              <button
                key={cat}
                className="font-heading font-bold text-xs uppercase tracking-widest px-4 py-2 text-cool hover:text-white hover:border-gold transition-all bg-navy-slate"
                style={{ border: '1px solid rgba(100,116,139,0.35)' }}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Blog grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {rest.map((post) => (
              <Link
                key={post.slug}
                to={`/blog/${post.slug}`}
                className="card-elevated-dark group overflow-hidden flex flex-col bg-navy-slate"
                style={{ border: '1px solid rgba(100,116,139,0.25)' }}
              >
                <div className="relative overflow-hidden" style={{ paddingBottom: '60%' }}>
                  <img
                    src={post.cover}
                    alt={post.title}
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    onError={(e) => { e.target.src = '/work/project1.webp'; }}
                  />
                </div>
                <div className="p-5 flex flex-col flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-[10px] font-black uppercase tracking-widest px-2.5 py-0.5 text-gold" style={{ background: 'rgb(var(--accent) / 0.15)', border: '1px solid rgb(var(--accent) / 0.2)' }}>
                      {post.category}
                    </span>
                    <span className="text-steel text-[10px]">{post.readTime}</span>
                  </div>
                  <h3 className="font-heading font-bold text-white uppercase text-lg leading-tight mb-2 group-hover:text-gold transition-colors">
                    {post.title}
                  </h3>
                  <p className="text-cool text-xs leading-relaxed flex-1 mb-4">{post.excerpt}</p>
                  <div className="flex items-center justify-between mt-auto pt-3" style={{ borderTop: '1px solid rgba(100,116,139,0.2)' }}>
                    <span className="text-steel text-xs">{post.date}</span>
                    <span className="text-gold text-xs font-bold flex items-center gap-1">
                      Read more
                      <svg className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <CTABanner />
    </>
  );
}
