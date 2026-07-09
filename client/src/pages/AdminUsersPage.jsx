import { useState } from 'react';
import { motion } from 'framer-motion';
import { LayoutDashboard, ShieldCheck, Users, CreditCard, MessageSquareWarning, Settings, Search, Ban, CheckCircle } from 'lucide-react';
import DashboardLayout from '../components/DashboardLayout';
import ADMIN_LINKS from '../constants/adminLinks';

const INITIAL_USERS = [
  { id: 1, name: 'Ayesha Khan', email: 'ayesha@example.com', role: 'tutor', status: 'active', joined: 'Jan 2026' },
  { id: 2, name: 'Zara M.', email: 'zara@example.com', role: 'student', status: 'active', joined: 'Feb 2026' },
  { id: 3, name: 'John Doe', email: 'john@example.com', role: 'student', status: 'banned', joined: 'Mar 2026' },
  { id: 4, name: 'Daniel Osei', email: 'daniel@example.com', role: 'tutor', status: 'active', joined: 'Apr 2026' },
];

export default function AdminUsersPage() {
  const [users, setUsers] = useState(INITIAL_USERS);
  const [query, setQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('');

  const toggleBan = (id) => {
    setUsers((list) =>
      list.map((u) => (u.id === id ? { ...u, status: u.status === 'banned' ? 'active' : 'banned' } : u))
    );
  };

  const filtered = users.filter((u) => {
    const matchesQuery = u.name.toLowerCase().includes(query.toLowerCase()) || u.email.toLowerCase().includes(query.toLowerCase());
    const matchesRole = !roleFilter || u.role === roleFilter;
    return matchesQuery && matchesRole;
  });

  return (
    <DashboardLayout links={ADMIN_LINKS} title="User Management">
      <div className="mb-5 flex flex-wrap items-center gap-3">
        <div className="glass-panel flex items-center gap-2 rounded-full px-4 py-2">
          <Search size={14} className="text-white/40" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name or email…"
            className="bg-transparent text-sm text-white placeholder-white/40 outline-none"
          />
        </div>
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="glass-panel rounded-full px-4 py-2 text-sm text-white outline-none"
        >
          <option value="" className="bg-indigo">All Roles</option>
          <option value="student" className="bg-indigo">Student</option>
          <option value="tutor" className="bg-indigo">Tutor</option>
        </select>
      </div>

      <div className="glass-panel overflow-hidden rounded-2xl">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-white/10 text-xs text-white/40">
              <th className="p-4 font-medium">Name</th>
              <th className="p-4 font-medium">Role</th>
              <th className="p-4 font-medium">Joined</th>
              <th className="p-4 font-medium">Status</th>
              <th className="p-4 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((u) => (
              <motion.tr key={u.id} layout className="border-b border-white/5 last:border-0">
                <td className="p-4">
                  <p className="text-white">{u.name}</p>
                  <p className="text-xs text-white/40">{u.email}</p>
                </td>
                <td className="p-4 capitalize text-white/60">{u.role}</td>
                <td className="p-4 text-white/60">{u.joined}</td>
                <td className="p-4">
                  <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                    u.status === 'active' ? 'bg-green-500/15 text-green-400' : 'bg-red-500/15 text-red-400'
                  }`}>
                    {u.status}
                  </span>
                </td>
                <td className="p-4">
                  <button
                    onClick={() => toggleBan(u.id)}
                    className={`flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-medium ${
                      u.status === 'banned' ? 'bg-green-500/15 text-green-400 hover:bg-green-500/25' : 'bg-red-500/15 text-red-400 hover:bg-red-500/25'
                    }`}
                  >
                    {u.status === 'banned' ? <CheckCircle size={13} /> : <Ban size={13} />}
                    {u.status === 'banned' ? 'Unban' : 'Ban'}
                  </button>
                </td>
              </motion.tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={5} className="p-6 text-center text-white/40">No users match this search.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </DashboardLayout>
  );
}
