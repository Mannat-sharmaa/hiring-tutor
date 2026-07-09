import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { NavLink, useNavigate } from 'react-router-dom';
import { Menu, X, LogOut } from 'lucide-react';
import useAuthStore from '../store/authStore';
import NotificationBell from './NotificationBell';

// One layout, driven by a `links` prop, so Student/Tutor/Admin dashboards
// each pass their own nav items instead of duplicating the shell.
export default function DashboardLayout({ links, children, title }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const Sidebar = (
    <div className="flex h-full flex-col justify-between">
      <div>
        <a href="/" className="mb-8 block font-display text-lg font-extrabold text-white">
          Edu<span className="text-cyan-electric">Connect</span>
        </a>
        <nav className="space-y-1">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                  isActive ? 'bg-violet/20 text-violet' : 'text-white/60 hover:bg-white/5 hover:text-white'
                }`
              }
            >
              <link.icon size={18} />
              {link.label}
            </NavLink>
          ))}
        </nav>
      </div>

      <div className="border-t border-white/10 pt-4">
        <div className="mb-3 flex items-center gap-3 px-1">
          <img
            src={user?.avatar || `https://api.dicebear.com/7.x/notionists/svg?seed=${user?.fullName || 'guest'}`}
            alt=""
            className="h-9 w-9 rounded-full object-cover border border-white/10"
          />
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-white">{user?.fullName || 'Guest'}</p>
            <p className="truncate text-xs text-white/40 capitalize">{user?.role || ''}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-red-400/80 hover:bg-red-500/10 hover:text-red-400 transition-colors"
        >
          <LogOut size={18} /> Log Out
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--color-bg)' }}>
      {/* Desktop sidebar - fixed */}
      <aside className="fixed inset-y-0 left-0 hidden w-64 glass-panel border-r p-5 lg:block">
        {Sidebar}
      </aside>

      {/* Mobile sidebar - slide in */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              className="fixed inset-0 z-40 bg-black/60 lg:hidden"
            />
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="fixed inset-y-0 left-0 z-50 w-64 glass-panel border-r p-5 lg:hidden"
            >
              {Sidebar}
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      <div className="lg:pl-64">
        {/* Top bar — visible on all sizes, shows title + notification bell */}
        <header className="sticky top-0 z-30 flex items-center justify-between border-b border-white/10 px-6 py-3 backdrop-blur-md bg-[var(--color-bg)]/80">
          <div className="flex items-center gap-3">
            {/* Hamburger — only on mobile */}
            <button
              onClick={() => setMobileOpen(true)}
              className="lg:hidden text-white/60 hover:text-white"
            >
              <Menu size={22} />
            </button>
            <h1 className="font-display text-lg font-extrabold text-white">{title}</h1>
          </div>

          {/* Right side: notification bell + avatar */}
          <div className="flex items-center gap-3">
            <NotificationBell />
            <img
              src={user?.avatar || `https://api.dicebear.com/7.x/notionists/svg?seed=${user?.fullName || 'guest'}`}
              alt=""
              className="h-8 w-8 rounded-full object-cover border border-white/15"
            />
          </div>
        </header>

        <main className="mx-auto max-w-6xl px-6 py-8">
          {children}
        </main>
      </div>
    </div>
  );
}
