import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, Sparkles, BookOpen, Code, Music, Globe, Calculator, FlaskConical, Star } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import StatCard from '../components/StatCard';
import TutorCard from '../components/TutorCard';
import MOCK_TUTORS from '../services/mockTutors';
import BackgroundOrbs from '../components/BackgroundOrbs';
import InteractiveTiltCard from '../components/InteractiveTiltCard';
import TypewriterHero from '../components/TypewriterHero';
import FloatingSymbols from '../components/FloatingSymbols';

const CATEGORIES = [
  { name: 'Mathematics', icon: Calculator },
  { name: 'Programming', icon: Code },
  { name: 'Science', icon: FlaskConical },
  { name: 'Languages', icon: Globe },
  { name: 'Music', icon: Music },
  { name: 'Test Prep', icon: BookOpen },
];

const STEPS = [
  { title: 'Search', desc: 'Browse thousands of verified tutors filtered by subject, budget, and schedule.' },
  { title: 'Book', desc: 'Pick a time slot, book a demo or full class, and pay securely.' },
  { title: 'Learn', desc: 'Join live video classes with an interactive whiteboard and real-time chat.' },
];

const TESTIMONIALS = [
  { name: 'Priya S.', role: 'Student', text: 'Found an amazing calculus tutor within a day. My grades went up within a month.' },
  { name: 'Ahmed R.', role: 'Parent', text: 'The verification process gave me real confidence in who was teaching my son.' },
  { name: 'Liu W.', role: 'Student', text: 'The live classroom with whiteboard makes remote learning feel personal.' },
];

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      type: 'spring',
      stiffness: 100,
      damping: 15,
    },
  },
};

// Advanced Scroll Stagger spring reveal
const scrollContainerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const scrollItemVariants = {
  hidden: { opacity: 0, y: 35, scale: 0.95 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: 'spring',
      stiffness: 85,
      damping: 14,
    },
  },
};

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="relative min-h-screen overflow-hidden">
      <BackgroundOrbs />
      <FloatingSymbols />
      <Navbar />

      {/* Hero */}
      <motion.section 
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="relative mx-auto max-w-5xl px-6 pb-20 pt-16 text-center"
      >
        {/* Floating Sparkles decorative background details */}
        <motion.div
          animate={{ y: [0, -12, 0], opacity: [0.4, 0.8, 0.4] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          className="absolute left-10 top-10 text-cyan-electric/40 hidden sm:block"
        >
          <Sparkles size={24} />
        </motion.div>
        <motion.div
          animate={{ y: [0, 12, 0], opacity: [0.3, 0.7, 0.3] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          className="absolute right-12 bottom-20 text-violet/40 hidden sm:block"
        >
          <Sparkles size={20} />
        </motion.div>

        <motion.div
          variants={itemVariants}
          className="mb-4 inline-flex items-center gap-2 rounded-full glass-panel px-4 py-1.5 text-xs font-medium text-cyan-electric hover:shadow-[0_0_15px_rgba(0,242,254,0.3)] transition-shadow duration-300"
        >
          <Sparkles size={12} className="animate-pulse" /> AI-powered tutor matching
        </motion.div>

        <motion.h1
          variants={itemVariants}
          className="font-display text-4xl font-extrabold leading-tight text-white sm:text-6xl text-glow-cyan flex flex-col items-center justify-center gap-2 sm:gap-4"
        >
          <span>Find Your Perfect</span>
          <TypewriterHero />
        </motion.h1>

        <motion.p
          variants={itemVariants}
          className="mx-auto mt-6 max-w-xl text-white/60"
        >
          From nursery to PhD, coding to guitar — book verified tutors for live 1-on-1 or group classes, on your schedule.
        </motion.p>

        <motion.div
          variants={itemVariants}
          className="mx-auto mt-8 flex max-w-lg items-center gap-2 rounded-full glass-panel p-2 shadow-glow hover:shadow-glow-cyan transition-shadow duration-300"
        >
          <Search size={18} className="ml-3 text-white/40" />
          <input
            placeholder="Try 'Python tutor' or 'IELTS coaching'…"
            onFocus={() => navigate('/search')}
            readOnly
            className="w-full cursor-pointer bg-transparent px-2 py-2 text-sm text-white placeholder-white/40 outline-none"
          />
          <button
            onClick={() => navigate('/search')}
            className="rounded-full bg-brand-gradient px-5 py-2.5 text-sm font-semibold text-slate-deep active:scale-95 transition-transform"
          >
            Get Started
          </button>
        </motion.div>
      </motion.section>

      {/* Trust stats */}
      <section className="mx-auto max-w-5xl px-6 pb-20">
        <div className="grid grid-cols-3 gap-4">
          <StatCard label="Tutors" value={10240} suffix="+" accent="violet" />
          <StatCard label="Students" value={52800} suffix="+" accent="cyan" />
          <StatCard label="Avg. Rating" value={4} suffix=".9 ★" accent="violet" />
        </div>
      </section>

      {/* How it works */}
      <section className="mx-auto max-w-5xl px-6 pb-20">
        <h2 className="mb-10 text-center font-display text-2xl font-bold text-white">How It Works</h2>
        <motion.div
          variants={scrollContainerVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 gap-6 sm:grid-cols-3"
        >
          {STEPS.map((step, i) => (
            <motion.div key={step.title} variants={scrollItemVariants}>
              <InteractiveTiltCard className="h-full">
                <div
                  className="glass-panel h-full rounded-2xl p-6 text-center hover:border-cyan-electric/30 transition-colors duration-300"
                >
                  <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-brand-gradient font-display font-bold text-slate-deep shadow-glow">
                    {i + 1}
                  </div>
                  <p className="font-display font-semibold text-white">{step.title}</p>
                  <p className="mt-1 text-sm text-white/50">{step.desc}</p>
                </div>
              </InteractiveTiltCard>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* Categories */}
      <section className="mx-auto max-w-5xl px-6 pb-20">
        <h2 className="mb-10 text-center font-display text-2xl font-bold text-white">Top Categories</h2>
        <motion.div 
          variants={scrollContainerVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6"
        >
          {CATEGORIES.map((cat, i) => (
            <motion.div key={cat.name} variants={scrollItemVariants} className="h-full">
              <InteractiveTiltCard className="h-full">
                <button
                  onClick={() => navigate('/search')}
                  className="glass-panel flex w-full h-full flex-col items-center gap-2 rounded-2xl p-5 hover:border-violet/30 hover:bg-white/10 transition-colors duration-300"
                >
                  <cat.icon size={22} className="text-violet" />
                  <span className="text-xs font-medium text-white/70">{cat.name}</span>
                </button>
              </InteractiveTiltCard>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* Featured tutors */}
      <section className="mx-auto max-w-6xl px-6 pb-20">
        <h2 className="mb-10 text-center font-display text-2xl font-bold text-white">Featured Tutors</h2>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {MOCK_TUTORS.slice(0, 3).map((tutor, i) => (
            <TutorCard key={tutor._id} tutor={tutor} index={i} onOpen={(t) => navigate(`/tutors/${t._id}`)} />
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section className="mx-auto max-w-5xl px-6 pb-24">
        <h2 className="mb-10 text-center font-display text-2xl font-bold text-white">What People Say</h2>
        <motion.div 
          variants={scrollContainerVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 gap-6 sm:grid-cols-3"
        >
          {TESTIMONIALS.map((t, i) => (
            <motion.div key={t.name} variants={scrollItemVariants} className="h-full">
              <InteractiveTiltCard className="h-full">
                <div
                  className="glass-panel h-full rounded-2xl p-6 hover:border-violet/30 transition-colors duration-300"
                >
                  <div className="mb-2 flex gap-0.5 text-cyan-electric">
                    {Array.from({ length: 5 }).map((_, j) => <Star key={j} size={12} className="fill-cyan-electric" />)}
                  </div>
                  <p className="text-sm text-white/70">{t.text}</p>
                  <p className="mt-4 text-xs font-medium text-white">{t.name} <span className="text-white/40">· {t.role}</span></p>
                </div>
              </InteractiveTiltCard>
            </motion.div>
          ))}
        </motion.div>
      </section>

      <Footer />
    </div>
  );
}
