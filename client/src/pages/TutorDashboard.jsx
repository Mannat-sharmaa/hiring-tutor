import { useEffect, useState } from 'react';
import { LayoutDashboard, User, CalendarDays, Inbox, Wallet, MessageCircle, Settings, Loader2, Video } from 'lucide-react';
import { motion } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import DashboardLayout from '../components/DashboardLayout';
import StatCard from '../components/StatCard';
import useAuthStore from '../store/authStore';
import api from '../services/api';

const LINKS = [
  { to: '/tutor/dashboard', label: 'Overview', icon: LayoutDashboard, end: true },
  { to: '/tutor/profile', label: 'My Profile', icon: User },
  { to: '/tutor/schedule', label: 'Availability', icon: CalendarDays },
  { to: '/tutor/bookings', label: 'Requests', icon: Inbox },
  { to: '/tutor/earnings', label: 'Earnings', icon: Wallet },
  { to: '/chat', label: 'Chat', icon: MessageCircle },
  { to: '/tutor/settings', label: 'Settings', icon: Settings },
];

function buildWeeklyChart(bookings) {
  const weeks = {};
  bookings.forEach((b) => {
    const d = new Date(b.scheduledDate);
    // ISO week key
    const week = `W${Math.ceil(d.getDate() / 7)}`;
    const earned = b.pricing?.tutorFee || 0;
    weeks[week] = (weeks[week] || 0) + earned;
  });
  return Object.entries(weeks).map(([week, amount]) => ({ week, amount }));
}

function formatDate(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  const today = new Date();
  if (d.toDateString() === today.toDateString()) return 'Today';
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export default function TutorDashboard() {
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [todayClasses, setTodayClasses] = useState([]);
  const [stats, setStats] = useState({ earnings: 0, students: 0, completed: 0, rating: 0 });
  const [chartData, setChartData] = useState([]);

  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];

    Promise.all([
      api.get('/bookings/me', { params: { status: 'upcoming' } }),
      api.get('/bookings/me', { params: { status: 'completed' } }),
    ]).then(([upRes, compRes]) => {
      const upcoming = upRes.data.bookings || [];
      const completed = compRes.data.bookings || [];

      // Today's confirmed sessions
      const todayConfirmed = upcoming.filter(
        (b) => b.status === 'confirmed' && b.scheduledDate?.slice(0, 10) === today
      );
      setTodayClasses(todayConfirmed);

      // Stats
      const totalEarnings = completed.reduce((sum, b) => sum + (b.pricing?.tutorFee || 0), 0);
      const uniqueStudents = new Set(completed.map((b) => b.student?._id?.toString())).size;
      setStats({
        earnings: totalEarnings,
        students: uniqueStudents,
        completed: completed.length,
        rating: user?.rating || 0,
      });

      // Chart
      setChartData(buildWeeklyChart(completed));
    }).catch(() => {}).finally(() => setLoading(false));
  }, [user]);

  if (loading) {
    return (
      <DashboardLayout links={LINKS} title="Overview">
        <div className="flex justify-center py-24">
          <Loader2 className="animate-spin text-cyan-electric" size={32} />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout links={LINKS} title="Overview">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-8 glass-panel rounded-2xl p-6">
        <h2 className="font-display text-xl font-bold text-white">
          Welcome back, {user?.fullName?.split(' ')[0] || 'Tutor'} 👋
        </h2>
        <p className="mt-1 text-sm text-white/50">Here's how your teaching is going this month.</p>
      </motion.div>

      <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard label="Earnings (Total)" value={stats.earnings} prefix="$" accent="cyan" />
        <StatCard label="Total Students" value={stats.students} accent="violet" />
        <StatCard label="Classes Completed" value={stats.completed} accent="violet" />
        <StatCard label="Rating" value={stats.rating || '—'} accent="cyan" />
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_320px]">
        <section className="glass-panel rounded-2xl p-6">
          <h3 className="mb-4 font-display text-sm font-bold text-white">Earnings by Week</h3>
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
                <XAxis dataKey="week" stroke="rgba(255,255,255,0.4)" fontSize={12} />
                <YAxis stroke="rgba(255,255,255,0.4)" fontSize={12} />
                <Tooltip contentStyle={{ background: '#1A1A2E', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8 }} />
                <Line type="monotone" dataKey="amount" stroke="#00F2FE" strokeWidth={2.5} dot={{ fill: '#6C63FF', r: 4 }} isAnimationActive />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-[220px] items-center justify-center">
              <p className="text-sm text-white/40">Complete sessions to see earnings chart.</p>
            </div>
          )}
        </section>

        <aside>
          <h3 className="mb-4 font-display text-sm font-bold text-white">Today's Schedule</h3>
          <div className="space-y-3">
            {todayClasses.map((cls) => (
              <motion.div key={cls._id} whileHover={{ y: -2 }} className="glass-panel rounded-xl p-4">
                <p className="text-sm font-medium text-white">{cls.subject?.name || 'Class'}</p>
                <p className="text-xs text-white/50">with {cls.student?.fullName || 'Student'}</p>
                <div className="mt-2 flex items-center justify-between">
                  <span className="text-xs font-medium text-cyan-electric">{cls.startTime}</span>
                  <button className="rounded-lg bg-brand-gradient px-3 py-1 text-[11px] font-semibold text-slate-deep">
                    Join
                  </button>
                </div>
              </motion.div>
            ))}
            {todayClasses.length === 0 && (
              <div className="glass-panel rounded-xl p-5 text-center">
                <p className="text-xs text-white/40">No classes today.</p>
              </div>
            )}
          </div>

          <div className="mt-6 grid grid-cols-2 gap-3">
            <a href="/tutor/schedule" className="rounded-xl border border-white/15 p-3 text-xs font-medium text-white/70 hover:bg-white/5 text-center">
              Update Availability
            </a>
            <a href="/tutor/profile" className="rounded-xl border border-white/15 p-3 text-xs font-medium text-white/70 hover:bg-white/5 text-center">
              Edit Profile
            </a>
          </div>
        </aside>
      </div>
    </DashboardLayout>
  );
}
