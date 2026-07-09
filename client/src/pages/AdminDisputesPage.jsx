import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LayoutDashboard, ShieldCheck, Users, CreditCard, MessageSquareWarning, Settings, Send } from 'lucide-react';
import DashboardLayout from '../components/DashboardLayout';
import ADMIN_LINKS from '../constants/adminLinks';

const DISPUTES = [
  {
    id: 1, student: 'Omar F.', tutor: 'Daniel Osei', subject: 'Python', status: 'Open',
    thread: [
      { from: 'Omar F.', text: 'Tutor was 20 minutes late and the class was cut short.' },
      { from: 'Daniel Osei', text: 'I had a connectivity issue, happy to offer a make-up session.' },
    ],
  },
  {
    id: 2, student: 'Priya S.', tutor: 'Maria Fernandez', subject: 'IELTS', status: 'Resolved',
    thread: [{ from: 'Priya S.', text: 'Requesting a refund, class was cancelled last minute.' }],
  },
];

export default function AdminDisputesPage() {
  const [activeId, setActiveId] = useState(DISPUTES[0].id);
  const [reply, setReply] = useState('');
  const [disputes, setDisputes] = useState(DISPUTES);

  const active = disputes.find((d) => d.id === activeId);

  const sendReply = () => {
    if (!reply.trim()) return;
    setDisputes((list) =>
      list.map((d) => (d.id === activeId ? { ...d, thread: [...d.thread, { from: 'Admin', text: reply }] } : d))
    );
    setReply('');
  };

  const resolve = () => {
    setDisputes((list) => list.map((d) => (d.id === activeId ? { ...d, status: 'Resolved' } : d)));
  };

  return (
    <DashboardLayout links={ADMIN_LINKS} title="Dispute Management">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[280px_1fr]">
        <div className="space-y-2">
          {disputes.map((d) => (
            <button
              key={d.id}
              onClick={() => setActiveId(d.id)}
              className={`w-full rounded-xl p-4 text-left transition-colors ${
                activeId === d.id ? 'bg-violet/15 border border-violet/40' : 'glass-panel hover:bg-white/10'
              }`}
            >
              <p className="text-sm font-medium text-white">{d.student} vs {d.tutor}</p>
              <p className="text-xs text-white/50">{d.subject}</p>
              <span className={`mt-2 inline-block rounded-full px-2 py-0.5 text-[10px] font-medium ${
                d.status === 'Open' ? 'bg-yellow-500/15 text-yellow-400' : 'bg-green-500/15 text-green-400'
              }`}>
                {d.status}
              </span>
            </button>
          ))}
        </div>

        <div className="glass-panel flex flex-col rounded-2xl p-5">
          <div className="mb-3 flex items-center justify-between">
            <p className="font-display text-sm font-bold text-white">{active.student} vs {active.tutor}</p>
            {active.status === 'Open' && (
              <button onClick={resolve} className="rounded-lg bg-green-500/20 px-3 py-1.5 text-xs font-medium text-green-400 hover:bg-green-500/30">
                Mark Resolved
              </button>
            )}
          </div>

          <div className="flex-1 space-y-2">
            <AnimatePresence initial={false}>
              {active.thread.map((m, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`max-w-[80%] rounded-xl px-3 py-2 text-sm ${
                    m.from === 'Admin' ? 'ml-auto bg-brand-gradient text-slate-deep' : 'bg-white/10 text-white'
                  }`}
                >
                  <p className="mb-0.5 text-[10px] font-medium opacity-70">{m.from}</p>
                  {m.text}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {active.status === 'Open' && (
            <div className="mt-3 flex items-center gap-2">
              <input
                value={reply}
                onChange={(e) => setReply(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && sendReply()}
                placeholder="Mediate as Admin…"
                className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-violet"
              />
              <button onClick={sendReply} className="rounded-lg bg-brand-gradient p-2 text-slate-deep">
                <Send size={16} />
              </button>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
