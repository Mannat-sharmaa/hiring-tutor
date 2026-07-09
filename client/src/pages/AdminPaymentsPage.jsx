import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LayoutDashboard, ShieldCheck, Users, CreditCard, MessageSquareWarning, Settings } from 'lucide-react';
import DashboardLayout from '../components/DashboardLayout';
import ADMIN_LINKS from '../constants/adminLinks';

const INITIAL_PAYMENTS = [
  { id: 1, student: 'Zara M.', tutor: 'Ayesha Khan', subject: 'Calculus', amount: 27.5, status: 'Paid' },
  { id: 2, student: 'Omar F.', tutor: 'Daniel Osei', subject: 'Python', amount: 44.0, status: 'Paid' },
  { id: 3, student: 'Priya S.', tutor: 'Maria Fernandez', subject: 'IELTS', amount: 19.8, status: 'Refund Requested' },
];

export default function AdminPaymentsPage() {
  const [payments, setPayments] = useState(INITIAL_PAYMENTS);
  const [modal, setModal] = useState(null);

  const processRefund = (id) => {
    setPayments((p) => p.map((x) => (x.id === id ? { ...x, status: 'Refunded' } : x)));
    setModal(null);
  };

  return (
    <DashboardLayout links={ADMIN_LINKS} title="Booking & Payment Management">
      <div className="glass-panel overflow-hidden rounded-2xl">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-white/10 text-xs text-white/40">
              <th className="p-4 font-medium">Student</th>
              <th className="p-4 font-medium">Tutor</th>
              <th className="p-4 font-medium">Subject</th>
              <th className="p-4 font-medium">Amount</th>
              <th className="p-4 font-medium">Status</th>
              <th className="p-4 font-medium">Action</th>
            </tr>
          </thead>
          <tbody>
            {payments.map((p) => (
              <tr key={p.id} className="border-b border-white/5 last:border-0">
                <td className="p-4 text-white">{p.student}</td>
                <td className="p-4 text-white/60">{p.tutor}</td>
                <td className="p-4 text-white/60">{p.subject}</td>
                <td className="p-4 text-white">${p.amount.toFixed(2)}</td>
                <td className="p-4">
                  <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                    p.status === 'Paid' ? 'bg-green-500/15 text-green-400'
                    : p.status === 'Refunded' ? 'bg-white/10 text-white/50'
                    : 'bg-yellow-500/15 text-yellow-400'
                  }`}>
                    {p.status}
                  </span>
                </td>
                <td className="p-4">
                  {p.status === 'Refund Requested' && (
                    <button onClick={() => setModal(p)} className="rounded-lg bg-red-500/15 px-3 py-1.5 text-xs font-medium text-red-400 hover:bg-red-500/25">
                      Review
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <AnimatePresence>
        {modal && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setModal(null)}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-6"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
              onClick={(e) => e.stopPropagation()}
              className="glass-panel w-full max-w-sm rounded-2xl p-6"
            >
              <h3 className="font-display text-lg font-bold text-white">Process Refund</h3>
              <p className="mt-2 text-sm text-white/60">
                Refund ${modal.amount.toFixed(2)} to {modal.student} for the {modal.subject} class with {modal.tutor}?
              </p>
              <div className="mt-5 flex gap-3">
                <button onClick={() => setModal(null)} className="flex-1 rounded-xl border border-white/15 py-2.5 text-sm text-white/70">
                  Cancel
                </button>
                <button onClick={() => processRefund(modal.id)} className="flex-1 rounded-xl bg-red-500 py-2.5 text-sm font-semibold text-white">
                  Approve Refund
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </DashboardLayout>
  );
}
