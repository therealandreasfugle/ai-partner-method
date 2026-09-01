import { useRef } from 'react';
import { motion, useScroll, useTransform, useReducedMotion } from 'framer-motion';

/**
 * ScrollRevealHeadline
 *
 * Reveals a headline word-by-word as the user scrolls it into view. Used as
 * the canonical "premium scroll polish" pattern per the foundation research
 * (tactic 9 / M1). Use at most ONE per page — the effect is signal, not
 * decoration.
 *
 * Source: research/_framework/web-design-research-2026-05.md, tactic 9, M1.
 *
 * Honours prefers-reduced-motion: when active, all words render at full
 * opacity and no scroll-linked transform is applied.
 *
 * Props:
 * - text: the headline string. Required.
 * - className: extra classes (font-size, weight, color, etc.). The component
 *   itself is unstyled.
 * - as: heading tag ("h1" | "h2" | "h3"). Defaults to "h2".
 * - startProgress / endProgress: scroll progress fractions for the reveal
 *   window. Defaults [0, 0.6] (full reveal by 60% of the scroll-into-view
 *   window).
 *
 * Example:
 *   <ScrollRevealHeadline
 *     as="h2"
 *     text="The work is the answer."
 *     className="font-heading text-display-md tracking-display"
 *   />
 */
export default function ScrollRevealHeadline({
  text,
  className = '',
  as: Tag = 'h2',
  startProgress = 0,
  endProgress = 0.6,
}) {
  const ref = useRef(null);
  const reduceMotion = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start 0.9', 'start 0.2'],
  });

  if (reduceMotion) {
    return <Tag ref={ref} className={className}>{text}</Tag>;
  }

  const words = text.split(' ');
  return (
    <Tag ref={ref} className={className}>
      {words.map((word, i) => {
        const wordStart = startProgress + (i / words.length) * (endProgress - startProgress);
        const wordEnd = wordStart + (1 / words.length) * (endProgress - startProgress);
        return (
          <Word key={`${word}-${i}`} progress={scrollYProgress} start={wordStart} end={wordEnd}>
            {word}{i < words.length - 1 ? ' ' : ''}
          </Word>
        );
      })}
    </Tag>
  );
}

function Word({ children, progress, start, end }) {
  const opacity = useTransform(progress, [start, end], [0.2, 1.0]);
  return <motion.span style={{ opacity, display: 'inline-block', willChange: 'opacity' }}>{children}</motion.span>;
}
