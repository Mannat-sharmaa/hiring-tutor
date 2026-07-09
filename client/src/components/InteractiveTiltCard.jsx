import { useRef } from 'react';
import { motion, useMotionValue, useTransform } from 'framer-motion';

export default function InteractiveTiltCard({ children, className = '', ...props }) {
  const cardRef = useRef(null);
  
  // Motion values to store mouse position normalized relative to card center [-0.5, 0.5]
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  // Transform normalized mouse coordinates into degrees of rotation
  const rotateX = useTransform(y, [-0.5, 0.5], [10, -10]);
  const rotateY = useTransform(x, [-0.5, 0.5], [-10, 10]);

  const handleMouseMove = (event) => {
    const card = cardRef.current;
    if (!card) return;

    const rect = card.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;

    // Calculate mouse position relative to card center, normalized to [-0.5, 0.5]
    const relativeX = (event.clientX - rect.left) / width - 0.5;
    const relativeY = (event.clientY - rect.top) / height - 0.5;

    x.set(relativeX);
    y.set(relativeY);
  };

  const handleMouseLeave = () => {
    // Reset back to center
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        rotateX,
        rotateY,
        transformStyle: 'preserve-3d',
      }}
      whileHover={{
        scale: 1.03,
      }}
      transition={{ type: 'spring', stiffness: 350, damping: 25 }}
      className={`relative ${className}`}
      {...props}
    >
      <div style={{ transform: 'translateZ(15px)' }} className="h-full w-full">
        {children}
      </div>
    </motion.div>
  );
}
