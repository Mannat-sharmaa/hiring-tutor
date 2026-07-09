import { useEffect, useState } from 'react';
import { LayoutDashboard, Search, Calendar, Heart, MessageCircle, Wallet, Settings, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../components/DashboardLayout';
import StatCard from '../components/StatCard';
import TutorCard from '../components/TutorCard';
import useAuthStore from '../store/authStore';
import api from '../services/api';

const LINKS = [
  { to: '/student/dashboard', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/search', label: 'Find a Tutor', icon: Search },
  { to: '/student/bookings', label: 'My Bookings', icon: Calendar },
  { to: '/student/favorites', label: 'Favorites', icon: Heart },
  { to: '/chat', label: 'Chat', icon: MessageCircle },
  { to: '/student/payments', label: 'Payments', icon: Wallet },
  { to: '/student/settings', label: 'Settings', icon: Settings },
];

function formatDate(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);

  if (d.toDateString() === today.toDateString()) return `Today · ${iso.slice(0, 10)}`;
  if (d.toDateString() === tomorrow.toDateString()) return `Tomorrow · ${iso.slice(0, 10)}`;
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export default function StudentDashboard() {
  const { user } = useAuthStore();
  const navigate = useNavigate();

  const [tutors, setTutors] = useState([]);
  const [loadingTutors, setLoadingTutors] = useState(true);
  const [upcoming, setUpcoming] = useState([]);
  const [stats, setStats] = useState({ total: 0, upcoming: 0, hours: 0 });

  // Load recommended tutors
  useEffect(() => {
    api.get('/tutors/search', { params: { limit: 4 } })
      .then(({ data }) => setTutors(data.results || []))
      .catch(() => setTutors([]))
      .finally(() => setLoadingTutors(false));
  }, []);

  // Load upcoming bookings for the sidebar schedule
  useEffect(() => {
    api.get('/bookings/me', { params: { status: 'upcoming' } })
      .then(({ data }) => {
        const bookings = data.bookings || [];
        setUpcoming(bookings.slice(0, 3));
        // Compute stats from all bookings
        setStats({
          upcoming: bookings.length,
        });
      })
      .catch(() => setUpcoming([]));

    // Load total completed for stats
    api.get('/bookings/me', { params: { status: 'completed' } })
      .then(({ data }) => {
        const completed = data.bookings || [];
        const hours = completed.reduce((sum, b) => sum + (b.durationMinutes || 60) / 60, 0);
        setStats((prev) => ({
          ...prev,
          total: completed.length,
          hours: Math.round(hours),
        }));
      })
      .catch(() => {});
  }, []);

  return (
    <DashboardLayout links={LINKS} title="Dashboard">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-8 glass-panel rounded-2xl p-6">
        <h2 className="font-display text-xl font-bold text-white">
          Welcome back, {user?.fullName?.split(' ')[0] || 'Student'} 👋
        </h2>
        <p className="mt-1 text-sm text-white/50">Here's what's happening with your learning this week.</p>
      </motion.div>

      <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-3">
        <StatCard label="Total Classes" value={stats.total} accent="violet" />
        <StatCard label="Upcoming Classes" value={stats.upcoming} accent="cyan" />
        <StatCard label="Hours Learned" value={stats.hours} suffix="h" accent="violet" />
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_320px]">
        <section>
          <h3 className="mb-4 font-display text-sm font-bold text-white">Recommended for You</h3>
          {loadingTutors ? (
            <div className="flex justify-center py-10">
              <Loader2 className="animate-spin text-cyan-electric" size={24} />
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              {tutors.map((tutor, i) => (
                <TutorCard
                  key={tutor._id}
                  tutor={tutor}
                  index={i}
                  onOpen={(t) => navigate(`/tutors/${t._id}`)}
                />
              ))}
              {tutors.length === 0 && (
                <p className="col-span-2 py-8 text-center text-sm text-white/40">No tutors found.</p>
              )}
            </div>
          )}
        </section>

        <aside>
          <h3 className="mb-4 font-display text-sm font-bold text-white">Upcoming Schedule</h3>
          <div className="space-y-3">
            {upcoming.map((cls) => (
              <motion.div
                key={cls._id}
                whileHover={{ y: -2 }}
                className="glass-panel rounded-xl p-4"
              >
                <p className="text-sm font-medium text-white">{cls.subject?.name || 'Class'}</p>
                <p className="text-xs text-white/50">with {cls.tutor?.fullName || 'Tutor'}</p>
                <p className="mt-2 text-xs font-medium text-cyan-electric">
                  {formatDate(cls.scheduledDate)} · {cls.startTime}
                </p>
              </motion.div>
            ))}
            {upcoming.length === 0 && (
              <div className="glass-panel rounded-xl p-5 text-center">
                <p className="text-xs text-white/40">No upcoming classes.</p>
                <a href="/search" className="mt-2 inline-block text-xs text-cyan-electric hover:underline">
                  Book one now →
                </a>
              </div>
            )}
          </div>
        </aside>
      </div>
    </DashboardLayout>
  );
}
