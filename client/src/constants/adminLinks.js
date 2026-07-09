import { LayoutDashboard, ShieldCheck, Users, ListTree, CreditCard, MessageSquareWarning, Settings } from 'lucide-react';

// Single source of truth for the Admin sidebar so every admin page shows
// the same nav in the same order, regardless of which page defines it.
const ADMIN_LINKS = [
  { to: '/admin', label: 'Analytics', icon: LayoutDashboard, end: true },
  { to: '/admin/verify', label: 'Verify Tutors', icon: ShieldCheck },
  { to: '/admin/users', label: 'Users', icon: Users },
  { to: '/admin/subjects', label: 'Subjects', icon: ListTree },
  { to: '/admin/payments', label: 'Payments', icon: CreditCard },
  { to: '/admin/disputes', label: 'Disputes', icon: MessageSquareWarning },
  { to: '/admin/settings', label: 'Settings', icon: Settings },
];

export default ADMIN_LINKS;
