import { useState, useEffect } from 'react';
import { motion, useReducedMotion } from 'framer-motion';

/**
 * Reveal, section-level scroll entrance.
 *
 * Wrap a section to fade + drift it up the first time it scrolls into view.
 * Honours prefers-reduced-motion (renders static, no transform) and reads the
 * vibe-driven --reveal-distance / --reveal-blur tokens so motion depth tracks
 * the brand's vibe: editorial drifts further and softer, structural is tighter.
 *
 * GPU-safe: animates only transform + opacity (+ a one-shot blur on entry,
 * never on a scrolling container). Do NOT wrap the Hero or any section with a
 * negative top margin; the entrance transform fights the overlap.
 */
export default function Reveal({ children, delay = 0, className = '' }) {
  const reduce = useReducedMotion();
  const [{ y, blur }, setMotion] = useState({ y: 30, blur: 0 });

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const cs = getComputedStyle(document.documentElement);
    const d = parseFloat(cs.getPropertyValue('--reveal-distance')) || 30;
    const b = parseFloat(cs.getPropertyValue('--reveal-blur')) || 0;
    setMotion({ y: d, blur: b });
  }, []);

  if (reduce) return <div className={className}>{children}</div>;

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y, filter: blur ? `blur(${blur}px)` : 'blur(0px)' }}
      whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
      viewport={{ once: true, amount: 0.18 }}
      transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1], delay }}
      style={{ willChange: 'transform, opacity' }}
    >
      {children}
    </motion.div>
  );
}
