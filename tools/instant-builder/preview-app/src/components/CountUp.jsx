import { useState, useEffect, useRef } from 'react';
import { useReducedMotion } from 'framer-motion';

/**
 * CountUp, animate a numeric stat when it scrolls into view.
 *
 * Parses the leading number out of values like "16", "2,100+", "100%", "4.9",
 * "$2M" and counts up to it on first view, preserving prefix + suffix and the
 * thousands grouping / decimal places. Reduced-motion renders the final value
 * immediately. Driven by IntersectionObserver + rAF (no scroll listener).
 */
export default function CountUp({ value, duration = 1400, className = '' }) {
  const reduce = useReducedMotion();
  const ref = useRef(null);
  const [display, setDisplay] = useState(reduce ? value : null);

  useEffect(() => {
    if (reduce) { setDisplay(value); return; }
    const el = ref.current;
    if (!el) return;

    const raw = String(value);
    const m = raw.match(/^([^\d]*)([\d,]+(?:\.\d+)?)(.*)$/s);
    if (!m) { setDisplay(value); return; }

    const prefix = m[1] || '';
    const grouped = m[2].includes(',');
    const numStr = m[2].replace(/,/g, '');
    const suffix = m[3] || '';
    const target = parseFloat(numStr);
    const decimals = numStr.includes('.') ? numStr.split('.')[1].length : 0;

    const fmt = (n) => {
      let s = n.toFixed(decimals);
      if (grouped) {
        s = Number(s).toLocaleString('en-US', {
          minimumFractionDigits: decimals,
          maximumFractionDigits: decimals,
        });
      }
      return prefix + s + suffix;
    };

    let raf = 0;
    let startTs = 0;
    let done = false;

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting && !done) {
            done = true;
            const step = (ts) => {
              if (!startTs) startTs = ts;
              const p = Math.min((ts - startTs) / duration, 1);
              const eased = 1 - Math.pow(1 - p, 3);
              setDisplay(fmt(target * eased));
              if (p < 1) raf = requestAnimationFrame(step);
            };
            raf = requestAnimationFrame(step);
          }
        });
      },
      { threshold: 0.4 }
    );

    io.observe(el);
    setDisplay(fmt(0));
    return () => { io.disconnect(); cancelAnimationFrame(raf); };
  }, [value, duration, reduce]);

  return <span ref={ref} className={className}>{display ?? value}</span>;
}
