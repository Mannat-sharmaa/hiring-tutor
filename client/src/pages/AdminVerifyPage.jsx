import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, X as XIcon, FileText } from 'lucide-react';
import DashboardLayout from '../components/DashboardLayout';
import ADMIN_LINKS from '../constants/adminLinks';

const INITIAL = [
  { id: 1, name: 'Karan Patel', email: 'karan@example.com', docs: ['ID Card', 'Degree Certificate'], date: '2 days ago' },
  { id: 2, name: 'Fatima Noor', email: 'fatima@example.com', docs: ['ID Card'], date: '5 hours ago' },
  { id: 3, name: 'Liam Chen', email: 'liam@example.com', docs: ['ID Card', 'Degree Certificate', 'Background Check'], date: '1 day ago' },
];

export default function AdminVerifyPage() {
  const [pending, setPending] = useState(INITIAL);
  const [rejecting, setRejecting] = useState(null);
  const [reason, setReason] = useState('');

  const approve = (id) => setPending((p) => p.filter((t) => t.id !== id));
  const confirmReject = () => {
    setPending((p) => p.filter((t) => t.id !== rejecting.id));
    setRejecting(null);
    setReason('');
  };

  return (
    <DashboardLayout links={ADMIN_LINKS} title="Tutor Verification">
      <div className="space-y-3">
        <AnimatePresence>
          {pending.map((t) => (
            <motion.div
              key={t.id}
              layout
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="glass-panel flex flex-wrap items-center justify-between gap-4 rounded-2xl p-5"
            >
              <div>
                <p className="text-sm font-medium text-white">{t.name}</p>
                <p className="text-xs text-white/40">{t.email} · Submitted {t.date}</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {t.docs.map((d) => (
                    <span key={d} className="flex items-center gap-1 rounded-full bg-white/5 px-2.5 py-1 text-[11px] text-white/60">
                      <FileText size={11} /> {d}
                    </span>
                  ))}
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => approve(t.id)} className="flex items-center gap-1 rounded-lg bg-green-500/20 px-3 py-2 text-xs font-medium text-green-400 hover:bg-green-500/30">
                  <Check size={13} /> Approve
                </button>
                <button onClick={() => setRejecting(t)} className="flex items-center gap-1 rounded-lg bg-red-500/20 px-3 py-2 text-xs font-medium text-red-400 hover:bg-red-500/30">
                  <XIcon size={13} /> Reject
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        {pending.length === 0 && <p className="text-sm text-white/40">No tutors awaiting verification.</p>}
      </div>

      <AnimatePresence>
        {rejecting && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setRejecting(null)}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-6"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
              onClick={(e) => e.stopPropagation()}
              className="glass-panel w-full max-w-sm rounded-2xl p-6"
            >
              <h3 className="font-display text-lg font-bold text-white">Reject {rejecting.name}?</h3>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Reason for rejection…"
                rows={3}
                className="mt-3 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-white/40 outline-none focus:border-violet"
              />
              <div className="mt-4 flex gap-3">
                <button onClick={() => setRejecting(null)} className="flex-1 rounded-xl border border-white/15 py-2.5 text-sm text-white/70">
                  Cancel
                </button>
                <button onClick={confirmReject} className="flex-1 rounded-xl bg-red-500 py-2.5 text-sm font-semibold text-white">
                  Confirm Reject
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </DashboardLayout>
  );
}
