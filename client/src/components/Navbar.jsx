import { useEffect, useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Menu, X, Bell, Calendar, CreditCard, UserCheck,
  Bot, Users, BookOpen, Brain, Palette, ChevronDown,
  LayoutDashboard, LogOut, Settings, User,
} from 'lucide-react';
import useAuthStore from '../store/authStore';

const NOTIFICATIONS = [
  { id: 1, icon: Calendar, text: 'Your class with Ayesha Khan is confirmed for 5:00 PM.', time: '10m ago', link: '/student/bookings' },
  { id: 2, icon: CreditCard, text: 'Payment of $27.50 received.', time: '1h ago', link: '/student/payments' },
  { id: 3, icon: UserCheck, text: 'Daniel Osei accepted your booking request.', time: '3h ago', link: '/student/bookings' },
];

function NotificationsDropdown() {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const onClick = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  return (
    <div ref={ref} className="relative">
      <motion.button
        onClick={() => setOpen((o) => !o)}
        whileTap={{ scale: 0.9 }}
        animate={NOTIFICATIONS.length > 0 ? { rotate: [0, -12, 12, -8, 8, 0] } : {}}
        transition={{ duration: 0.6, delay: 1, repeat: Infinity, repeatDelay: 6 }}
        className="relative rounded-full p-2 hover:bg-white/10"
        aria-label="Notifications"
      >
        <Bell size={18} className="text-white/70" />
        {NOTIFICATIONS.length > 0 && (
          <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-cyan-electric" />
        )}
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.96 }}
            transition={{ duration: 0.15 }}
            className="glass-panel absolute right-0 top-12 w-80 rounded-2xl border p-2 shadow-card"
          >
            <p className="px-3 py-2 text-xs font-semibold text-white/50">Notifications</p>
            {NOTIFICATIONS.map((n) => (
              <Link
                key={n.id}
                to={n.link}
                onClick={() => setOpen(false)}
                className="flex items-start gap-3 rounded-xl p-3 hover:bg-white/5"
              >
                <div className="mt-0.5 rounded-full bg-violet/15 p-1.5">
                  <n.icon size={14} className="text-violet" />
                </div>
                <div>
                  <p className="text-xs text-white/80">{n.text}</p>
                  <p className="mt-0.5 text-[10px] text-white/40">{n.time}</p>
                </div>
              </Link>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

const FEATURE_LINKS = [
  { to: '/ai-assistant', icon: Bot, label: 'AI Study Buddy', desc: 'Get instant study help', color: 'text-cyan-electric', bg: 'bg-cyan-electric/10' },
  { to: '/study-rooms', icon: Users, label: 'Study Rooms', desc: 'Join group sessions', color: 'text-violet', bg: 'bg-violet/10' },
  { to: '/resources', icon: BookOpen, label: 'Resource Hub', desc: 'Download study notes', color: 'text-emerald-400', bg: 'bg-emerald-400/10' },
  { to: '/quizzes', icon: Brain, label: 'Quizzes', desc: 'Test your knowledge', color: 'text-amber-400', bg: 'bg-amber-400/10' },
  { to: '/themes', icon: Palette, label: 'Themes', desc: 'Customize your look', color: 'text-rose-400', bg: 'bg-rose-400/10' },
];

function FeaturesDropdown() {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const onClick = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(o => !o)}
        className="flex items-center gap-1 text-sm text-white/70 hover:text-white transition-colors"
      >
        Explore <motion.span animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }}><ChevronDown size={14} /></motion.span>
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.96 }}
            transition={{ duration: 0.15 }}
            className="glass-panel absolute left-1/2 top-12 w-64 -translate-x-1/2 rounded-2xl border p-2 shadow-card"
          >
            {FEATURE_LINKS.map(fl => (
              <Link
                key={fl.to}
                to={fl.to}
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 rounded-xl p-2.5 hover:bg-white/5 transition-colors"
              >
                <div className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg ${fl.bg}`}>
                  <fl.icon size={16} className={fl.color} />
                </div>
                <div>
                  <p className="text-xs font-semibold text-white">{fl.label}</p>
                  <p className="text-[10px] text-white/40">{fl.desc}</p>
                </div>
              </Link>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── User Avatar Dropdown (shown when logged in) ───────────────────────────────
function UserDropdown({ user }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const { logout } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    const onClick = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  const dashboardPath =
    user.role === 'tutor' ? '/tutor/dashboard'
    : user.role === 'admin' ? '/admin'
    : '/student/dashboard';

  const settingsPath =
    user.role === 'tutor' ? '/tutor/settings'
    : '/student/settings';

  const handleLogout = async () => {
    setOpen(false);
    await logout();
    navigate('/');
  };

  return (
    <div ref={ref} className="relative">
      <motion.button
        onClick={() => setOpen(o => !o)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="flex items-center gap-2 rounded-full border border-white/15 bg-white/5 pl-1.5 pr-3 py-1.5"
      >
        <img
          src={`https://api.dicebear.com/7.x/notionists/svg?seed=${user.fullName}`}
          alt=""
          className="h-7 w-7 rounded-full bg-violet/20"
        />
        <span className="text-xs font-semibold text-white">{user.fullName?.split(' ')[0]}</span>
        <motion.span animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }}>
          <ChevronDown size={13} className="text-white/50" />
        </motion.span>
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="glass-panel absolute right-0 top-12 w-52 rounded-2xl border p-2 shadow-card"
          >
            {/* User info header */}
            <div className="flex items-center gap-3 rounded-xl px-3 py-2.5 mb-1">
              <img
                src={`https://api.dicebear.com/7.x/notionists/svg?seed=${user.fullName}`}
                alt=""
                className="h-9 w-9 rounded-full bg-violet/20"
              />
              <div className="min-w-0">
                <p className="truncate text-xs font-semibold text-white">{user.fullName}</p>
                <p className="truncate text-[10px] capitalize text-white/40">{user.role}</p>
              </div>
            </div>

            <div className="my-1 border-t border-white/10" />

            <Link
              to={dashboardPath}
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-white/70 hover:bg-white/5 hover:text-white transition-colors"
            >
              <LayoutDashboard size={15} /> Dashboard
            </Link>

            <Link
              to={settingsPath}
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-white/70 hover:bg-white/5 hover:text-white transition-colors"
            >
              <Settings size={15} /> Settings
            </Link>

            <div className="my-1 border-t border-white/10" />

            <button
              onClick={handleLogout}
              className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-red-400/80 hover:bg-red-500/10 hover:text-red-400 transition-colors"
            >
              <LogOut size={15} /> Log Out
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Main Navbar ───────────────────────────────────────────────────────────────
export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleMobileLogout = async () => {
    setMenuOpen(false);
    await logout();
    navigate('/');
  };

  return (
    <motion.nav
      animate={{ paddingTop: scrolled ? 10 : 20, paddingBottom: scrolled ? 10 : 20 }}
      transition={{ duration: 0.3 }}
      className={`sticky top-0 z-40 flex items-center justify-between px-6 transition-colors duration-300 ${
        scrolled ? 'glass-panel border-b' : 'bg-transparent'
      }`}
    >
      <Link to="/" className="font-display text-lg font-extrabold tracking-tight text-white">
        Edu<span className="text-cyan-electric">Connect</span>
      </Link>

      {/* Desktop Nav */}
      <div className="hidden items-center gap-5 md:flex">
        <Link to="/" className="text-sm text-white/70 hover:text-white transition-colors">Home</Link>
        <Link to="/search" className="text-sm text-white/70 hover:text-white transition-colors">Find a Tutor</Link>
        <FeaturesDropdown />
        <NotificationsDropdown />
        {user ? (
          <UserDropdown user={user} />
        ) : (
          <Link
            to="/login"
            className="rounded-full bg-brand-gradient px-4 py-2 text-sm font-semibold text-slate-deep transition-transform hover:scale-105"
          >
            Log In
          </Link>
        )}
      </div>

      {/* Mobile hamburger */}
      <button className="md:hidden" onClick={() => setMenuOpen((o) => !o)} aria-label="Toggle menu">
        <motion.div animate={{ rotate: menuOpen ? 90 : 0 }} transition={{ duration: 0.25 }}>
          {menuOpen ? <X className="text-white" /> : <Menu className="text-white" />}
        </motion.div>
      </button>

      {/* Mobile menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="glass-panel absolute left-0 right-0 top-full overflow-hidden border-t p-4 md:hidden"
          >
            <div className="flex flex-col gap-3">
              <Link to="/" onClick={() => setMenuOpen(false)} className="text-sm text-white/70">Home</Link>
              <Link to="/search" onClick={() => setMenuOpen(false)} className="text-sm text-white/70">Find a Tutor</Link>
              <div className="border-t border-white/10 pt-2">
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-white/30">Features</p>
                <div className="grid grid-cols-2 gap-2">
                  <Link to="/ai-assistant" onClick={() => setMenuOpen(false)} className="flex items-center gap-2 rounded-xl bg-white/5 p-2 text-xs text-white/70"><Bot size={14} className="text-cyan-electric" /> AI Buddy</Link>
                  <Link to="/study-rooms" onClick={() => setMenuOpen(false)} className="flex items-center gap-2 rounded-xl bg-white/5 p-2 text-xs text-white/70"><Users size={14} className="text-violet" /> Study Rooms</Link>
                  <Link to="/resources" onClick={() => setMenuOpen(false)} className="flex items-center gap-2 rounded-xl bg-white/5 p-2 text-xs text-white/70"><BookOpen size={14} className="text-emerald-400" /> Resources</Link>
                  <Link to="/quizzes" onClick={() => setMenuOpen(false)} className="flex items-center gap-2 rounded-xl bg-white/5 p-2 text-xs text-white/70"><Brain size={14} className="text-amber-400" /> Quizzes</Link>
                </div>
              </div>

              <div className="border-t border-white/10 pt-2">
                {user ? (
                  <>
                    <div className="mb-2 flex items-center gap-2 px-1">
                      <img src={`https://api.dicebear.com/7.x/notionists/svg?seed=${user.fullName}`} alt="" className="h-7 w-7 rounded-full" />
                      <p className="text-sm font-medium text-white">{user.fullName}</p>
                    </div>
                    <Link
                      to={user.role === 'tutor' ? '/tutor/dashboard' : '/student/dashboard'}
                      onClick={() => setMenuOpen(false)}
                      className="flex items-center gap-2 text-sm text-cyan-electric mb-2"
                    >
                      <LayoutDashboard size={14} /> Dashboard
                    </Link>
                    <button
                      onClick={handleMobileLogout}
                      className="flex items-center gap-2 text-sm text-red-400"
                    >
                      <LogOut size={14} /> Log Out
                    </button>
                  </>
                ) : (
                  <Link to="/login" onClick={() => setMenuOpen(false)} className="text-sm text-white/70">Log In</Link>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}
