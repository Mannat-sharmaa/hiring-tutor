import { useEffect, useState } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';

const SYMBOLS = [
  // Math
  { char: 'π', x: '10%', y: '15%', size: 'text-2xl', color: 'text-violet/30' },
  { char: '√', x: '85%', y: '12%', size: 'text-3xl', color: 'text-cyan-electric/25' },
  { char: '∑', x: '75%', y: '75%', size: 'text-4xl', color: 'text-violet/20' },
  { char: '∫', x: '5%', y: '65%', size: 'text-3xl', color: 'text-cyan-electric/20' },
  { char: 'x', x: '45%', y: '8%', size: 'text-xl', color: 'text-white/10' },
  { char: 'y', x: '92%', y: '45%', size: 'text-xl', color: 'text-white/10' },

  // Programming
  { char: '{ }', x: '12%', y: '45%', size: 'text-3xl', color: 'text-cyan-electric/30' },
  { char: '< >', x: '80%', y: '30%', size: 'text-2xl', color: 'text-violet/25' },
  { char: '[ ]', x: '35%', y: '85%', size: 'text-xl', color: 'text-white/10' },
  { char: '//', x: '60%', y: '90%', size: 'text-2xl', color: 'text-violet/20' },

  // Science / Music / General
  { char: '⚛', x: '50%', y: '78%', size: 'text-3xl', color: 'text-rose-500/20' },
  { char: '♫', x: '25%', y: '25%', size: 'text-2xl', color: 'text-emerald-400/20' },
  { char: '📖', x: '70%', y: '18%', size: 'text-xl', color: 'text-amber-400/15' },
];

// Sub-component to ensure hooks are called at the top level (conforming to Rules of Hooks)
function FloatingSymbolItem({ sym, index, springX, springY }) {
  const factor = 0.4 + (index % 5) * 0.2; // Multipliers for parallax layers

  // Define offsets directly using spring values
  const xOffset = useTransform(springX, [-0.5, 0.5], [60 * factor, -60 * factor]);
  const yOffset = useTransform(springY, [-0.5, 0.5], [60 * factor, -60 * factor]);

  return (
    <motion.div
      style={{
        position: 'absolute',
        left: sym.x,
        top: sym.y,
        x: xOffset,
        y: yOffset,
      }}
      initial={{ opacity: 0, scale: 0.5 }}
      animate={{ 
        opacity: 1, 
        scale: 1,
        y: [0, -10, 0], // ambient floating loop
      }}
      transition={{
        opacity: { duration: 1, delay: index * 0.04 },
        scale: { duration: 1, delay: index * 0.04 },
        y: {
          duration: 6 + (index % 3) * 2,
          repeat: Infinity,
          ease: 'easeInOut',
        }
      }}
      className={`font-display font-bold ${sym.size} ${sym.color}`}
    >
      {sym.char}
    </motion.div>
  );
}

export default function FloatingSymbols() {
  const [mounted, setMounted] = useState(false);
  
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springX = useSpring(mouseX, { stiffness: 50, damping: 25 });
  const springY = useSpring(mouseY, { stiffness: 50, damping: 25 });

  useEffect(() => {
    setMounted(true);

    const handleMouseMove = (e) => {
      const relativeX = e.clientX / window.innerWidth - 0.5;
      const relativeY = e.clientY / window.innerHeight - 0.5;
      
      mouseX.set(relativeX);
      mouseY.set(relativeY);
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [mouseX, mouseY]);

  if (!mounted) return null;

  return (
    <div className="pointer-events-none fixed inset-0 -z-15 overflow-hidden select-none">
      {SYMBOLS.map((sym, index) => (
        <FloatingSymbolItem
          key={index}
          sym={sym}
          index={index}
          springX={springX}
          springY={springY}
        />
      ))}
    </div>
  );
}
