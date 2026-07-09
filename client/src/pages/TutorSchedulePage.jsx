import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { LayoutDashboard, User, CalendarDays, Inbox, Wallet, MessageCircle, Settings } from 'lucide-react';
import DashboardLayout from '../components/DashboardLayout';
import useAuthStore from '../store/authStore';
import { updateTutorAvailability } from '../services/api';

const LINKS = [
  { to: '/tutor/dashboard', label: 'Overview', icon: LayoutDashboard },
  { to: '/tutor/profile', label: 'My Profile', icon: User },
  { to: '/tutor/schedule', label: 'Availability', icon: CalendarDays, end: true },
  { to: '/tutor/bookings', label: 'Requests', icon: Inbox },
  { to: '/tutor/earnings', label: 'Earnings', icon: Wallet },
  { to: '/chat', label: 'Chat', icon: MessageCircle },
  { to: '/tutor/settings', label: 'Settings', icon: Settings },
];

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const HOURS = Array.from({ length: 12 }, (_, i) => 8 + i); // 8am - 7pm

export default function TutorSchedulePage() {
  const { user, fetchMe } = useAuthStore();
  
  // key = `${day}-${hour}`, value = boolean (available)
  const [slots, setSlots] = useState({});
  const [saving, setSaving] = useState(false);

  // Populate calendar grid from tutor's current availability on mount
  useEffect(() => {
    if (user && user.availability) {
      const initialSlots = {};
      const daysMapRev = { mon: 'Mon', tue: 'Tue', wed: 'Wed', thu: 'Thu', fri: 'Fri', sat: 'Sat', sun: 'Sun' };

      user.availability.forEach((dayGroup) => {
        const d = daysMapRev[dayGroup.day];
        if (!d) return;

        dayGroup.slots.forEach((slot) => {
          const hour = parseInt(slot.start.split(':')[0], 10);
          if (!isNaN(hour)) {
            initialSlots[`${d}-${hour}`] = true;
          }
        });
      });
      setSlots(initialSlots);
    }
  }, [user]);

  const toggle = (key) => setSlots((s) => ({ ...s, [key]: !s[key] }));

  const handleSaveAvailability = async () => {
    setSaving(true);
    const formatted = [];
    const daysMap = { Mon: 'mon', Tue: 'tue', Wed: 'wed', Thu: 'thu', Fri: 'fri', Sat: 'sat', Sun: 'sun' };

    for (const d of DAYS) {
      const daySlots = [];
      for (const hour of HOURS) {
        const key = `${d}-${hour}`;
        if (slots[key]) {
          const start = `${String(hour).padStart(2, '0')}:00`;
          const end = `${String(hour + 1).padStart(2, '0')}:00`;
          daySlots.push({ start, end });
        }
      }
      if (daySlots.length > 0) {
        formatted.push({
          day: daysMap[d],
          slots: daySlots,
        });
      }
    }

    try {
      await updateTutorAvailability(formatted);
      await fetchMe();
      alert('Availability saved successfully!');
    } catch (err) {
      alert('Failed to save availability: ' + (err.response?.data?.message || err.message));
    } finally {
      setSaving(false);
    }
  };

  return (
    <DashboardLayout links={LINKS} title="Availability">
      <div className="glass-panel rounded-2xl p-6">
        <div className="mb-4 flex flex-wrap gap-4 items-center justify-between">
          <p className="text-sm text-white/50">Click a slot to mark it available. Green = open for booking.</p>
          <button 
            onClick={handleSaveAvailability}
            disabled={saving}
            className="rounded-lg bg-brand-gradient px-4 py-2 text-xs font-semibold text-slate-deep active:scale-95 transition-transform disabled:opacity-55"
          >
            {saving ? 'Saving...' : 'Save Availability'}
          </button>
        </div>

        <div className="overflow-x-auto">
          <div className="grid min-w-[700px] grid-cols-8 gap-1">
            <div />
            {DAYS.map((d) => (
              <div key={d} className="pb-2 text-center text-xs font-medium text-white/50">{d}</div>
            ))}

            {HOURS.map((hour) => (
              <div key={hour} className="contents">
                <div className="flex items-center justify-end pr-2 text-xs text-white/40">
                  {hour % 12 || 12}{hour < 12 ? 'AM' : 'PM'}
                </div>
                {DAYS.map((d) => {
                  const key = `${d}-${hour}`;
                  const isOn = !!slots[key];
                  return (
                    <motion.button
                      key={key}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => toggle(key)}
                      className={`h-8 rounded-md transition-colors ${
                        isOn ? 'bg-cyan-electric/70' : 'bg-white/5 hover:bg-white/10'
                      }`}
                    />
                  );
                })}
              </div>
            ))}
          </div>
        </div>

        <div className="mt-4 rounded-xl bg-white/5 p-3 text-xs text-white/50">
          Tip: Set up recurring availability (e.g. every Monday 5–7 PM) — students will only be able to book
          slots you've marked here.
        </div>
      </div>
    </DashboardLayout>
  );
}
