import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LayoutDashboard, User, CalendarDays, Inbox, Wallet, MessageCircle, Settings, ArrowDownToLine, Loader2 } from 'lucide-react';
import DashboardLayout from '../components/DashboardLayout';
import StatCard from '../components/StatCard';
import api from '../services/api';

const LINKS = [
  { to: '/tutor/dashboard', label: 'Overview', icon: LayoutDashboard },
  { to: '/tutor/profile', label: 'My Profile', icon: User },
  { to: '/tutor/schedule', label: 'Availability', icon: CalendarDays },
  { to: '/tutor/bookings', label: 'Requests', icon: Inbox },
  { to: '/tutor/earnings', label: 'Earnings', icon: Wallet, end: true },
  { to: '/chat', label: 'Chat', icon: MessageCircle },
  { to: '/tutor/settings', label: 'Settings', icon: Settings },
];

function formatDate(iso) {
  if (!iso) return '';
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function TutorEarningsPage() {
  const [showModal, setShowModal] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ total: 0, pending: 0, withdrawable: 0 });

  useEffect(() => {
    Promise.all([
      api.get('/bookings/me', { params: { status: 'completed' } }),
      api.get('/bookings/me', { params: { status: 'upcoming' } }),
    ]).then(([compRes, upRes]) => {
      const completed = compRes.data.bookings || [];
      const upcoming = upRes.data.bookings || [];

      // Total earned from completed sessions
      const total = completed.reduce((sum, b) => sum + (b.pricing?.tutorFee || 0), 0);

      // Pending = confirmed but not yet completed
      const pendingEarnings = upcoming
        .filter((b) => b.status === 'confirmed')
        .reduce((sum, b) => sum + (b.pricing?.tutorFee || 0), 0);

      // Withdrawable = 80% of total (simulating platform hold period)
      const withdrawable = Math.round(total * 0.8);

      setStats({ total, pending: pendingEarnings, withdrawable });
      setTransactions(completed);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  return (
    <DashboardLayout links={LINKS} title="Earnings">
      {loading ? (
        <div className="flex justify-center py-24">
          <Loader2 className="animate-spin text-cyan-electric" size={32} />
        </div>
      ) : (
        <>
          <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
            <StatCard label="Total Earned" value={stats.total} prefix="₹" accent="violet" />
            <StatCard label="Pending Balance" value={stats.pending} prefix="₹" accent="cyan" />
            <StatCard label="Withdrawable" value={stats.withdrawable} prefix="₹" accent="violet" />
          </div>

          <div className="mb-8">
            <button
              onClick={() => setShowModal(true)}
              className="flex items-center gap-2 rounded-xl bg-brand-gradient px-5 py-3 text-sm font-semibold text-slate-deep"
            >
              <ArrowDownToLine size={16} /> Withdraw Funds
            </button>
          </div>

          <div className="glass-panel overflow-hidden rounded-2xl">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-white/10 text-xs text-white/40">
                  <th className="p-4 font-medium">Student</th>
                  <th className="p-4 font-medium">Subject</th>
                  <th className="p-4 font-medium">Date</th>
                  <th className="p-4 font-medium">Amount</th>
                  <th className="p-4 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((t) => (
                  <tr key={t._id} className="border-b border-white/5 last:border-0">
                    <td className="p-4 text-white">{t.student?.fullName || 'Student'}</td>
                    <td className="p-4 text-white/60">{t.subject?.name || '—'}</td>
                    <td className="p-4 text-white/60">{formatDate(t.scheduledDate)}</td>
                    <td className="p-4 text-white">₹{(t.pricing?.tutorFee || 0).toFixed(2)}</td>
                    <td className="p-4">
                      <span className="rounded-full bg-green-500/15 px-2.5 py-1 text-xs font-medium text-green-400">
                        Paid
                      </span>
                    </td>
                  </tr>
                ))}
                {transactions.length === 0 && (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-sm text-white/40">
                      No completed sessions yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </>
      )}

      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setShowModal(false)}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-6"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
              onClick={(e) => e.stopPropagation()}
              className="glass-panel w-full max-w-sm rounded-2xl p-6"
            >
              <h3 className="font-display text-lg font-bold text-white">Withdraw Funds</h3>
              <p className="mt-1 text-xs text-white/50">Available: ₹{stats.withdrawable.toFixed(2)}</p>
              <input
                type="number"
                value={withdrawAmount}
                onChange={(e) => setWithdrawAmount(e.target.value)}
                placeholder="Amount"
                max={stats.withdrawable}
                className="mt-4 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-white/40 outline-none focus:border-violet"
              />
              <select className="mt-3 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none focus:border-violet">
                <option className="bg-indigo">Bank Transfer</option>
                <option className="bg-indigo">PayPal</option>
                <option className="bg-indigo">JazzCash</option>
                <option className="bg-indigo">EasyPaisa</option>
              </select>
              <div className="mt-5 flex gap-3">
                <button onClick={() => setShowModal(false)} className="flex-1 rounded-xl border border-white/15 py-2.5 text-sm text-white/70">
                  Cancel
                </button>
                <button
                  onClick={() => {
                    // Withdrawal flow would integrate payment gateway here
                    setShowModal(false);
                  }}
                  className="flex-1 rounded-xl bg-brand-gradient py-2.5 text-sm font-semibold text-slate-deep"
                >
                  Confirm
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </DashboardLayout>
  );
}
