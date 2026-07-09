import { LayoutDashboard, Search, Calendar, Heart, MessageCircle, Wallet, Settings } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../components/DashboardLayout';
import TutorCard from '../components/TutorCard';
import MOCK_TUTORS from '../services/mockTutors';

const LINKS = [
  { to: '/student/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/search', label: 'Find a Tutor', icon: Search },
  { to: '/student/bookings', label: 'My Bookings', icon: Calendar },
  { to: '/student/favorites', label: 'Favorites', icon: Heart, end: true },
  { to: '/chat', label: 'Chat', icon: MessageCircle },
  { to: '/student/payments', label: 'Payments', icon: Wallet },
  { to: '/student/settings', label: 'Settings', icon: Settings },
];

export default function FavoritesPage() {
  const navigate = useNavigate();
  const favorites = MOCK_TUTORS.slice(0, 3); // stand-in for GET /api/students/favorites

  return (
    <DashboardLayout links={LINKS} title="Favorites">
      {favorites.length === 0 ? (
        <div className="glass-panel rounded-2xl p-10 text-center">
          <Heart size={28} className="mx-auto text-white/30" />
          <p className="mt-3 text-sm text-white/50">You haven't saved any tutors yet.</p>
          <button onClick={() => navigate('/search')} className="mt-4 rounded-lg bg-brand-gradient px-4 py-2 text-xs font-semibold text-slate-deep">
            Browse Tutors
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {favorites.map((tutor, i) => (
            <TutorCard key={tutor._id} tutor={tutor} index={i} onOpen={(t) => navigate(`/tutors/${t._id}`)} />
          ))}
        </div>
      )}
    </DashboardLayout>
  );
}
