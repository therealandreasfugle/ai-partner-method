import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { useLocation } from 'react-router-dom';

/**
 * PageTransition
 *
 * Wraps router children in an AnimatePresence that fades-and-shifts pages on
 * route change. Per the foundation research (tactic M5): 200ms fade + 8px
 * translate, ease-out-expo. Subtle. Not slide. Not curtain.
 *
 * Source: research/_framework/web-design-research-2026-05.md, tactic M5.
 *
 * Honours prefers-reduced-motion: when active, transitions are instant
 * (children just render without motion).
 *
 * Usage:
 *   <PageTransition>
 *     <Routes>...</Routes>
 *   </PageTransition>
 */
export default function PageTransition({ children }) {
  const location = useLocation();
  const reduceMotion = useReducedMotion();

  if (reduceMotion) {
    return <>{children}</>;
  }

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={location.pathname}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{
          duration: 0.2,
          ease: [0.16, 1, 0.3, 1], // ease-premium-out (matches --ease-default in index.css)
        }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
