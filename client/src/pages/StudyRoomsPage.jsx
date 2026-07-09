import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Lock, Plus, X, Hash, Clock, Zap, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import BackgroundOrbs from '../components/BackgroundOrbs';
import useAuthStore from '../store/authStore';
import api from '../services/api';

const SUBJECT_COLORS = {
  Mathematics: 'from-violet/40 to-violet/10',
  Programming: 'from-cyan-electric/40 to-cyan-electric/10',
  Languages: 'from-emerald-500/40 to-emerald-500/10',
  Science: 'from-blue-500/40 to-blue-500/10',
  Music: 'from-rose-500/40 to-rose-500/10',
  'Test Prep': 'from-amber-500/40 to-amber-500/10',
};

const SUBJECT_TEXT = {
  Mathematics: 'text-violet',
  Programming: 'text-cyan-electric',
  Languages: 'text-emerald-400',
  Science: 'text-blue-400',
  Music: 'text-rose-400',
  'Test Prep': 'text-amber-400',
};

function CreateRoomModal({ onClose, onCreated }) {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', subject: 'Mathematics', maxPeople: 8, isPrivate: false, tagsInput: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      navigate('/login');
      return;
    }
    if (!form.name.trim()) {
      setError('Please provide a room name');
      return;
    }
    setLoading(true);
    setError('');

    try {
      const tags = form.tagsInput.split(',').map(t => t.trim()).filter(Boolean);
      const { data } = await api.post('/study-rooms', {
        name: form.name,
        subject: form.subject,
        maxPeople: form.maxPeople,
        isPrivate: form.isPrivate,
        tags,
      });
      onCreated(data.data);
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create study room');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.92, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.92, y: 20 }}
        transition={{ type: 'spring', stiffness: 200, damping: 20 }}
        onClick={e => e.stopPropagation()}
        className="glass-panel w-full max-w-md rounded-3xl p-8"
      >
        <div className="mb-6 flex items-center justify-between">
          <h2 className="font-display text-xl font-bold text-white">Create Study Room</h2>
          <button onClick={onClose} className="rounded-full p-2 hover:bg-white/10 text-white/50">
            <X size={18} />
          </button>
        </div>

        {error && <p className="mb-4 text-xs text-rose-400 bg-rose-500/10 p-3 rounded-xl border border-rose-500/20">{error}</p>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-white/60">Room Name</label>
            <input
              value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })}
              placeholder="e.g. Calculus Study Group"
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder-white/30 outline-none focus:border-cyan-electric transition-colors"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-white/60">Subject</label>
            <select
              value={form.subject}
              onChange={e => setForm({ ...form, subject: e.target.value })}
              className="w-full rounded-xl border border-white/10 bg-slate-deep px-4 py-2.5 text-sm text-white outline-none focus:border-cyan-electric"
            >
              {Object.keys(SUBJECT_COLORS).map(s => <option key={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-white/60">Tags (comma separated)</label>
            <input
              value={form.tagsInput}
              onChange={e => setForm({ ...form, tagsInput: e.target.value })}
              placeholder="e.g. integrals, exam-prep"
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder-white/30 outline-none focus:border-cyan-electric transition-colors"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-white/60">Max Participants: {form.maxPeople}</label>
            <input
              type="range" min={2} max={20} value={form.maxPeople}
              onChange={e => setForm({ ...form, maxPeople: +e.target.value })}
              className="w-full accent-violet"
            />
          </div>
          <label className="flex cursor-pointer items-center gap-3">
            <div
              onClick={() => setForm({ ...form, isPrivate: !form.isPrivate })}
              className={`relative h-6 w-11 rounded-full transition-colors ${form.isPrivate ? 'bg-violet' : 'bg-white/20'}`}
            >
              <div className={`absolute top-1 h-4 w-4 rounded-full bg-white transition-transform ${form.isPrivate ? 'translate-x-6' : 'translate-x-1'}`} />
            </div>
            <span className="text-sm text-white/70">Private Room</span>
          </label>
          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center items-center gap-2 rounded-xl bg-brand-gradient py-3 text-sm font-semibold text-slate-deep transition-transform active:scale-95 disabled:opacity-55"
          >
            {loading ? <Loader2 size={16} className="animate-spin" /> : 'Create Room'}
          </button>
        </form>
      </motion.div>
    </motion.div>
  );
}

function RoomCard({ room, index, onRoomAction }) {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const participantsList = room.participants || [];
  const isJoined = user && participantsList.some(p => (p._id || p) === user._id);

  const handleAction = async () => {
    if (!user) {
      navigate('/login');
      return;
    }
    setLoading(true);
    try {
      if (isJoined) {
        await api.patch(`/study-rooms/${room._id}/leave`);
      } else {
        await api.patch(`/study-rooms/${room._id}/join`);
      }
      onRoomAction();
    } catch (err) {
      alert(err.response?.data?.message || 'Action failed');
    } finally {
      setLoading(false);
    }
  };

  const bgGrad = SUBJECT_COLORS[room.subject] || 'from-violet/40 to-violet/10';
  const textCol = SUBJECT_TEXT[room.subject] || 'text-violet';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.07, type: 'spring', stiffness: 100, damping: 15 }}
      whileHover={{ y: -4 }}
      className="glass-panel group relative cursor-pointer overflow-hidden rounded-2xl p-5 transition-all duration-300 hover:border-white/20 hover:shadow-glow"
    >
      <div className={`absolute inset-0 bg-gradient-to-br ${bgGrad} opacity-30`} />
      <div className="relative">
        <div className="mb-3 flex items-start justify-between">
          <div>
            <div className="mb-1 flex items-center gap-2">
              {room.isLive && (
                <span className="flex items-center gap-1 rounded-full bg-green-500/20 px-2 py-0.5 text-[10px] font-semibold text-green-400">
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-green-400" /> LIVE
                </span>
              )}
              {room.isPrivate && <Lock size={12} className="text-white/40" />}
            </div>
            <h3 className="font-display font-semibold text-white">{room.name}</h3>
            <p className={`text-xs font-medium ${textCol}`}>{room.subject}</p>
          </div>
        </div>

        <div className="mb-3 flex flex-wrap gap-1">
          {room.tags && room.tags.map(tag => (
            <span key={tag} className="rounded-full bg-white/10 px-2 py-0.5 text-[10px] text-white/60">
              #{tag}
            </span>
          ))}
        </div>

        <div className="mb-4 flex items-center justify-between text-xs text-white/50">
          <span>Hosted by {room.hostName || (room.host?.fullName) || 'Verified Tutor'}</span>
          <div className="flex items-center gap-1">
            <Users size={12} />
            <span>{participantsList.length}/{room.maxPeople}</span>
          </div>
        </div>

        {/* Participant avatars */}
        <div className="mb-4 flex -space-x-2">
          {participantsList.slice(0, 4).map((p, i) => (
            <img
              key={p._id || i}
              src={`https://api.dicebear.com/7.x/notionists/svg?seed=${p.fullName || p}`}
              className="h-7 w-7 rounded-full border-2 border-slate-deep object-cover"
              alt="participant"
            />
          ))}
          {participantsList.length > 4 && (
            <div className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-slate-deep bg-violet text-[10px] font-bold text-white">
              +{participantsList.length - 4}
            </div>
          )}
        </div>

        {/* Progress bar */}
        <div className="mb-4 h-1.5 w-full rounded-full bg-white/10">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${(participantsList.length / room.maxPeople) * 100}%` }}
            transition={{ duration: 0.8 }}
            className="h-full rounded-full bg-brand-gradient"
          />
        </div>

        <button
          onClick={handleAction}
          disabled={loading}
          className={`w-full flex items-center justify-center gap-2 rounded-xl py-2 text-sm font-semibold text-slate-deep transition-transform active:scale-95 ${
            isJoined ? 'bg-rose-500 text-white' : 'bg-brand-gradient'
          }`}
        >
          {loading ? <Loader2 size={16} className="animate-spin" /> : isJoined ? 'Leave Room' : 'Join Room'}
        </button>
      </div>
    </motion.div>
  );
}

export default function StudyRoomsPage() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [filter, setFilter] = useState('All');
  const subjects = ['All', ...Object.keys(SUBJECT_COLORS)];

  const fetchRooms = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/study-rooms', { params: { subject: filter } });
      setRooms(data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRooms();
  }, [filter]);

  const handleCreateClick = () => {
    if (!user) {
      navigate('/login');
    } else {
      setShowCreate(true);
    }
  };

  const handleRoomCreated = (newRoom) => {
    setRooms(prev => [newRoom, ...prev]);
  };

  return (
    <div className="relative min-h-screen overflow-hidden">
      <BackgroundOrbs />
      <Navbar />

      <div className="mx-auto max-w-6xl px-6 pb-20 pt-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center"
        >
          <div>
            <h1 className="font-display text-3xl font-extrabold text-white">
              Community <span className="bg-brand-gradient bg-clip-text text-transparent">Study Rooms</span>
            </h1>
            <p className="mt-1 text-white/50">Join or create live group study sessions — learn together, grow faster.</p>
          </div>
          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            onClick={handleCreateClick}
            className="flex items-center gap-2 rounded-xl bg-brand-gradient px-5 py-2.5 text-sm font-semibold text-slate-deep shadow-glow"
          >
            <Plus size={16} /> Create Room
          </motion.button>
        </motion.div>

        {/* Stats */}
        <div className="mb-8 grid grid-cols-3 gap-4">
          {[
            { label: 'Live Rooms', value: rooms.length, icon: Hash, color: 'text-violet' },
            { label: 'Participants', value: rooms.reduce((acc, r) => acc + (r.participants?.length || 0), 0), icon: Zap, color: 'text-cyan-electric' },
            { label: 'Avg Size', value: rooms.length > 0 ? (rooms.reduce((acc, r) => acc + (r.participants?.length || 0), 0) / rooms.length).toFixed(1) : '0.0', icon: Clock, color: 'text-rose-400' },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="glass-panel rounded-2xl p-4 text-center"
            >
              <stat.icon size={20} className={`mx-auto mb-2 ${stat.color}`} />
              <p className={`font-display text-2xl font-extrabold ${stat.color}`}>{stat.value}</p>
              <p className="text-xs text-white/50">{stat.label}</p>
            </motion.div>
          ))}
        </div>

        {/* Subject Filter */}
        <div className="mb-6 flex flex-wrap gap-2">
          {subjects.map(s => (
            <motion.button
              key={s}
              whileTap={{ scale: 0.95 }}
              onClick={() => setFilter(s)}
              className={`rounded-full px-4 py-1.5 text-xs font-medium transition-all ${
                filter === s ? 'bg-brand-gradient text-slate-deep shadow-glow' : 'glass-panel text-white/60 hover:text-white'
              }`}
            >
              {s}
            </motion.button>
          ))}
        </div>

        {/* Room Grid */}
        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div key="loader" className="flex justify-center py-20">
              <Loader2 size={32} className="animate-spin text-cyan-electric" />
            </motion.div>
          ) : (
            <motion.div key="list" className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {rooms.map((room, i) => (
                <RoomCard key={room._id} room={room} index={i} onRoomAction={fetchRooms} />
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {!loading && rooms.length === 0 && (
          <div className="py-20 text-center text-white/40">
            No live study rooms found for this subject. Try creating one!
          </div>
        )}
      </div>

      <AnimatePresence>
        {showCreate && <CreateRoomModal onClose={() => setShowCreate(false)} onCreated={handleRoomCreated} />}
      </AnimatePresence>

      <Footer />
    </div>
  );
}
