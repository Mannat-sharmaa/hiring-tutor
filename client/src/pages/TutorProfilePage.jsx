import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Star, Clock, Users, ShieldCheck, MessageCircle } from 'lucide-react';
import Navbar from '../components/Navbar';
import { getTutorProfile, createOrGetChat } from '../services/api';
import MOCK_TUTORS from '../services/mockTutors';

import useAuthStore from '../store/authStore';

const DAYS = [
  { key: 'mon', label: 'Mon' }, { key: 'tue', label: 'Tue' }, { key: 'wed', label: 'Wed' },
  { key: 'thu', label: 'Thu' }, { key: 'fri', label: 'Fri' }, { key: 'sat', label: 'Sat' }, { key: 'sun', label: 'Sun' },
];

const MOCK_REVIEWS = [
  { id: 1, name: 'Priya S.', rating: 5, comment: 'Explains concepts so clearly. My grades improved within a month.' },
  { id: 2, name: 'Ahmed R.', rating: 5, comment: 'Very patient and always on time. Highly recommend.' },
  { id: 3, name: 'Liu W.', rating: 4, comment: 'Great tutor, sessions are well structured.' },
];

export default function TutorProfilePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [tutor, setTutor] = useState(null);
  const [tab, setTab] = useState('about');
  const { user, isInitialized } = useAuthStore();

  useEffect(() => {
    if (isInitialized && !user) {
      navigate('/login');
    }
  }, [isInitialized, user, navigate]);

  useEffect(() => {
    getTutorProfile(id)
      .then((data) => setTutor(data.tutor))
      .catch(() => setTutor(MOCK_TUTORS.find((t) => t._id === id) || MOCK_TUTORS[0]));
  }, [id]);

  if (!isInitialized || !tutor) {
    return (
      <div className="flex min-h-screen items-center justify-center text-white/50 bg-slate-deep">Loading profile…</div>
    );
  }

  const subjectNames = (tutor.subjects || []).map((s) => s.subject?.name).filter(Boolean);  
  
  const handleMessageTutor = async () => {
    try {
      const response = await createOrGetChat(tutor._id);
      navigate('/chat', { state: { activeChatId: response.chat._id } });
    } catch (err) {
      alert('Failed to start chat: ' + err.message);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden">
      <div className="pointer-events-none fixed left-1/2 top-0 -z-10 h-[600px] w-[600px] -translate-x-1/2 animate-breathe bg-orb-gradient blur-3xl" />
      <Navbar />

      <main className="mx-auto max-w-5xl px-6 pb-24 pt-10">
        {/* Hero */}
        <motion.div
          layoutId={`tutor-card-${tutor._id}`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-panel rounded-3xl p-8"
        >
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-5">
              <img
                src={tutor.avatar || `https://api.dicebear.com/7.x/notionists/svg?seed=${tutor.fullName}`}
                alt={tutor.fullName}
                className="h-24 w-24 rounded-2xl object-cover ring-2 ring-white/10"
              />
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="font-display text-2xl font-bold text-white text-glow-cyan">
                    {tutor.fullName}
                  </h1>
                  {tutor.verification?.overallStatus === 'verified' && (
                    <ShieldCheck className="text-cyan-electric" size={20} />
                  )}
                </div>
                <p className="mt-1 text-sm text-white/60">{tutor.headline}</p>
                <div className="mt-3 flex flex-wrap gap-4 text-xs text-white/50">
                  <span className="flex items-center gap-1">
                    <Star className="fill-cyan-electric text-cyan-electric" size={14} />{' '}
                    {(tutor.ratingAverage ?? 0).toFixed(1)} ({tutor.ratingCount ?? 0})
                  </span>
                  <span className="flex items-center gap-1"><Users size={14} /> {tutor.studentsCount ?? 0} students</span>
                  <span className="flex items-center gap-1"><Clock size={14} /> {tutor.experienceYears ?? 0}y exp</span>
                </div>
              </div>
            </div>

            <div className="text-right">
              <p className="font-display text-3xl font-extrabold text-white">
                ₹{tutor.hourlyRate}<span className="text-sm font-normal text-white/40">/hr</span>
              </p>
              <div className="mt-3 flex gap-2">
                <button
                  onClick={handleMessageTutor}
                  className="rounded-xl border border-white/15 p-3 text-white/70 hover:bg-white/5"
                  aria-label="Message tutor"
                >
                  <MessageCircle size={18} />
                </button>
                <button
                  onClick={() => navigate(`/booking/${tutor._id}`)}
                  className="rounded-xl bg-brand-gradient px-5 py-3 text-sm font-semibold text-slate-deep"
                >
                  Book a Class
                </button>
              </div>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap gap-2">
            {subjectNames.map((s) => (
              <span key={s} className="rounded-full bg-violet/15 px-3 py-1 text-xs font-medium text-violet">{s}</span>
            ))}
          </div>
        </motion.div>

        {/* Tabs */}
        <div className="relative mt-8 flex gap-6 border-b border-white/10">
          {['about', 'availability', 'reviews'].map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`relative pb-3 text-sm font-medium capitalize transition-colors ${
                tab === t ? 'text-white' : 'text-white/40 hover:text-white/70'
              }`}
            >
              {t}
              {tab === t && (
                <motion.div layoutId="tab-underline" className="absolute -bottom-px left-0 right-0 h-0.5 bg-brand-gradient" />
              )}
            </button>
          ))}
        </div>

        <div className="mt-6">
          {tab === 'about' && (
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="leading-relaxed text-white/70">
              {tutor.bio || `${tutor.fullName} is a dedicated tutor with ${tutor.experienceYears ?? 'several'} years of teaching experience, focused on helping students build real understanding rather than memorized answers.`}
            </motion.p>
          )}

          {tab === 'availability' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-7 gap-2">
              {DAYS.map((d) => {
                const isAvailable = Math.random() > 0.3; // placeholder pattern until real availability is fetched
                return (
                  <div key={d.key} className="glass-panel rounded-xl p-3 text-center">
                    <p className="text-xs font-medium text-white/50">{d.label}</p>
                    <div className={`mt-2 h-16 rounded-lg ${isAvailable ? 'bg-cyan-electric/20' : 'bg-white/5'}`} />
                    <p className={`mt-1 text-[10px] ${isAvailable ? 'text-cyan-electric' : 'text-white/30'}`}>
                      {isAvailable ? 'Free' : 'Booked'}
                    </p>
                  </div>
                );
              })}
            </motion.div>
          )}

          {tab === 'reviews' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
              {MOCK_REVIEWS.map((r) => (
                <div key={r.id} className="glass-panel rounded-2xl p-5">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-white">{r.name}</p>
                    <div className="flex items-center gap-1 text-xs text-cyan-electric">
                      <Star size={12} className="fill-cyan-electric" /> {r.rating}
                    </div>
                  </div>
                  <p className="mt-2 text-sm text-white/60">{r.comment}</p>
                </div>
              ))}
            </motion.div>
          )}
        </div>
      </main>
    </div>
  );
}
