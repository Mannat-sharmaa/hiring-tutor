import { useRef, useState } from 'react';
import { motion, useMotionValue, useTransform } from 'framer-motion';
import { Star, Clock, Heart } from 'lucide-react';

export default function TutorCard({ tutor, onOpen, index = 0 }) {
  const cardRef = useRef(null);
  
  // Track normalized mouse coordinates [0, 1]
  const x = useMotionValue(0.5);
  const y = useMotionValue(0.5);

  // Transform coordinates into degrees of rotation
  const rotateX = useTransform(y, [0, 1], [8, -8]);
  const rotateY = useTransform(x, [0, 1], [-8, 8]);

  // Spotlight radial coordinates
  const glowX = useTransform(x, (val) => `${val * 100}%`);
  const glowY = useTransform(y, (val) => `${val * 100}%`);

  // Active state is set once on enter/leave, preventing re-renders during mouse moves
  const [glowActive, setGlowActive] = useState(false);
  const [isFav, setIsFav] = useState(false);

  const handleMouseMove = (e) => {
    const card = cardRef.current;
    if (!card) return;

    const rect = card.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width;
    const py = (e.clientY - rect.top) / rect.height;

    x.set(px);
    y.set(py);
  };

  const handleMouseEnter = () => {
    setGlowActive(true);
  };

  const handleMouseLeave = () => {
    setGlowActive(false);
    // Reset rotation smoothly back to center
    x.set(0.5);
    y.set(0.5);
  };

  const subjectNames = (tutor.subjects || []).slice(0, 3).map((s) => s.subject?.name).filter(Boolean);

  return (
    <motion.div
      ref={cardRef}
      layoutId={`tutor-card-${tutor._id}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: Math.min(index, 8) * 0.04, ease: 'easeOut' }}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{
        rotateX,
        rotateY,
        transformStyle: 'preserve-3d',
      }}
      className="group relative cursor-pointer rounded-2xl glass-panel p-5 transition-all duration-300 hover:shadow-glow"
      onClick={() => onOpen?.(tutor)}
    >
      {/* Cursor-tracked spotlight (updated via motion style, avoids react re-render) */}
      <motion.div
        className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{
          opacity: glowActive ? 1 : 0,
          background: `radial-gradient(220px circle at var(--glow-x, 50%) var(--glow-y, 50%), rgba(0, 242, 254, 0.15), transparent 70%)`,
          // Pass motion values as CSS variables so we avoid re-rendering
          '--glow-x': glowX,
          '--glow-y': glowY,
        }}
      />

      <div className="relative flex items-start justify-between">
        <div className="flex items-center gap-3">
          <img
            src={tutor.avatar || `https://api.dicebear.com/7.x/notionists/svg?seed=${tutor.fullName}`}
            alt={tutor.fullName}
            className="h-14 w-14 rounded-xl object-cover ring-2 ring-white/10"
          />
          <div>
            <h3 className="font-display text-base font-semibold text-white">{tutor.fullName}</h3>
            <p className="text-xs text-white/50">{tutor.headline || 'Verified Tutor'}</p>
          </div>
        </div>

        <motion.button
          whileTap={{ scale: 0.7 }}
          onClick={(e) => {
            e.stopPropagation();
            setIsFav((v) => !v);
          }}
          aria-label={isFav ? 'Remove from favorites' : 'Add to favorites'}
          className="rounded-full p-2 hover:bg-white/10"
        >
          <motion.span animate={isFav ? { scale: [1, 1.4, 1] } : { scale: 1 }} transition={{ duration: 0.3 }}>
            <Heart size={18} className={isFav ? 'fill-violet text-violet' : 'text-white/40'} />
          </motion.span>
        </motion.button>
      </div>

      <div className="relative mt-4 flex flex-wrap gap-1.5">
        {subjectNames.map((s) => (
          <span key={s} className="rounded-full bg-violet/15 px-2.5 py-1 text-[11px] font-medium text-violet">
            {s}
          </span>
        ))}
      </div>

      <div className="relative mt-4 flex items-center justify-between text-sm">
        <div className="flex items-center gap-1 text-white/70">
          <Star size={14} className="fill-cyan-electric text-cyan-electric" />
          <span className="font-semibold text-white">{tutor.ratingAverage?.toFixed(1) ?? '0.0'}</span>
          <span className="text-white/40">({tutor.ratingCount ?? 0})</span>
        </div>
        <div className="flex items-center gap-1 text-white/40">
          <Clock size={13} />
          <span className="text-xs">{tutor.experienceYears ?? 0}y exp</span>
        </div>
      </div>

      <div className="relative mt-4 flex items-center justify-between border-t border-white/10 pt-4">
        <div>
          <span className="font-display text-lg font-bold text-white">₹{tutor.hourlyRate}</span>
          <span className="text-xs text-white/40"> /hr</span>
        </div>
        <button className="rounded-lg bg-brand-gradient px-4 py-2 text-xs font-semibold text-slate-deep transition-transform active:scale-95">
          View Profile
        </button>
      </div>
    </motion.div>
  );
}
