import { motion } from 'framer-motion';
import Navbar from './Navbar';
import Footer from './Footer';

// Wraps About/Privacy/Terms/Contact-style pages so they all share the same
// nav, footer, ambient background, and entrance animation.
export default function StaticPageLayout({ title, subtitle, children }) {
  return (
    <div className="relative min-h-screen overflow-hidden">
      <div className="pointer-events-none fixed left-1/2 top-0 -z-10 h-[500px] w-[500px] -translate-x-1/2 animate-breathe bg-orb-gradient blur-3xl" />
      <Navbar />

      <motion.main
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="mx-auto max-w-3xl px-6 pb-24 pt-14"
      >
        <h1 className="font-display text-3xl font-extrabold text-white">{title}</h1>
        {subtitle && <p className="mt-2 text-sm text-white/50">{subtitle}</p>}
        <div className="mt-8 space-y-6 text-sm leading-relaxed text-white/70">{children}</div>
      </motion.main>

      <Footer />
    </div>
  );
}
