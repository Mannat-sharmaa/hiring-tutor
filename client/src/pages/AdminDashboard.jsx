import { useState } from 'react';
import { motion } from 'framer-motion';
import { LayoutDashboard, ShieldCheck, Users, CreditCard, MessageSquareWarning, Settings, Check, X as XIcon } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import DashboardLayout from '../components/DashboardLayout';
import StatCard from '../components/StatCard';
import ADMIN_LINKS from '../constants/adminLinks';

const REVENUE = [
  { month: 'Jan', revenue: 4200 }, { month: 'Feb', revenue: 5100 }, { month: 'Mar', revenue: 4800 },
  { month: 'Apr', revenue: 6300 }, { month: 'May', revenue: 7200 }, { month: 'Jun', revenue: 8100 },
];

const SUBJECT_POPULARITY = [
  { name: 'Math', value: 32 }, { name: 'Programming', value: 26 }, { name: 'Languages', value: 18 },
  { name: 'Music', value: 14 }, { name: 'Science', value: 10 },
];
const COLORS = ['#6C63FF', '#00F2FE', '#8B7FFF', '#4CD5DE', '#3A3A5C'];

const PENDING_TUTORS = [
  { id: 1, name: 'Karan Patel', submitted: 'ID, Degree', date: '2 days ago' },
  { id: 2, name: 'Fatima Noor', submitted: 'ID', date: '5 hours ago' },
];

const USERS = [
  { id: 1, name: 'Ayesha Khan', email: 'ayesha@example.com', role: 'tutor', status: 'active' },
  { id: 2, name: 'Zara M.', email: 'zara@example.com', role: 'student', status: 'active' },
  { id: 3, name: 'John Doe', email: 'john@example.com', role: 'student', status: 'banned' },
];

export default function AdminDashboard() {
  const [pending, setPending] = useState(PENDING_TUTORS);

  const decide = (id, decision) => {
    setPending((p) => p.filter((t) => t.id !== id));
    // In production this calls PATCH /api/admin/tutors/:id/verify with { decision }
  };

  return (
    <DashboardLayout links={ADMIN_LINKS} title="Analytics">
      <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Total Users" value={12480} accent="violet" />
        <StatCard label="Verified Tutors" value={892} accent="cyan" />
        <StatCard label="Total Revenue" value={35700} prefix="$" accent="violet" />
        <StatCard label="Bookings Today" value={214} accent="cyan" />
      </div>

      <div className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="glass-panel rounded-2xl p-6">
          <h3 className="mb-4 font-display text-sm font-bold text-white">Monthly Revenue</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={REVENUE}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
              <XAxis dataKey="month" stroke="rgba(255,255,255,0.4)" fontSize={12} />
              <YAxis stroke="rgba(255,255,255,0.4)" fontSize={12} />
              <Tooltip contentStyle={{ background: '#1A1A2E', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8 }} />
              <Bar dataKey="revenue" fill="#6C63FF" radius={[6, 6, 0, 0]} isAnimationActive />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="glass-panel rounded-2xl p-6">
          <h3 className="mb-4 font-display text-sm font-bold text-white">Subject Popularity</h3>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={SUBJECT_POPULARITY} dataKey="value" nameKey="name" innerRadius={50} outerRadius={80} isAnimationActive>
                {SUBJECT_POPULARITY.map((entry, i) => (
                  <Cell key={entry.name} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ background: '#1A1A2E', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8 }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Tutor verification queue */}
        <div className="glass-panel rounded-2xl p-6">
          <h3 className="mb-4 font-display text-sm font-bold text-white">Pending Tutor Verifications</h3>
          <div className="space-y-3">
            {pending.map((t) => (
              <motion.div
                key={t.id}
                layout
                exit={{ opacity: 0, x: -20 }}
                className="flex items-center justify-between rounded-xl bg-white/5 p-3"
              >
                <div>
                  <p className="text-sm font-medium text-white">{t.name}</p>
                  <p className="text-xs text-white/40">{t.submitted} · {t.date}</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => decide(t.id, 'approve')}
                    className="rounded-lg bg-green-500/20 p-2 text-green-400 hover:bg-green-500/30"
                  >
                    <Check size={14} />
                  </button>
                  <button
                    onClick={() => decide(t.id, 'reject')}
                    className="rounded-lg bg-red-500/20 p-2 text-red-400 hover:bg-red-500/30"
                  >
                    <XIcon size={14} />
                  </button>
                </div>
              </motion.div>
            ))}
            {pending.length === 0 && <p className="text-sm text-white/40">No tutors awaiting verification.</p>}
          </div>
        </div>

        {/* User management table */}
        <div className="glass-panel rounded-2xl p-6">
          <h3 className="mb-4 font-display text-sm font-bold text-white">Recent Users</h3>
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="text-xs text-white/40">
                <th className="pb-2 font-medium">Name</th>
                <th className="pb-2 font-medium">Role</th>
                <th className="pb-2 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {USERS.map((u) => (
                <tr key={u.id} className="border-t border-white/5">
                  <td className="py-2.5">
                    <p className="text-white">{u.name}</p>
                    <p className="text-xs text-white/40">{u.email}</p>
                  </td>
                  <td className="py-2.5 capitalize text-white/60">{u.role}</td>
                  <td className="py-2.5">
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                        u.status === 'active' ? 'bg-green-500/15 text-green-400' : 'bg-red-500/15 text-red-400'
                      }`}
                    >
                      {u.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
}
