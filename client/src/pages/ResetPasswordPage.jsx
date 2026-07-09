import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useSearchParams } from 'react-router-dom';
import { Lock } from 'lucide-react';
import AnimatedSuccessCheckmark from '../components/AnimatedSuccessCheckmark';
import api from '../services/api';

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError("Passwords don't match");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    setLoading(true);
    setError('');

    try {
      await api.post('/auth/reset-password', { token, password });
      setSuccess(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong. Please try again.');
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
          {!success ? (
            <motion.form key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onSubmit={handleSubmit}>
              <h1 className="font-display text-xl font-bold text-white">Reset Password</h1>
              <p className="mt-1 text-sm text-white/50">Enter your new secure password below.</p>

              {!token ? (
                <p className="mt-6 text-sm text-red-400 font-semibold bg-red-500/10 p-3 rounded-xl border border-red-500/20">
                  Missing or invalid password reset token. Please request a new link.
                </p>
              ) : (
                <>
                  <div className="relative mt-6">
                    <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="New password (min 8 chars)"
                      className="w-full rounded-xl border border-white/10 bg-white/5 py-3 pl-10 pr-4 text-sm text-white placeholder-white/40 outline-none focus:border-violet"
                    />
                  </div>

                  <div className="relative mt-4">
                    <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
                    <input
                      type="password"
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Confirm new password"
                      className="w-full rounded-xl border border-white/10 bg-white/5 py-3 pl-10 pr-4 text-sm text-white placeholder-white/40 outline-none focus:border-violet"
                    />
                  </div>

                  {error && <p className="mt-2 text-xs text-red-400">{error}</p>}

                  <button
                    type="submit"
                    disabled={loading}
                    className="mt-5 w-full rounded-xl bg-brand-gradient py-3 text-sm font-semibold text-slate-deep disabled:opacity-60"
                  >
                    {loading ? 'Resetting…' : 'Reset Password'}
                  </button>
                </>
              )}
            </motion.form>
          ) : (
            <motion.div key="success" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
              <AnimatedSuccessCheckmark />
              <h1 className="mt-2 font-display text-xl font-bold text-white">Reset Success!</h1>
              <p className="mt-1 text-sm text-white/50">
                Your password has been reset successfully. You can now log in with your new password.
              </p>
              <Link to="/login" className="mt-6 block w-full rounded-xl bg-brand-gradient py-3 text-sm font-semibold text-slate-deep">
                Go to Log In
              </Link>
            </motion.div>
          )}
        </AnimatePresence>

        {!success && (
          <p className="mt-6 text-sm text-white/50">
            <Link to="/login" className="font-medium text-cyan-electric hover:underline">
              Back to Log In
            </Link>
          </p>
        )}
      </motion.div>
    </div>
  );
}
