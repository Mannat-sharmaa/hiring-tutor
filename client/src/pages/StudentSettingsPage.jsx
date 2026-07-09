import { LayoutDashboard, Search, Calendar, Heart, MessageCircle, Wallet, Settings } from 'lucide-react';
import DashboardLayout from '../components/DashboardLayout';
import SettingsTabs from '../components/SettingsTabs';

const LINKS = [
  { to: '/student/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/search', label: 'Find a Tutor', icon: Search },
  { to: '/student/bookings', label: 'My Bookings', icon: Calendar },
  { to: '/student/favorites', label: 'Favorites', icon: Heart },
  { to: '/chat', label: 'Chat', icon: MessageCircle },
  { to: '/student/payments', label: 'Payments', icon: Wallet },
  { to: '/student/settings', label: 'Settings', icon: Settings, end: true },
];

export default function StudentSettingsPage() {
  return (
    <DashboardLayout links={LINKS} title="Settings">
      <SettingsTabs />
    </DashboardLayout>
  );
}
