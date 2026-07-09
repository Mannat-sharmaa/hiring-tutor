import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LayoutDashboard, ShieldCheck, Users, CreditCard, MessageSquareWarning, Settings } from 'lucide-react';
import DashboardLayout from '../components/DashboardLayout';
import ADMIN_LINKS from '../constants/adminLinks';

const TABS = ['General', 'Fees', 'Email', 'Security'];

export default function AdminSettingsPage() {
  const [tab, setTab] = useState('General');
  const [commission, setCommission] = useState(10);

  return (
    <DashboardLayout links={ADMIN_LINKS} title="Platform Settings">
      <div className="glass-panel rounded-2xl p-6">
        <div className="mb-6 flex flex-wrap gap-2">
          {TABS.map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`rounded-full px-4 py-2 text-xs font-medium ${tab === t ? 'bg-violet/20 text-violet' : 'text-white/50 hover:bg-white/5'}`}
            >
              {t}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div key={tab} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="max-w-md space-y-3">
            {tab === 'General' && (
              <>
                <label className="block text-xs font-medium text-white/50">
                  Site Name
                  <input defaultValue="EduConnect" className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none focus:border-violet" />
                </label>
                <label className="block text-xs font-medium text-white/50">
                  Contact Email
                  <input defaultValue="support@educonnect.com" className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none focus:border-violet" />
                </label>
              </>
            )}

            {tab === 'Fees' && (
              <div>
                <p className="mb-1 text-xs font-medium text-white/50">Platform Commission</p>
                <input
                  type="range" min={0} max={30} value={commission}
                  onChange={(e) => setCommission(Number(e.target.value))}
                  className="w-full accent-violet"
                />
                <p className="mt-1 text-sm font-semibold text-cyan-electric">{commission}%</p>
              </div>
            )}

            {tab === 'Email' && (
              <>
                <label className="block text-xs font-medium text-white/50">
                  SMTP Host
                  <input placeholder="smtp.gmail.com" className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-white/40 outline-none focus:border-violet" />
                </label>
                <label className="block text-xs font-medium text-white/50">
                  SMTP Port
                  <input placeholder="587" className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-white/40 outline-none focus:border-violet" />
                </label>
              </>
            )}

            {tab === 'Security' && (
              <>
                <label className="block text-xs font-medium text-white/50">
                  OTP Expiry (minutes)
                  <input type="number" defaultValue={10} className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none focus:border-violet" />
                </label>
                <label className="block text-xs font-medium text-white/50">
                  Rate Limit (requests / 15 min)
                  <input type="number" defaultValue={500} className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none focus:border-violet" />
                </label>
              </>
            )}

            <button className="rounded-xl bg-brand-gradient px-5 py-2.5 text-sm font-semibold text-slate-deep">
              Save Settings
            </button>
          </motion.div>
        </AnimatePresence>
      </div>
    </DashboardLayout>
  );
}
