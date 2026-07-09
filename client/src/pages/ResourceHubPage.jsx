import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, Download, Eye, Star, Search, FileText, Code, Music, Calculator, Globe, FlaskConical, Unlock, Upload, Heart, X, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import BackgroundOrbs from '../components/BackgroundOrbs';
import useAuthStore from '../store/authStore';
import api from '../services/api';

const SUBJECT_ICONS = { Programming: Code, Mathematics: Calculator, Languages: Globe, Music: Music, Science: FlaskConical, 'Test Prep': BookOpen };
const SUBJECT_COLORS = {
  Programming: 'text-cyan-electric bg-cyan-electric/10',
  Mathematics: 'text-violet bg-violet/10',
  Languages: 'text-emerald-400 bg-emerald-400/10',
  Music: 'text-rose-400 bg-rose-400/10',
  Science: 'text-blue-400 bg-blue-400/10',
  'Test Prep': 'text-amber-400 bg-amber-400/10',
};

function UploadResourceModal({ onClose, onUploaded }) {
  const [form, setForm] = useState({ title: '', subject: 'Mathematics', type: 'PDF', price: 0, pages: 1, tagsInput: '', preview: '', fileUrl: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title || !form.subject || !form.preview) {
      setError('Please provide title, subject, and preview');
      return;
    }
    setLoading(true);
    setError('');

    try {
      const tags = form.tagsInput.split(',').map(t => t.trim()).filter(Boolean);
      const { data } = await api.post('/resources', {
        title: form.title,
        subject: form.subject,
        type: form.type,
        price: Number(form.price) || 0,
        pages: Number(form.pages) || 1,
        preview: form.preview,
        fileUrl: form.fileUrl,
        tags,
      });
      onUploaded(data.data);
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to upload resource');
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
        className="glass-panel w-full max-w-md rounded-3xl p-6"
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-lg font-bold text-white">Upload Study Resource</h2>
          <button onClick={onClose} className="rounded-full p-1.5 hover:bg-white/10 text-white/50">
            <X size={16} />
          </button>
        </div>

        {error && <p className="mb-3 text-xs text-rose-400 bg-rose-500/10 p-2.5 rounded-xl border border-rose-500/20">{error}</p>}

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="mb-1 block text-xs font-medium text-white/60">Title</label>
            <input
              value={form.title}
              onChange={e => setForm({ ...form, title: e.target.value })}
              placeholder="e.g. Algebra Complete Formula Sheet"
              className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder-white/30 outline-none focus:border-cyan-electric transition-colors"
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="mb-1 block text-xs font-medium text-white/60">Subject</label>
              <select
                value={form.subject}
                onChange={e => setForm({ ...form, subject: e.target.value })}
                className="w-full rounded-xl border border-white/10 bg-slate-deep px-3 py-2 text-sm text-white outline-none focus:border-cyan-electric"
              >
                {Object.keys(SUBJECT_COLORS).map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-white/60">Format</label>
              <select
                value={form.type}
                onChange={e => setForm({ ...form, type: e.target.value })}
                className="w-full rounded-xl border border-white/10 bg-slate-deep px-3 py-2 text-sm text-white outline-none focus:border-cyan-electric"
              >
                <option>PDF</option>
                <option>DOC</option>
                <option>ZIP</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="mb-1 block text-xs font-medium text-white/60">Price ($)</label>
              <input
                type="number" min={0} value={form.price}
                onChange={e => setForm({ ...form, price: e.target.value })}
                className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-cyan-electric"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-white/60">Pages / Length</label>
              <input
                type="number" min={1} value={form.pages}
                onChange={e => setForm({ ...form, pages: e.target.value })}
                className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-cyan-electric"
              />
            </div>
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-white/60">Tags (comma separated)</label>
            <input
              value={form.tagsInput}
              onChange={e => setForm({ ...form, tagsInput: e.target.value })}
              placeholder="e.g. algebra, math-tricks"
              className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder-white/30 outline-none focus:border-cyan-electric transition-colors"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-white/60">File URL (Mock link)</label>
            <input
              value={form.fileUrl}
              onChange={e => setForm({ ...form, fileUrl: e.target.value })}
              placeholder="e.g. http://example.com/notes.pdf"
              className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder-white/30 outline-none focus:border-cyan-electric transition-colors"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-white/60">Preview Summary / Description</label>
            <textarea
              rows={2} value={form.preview}
              onChange={e => setForm({ ...form, preview: e.target.value })}
              placeholder="Brief overview of the material..."
              className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder-white/30 outline-none focus:border-cyan-electric transition-colors resize-none"
            />
          </div>
          <button
            type="submit" disabled={loading}
            className="w-full flex justify-center items-center gap-2 rounded-xl bg-brand-gradient py-2.5 text-sm font-semibold text-slate-deep transition-transform active:scale-95 disabled:opacity-55"
          >
            {loading ? <Loader2 size={16} className="animate-spin" /> : 'Upload Resource'}
          </button>
        </form>
      </motion.div>
    </motion.div>
  );
}

function ResourceCard({ res, index }) {
  const [liked, setLiked] = useState(false);
  const Icon = SUBJECT_ICONS[res.subject] || FileText;
  const isFree = res.price === 0;

  const handleDownload = () => {
    if (res.fileUrl) {
      window.open(res.fileUrl, '_blank');
    } else {
      alert('Downloading study guide: ' + res.title);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06, type: 'spring', stiffness: 100, damping: 15 }}
      whileHover={{ y: -4 }}
      className="glass-panel group relative flex flex-col rounded-2xl p-5 transition-all hover:border-white/20 hover:shadow-glow"
    >
      {/* Type badge */}
      <div className="mb-4 flex items-start justify-between">
        <div className={`flex items-center gap-2 rounded-xl px-3 py-1.5 text-xs font-semibold ${SUBJECT_COLORS[res.subject] || 'text-violet bg-violet/10'}`}>
          <Icon size={14} /> {res.subject}
        </div>
        <div className="flex items-center gap-2">
          <span className="rounded-lg bg-white/10 px-2 py-1 text-[10px] font-bold text-white/60">{res.type}</span>
          <motion.button
            whileTap={{ scale: 0.7 }}
            onClick={() => setLiked(v => !v)}
            className="rounded-full p-1.5 hover:bg-white/10"
          >
            <Heart size={14} className={liked ? 'fill-rose-500 text-rose-500' : 'text-white/40'} />
          </motion.button>
        </div>
      </div>

      <h3 className="mb-2 font-display font-semibold leading-snug text-white">{res.title}</h3>
      <p className="mb-3 flex-1 text-xs leading-relaxed text-white/50">{res.preview}</p>

      {/* Tags */}
      <div className="mb-3 flex flex-wrap gap-1">
        {res.tags && res.tags.map(t => (
          <span key={t} className="rounded-full bg-white/8 px-2 py-0.5 text-[10px] text-white/50">#{t}</span>
        ))}
      </div>

      {/* Meta */}
      <div className="mb-4 flex items-center justify-between text-xs text-white/40">
        <span>by {res.tutorName || res.tutor?.fullName || 'Verified Tutor'}</span>
        <div className="flex items-center gap-2 flex-wrap">
          <span className="flex items-center gap-1"><Star size={11} className="fill-amber-400 text-amber-400" /> {res.rating || '4.8'}</span>
          <span className="flex items-center gap-1"><Download size={11} /> {res.downloads || '0'}</span>
          <span className="flex items-center gap-1"><FileText size={11} /> {res.pages}p</span>
        </div>
      </div>

      {/* Action */}
      <div className="flex items-center gap-2">
        <button
          onClick={handleDownload}
          className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-white/10 py-2 text-xs font-medium text-white/70 hover:bg-white/5 transition-colors"
        >
          <Eye size={13} /> Preview
        </button>
        <button
          onClick={handleDownload}
          className={`flex flex-1 items-center justify-center gap-1.5 rounded-xl py-2 text-xs font-semibold transition-transform active:scale-95 ${isFree ? 'bg-brand-gradient text-slate-deep' : 'bg-violet/20 text-violet border border-violet/30'}`}
        >
          {isFree ? (<><Download size={13} /> Download</>) : (<><Unlock size={13} /> Get ${res.price}</>)}
        </button>
      </div>
    </motion.div>
  );
}

export default function ResourceHubPage() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('All');
  const [freeOnly, setFreeOnly] = useState(false);
  const [showUpload, setShowUpload] = useState(false);
  const subjects = ['All', ...Object.keys(SUBJECT_ICONS)];

  const fetchResources = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/resources', {
        params: {
          subject: filter,
          search: search || undefined,
          freeOnly: freeOnly ? 'true' : undefined
        }
      });
      setResources(data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResources();
  }, [filter, search, freeOnly]);

  const handleUploadClick = () => {
    if (!user) {
      navigate('/login');
      return;
    }
    if (user.role !== 'tutor' && user.role !== 'admin') {
      alert('Only verified Tutors can upload educational study resources! Please register as a tutor to upload.');
      return;
    }
    setShowUpload(true);
  };

  const handleUploaded = (newRes) => {
    setResources(prev => [newRes, ...prev]);
  };

  return (
    <div className="relative min-h-screen overflow-hidden">
      <BackgroundOrbs />
      <Navbar />

      <div className="mx-auto max-w-7xl px-6 pb-20 pt-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10"
        >
          <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <h1 className="font-display text-3xl font-extrabold text-white">
                Study <span className="bg-brand-gradient bg-clip-text text-transparent">Resource Hub</span>
              </h1>
              <p className="mt-1 text-white/50">Download notes, guides & practice sets from our top tutors.</p>
            </div>
            <button
              onClick={handleUploadClick}
              className="flex items-center gap-2 rounded-xl bg-brand-gradient px-5 py-2.5 text-sm font-semibold text-slate-deep shadow-glow"
            >
              <Upload size={16} /> Upload Resource
            </button>
          </div>

          {/* Stats */}
          <div className="mt-6 grid grid-cols-3 gap-3">
            {[
              { label: 'Total Resources', value: resources.length },
              { label: 'Free Guides', value: resources.filter(r => r.price === 0).length },
              { label: 'Downloads', value: resources.reduce((acc, r) => acc + (r.downloads || 0), 0) },
            ].map((s, i) => (
              <motion.div
                key={s.label}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.1 }}
                className="glass-panel rounded-2xl p-4 text-center"
              >
                <p className="font-display text-xl font-extrabold text-white">{s.value}</p>
                <p className="text-xs text-white/50">{s.label}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Filters */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search notes, topics, subjects..."
              className="w-full rounded-xl border border-white/10 bg-white/5 py-2.5 pl-10 pr-4 text-sm text-white placeholder-white/30 outline-none focus:border-cyan-electric transition-colors"
            />
          </div>
          <label className="flex cursor-pointer items-center gap-2 text-sm text-white/60 select-none">
            <div
              onClick={() => setFreeOnly(v => !v)}
              className={`relative h-5 w-9 rounded-full transition-colors ${freeOnly ? 'bg-violet' : 'bg-white/20'}`}
            >
              <div className={`absolute top-0.5 h-4 w-4 rounded-full bg-white transition-transform ${freeOnly ? 'translate-x-4' : 'translate-x-0.5'}`} />
            </div>
            Free Only
          </label>
        </div>

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

        {/* Grid */}
        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div key="loader" className="flex justify-center py-20">
              <Loader2 size={32} className="animate-spin text-cyan-electric" />
            </motion.div>
          ) : (
            <motion.div key="list" className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {resources.map((res, i) => <ResourceCard key={res._id} res={res} index={i} />)}
            </motion.div>
          )}
        </AnimatePresence>

        {!loading && resources.length === 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="py-20 text-center">
            <BookOpen size={48} className="mx-auto mb-4 text-white/20" />
            <p className="text-white/40">No study materials found. Try uploading one!</p>
          </motion.div>
        )}
      </div>

      <AnimatePresence>
        {showUpload && <UploadResourceModal onClose={() => setShowUpload(false)} onUploaded={handleUploaded} />}
      </AnimatePresence>

      <Footer />
    </div>
  );
}
