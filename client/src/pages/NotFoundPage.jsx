import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Home, SearchX } from 'lucide-react';

export default function NotFoundPage() {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-6 text-center">
      <div className="pointer-events-none fixed left-1/2 top-0 -z-10 h-[500px] w-[500px] -translate-x-1/2 animate-breathe bg-orb-gradient blur-3xl" />

      <motion.div
        animate={{ y: [0, -14, 0] }}
        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        className="mb-4 flex h-24 w-24 items-center justify-center rounded-full glass-panel"
      >
        <SearchX size={40} className="text-violet" />
      </motion.div>

      <h1 className="font-display text-6xl font-extrabold text-white">404</h1>
      <p className="mt-2 text-lg font-medium text-white/70">Looks like this page skipped class.</p>
      <p className="mt-1 text-sm text-white/40">The page you're looking for doesn't exist or has moved.</p>

      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="mt-8">
        <Link
          to="/"
          className="flex items-center gap-2 rounded-full bg-brand-gradient px-6 py-3 text-sm font-semibold text-slate-deep"
        >
          <Home size={16} /> Back to Home
        </Link>
      </motion.div>
    </div>
  );
}
