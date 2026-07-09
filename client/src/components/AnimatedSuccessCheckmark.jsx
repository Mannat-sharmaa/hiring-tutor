import { motion } from 'framer-motion';

export default function AnimatedSuccessCheckmark() {
  return (
    <div className="flex justify-center items-center py-4">
      <svg className="h-16 w-16 text-cyan-electric" viewBox="0 0 52 52" fill="none">
        <motion.circle
          cx="26"
          cy="26"
          r="25"
          stroke="currentColor"
          strokeWidth="3"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.6, ease: 'easeInOut' }}
        />
        <motion.path
          d="M14 27l7.5 7.5 16.5-16.5"
          stroke="currentColor"
          strokeWidth="3.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.4, delay: 0.5, ease: 'easeOut' }}
        />
      </svg>
    </div>
  );
}
