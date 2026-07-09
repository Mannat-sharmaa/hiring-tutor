import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Check, CheckCheck, X, ExternalLink } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useNotifications } from '../hooks/useNotifications';

const TYPE_ICON = {
  booking_requested : '📅',
  booking_confirmed : '🎉',
  booking_cancelled : '❌',
  payment_received  : '💰',
  class_reminder    : '⏰',
  new_review        : '⭐',
  tutor_verified    : '✅',
  tutor_rejected    : '⚠️',
  message           : '💬',
  system            : '🔔',
};

function timeAgo(iso) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export default function NotificationBell() {
  const [open, setOpen] = useState(false);
  const panelRef = useRef(null);
  const navigate = useNavigate();
  const { notifications, unreadCount, loading, markAllRead, markOneRead } = useNotifications();

  // Close when clicking outside
  useEffect(() => {
    const handler = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleNotifClick = async (notif) => {
    if (!notif.isRead) await markOneRead(notif._id);
    setOpen(false);
    if (notif.link) navigate(notif.link);
  };

  return (
    <div className="relative" ref={panelRef}>
      {/* Bell button */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="relative flex h-9 w-9 items-center justify-center rounded-full bg-white/5 hover:bg-white/10 border border-white/10 transition-all"
        aria-label="Notifications"
      >
        {unreadCount > 0 && (
          <span className="absolute inset-0 rounded-full bg-cyan-electric/20 animate-ping -z-10" />
        )}
        <motion.div
          animate={unreadCount > 0 ? {
            rotate: [0, -18, 15, -12, 8, -4, 0],
          } : {}}
          transition={{
            duration: 1.6,
            repeat: Infinity,
            repeatDelay: 3.5,
            ease: "easeInOut"
          }}
        >
          <Bell size={17} className="text-white/80" />
        </motion.div>
        {unreadCount > 0 && (
          <motion.span
            key={unreadCount}
            initial={{ scale: 0.5 }}
            animate={{ scale: 1 }}
            className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white"
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </motion.span>
        )}
      </button>

      {/* Dropdown panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.97 }}
            transition={{ duration: 0.18 }}
            className="absolute right-0 top-11 z-50 w-80 rounded-2xl border border-white/10 bg-[#0D0D1C] shadow-2xl shadow-black/60 overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <Bell size={14} className="text-cyan-electric" />
                Notifications
                {unreadCount > 0 && (
                  <span className="rounded-full bg-red-500 px-1.5 py-0.5 text-[9px] font-bold text-white">
                    {unreadCount}
                  </span>
                )}
              </h4>
              <div className="flex items-center gap-1">
                {unreadCount > 0 && (
                  <button
                    onClick={markAllRead}
                    title="Mark all read"
                    className="flex items-center gap-1 rounded-lg px-2 py-1 text-[10px] text-white/50 hover:bg-white/5 hover:text-cyan-electric transition-all"
                  >
                    <CheckCheck size={12} /> All read
                  </button>
                )}
                <button
                  onClick={() => setOpen(false)}
                  className="rounded-lg p-1 text-white/30 hover:bg-white/5 hover:text-white transition-all"
                >
                  <X size={14} />
                </button>
              </div>
            </div>

            {/* List */}
            <div className="max-h-[360px] overflow-y-auto">
              {loading ? (
                <div className="py-10 text-center text-xs text-white/30">Loading...</div>
              ) : notifications.length === 0 ? (
                <div className="flex flex-col items-center py-10 gap-2">
                  <Bell size={28} className="text-white/10" />
                  <p className="text-xs text-white/30">No notifications yet</p>
                </div>
              ) : (
                notifications.map((n) => (
                  <button
                    key={n._id}
                    onClick={() => handleNotifClick(n)}
                    className={`flex w-full items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-white/5 border-b border-white/5 last:border-0 ${
                      !n.isRead ? 'bg-cyan-electric/5' : ''
                    }`}
                  >
                    {/* Icon */}
                    <span className="mt-0.5 text-base flex-shrink-0">
                      {TYPE_ICON[n.type] || '🔔'}
                    </span>

                    {/* Content */}
                    <div className="min-w-0 flex-1">
                      <p className={`text-xs font-semibold leading-snug ${!n.isRead ? 'text-white' : 'text-white/70'}`}>
                        {n.title}
                      </p>
                      {n.body && (
                        <p className="mt-0.5 text-[11px] text-white/50 leading-relaxed line-clamp-2">
                          {n.body}
                        </p>
                      )}
                      <p className="mt-1 text-[10px] text-white/30">{timeAgo(n.createdAt)}</p>
                    </div>

                    {/* Unread dot + link icon */}
                    <div className="flex flex-col items-center gap-2 flex-shrink-0 mt-0.5">
                      {!n.isRead && (
                        <span className="h-2 w-2 rounded-full bg-cyan-electric" />
                      )}
                      {n.link && (
                        <ExternalLink size={10} className="text-white/20" />
                      )}
                    </div>
                  </button>
                ))
              )}
            </div>

            {/* Footer */}
            {notifications.length > 0 && (
              <div className="border-t border-white/10 px-4 py-2.5 text-center">
                <button
                  onClick={() => { setOpen(false); markAllRead(); }}
                  className="text-[11px] text-white/40 hover:text-cyan-electric transition-colors flex items-center gap-1 mx-auto"
                >
                  <Check size={11} /> Mark all as read
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
