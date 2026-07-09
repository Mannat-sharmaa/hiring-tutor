import { motion } from 'framer-motion';

// These orbs use CSS custom properties (--orb-color-1/2/3) set by ThemeContext.
// When the user picks a new theme, the JS sets new values on :root and all orbs instantly change.
export default function BackgroundOrbs() {
  return (
    <div className="pointer-events-none fixed inset-0 -z-20 overflow-hidden">
      {/* Orb 1 — primary accent */}
      <motion.div
        animate={{
          x: [0, 80, -40, 100, 0],
          y: [0, -100, 60, -40, 0],
          scale: [1, 1.2, 0.9, 1.1, 1],
        }}
        transition={{ duration: 25, repeat: Infinity, ease: 'easeInOut' }}
        className="orb-1 absolute left-1/4 top-10 h-[500px] w-[500px] rounded-full blur-[120px]"
        style={{ backgroundColor: 'var(--orb-color-1)', transition: 'background-color 0.6s ease' }}
      />

      {/* Orb 2 — secondary accent */}
      <motion.div
        animate={{
          x: [0, -90, 70, -60, 0],
          y: [0, 80, -120, 90, 0],
          scale: [1, 0.8, 1.15, 0.9, 1],
        }}
        transition={{ duration: 30, repeat: Infinity, ease: 'easeInOut' }}
        className="orb-2 absolute right-1/4 top-1/4 h-[600px] w-[600px] rounded-full blur-[130px]"
        style={{ backgroundColor: 'var(--orb-color-2)', transition: 'background-color 0.6s ease' }}
      />

      {/* Orb 3 — highlight accent */}
      <motion.div
        animate={{
          x: [0, 100, -80, 50, 0],
          y: [0, 120, -50, -100, 0],
          scale: [1, 1.25, 0.85, 1.05, 1],
        }}
        transition={{ duration: 28, repeat: Infinity, ease: 'easeInOut' }}
        className="orb-3 absolute left-1/3 bottom-10 h-[450px] w-[450px] rounded-full blur-[110px]"
        style={{ backgroundColor: 'var(--orb-color-3)', transition: 'background-color 0.6s ease' }}
      />
    </div>
  );
}
