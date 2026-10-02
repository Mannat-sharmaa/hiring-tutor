import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { LayoutDashboard, Search, Calendar, Heart, MessageCircle, Wallet, Settings, Video, Loader2, X, Sparkles, Star } from 'lucide-react';
import DashboardLayout from '../components/DashboardLayout';
import api from '../services/api';
import { submitReview, getReviewByBooking } from '../services/api';

const LINKS = [
  { to: '/student/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/search', label: 'Find a Tutor', icon: Search },
  { to: '/student/bookings', label: 'My Bookings', icon: Calendar, end: true },
  { to: '/student/favorites', label: 'Favorites', icon: Heart },
  { to: '/chat', label: 'Chat', icon: MessageCircle },
  { to: '/student/payments', label: 'Payments', icon: Wallet },
  { to: '/student/settings', label: 'Settings', icon: Settings },
];

const TABS = ['upcoming', 'completed', 'cancelled'];

const STATUS_STYLES = {
  confirmed: 'bg-cyan-electric/15 text-cyan-electric',
  pending:   'bg-yellow-500/15 text-yellow-400',
  completed: 'bg-green-500/15 text-green-400',
  cancelled: 'bg-red-500/15 text-red-400',
  rejected:  'bg-red-500/15 text-red-400',
};

function formatDate(iso) {
  if (!iso) return '';
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function StarRating({ value, onChange }) {
  const [hover, setHover] = useState(0);
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onChange(star)}
          onMouseEnter={() => setHover(star)}
          onMouseLeave={() => setHover(0)}
          className="transition-transform hover:scale-110 active:scale-95"
        >
          <Star
            size={28}
            className={`transition-colors ${
              star <= (hover || value)
                ? 'fill-yellow-400 text-yellow-400'
                : 'text-white/20'
            }`}
          />
        </button>
      ))}
    </div>
  );
}

export default function StudentBookingsPage() {
  const navigate = useNavigate();
  const [tab, setTab] = useState('upcoming');
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(null);
  const [selectedNotes, setSelectedNotes] = useState(null);

  // Review state
  const [reviewTarget, setReviewTarget] = useState(null); // { bookingId, tutorName }
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewComment, setReviewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewedBookings, setReviewedBookings] = useState({}); // bookingId -> true

  const fetchBookings = async (status) => {
    setLoading(true);
    let remoteBookings = [];
    try {
      const { data } = await api.get('/bookings/me', { params: { status } });
      remoteBookings = data.bookings || [];
    } catch {
      remoteBookings = [];
    }

    let localBookings = [];
    try {
      localBookings = JSON.parse(localStorage.getItem('educonnect_student_bookings') || '[]');
    } catch {
      localBookings = [];
    }

    const filteredLocal = status === 'upcoming' 
      ? localBookings.filter(b => b.status === 'confirmed' || b.status === 'pending')
      : (status === 'completed' ? localBookings.filter(b => b.status === 'completed') : localBookings.filter(b => b.status === 'cancelled'));

    const combined = [...filteredLocal];
    remoteBookings.forEach(b => {
      if (!combined.some(c => c._id === b._id)) combined.push(b);
    });

    setBookings(combined);
    setLoading(false);
  };

  useEffect(() => {
    fetchBookings(tab);
  }, [tab]);

  // When completed tab is loaded, check which ones are already reviewed
  useEffect(() => {
    if (tab !== 'completed' || bookings.length === 0) return;
    bookings.forEach(async (b) => {
      try {
        const { review } = await getReviewByBooking(b._id);
        if (review) {
          setReviewedBookings((prev) => ({ ...prev, [b._id]: true }));
        }
      } catch { /* silent */ }
    });
  }, [tab, bookings]);

  const handleCancel = async (id) => {
    setCancelling(id);
    try {
      await api.patch(`/bookings/${id}/cancel`, { reason: 'Student cancelled' });
      setBookings((prev) => prev.filter((b) => b._id !== id));
    } catch {
      // silent
    } finally {
      setCancelling(null);
    }
  };

  const openReviewModal = (booking) => {
    setReviewTarget({ bookingId: booking._id, tutorName: booking.tutor?.fullName || 'Tutor' });
    setReviewRating(0);
    setReviewComment('');
  };

  const handleSubmitReview = async () => {
    if (!reviewRating) return;
    setSubmittingReview(true);
    try {
      await submitReview({
        bookingId: reviewTarget.bookingId,
        rating: reviewRating,
        comment: reviewComment,
      });
      setReviewedBookings((prev) => ({ ...prev, [reviewTarget.bookingId]: true }));
      setReviewTarget(null);
    } catch (err) {
      alert(err?.response?.data?.message || 'Could not submit review. Please try again.');
    } finally {
      setSubmittingReview(false);
    }
  };

  const LABEL = ['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'];

  return (
    <DashboardLayout links={LINKS} title="My Bookings">
      <div className="mb-6 flex gap-6 border-b border-white/10">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`relative pb-3 text-sm font-medium capitalize ${tab === t ? 'text-white' : 'text-white/40 hover:text-white/70'}`}
          >
            {t}
            {tab === t && <motion.div layoutId="booking-tab-underline" className="absolute -bottom-px left-0 right-0 h-0.5 bg-brand-gradient" />}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {loading ? (
          <motion.div key="loader" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex justify-center py-16">
            <Loader2 className="animate-spin text-cyan-electric" size={28} />
          </motion.div>
        ) : (
          <motion.div key={tab} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-3">
            {bookings.map((b) => {
              const tutorName = b.tutor?.fullName || 'Tutor';
              const subject = b.subject?.name || 'Class';
              const status = b.status;
              const alreadyReviewed = reviewedBookings[b._id];

              return (
                <div key={b._id} className="glass-panel flex flex-wrap items-center justify-between gap-3 rounded-2xl p-4">
                  <div>
                    <p className="text-sm font-medium text-white">{subject} with {tutorName}</p>
                    <p className="text-xs text-white/50">{formatDate(b.scheduledDate)} · {b.startTime}</p>
                    <p className="mt-0.5 text-xs text-white/30">{b.durationMinutes} min · {b.classType}</p>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap justify-end">
                    <span className={`rounded-full px-3 py-1 text-xs font-medium capitalize ${STATUS_STYLES[status] || 'bg-white/10 text-white/60'}`}>
                      {status}
                    </span>

                    {/* AI Notes button */}
                    {status === 'completed' && b.aiNotes && (
                      <button
                        onClick={() => setSelectedNotes(b.aiNotes)}
                        className="flex items-center gap-1.5 rounded-lg bg-[#00F2FE]/15 border border-[#00F2FE]/30 px-3 py-1.5 text-xs font-semibold text-[#00F2FE] hover:bg-[#00F2FE]/25 transition-all"
                      >
                        <Sparkles size={12} /> AI Notes
                      </button>
                    )}

                    {/* Review button — completed classes only */}
                    {status === 'completed' && (
                      alreadyReviewed ? (
                        <span className="flex items-center gap-1 rounded-lg bg-yellow-500/10 border border-yellow-500/20 px-3 py-1.5 text-xs font-semibold text-yellow-400">
                          <Star size={11} className="fill-yellow-400" /> Reviewed
                        </span>
                      ) : (
                        <button
                          onClick={() => openReviewModal(b)}
                          className="flex items-center gap-1.5 rounded-lg bg-yellow-500/15 border border-yellow-500/30 px-3 py-1.5 text-xs font-semibold text-yellow-400 hover:bg-yellow-500/25 transition-all"
                        >
                          <Star size={12} /> Write Review
                        </button>
                      )
                    )}

                    {/* Join button */}
                    {tab === 'upcoming' && status === 'confirmed' && (
                      <button
                        onClick={() => navigate(`/classroom/${b._id}`)}
                        className="flex items-center gap-1 rounded-lg bg-brand-gradient px-3 py-1.5 text-xs font-semibold text-slate-deep"
                      >
                        <Video size={12} /> Join
                      </button>
                    )}

                    {/* Cancel button */}
                    {tab === 'upcoming' && (
                      <button
                        onClick={() => handleCancel(b._id)}
                        disabled={cancelling === b._id}
                        className="flex items-center gap-1 rounded-lg border border-white/15 px-3 py-1.5 text-xs text-white/60 hover:bg-white/5 disabled:opacity-50"
                      >
                        {cancelling === b._id ? <Loader2 size={11} className="animate-spin" /> : <X size={11} />}
                        Cancel
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
            {bookings.length === 0 && (
              <div className="glass-panel rounded-2xl py-14 text-center">
                <p className="text-sm text-white/40">No {tab} bookings yet.</p>
                {tab === 'upcoming' && (
                  <a href="/search" className="mt-3 inline-block text-xs text-cyan-electric hover:underline">
                    Find a tutor →
                  </a>
                )}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ───── Review Modal ───── */}
      <AnimatePresence>
        {reviewTarget && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              className="w-full max-w-md rounded-2xl border border-white/10 bg-[#0A0A14] shadow-2xl overflow-hidden"
            >
              {/* Header */}
              <div className="flex items-center justify-between border-b border-white/10 px-6 py-4">
                <h3 className="flex items-center gap-2 font-display text-base font-bold text-white">
                  <Star size={16} className="text-yellow-400 fill-yellow-400" />
                  Rate your session
                </h3>
                <button
                  onClick={() => setReviewTarget(null)}
                  className="rounded-lg p-1.5 text-white/40 hover:bg-white/5 hover:text-white transition-all"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="p-6 space-y-5">
                <p className="text-sm text-white/60">
                  How was your class with <span className="font-semibold text-white">{reviewTarget.tutorName}</span>?
                </p>

                {/* Star selector */}
                <div className="flex flex-col items-center gap-2">
                  <StarRating value={reviewRating} onChange={setReviewRating} />
                  {reviewRating > 0 && (
                    <span className="text-xs font-semibold text-yellow-400">{LABEL[reviewRating]}</span>
                  )}
                </div>

                {/* Comment */}
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-white/50 uppercase tracking-wider">
                    Your feedback (optional)
                  </label>
                  <textarea
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    maxLength={500}
                    rows={4}
                    placeholder="Share what you liked or what could be improved..."
                    className="w-full rounded-xl border border-white/10 bg-white/5 p-3 text-sm text-white placeholder-white/30 outline-none focus:border-cyan-electric resize-none transition-colors"
                  />
                  <p className="mt-1 text-right text-[10px] text-white/30">{reviewComment.length}/500</p>
                </div>

                {/* Submit */}
                <div className="flex gap-3">
                  <button
                    onClick={() => setReviewTarget(null)}
                    className="flex-1 rounded-xl border border-white/15 py-2.5 text-xs font-semibold text-white/60 hover:bg-white/5 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSubmitReview}
                    disabled={!reviewRating || submittingReview}
                    className="flex-1 rounded-xl bg-brand-gradient py-2.5 text-xs font-bold text-slate-deep disabled:opacity-40 transition-all flex items-center justify-center gap-2"
                  >
                    {submittingReview
                      ? <><Loader2 size={13} className="animate-spin" /> Submitting...</>
                      : <><Star size={13} className="fill-slate-deep" /> Submit Review</>}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ───── AI Notes Viewer Modal ───── */}
      <AnimatePresence>
        {selectedNotes && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              className="w-full max-w-lg rounded-2xl border border-white/10 bg-[#0A0A14] p-6 shadow-2xl"
            >
              <div className="mb-4 flex items-center justify-between border-b border-white/10 pb-3">
                <h3 className="flex items-center gap-2 font-display text-base font-bold text-cyan-electric">
                  <Sparkles size={18} /> AI Class Notes & Homework
                </h3>
                <button
                  onClick={() => setSelectedNotes(null)}
                  className="rounded-lg p-1.5 text-white/40 hover:bg-white/5 hover:text-white"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="space-y-4 max-h-[380px] overflow-y-auto pr-1 text-white">
                <div>
                  <h4 className="text-xs font-bold text-white/50 uppercase tracking-wider mb-2">Core Concepts covered</h4>
                  <ul className="list-disc pl-5 space-y-2 text-sm text-white/80">
                    {selectedNotes.coreConcepts?.map((concept, idx) => (
                      <li key={idx}>{concept}</li>
                    ))}
                    {(!selectedNotes.coreConcepts || selectedNotes.coreConcepts.length === 0) && (
                      <li className="text-white/40 italic">No notes summary found.</li>
                    )}
                  </ul>
                </div>

                <div className="border-t border-white/5 pt-4">
                  <h4 className="text-xs font-bold text-white/50 uppercase tracking-wider mb-2">Homework & Exercises</h4>
                  <ol className="list-decimal pl-5 space-y-2 text-sm text-white/80">
                    {selectedNotes.homework?.map((task, idx) => (
                      <li key={idx}>{task}</li>
                    ))}
                    {(!selectedNotes.homework || selectedNotes.homework.length === 0) && (
                      <li className="text-white/40 italic">No homework recommended.</li>
                    )}
                  </ol>
                </div>
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => setSelectedNotes(null)}
                  className="rounded-xl bg-brand-gradient px-4 py-2 text-xs font-semibold text-slate-deep"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </DashboardLayout>
  );
}
