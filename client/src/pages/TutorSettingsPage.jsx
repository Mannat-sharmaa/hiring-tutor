import { LayoutDashboard, User, CalendarDays, Inbox, Wallet, MessageCircle, Settings } from 'lucide-react';
import DashboardLayout from '../components/DashboardLayout';
import SettingsTabs from '../components/SettingsTabs';

const LINKS = [
  { to: '/tutor/dashboard', label: 'Overview', icon: LayoutDashboard },
  { to: '/tutor/profile', label: 'My Profile', icon: User },
  { to: '/tutor/schedule', label: 'Availability', icon: CalendarDays },
  { to: '/tutor/bookings', label: 'Requests', icon: Inbox },
  { to: '/tutor/earnings', label: 'Earnings', icon: Wallet },
  { to: '/chat', label: 'Chat', icon: MessageCircle },
  { to: '/tutor/settings', label: 'Settings', icon: Settings, end: true },
];

export default function TutorSettingsPage() {
  return (
    <DashboardLayout links={LINKS} title="Settings">
      <SettingsTabs />
    </DashboardLayout>
  );
}
