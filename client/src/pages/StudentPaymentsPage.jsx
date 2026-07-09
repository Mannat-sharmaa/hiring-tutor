import { LayoutDashboard, Search, Calendar, Heart, MessageCircle, Wallet, Settings } from 'lucide-react';
import DashboardLayout from '../components/DashboardLayout';

const LINKS = [
  { to: '/student/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/search', label: 'Find a Tutor', icon: Search },
  { to: '/student/bookings', label: 'My Bookings', icon: Calendar },
  { to: '/student/favorites', label: 'Favorites', icon: Heart },
  { to: '/chat', label: 'Chat', icon: MessageCircle },
  { to: '/student/payments', label: 'Payments', icon: Wallet, end: true },
  { to: '/student/settings', label: 'Settings', icon: Settings },
];

const TRANSACTIONS = [
  { id: 1, tutor: 'Ayesha Khan', date: 'Jun 28, 2026', amount: 27.5, status: 'Paid' },
  { id: 2, tutor: 'Maria Fernandez', date: 'Jun 20, 2026', amount: 19.8, status: 'Paid' },
  { id: 3, tutor: 'Daniel Osei', date: 'Jun 12, 2026', amount: 44.0, status: 'Refunded' },
];

export default function StudentPaymentsPage() {
  return (
    <DashboardLayout links={LINKS} title="Payments">
      <div className="glass-panel overflow-hidden rounded-2xl">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-white/10 text-xs text-white/40">
              <th className="p-4 font-medium">Tutor</th>
              <th className="p-4 font-medium">Date</th>
              <th className="p-4 font-medium">Amount</th>
              <th className="p-4 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {TRANSACTIONS.map((t) => (
              <tr key={t.id} className="border-b border-white/5 last:border-0">
                <td className="p-4 text-white">{t.tutor}</td>
                <td className="p-4 text-white/60">{t.date}</td>
                <td className="p-4 text-white">${t.amount.toFixed(2)}</td>
                <td className="p-4">
                  <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                    t.status === 'Paid' ? 'bg-green-500/15 text-green-400' : 'bg-yellow-500/15 text-yellow-400'
                  }`}>
                    {t.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </DashboardLayout>
  );
}
