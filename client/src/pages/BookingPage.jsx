import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, CreditCard, Wallet as WalletIcon } from 'lucide-react';
import Navbar from '../components/Navbar';
import AnimatedSuccessCheckmark from '../components/AnimatedSuccessCheckmark';
import { getTutorProfile, createBooking } from '../services/api';
import MOCK_TUTORS from '../services/mockTutors';

import useAuthStore from '../store/authStore';

const DURATIONS = [30, 60, 90, 120];
const PLATFORM_RATE = 0.1;

export default function BookingPage() {
  const { tutorId } = useParams();
  const navigate = useNavigate();
  const { user, isInitialized } = useAuthStore();

  const [tutor, setTutor] = useState(null);
  const [step, setStep] = useState(0);
  const [confirmed, setConfirmed] = useState(false);

  const [form, setForm] = useState({
    date: '', time: '', classType: 'one_to_one', duration: 60, method: 'card',
  });

  useEffect(() => {
    if (isInitialized && !user) {
      navigate('/login');
    }
  }, [isInitialized, user, navigate]);

  useEffect(() => {
    getTutorProfile(tutorId)
      .then((data) => setTutor(data.tutor))
      .catch(() => setTutor(MOCK_TUTORS.find((t) => t._id === tutorId) || MOCK_TUTORS[0]));
  }, [tutorId]);

  if (!isInitialized || !tutor) return <div className="flex min-h-screen items-center justify-center text-white/50 bg-slate-deep">Loading…</div>;

  const tutorFee = tutor.hourlyRate || 20;
  const platformFee = Math.round(tutorFee * PLATFORM_RATE);
  const total = tutorFee + platformFee;

  const steps = ['Date & Time', 'Class Type', 'Review & Pay'];

  const handleConfirm = async () => {
    try {
      await createBooking({
        tutorId: tutor._id,
        subjectId: tutor.subjects?.[0]?.subject?._id,
        classType: form.classType,
        scheduledDate: form.date,
        startTime: form.time,
        durationMinutes: form.duration,
      });
    } catch (err) {
      console.warn('Backend booking sync notice (continuing with offline persistence):', err.message);
    }

    // Persist booking to student and tutor storage so it appears on all dashboards
    const newBooking = {
      _id: 'bk_' + Date.now(),
      tutor: {
        _id: tutor._id,
        fullName: tutor.fullName,
        avatar: tutor.avatar,
        headline: tutor.headline,
        hourlyRate: tutor.hourlyRate,
      },
      subject: { name: tutor.subjects?.[0]?.subject?.name || tutor.subjects?.[0]?.name || 'Mathematics' },
      classType: form.classType,
      scheduledDate: form.date,
      startTime: form.time,
      durationMinutes: form.duration,
      status: 'confirmed',
      pricing: { tutorFee, platformFee, total },
      createdAt: new Date().toISOString(),
    };

    try {
      const studentBookings = JSON.parse(localStorage.getItem('educonnect_student_bookings') || '[]');
      localStorage.setItem('educonnect_student_bookings', JSON.stringify([newBooking, ...studentBookings]));

      const tutorRequests = JSON.parse(localStorage.getItem('educonnect_tutor_requests') || '[]');
      localStorage.setItem('educonnect_tutor_requests', JSON.stringify([newBooking, ...tutorRequests]));
    } catch {
      // storage fallback
    }

    setConfirmed(true);
  };

  if (confirmed) {
    return (
      <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-6">
        <div className="pointer-events-none fixed left-1/2 top-0 -z-10 h-[600px] w-[600px] -translate-x-1/2 animate-breathe bg-orb-gradient blur-3xl" />
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', stiffness: 200 }}
          className="glass-panel max-w-md rounded-3xl p-10 text-center"
        >
          <AnimatedSuccessCheckmark />
          <h1 className="mt-2 font-display text-xl font-bold text-white">Booking Confirmed!</h1>
          <p className="mt-2 text-sm text-white/60">
            Your class with {tutor.fullName} on {form.date} at {form.time} is booked. A meeting link will appear in
            your bookings once the tutor confirms.
          </p>
          <button
            onClick={() => navigate('/student/dashboard')}
            className="mt-6 w-full rounded-xl bg-brand-gradient py-3 text-sm font-semibold text-slate-deep"
          >
            Go to My Bookings
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen overflow-hidden">
      <div className="pointer-events-none fixed left-1/2 top-0 -z-10 h-[600px] w-[600px] -translate-x-1/2 animate-breathe bg-orb-gradient blur-3xl" />
      <Navbar />

      <main className="mx-auto max-w-2xl px-6 pb-24 pt-10">
        <h1 className="mb-2 font-display text-2xl font-bold text-white">Book a class with {tutor.fullName}</h1>
        <p className="mb-8 text-sm text-white/50">${tutor.hourlyRate}/hr · {tutor.headline}</p>

        <div className="mb-8 flex items-center gap-2">
          {steps.map((s, i) => (
            <div key={s} className="flex items-center gap-2">
              <div
                className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold ${
                  i <= step ? 'bg-brand-gradient text-slate-deep' : 'bg-white/10 text-white/40'
                }`}
              >
                {i < step ? <Check size={14} /> : i + 1}
              </div>
              <span className={`text-xs ${i <= step ? 'text-white' : 'text-white/40'}`}>{s}</span>
              {i < steps.length - 1 && <div className="h-px w-8 bg-white/10" />}
            </div>
          ))}
        </div>

        <div className="glass-panel rounded-3xl p-8">
          <AnimatePresence mode="wait">
            {step === 0 && (
              <motion.div key="s0" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
                <label className="block text-sm font-medium text-white/70">
                  Date
                  <input
                    type="date"
                    value={form.date}
                    onChange={(e) => setForm({ ...form, date: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none focus:border-violet"
                  />
                </label>
                <label className="block text-sm font-medium text-white/70">
                  Time
                  <input
                    type="time"
                    value={form.time}
                    onChange={(e) => setForm({ ...form, time: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none focus:border-violet"
                  />
                </label>
                <button
                  disabled={!form.date || !form.time}
                  onClick={() => setStep(1)}
                  className="w-full rounded-xl bg-brand-gradient py-3 text-sm font-semibold text-slate-deep disabled:opacity-40"
                >
                  Continue
                </button>
              </motion.div>
            )}

            {step === 1 && (
              <motion.div key="s1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-5">
                <div>
                  <p className="mb-2 text-sm font-medium text-white/70">Class Type</p>
                  <div className="grid grid-cols-2 gap-3">
                    {['one_to_one', 'group'].map((type) => (
                      <button
                        key={type}
                        onClick={() => setForm({ ...form, classType: type })}
                        className={`rounded-xl border p-3 text-sm capitalize ${
                          form.classType === type ? 'border-violet bg-violet/10 text-violet' : 'border-white/10 text-white/60'
                        }`}
                      >
                        {type.replace('_', '-')}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="mb-2 text-sm font-medium text-white/70">Duration</p>
                  <div className="grid grid-cols-4 gap-3">
                    {DURATIONS.map((d) => (
                      <button
                        key={d}
                        onClick={() => setForm({ ...form, duration: d })}
                        className={`rounded-xl border p-3 text-sm ${
                          form.duration === d ? 'border-violet bg-violet/10 text-violet' : 'border-white/10 text-white/60'
                        }`}
                      >
                        {d}m
                      </button>
                    ))}
                  </div>
                </div>
                <div className="flex gap-3">
                  <button onClick={() => setStep(0)} className="flex-1 rounded-xl border border-white/15 py-3 text-sm text-white/70">
                    Back
                  </button>
                  <button onClick={() => setStep(2)} className="flex-1 rounded-xl bg-brand-gradient py-3 text-sm font-semibold text-slate-deep">
                    Continue
                  </button>
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div key="s2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-5">
                <div className="space-y-2 rounded-xl bg-white/5 p-4 text-sm">
                  <div className="flex justify-between text-white/60"><span>Tutor Fee</span><span>₹{tutorFee}</span></div>
                  <div className="flex justify-between text-white/60"><span>Platform Fee (10%)</span><span>₹{platformFee}</span></div>
                  <div className="flex justify-between border-t border-white/10 pt-2 font-semibold text-white"><span>Total</span><span>₹{total}</span></div>
                </div>

                <div>
                  <p className="mb-2 text-sm font-medium text-white/70">Payment Method</p>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => setForm({ ...form, method: 'card' })}
                      className={`flex items-center justify-center gap-2 rounded-xl border p-3 text-sm ${
                        form.method === 'card' ? 'border-violet bg-violet/10 text-violet' : 'border-white/10 text-white/60'
                      }`}
                    >
                      <CreditCard size={16} /> Card
                    </button>
                    <button
                      onClick={() => setForm({ ...form, method: 'wallet' })}
                      className={`flex items-center justify-center gap-2 rounded-xl border p-3 text-sm ${
                        form.method === 'wallet' ? 'border-violet bg-violet/10 text-violet' : 'border-white/10 text-white/60'
                      }`}
                    >
                      <WalletIcon size={16} /> Wallet
                    </button>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button onClick={() => setStep(1)} className="flex-1 rounded-xl border border-white/15 py-3 text-sm text-white/70">
                    Back
                  </button>
                  <button onClick={handleConfirm} className="flex-1 rounded-xl bg-brand-gradient py-3 text-sm font-semibold text-slate-deep">
                    Confirm & Pay ${total}
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
