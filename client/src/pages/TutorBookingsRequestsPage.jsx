import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { LayoutDashboard, User, CalendarDays, Inbox, Wallet, MessageCircle, Settings, Check, X as XIcon, Video, Loader2, Sparkles, X } from 'lucide-react';
import DashboardLayout from '../components/DashboardLayout';
import api from '../services/api';

const LINKS = [
  { to: '/tutor/dashboard', label: 'Overview', icon: LayoutDashboard },
  { to: '/tutor/profile', label: 'My Profile', icon: User },
  { to: '/tutor/schedule', label: 'Availability', icon: CalendarDays },
  { to: '/tutor/bookings', label: 'Requests', icon: Inbox, end: true },
  { to: '/tutor/earnings', label: 'Earnings', icon: Wallet },
  { to: '/chat', label: 'Chat', icon: MessageCircle },
  { to: '/tutor/settings', label: 'Settings', icon: Settings },
];

function formatDate(iso) {
  if (!iso) return '';
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function TutorBookingsRequestsPage() {
  const navigate = useNavigate();
  const [pending, setPending] = useState([]);
  const [upcoming, setUpcoming] = useState([]);
  const [past, setPast] = useState([]);
  const [selectedNotes, setSelectedNotes] = useState(null);
  const [loading, setLoading] = useState(true);
  const [acting, setActing] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const [upRes, compRes] = await Promise.all([
        api.get('/bookings/me', { params: { status: 'upcoming' } }),
        api.get('/bookings/me', { params: { status: 'completed' } }),
      ]);
      const allUpcoming = upRes.data.bookings || [];
      setPending(allUpcoming.filter((b) => b.status === 'pending'));
      setUpcoming(allUpcoming.filter((b) => b.status === 'confirmed'));
      setPast(compRes.data.bookings || []);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const respond = async (id, action) => {
    setActing(id + action);
    try {
      await api.patch(`/bookings/${id}/respond`, { action });
      await load();
    } catch {
      // silent
    } finally {
      setActing(null);
    }
  };

  if (loading) {
    return (
      <DashboardLayout links={LINKS} title="Bookings & Requests">
        <div className="flex justify-center py-24">
          <Loader2 className="animate-spin text-cyan-electric" size={32} />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout links={LINKS} title="Bookings & Requests">
      {/* Incoming Requests */}
      <section className="mb-8">
        <h3 className="mb-3 font-display text-sm font-bold text-white">
          Incoming Requests
          {pending.length > 0 && (
            <span className="ml-2 rounded-full bg-violet/20 px-2 py-0.5 text-xs text-violet">{pending.length}</span>
          )}
        </h3>
        <div className="space-y-3">
          <AnimatePresence>
            {pending.map((r) => (
              <motion.div
                key={r._id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="glass-panel flex flex-wrap items-center justify-between gap-3 rounded-2xl p-4"
              >
                <div>
                  <p className="text-sm font-medium text-white">
                    {r.subject?.name || 'Class'} — {r.student?.fullName || 'Student'}
                  </p>
                  <p className="text-xs text-white/50">{formatDate(r.scheduledDate)} · {r.startTime}</p>
                  <p className="mt-0.5 text-xs text-white/30">{r.durationMinutes} min · {r.classType}</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => respond(r._id, 'accept')}
                    disabled={!!acting}
                    className="flex items-center gap-1 rounded-lg bg-green-500/20 px-3 py-1.5 text-xs font-medium text-green-400 hover:bg-green-500/30 disabled:opacity-50"
                  >
                    {acting === r._id + 'accept' ? <Loader2 size={12} className="animate-spin" /> : <Check size={13} />}
                    Accept
                  </button>
                  <button
                    onClick={() => respond(r._id, 'reject')}
                    disabled={!!acting}
                    className="flex items-center gap-1 rounded-lg bg-red-500/20 px-3 py-1.5 text-xs font-medium text-red-400 hover:bg-red-500/30 disabled:opacity-50"
                  >
                    {acting === r._id + 'reject' ? <Loader2 size={12} className="animate-spin" /> : <XIcon size={13} />}
                    Reject
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          {pending.length === 0 && (
            <p className="rounded-xl glass-panel py-6 text-center text-sm text-white/40">No pending requests.</p>
          )}
        </div>
      </section>

      {/* Upcoming Confirmed Classes */}
      <section className="mb-8">
        <h3 className="mb-3 font-display text-sm font-bold text-white">Upcoming Classes</h3>
        <div className="space-y-3">
          {upcoming.map((c) => (
            <div key={c._id} className="glass-panel flex items-center justify-between rounded-2xl p-4">
              <div>
                <p className="text-sm font-medium text-white">
                  {c.subject?.name || 'Class'} — {c.student?.fullName || 'Student'}
                </p>
                <p className="text-xs text-white/50">{formatDate(c.scheduledDate)} · {c.startTime}</p>
              </div>
              <button 
                onClick={() => navigate(`/classroom/${c._id}`)}
                className="flex items-center gap-1 rounded-lg bg-brand-gradient px-3 py-1.5 text-xs font-semibold text-slate-deep"
              >
                <Video size={13} /> Start Class
              </button>
            </div>
          ))}
          {upcoming.length === 0 && (
            <p className="rounded-xl glass-panel py-6 text-center text-sm text-white/40">No upcoming confirmed classes.</p>
          )}
        </div>
      </section>

      {/* Past / Completed */}
      <section>
        <h3 className="mb-3 font-display text-sm font-bold text-white">Past Classes</h3>
        <div className="space-y-3">
          {past.map((c) => (
            <div key={c._id} className="glass-panel rounded-2xl p-4">
              <p className="text-sm font-medium text-white">
                {c.subject?.name || 'Class'} — {c.student?.fullName || 'Student'}
              </p>
              <p className="text-xs text-white/50">{formatDate(c.scheduledDate)}</p>
              {c.pricing?.tutorFee && (
                <p className="mt-1 text-xs text-cyan-electric">Earned: ${c.pricing.tutorFee}</p>
              )}
              {c.aiNotes && (
                <button 
                  onClick={() => setSelectedNotes(c.aiNotes)}
                  className="mt-2 flex items-center gap-1.5 rounded-lg bg-[#00F2FE]/15 border border-[#00F2FE]/30 px-3 py-1.5 text-xs font-semibold text-[#00F2FE] hover:bg-[#00F2FE]/25 transition-all"
                >
                  <Sparkles size={12} /> View AI Notes
                </button>
              )}
            </div>
          ))}
          {past.length === 0 && (
            <p className="rounded-xl glass-panel py-6 text-center text-sm text-white/40">No completed classes yet.</p>
          )}
        </div>
      </section>

      {/* AI Notes Viewer Modal */}
      <AnimatePresence>
        {selectedNotes && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              className="w-full max-w-lg rounded-2xl border border-white/10 bg-[#0A0A14] p-6 shadow-2xl"
            >
              <div className="mb-4 flex items-center justify-between border-b border-white/10 pb-3">
                <h3 className="flex items-center gap-2 font-display text-base font-bold text-cyan-electric">
                  <Sparkles size={18} /> AI Class Notes & Homework
                </h3>
                <button
                  onClick={() => setSelectedNotes(null)}
                  className="rounded-lg p-1.5 text-white/40 hover:bg-white/5 hover:text-white"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="space-y-4 max-h-[380px] overflow-y-auto pr-1 text-white">
                <div>
                  <h4 className="text-xs font-bold text-white/50 uppercase tracking-wider mb-2">Core Concepts covered</h4>
                  <ul className="list-disc pl-5 space-y-2 text-sm text-white/80">
                    {selectedNotes.coreConcepts?.map((concept, idx) => (
                      <li key={idx}>{concept}</li>
                    ))}
                    {(!selectedNotes.coreConcepts || selectedNotes.coreConcepts.length === 0) && (
                      <li className="text-white/40 italic">No notes summary found.</li>
                    )}
                  </ul>
                </div>

                <div className="border-t border-white/5 pt-4">
                  <h4 className="text-xs font-bold text-white/50 uppercase tracking-wider mb-2">Homework & Exercises</h4>
                  <ol className="list-decimal pl-5 space-y-2 text-sm text-white/80">
                    {selectedNotes.homework?.map((task, idx) => (
                      <li key={idx}>{task}</li>
                    ))}
                    {(!selectedNotes.homework || selectedNotes.homework.length === 0) && (
                      <li className="text-white/40 italic">No homework recommended.</li>
                    )}
                  </ol>
                </div>
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => setSelectedNotes(null)}
                  className="rounded-xl bg-brand-gradient px-4 py-2 text-xs font-semibold text-slate-deep"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </DashboardLayout>
  );
}
