import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Ticker from './Ticker';
import BackgroundPattern from './BackgroundPattern';
import CornerOverlay from './CornerOverlay';
import { brandDNA } from '../config/brand-dna';
import { submitLead } from '../lib/submitLead';

export default function CTABanner() {
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    setError('');
    const result = await submitLead(e.currentTarget);
    if (result.ok) { navigate('/thank-you'); return; }
    setError(result.message);
    setBusy(false);
  };

  return (
    <section id="cta-form" className="relative overflow-hidden bg-navy">
      <BackgroundPattern motif={brandDNA.shape_motif} opacity={0.3} color="white" />

      {/* Rule 58: per-client corner overlays. */}
      <CornerOverlay position="top-left" size={320} />
      <CornerOverlay position="bottom-right" size={320} />

      {/* Content */}
      <div className="relative max-w-7xl mx-auto px-8 py-16 grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
        {/* Left: Logo + CTA text */}
        <div>
          <img src="/logo.webp" alt={brandDNA.company.name} className="w-56 h-auto mb-6" onError={(e) => { const el = e.target; el.onerror = () => { el.onerror = null; el.style.display = 'none'; }; el.src = '/logo.svg'; }} />
          <p className="text-gold font-body font-semibold text-xs uppercase tracking-[0.2em] mb-3">
            {brandDNA.copy.cta.label}
          </p>
          <h2 className="font-heading font-bold text-white uppercase leading-none text-5xl mb-1">
            {brandDNA.copy.cta.heading}
          </h2>
          <span className="line-gold block w-12 my-4" />
          <p className="text-cool font-body text-sm leading-relaxed">
            {brandDNA.copy.cta.body}
          </p>
        </div>

        {/* Right: Contact form panel. KEEPS its dark + gold styling in both
            light and dark mode so the gold form stays legible. The
            theme-keep-dark class on this wrapper opts out of the global
            light-theme inversion. */}
        <div className="theme-keep-dark">
          <div
            className="overflow-hidden"
            style={{
              background: 'rgba(15,23,42,0.85)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              border: '1px solid rgba(255,255,255,0.10)',
              boxShadow: '0 20px 60px rgba(0,0,0,0.55), 0 4px 16px rgba(0,0,0,0.30)',
            }}
          >
            <div className="px-[18px] pt-[16px] pb-[10px]" style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
              <span className="heading-metallic font-heading font-bold text-white text-xl uppercase tracking-wide block">
                {brandDNA.copy.formHeader}
              </span>
              <span className="text-white/50 text-[11px] font-body">{brandDNA.copy.formSubtext}</span>
            </div>
            <form onSubmit={handleSubmit} className="p-[12px] grid grid-cols-1 sm:grid-cols-2 gap-[10px]">
              <input
                name="name"
                required
                className="form-input px-[14px] py-[12px] text-sm placeholder-white/40"
                placeholder="Your Name"
                style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.14)', color: 'white' }}
              />
              <input
                name="phone"
                className="form-input px-[14px] py-[12px] text-sm placeholder-white/40"
                placeholder="Phone Number"
                type="tel"
                style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.14)', color: 'white' }}
              />
              <input
                name="email"
                className="form-input sm:col-span-2 px-[14px] py-[12px] text-sm placeholder-white/40"
                placeholder="Email Address"
                type="email"
                style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.14)', color: 'white' }}
              />
              <select
                name="service"
                defaultValue=""
                className="form-input sm:col-span-2 px-[14px] py-[12px] text-sm"
                style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.14)', color: 'rgba(255,255,255,0.75)' }}
              >
                <option value="" style={{ background: '#1E293B', color: 'white' }}>How Can We Help?</option>
                {brandDNA.services.map((s) => (
                  <option key={s.slug} value={s.name} style={{ background: '#1E293B', color: 'white' }}>{s.name}</option>
                ))}
              </select>
              {/* Honeypot. Hidden from people and from screen readers, so
                  anything that fills it is a bot and is dropped server side. */}
              <input
                name="website_url"
                tabIndex={-1}
                autoComplete="off"
                aria-hidden="true"
                className="absolute opacity-0 pointer-events-none h-0 w-0"
              />
              <div className="sm:col-span-2">
                <button
                  type="submit"
                  disabled={busy}
                  className="btn-gold w-full font-heading font-bold text-lg uppercase tracking-widest py-3.5 text-navy disabled:opacity-60"
                >
                  {busy ? 'Sending...' : <>{brandDNA.copy.buttonText} →</>}
                </button>
                {error && (
                  <p role="alert" className="text-center font-body text-[12px] mt-2" style={{ color: '#FCA5A5' }}>{error}</p>
                )}
                <p className="text-center text-white/35 font-body text-[10px] mt-2">
                  {brandDNA.copy.privacyLine}
                </p>
              </div>
            </form>
          </div>
        </div>
      </div>

      <Ticker />
    </section>
  );
}
