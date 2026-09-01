import { useState } from 'react';

/**
 * FAQAccordion, single shared accordion used by both the home FAQ.jsx and
 * the per-service ServiceDetailPage.jsx. Click an item to expand its answer
 * (plus icon rotates 45 degrees into a cross with gold gradient background).
 *
 * Props:
 *   items: [{ q: string, a: string }], required
 *
 * Visual contract MUST stay in sync with FAQ.jsx (lessons 14-proposal Rule 8):
 *   - Border:        1px solid rgba(100,116,139,0.25) closed; 1px solid rgb(var(--accent)) open
 *   - BorderTop:     2px solid rgb(var(--accent)) when open
 *   - Background:    bg-navy-slate
 *   - Toggle button: 8x8 square, plus icon -> 45 deg rotated cross when open
 *   - Open icon bg:  gold gradient (accent-light -> accent -> accent-dark -> accent-light)
 *   - Closed icon:   rgba(100,116,139,0.2)
 *   - Answer body:   text-cool font-body text-sm leading-relaxed pt-4
 */
export default function FAQAccordion({ items }) {
  const [open, setOpen] = useState(null);

  if (!items || items.length === 0) return null;

  return (
    <div className="flex flex-col gap-[10px]">
      {items.map((item, i) => (
        <div
          key={i}
          className="overflow-hidden transition-all duration-200 bg-navy-slate"
          style={{
            border: `1px solid ${open === i ? 'rgb(var(--accent))' : 'rgba(100,116,139,0.25)'}`,
            borderTop: open === i ? '2px solid rgb(var(--accent))' : '1px solid rgba(100,116,139,0.25)',
          }}
        >
          <button
            onClick={() => setOpen(open === i ? null : i)}
            className="w-full flex items-center justify-between gap-[16px] px-[20px] py-[14px] text-left"
          >
            <span className="font-heading font-bold text-white text-sm uppercase tracking-wide leading-tight pr-4">
              {item.q}
            </span>
            <div
              className="w-[30px] h-[30px] flex items-center justify-center flex-shrink-0 transition-all duration-200"
              style={{
                background: open === i
                  ? 'linear-gradient(135deg, rgb(var(--accent-light)) 0%, rgb(var(--accent)) 40%, rgb(var(--accent-dark)) 65%, rgb(var(--accent-light)) 100%)'
                  : 'rgba(100,116,139,0.2)',
                transform: open === i ? 'rotate(45deg)' : 'rotate(0deg)',
              }}
            >
              <svg
                className="w-[15px] h-[15px]"
                style={{ color: open === i ? '#0F172A' : '#94A3BB' }}
                fill="none" viewBox="0 0 24 24" stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16M4 12h16" />
              </svg>
            </div>
          </button>
          {open === i && (
            <div className="px-[20px] pb-[14px]" style={{ borderTop: '1px solid rgba(100,116,139,0.2)' }}>
              <p className="text-cool font-body text-sm leading-relaxed pt-[12px]">{item.a}</p>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
