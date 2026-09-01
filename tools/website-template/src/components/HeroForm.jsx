import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { brandDNA } from '../config/brand-dna';
import { submitLead } from '../lib/submitLead';

const glassInput = {
  background: 'rgba(255,255,255,0.07)',
  border: '1px solid rgba(255,255,255,0.14)',
  color: 'white',
};

/**
 * HeroForm, the hero lead-capture card.
 *
 * Shared VERBATIM across every hero archetype (split-form, full-bleed,
 * editorial-split) so the conversion path, its fields, and its QA checks are
 * identical no matter which layout a brand uses. The parent controls width via
 * `className`; this component owns the glass card, the #quote anchor, and the
 * form. `vibe-feature` makes the card radius track the brand's vibe.
 */
export default function HeroForm({ className = '' }) {
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
    <div
      id="quote"
      className={`vibe-feature overflow-hidden ${className}`}
      style={{
        background: 'rgba(15,23,42,0.60)',
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

      <form onSubmit={handleSubmit} className="p-[12px] grid grid-cols-2 gap-[10px]">
        <input name="name" required className="form-input px-[14px] py-[12px] text-sm placeholder-white/40" placeholder="Your Name" style={glassInput} />
        <input name="phone" className="form-input px-[14px] py-[12px] text-sm placeholder-white/40" placeholder="Phone Number" type="tel" style={glassInput} />
        <input name="email" className="form-input col-span-2 px-[14px] py-[12px] text-sm placeholder-white/40" placeholder="Email Address" type="email" style={glassInput} />
        <select name="service" defaultValue="" className="form-input col-span-2 px-[14px] py-[12px] text-sm" style={{ ...glassInput, color: 'rgba(255,255,255,0.75)' }}>
          <option value="" style={{ background: '#1E293B', color: 'white' }}>How Can We Help?</option>
          {brandDNA.services.map((s) => (
            <option key={s.slug} value={s.name} style={{ background: '#1E293B', color: 'white' }}>{s.name}</option>
          ))}
        </select>
        <input name="address" className="form-input col-span-2 px-[14px] py-[12px] text-sm placeholder-white/40" placeholder="Property Address" style={glassInput} />
        <input name="message" className="form-input col-span-2 px-[14px] py-[12px] text-sm placeholder-white/40" placeholder="Brief message (optional)" style={glassInput} />
        {/* Honeypot. Hidden from people and from screen readers, so anything
            that fills it is a bot and the request is dropped server side. */}
        <input
          name="website_url"
          tabIndex={-1}
          autoComplete="off"
          aria-hidden="true"
          className="absolute opacity-0 pointer-events-none h-0 w-0"
        />
        <div className="col-span-2">
          <button
            type="submit"
            disabled={busy}
            className="btn-gold w-full font-heading font-bold text-sm uppercase tracking-widest py-[13px] text-navy disabled:opacity-60"
          >
            {busy ? 'Sending...' : <>{brandDNA.copy.buttonText} &rarr;</>}
          </button>
          {error && (
            <p role="alert" className="text-center font-body text-[12px] mt-2" style={{ color: '#FCA5A5' }}>{error}</p>
          )}
          {brandDNA.copy.privacyLine && (
            <p className="text-center text-white/35 font-body text-[10px] mt-2">{brandDNA.copy.privacyLine}</p>
          )}
        </div>
      </form>
    </div>
  );
}
