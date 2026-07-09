import { useEffect, useRef, useState } from 'react';
import { motion, useInView } from 'framer-motion';

// Counts up from 0 to `value` once the card scrolls into view — used for
// every "Total X" stat across Student/Tutor/Admin dashboards.
export default function StatCard({ label, value, prefix = '', suffix = '', icon: Icon, accent = 'violet' }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (!inView) return;
    const duration = 900;
    const start = performance.now();
    const tick = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      setDisplay(Math.round(value * progress));
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [inView, value]);

  const accentClass = accent === 'cyan' ? 'text-cyan-electric' : 'text-violet';

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="glass-panel rounded-2xl p-5"
    >
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium text-white/50">{label}</p>
        {Icon && <Icon size={16} className={accentClass} />}
      </div>
      <p className="mt-2 font-display text-2xl font-extrabold text-white">
        {prefix}
        {display.toLocaleString()}
        {suffix}
      </p>
    </motion.div>
  );
}
