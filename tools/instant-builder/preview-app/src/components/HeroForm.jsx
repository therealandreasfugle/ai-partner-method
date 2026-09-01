import { useNavigate } from 'react-router-dom';
import { brandDNA } from '../config/brand-dna';

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
  const handleSubmit = (e) => {
    e.preventDefault();
    navigate('/thank-you');
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
        <input className="form-input px-[14px] py-[12px] text-sm placeholder-white/40" placeholder="Your Name" style={glassInput} />
        <input className="form-input px-[14px] py-[12px] text-sm placeholder-white/40" placeholder="Phone Number" type="tel" style={glassInput} />
        <input className="form-input col-span-2 px-[14px] py-[12px] text-sm placeholder-white/40" placeholder="Email Address" type="email" style={glassInput} />
        <select className="form-input col-span-2 px-[14px] py-[12px] text-sm" style={{ ...glassInput, color: 'rgba(255,255,255,0.75)' }}>
          <option style={{ background: '#1E293B', color: 'white' }}>How Can We Help?</option>
          {brandDNA.services.map((s) => (
            <option key={s.slug} value={s.slug} style={{ background: '#1E293B', color: 'white' }}>{s.name}</option>
          ))}
        </select>
        <input className="form-input col-span-2 px-[14px] py-[12px] text-sm placeholder-white/40" placeholder={brandDNA.copy.addressLabel || 'Property Address'} style={glassInput} />
        <input className="form-input col-span-2 px-[14px] py-[12px] text-sm placeholder-white/40" placeholder="Brief message (optional)" style={glassInput} />
        <div className="col-span-2">
          <button
            type="submit"
            className="btn-gold w-full font-heading font-bold text-sm uppercase tracking-widest py-[13px] text-navy"
          >
            {brandDNA.copy.buttonText} &rarr;
          </button>
          {brandDNA.copy.privacyLine && (
            <p className="text-center text-white/35 font-body text-[10px] mt-2">{brandDNA.copy.privacyLine}</p>
          )}
        </div>
      </form>
    </div>
  );
}
