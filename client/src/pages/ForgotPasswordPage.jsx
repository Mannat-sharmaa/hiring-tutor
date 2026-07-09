import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Mail } from 'lucide-react';
import AnimatedSuccessCheckmark from '../components/AnimatedSuccessCheckmark';
import api from '../services/api';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      // Backend route not scaffolded yet in this pass — wire to
      // POST /api/auth/forgot-password once it's added.
      await api.post('/auth/forgot-password', { email }).catch(() => {});
      setSent(true);
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-6">
      <div className="pointer-events-none fixed left-1/2 top-0 -z-10 h-[500px] w-[500px] -translate-x-1/2 animate-breathe bg-orb-gradient blur-3xl" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm glass-panel rounded-3xl p-8 text-center"
      >
        <AnimatePresence mode="wait">
          {!sent ? (
            <motion.form key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onSubmit={handleSubmit}>
              <h1 className="font-display text-xl font-bold text-white">Forgot your password?</h1>
              <p className="mt-1 text-sm text-white/50">Enter your email and we'll send you a reset link.</p>

              <div className="relative mt-6">
                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email address"
                  className="w-full rounded-xl border border-white/10 bg-white/5 py-3 pl-10 pr-4 text-sm text-white placeholder-white/40 outline-none focus:border-violet"
                />
              </div>

              {error && <p className="mt-2 text-xs text-red-400">{error}</p>}

              <button
                type="submit"
                disabled={loading}
                className="mt-5 w-full rounded-xl bg-brand-gradient py-3 text-sm font-semibold text-slate-deep disabled:opacity-60"
              >
                {loading ? 'Sending…' : 'Send Reset Link'}
              </button>
            </motion.form>
          ) : (
            <motion.div key="success" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
              <AnimatedSuccessCheckmark />
              <h1 className="mt-2 font-display text-xl font-bold text-white">Check your inbox</h1>
              <p className="mt-1 text-sm text-white/50">
                If an account exists for {email}, a reset link is on its way.
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        <p className="mt-6 text-sm text-white/50">
          <Link to="/login" className="font-medium text-cyan-electric hover:underline">
            Back to Log In
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
