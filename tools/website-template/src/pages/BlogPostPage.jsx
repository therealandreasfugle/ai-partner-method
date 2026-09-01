import { useParams, Link, Navigate, useNavigate } from 'react-router-dom';
import CTABanner from '../components/CTABanner';
import { blogPosts } from './BlogPage';
import { brandDNA } from '../config/brand-dna';

const glassInput = {
  background: 'rgba(255,255,255,0.07)',
  border: '1px solid rgba(255,255,255,0.14)',
  color: 'white',
};

export default function BlogPostPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const post = blogPosts.find((p) => p.slug === slug);

  if (!post) return <Navigate to="/blog" replace />;

  const related = blogPosts.filter((p) => p.slug !== slug).slice(0, 3);
  const bpCopy = (brandDNA.pages && brandDNA.pages.blogPost) || {};
  const fallbackProject = (() => {
    const p = (brandDNA.previous_projects || [])[0];
    return p && p.filename ? `/work/${p.filename}` : null;
  })();

  // Convert a copy-deck markdown body into the BlogPostPage content-block shape
  // ({type:'p'|'h2'|'list', text|items}). Allows post.body (Stage 6 markdown) to
  // back-fill the content array when no structured content blocks shipped.
  const blocksFromMarkdown = (md) => {
    if (!md) return null;
    return md.trim().split(/\n\s*\n/).map((blk) => {
      const t = blk.trim();
      if (t.startsWith('## ')) return { type: 'h2', text: t.replace(/^##\s+/, '').replace(/\*([^*]+)\*/g, '$1') };
      if (t.startsWith('- ')) return { type: 'list', items: t.split(/\n- /).map((s) => s.replace(/^- /, '').trim()).filter(Boolean) };
      return { type: 'p', text: t };
    });
  };

  // brandDNA.blog_posts[i].content is the schema-defined rich body. Order of
  // preference: structured content blocks, copy-deck body markdown, excerpt fallback.
  const contentBlocks =
    (post.content && post.content.length > 0)
      ? post.content
      : (blocksFromMarkdown(post.body) || [{ type: 'p', text: post.excerpt }]);

  const handleEstimateSubmit = (e) => {
    e.preventDefault();
    navigate('/thank-you');
  };

  return (
    <>
      {/* Article Hero */}
      <section className="relative overflow-hidden flex flex-col justify-end bg-navy theme-keep-dark" style={{ minHeight: '50vh' }}>
        <div className="absolute inset-0 w-full h-full" style={{ zIndex: 1 }}>
          <img
            src="/hero-image.webp"
            alt={post.title}
            className="w-full h-full object-cover"
            style={{ objectPosition: '50% 40%' }}
            onError={(e) => { if (fallbackProject) { e.target.src = fallbackProject; } else { e.target.style.display = 'none'; } }}
          />
          <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, rgba(15,23,42,0.45) 0%, rgba(15,23,42,0.92) 100%)' }} />
        </div>
        <div className="relative px-8 py-14 max-w-5xl mx-auto w-full" style={{ zIndex: 5 }}>
          <div className="flex items-center gap-2 text-cool text-xs font-semibold uppercase tracking-widest mb-4">
            <Link to="/" className="hover:text-white transition-colors">Home</Link>
            <span className="text-gold">›</span>
            <Link to="/blog" className="hover:text-white transition-colors">Blog</Link>
            <span className="text-gold">›</span>
            <span className="text-white">{post.category}</span>
          </div>
          <div className="flex items-center gap-3 mb-4">
            <span className="text-[10px] font-black uppercase tracking-widest px-3 py-1 text-gold" style={{ background: 'rgb(var(--accent) / 0.15)', border: '1px solid rgb(var(--accent) / 0.2)' }}>
              {post.category}
            </span>
            <span className="text-cool text-xs">{post.readTime}</span>
            <span className="text-steel text-xs">·</span>
            <span className="text-cool text-xs">{post.date}</span>
          </div>
          <h1 className="font-heading font-bold text-white uppercase leading-tight text-4xl lg:text-5xl max-w-3xl">
            {post.title}
          </h1>
        </div>
      </section>

      {/* Article Body */}
      <section className="relative py-16 bg-grid bg-navy">
        <div className="max-w-7xl mx-auto px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">

            {/* Main content */}
            <article className="lg:col-span-2">
              <p className="text-cool text-base leading-relaxed mb-6 text-lg pl-5" style={{ borderLeft: '2px solid rgb(var(--accent))' }}>
                {post.excerpt}
              </p>

              <div>
                {contentBlocks.map((block, i) => {
                  if (block.type === 'p') {
                    return <p key={i} className="text-cool text-sm leading-relaxed mb-5">{block.text}</p>;
                  }
                  if (block.type === 'h2') {
                    return <h2 key={i} className="font-heading font-bold text-white uppercase text-2xl mt-8 mb-4">{block.text}</h2>;
                  }
                  if (block.type === 'list') {
                    return (
                      <ul key={i} className="flex flex-col gap-2 mb-5">
                        {block.items.map((item, j) => (
                          <li key={j} className="flex items-start gap-3 text-cool text-sm leading-relaxed">
                            <div className="w-4 h-4 flex items-center justify-center flex-shrink-0 mt-0.5 bg-navy-slate" style={{ border: '1px solid rgba(100,116,139,0.5)' }}>
                              <svg className="w-2.5 h-2.5 text-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                              </svg>
                            </div>
                            {item}
                          </li>
                        ))}
                      </ul>
                    );
                  }
                  return null;
                })}
              </div>

              {/* Inline estimate form */}
              <div className="mt-10 overflow-hidden" style={{ background: 'rgba(15,23,42,0.60)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.10)', boxShadow: '0 20px 60px rgba(0,0,0,0.55)' }}>
                <div className="px-6 pt-6 pb-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                  <span className="heading-metallic font-heading font-bold text-white text-xl uppercase tracking-wide block">{brandDNA.copy.formHeader}</span>
                  <span className="text-white/50 text-[11px] font-body">{brandDNA.copy.formSubtext} No obligation.</span>
                </div>
                <form onSubmit={handleEstimateSubmit} className="p-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <input className="form-input px-4 py-3 text-sm placeholder-white/40" style={glassInput} placeholder="Your Name" />
                  <input className="form-input px-4 py-3 text-sm placeholder-white/40" style={glassInput} placeholder="Phone Number" type="tel" />
                  <input className="form-input px-4 py-3 text-sm placeholder-white/40" style={glassInput} placeholder="Email Address" type="email" />
                  <div className="sm:col-span-3">
                    <button
                      type="submit"
                      className="btn-gold w-full font-heading font-bold text-base uppercase tracking-widest py-3 text-navy"
                    >
                      {brandDNA.copy.buttonText} →
                    </button>
                    {brandDNA.copy.privacyLine && (
                      <p className="text-center text-white/35 text-[10px] mt-2">{brandDNA.copy.privacyLine}</p>
                    )}
                  </div>
                </form>
              </div>

              {/* Author box */}
              <div className="mt-8 flex items-center gap-4 p-5 bg-navy-slate" style={{ border: '1px solid rgba(100,116,139,0.25)' }}>
                <img
                  src="/owner.webp"
                  alt={brandDNA.team.founder.name}
                  className="w-14 h-14 object-cover flex-shrink-0"
                  style={{ objectPosition: '50% 10%' }}
                  onError={(e) => { e.target.style.display = 'none'; }}
                />
                <div>
                  <div className="font-heading font-bold text-white uppercase text-sm">{brandDNA.company.name.toUpperCase()}</div>
                  <p className="text-cool text-xs leading-relaxed mt-0.5">{brandDNA.team.founder.name}, {brandDNA.team.founder.title}.</p>
                </div>
              </div>

              {/* Back to blog */}
              <div className="mt-8">
                <Link to="/blog" className="flex items-center gap-2 text-gold text-sm font-bold hover:gap-3 transition-all hover:text-white">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  {bpCopy.backToListLabel || 'Back to all articles'}
                </Link>
              </div>
            </article>

            {/* Sidebar */}
            <aside className="flex flex-col gap-5">
              {/* CTA card */}
              {(bpCopy.sidebarCtaHeading || bpCopy.sidebarCtaBody) && (
                <div className="p-6 text-center bg-navy-slate" style={{ border: '1px solid rgb(var(--accent) / 0.2)', borderTop: '2px solid rgb(var(--accent))' }}>
                  {bpCopy.sidebarCtaHeading && (
                    <div className="font-heading font-bold text-white uppercase text-lg mb-2">
                      {bpCopy.sidebarCtaHeading}
                    </div>
                  )}
                  {bpCopy.sidebarCtaBody && (
                    <p className="text-cool text-xs leading-relaxed mb-5">
                      {bpCopy.sidebarCtaBody}
                    </p>
                  )}
                  <Link
                    to="/contact"
                    className="btn-gold block w-full font-heading font-bold text-sm uppercase px-5 py-3 tracking-widest text-navy"
                  >
                    {bpCopy.sidebarCtaButton || brandDNA.copy.buttonText} →
                  </Link>
                </div>
              )}

              {/* Contact info */}
              <div className="p-5 bg-navy-slate" style={{ border: '1px solid rgba(100,116,139,0.25)' }}>
                <div className="font-heading font-bold text-white uppercase text-sm tracking-wider mb-4">{bpCopy.sidebarCallLabel || 'CALL US DIRECT'}</div>
                <a href={`tel:${brandDNA.contact.phoneTelLink}`} className="flex items-center gap-3 group mb-3">
                  <div className="w-8 h-8 flex items-center justify-center flex-shrink-0" style={{ background: 'linear-gradient(135deg, rgb(var(--accent-light)) 0%, rgb(var(--accent)) 40%, rgb(var(--accent-dark)) 65%, rgb(var(--accent-light)) 100%)' }}>
                    <svg className="w-3.5 h-3.5 text-navy" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                  </div>
                  <span className="font-heading font-bold text-white group-hover:text-gold transition-colors">{brandDNA.contact.phone}</span>
                </a>
                {bpCopy.sidebarCallNote && (
                  <p className="text-steel text-xs leading-relaxed">{bpCopy.sidebarCallNote}</p>
                )}
              </div>

              {/* Related posts */}
              {related.length > 0 && (
                <div>
                  <div className="font-heading font-bold text-white uppercase text-sm tracking-wider mb-4">{bpCopy.moreArticlesLabel || 'MORE ARTICLES'}</div>
                  <div className="flex flex-col gap-3">
                    {related.map((p) => (
                      <Link key={p.slug} to={`/blog/${p.slug}`} className="group flex items-start gap-3 p-3 bg-navy-slate" style={{ border: '1px solid rgba(100,116,139,0.25)' }}>
                        <div className="w-14 h-14 overflow-hidden flex-shrink-0">
                          <img
                            src={p.cover}
                            alt={p.title}
                            className="w-full h-full object-cover transition-transform group-hover:scale-105 duration-300"
                            onError={(e) => { if (fallbackProject) { e.target.src = fallbackProject; } else { e.target.style.display = 'none'; } }}
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <span className="text-[9px] font-black uppercase tracking-widest text-gold">{p.category}</span>
                          <div className="font-heading font-bold text-white text-xs uppercase leading-tight mt-0.5 group-hover:text-gold transition-colors line-clamp-2">{p.title}</div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </aside>
          </div>
        </div>
      </section>

      <CTABanner />
    </>
  );
}
