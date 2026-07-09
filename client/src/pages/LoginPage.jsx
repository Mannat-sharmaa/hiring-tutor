import { useState, useEffect, useRef } from 'react';
import { motion, useMotionValue, useTransform } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';
import useAuthStore from '../store/authStore';
import BackgroundOrbs from '../components/BackgroundOrbs';

import api from '../services/api';

const formContainerVariants = {
  hidden: { opacity: 0, scale: 0.96 },
  show: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.4,
      ease: 'easeOut',
      staggerChildren: 0.08,
      delayChildren: 0.1,
    },
  },
};

const formItemVariants = {
  hidden: { opacity: 0, y: 15 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      type: 'spring',
      stiffness: 120,
      damping: 16,
    },
  },
};

export default function LoginPage() {
  const navigate = useNavigate();
  const { user, login, googleLogin, isLoading, error } = useAuthStore();
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);

  const cardRef = useRef(null);
  
  // Track normalized mouse coordinates [0, 1] for 3D parallax tilt
  const x = useMotionValue(0.5);
  const y = useMotionValue(0.5);

  // Transform coordinates into degrees of rotation
  const rotateX = useTransform(y, [0, 1], [6, -6]);
  const rotateY = useTransform(x, [0, 1], [-6, 6]);

  const handleMouseMove = (e) => {
    const card = cardRef.current;
    if (!card) return;

    const rect = card.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width;
    const py = (e.clientY - rect.top) / rect.height;

    x.set(px);
    y.set(py);
  };

  const handleMouseLeave = () => {
    // Reset rotation smoothly back to center
    x.set(0.5);
    y.set(0.5);
  };

  useEffect(() => {
    if (user) {
      if (user.role === 'tutor') {
        const isProfileIncomplete = !user.headline || !user.bio || !user.hourlyRate;
        navigate(isProfileIncomplete ? '/tutor/profile' : '/tutor/dashboard');
      } else if (user.role === 'student') {
        const isProfileIncomplete = !user.phone;
        navigate(isProfileIncomplete ? '/student/settings' : '/student/dashboard');
      } else {
        navigate(user.role === 'admin' ? '/admin' : '/student/dashboard');
      }
    }
  }, [user, navigate]);

  useEffect(() => {
    let active = true;

    const initGoogleSignIn = async () => {
      try {
        const { data } = await api.get('/auth/config');
        if (!active) return;
        const clientId = data.googleClientId;

        if (clientId && window.google) {
          window.google.accounts.id.initialize({
            client_id: clientId,
            callback: async (response) => {
              try {
                await googleLogin({ idToken: response.credential });
              } catch (err) {
                console.error('Google login failed:', err);
              }
            },
          });

          window.google.accounts.id.renderButton(
            document.getElementById('google-btn-container'),
            {
              theme: 'outline',
              size: 'large',
              width: 320,
              text: 'continue_with',
              shape: 'rectangular',
            }
          );
        }
      } catch (err) {
        console.error('Google initialization error:', err);
      }
    };

    const t = setTimeout(initGoogleSignIn, 600);

    return () => {
      active = false;
      clearTimeout(t);
    };
  }, [googleLogin]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const { user } = await login(form);
      if (user.role === 'tutor') {
        const isProfileIncomplete = !user.headline || !user.bio || !user.hourlyRate;
        navigate(isProfileIncomplete ? '/tutor/profile' : '/tutor/dashboard');
      } else {
        navigate(user.role === 'admin' ? '/admin' : '/student/dashboard');
      }
    } catch {
      // error is already surfaced via the store
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-6">
      <BackgroundOrbs />

      <motion.div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{
          rotateX,
          rotateY,
          transformStyle: 'preserve-3d',
        }}
        variants={formContainerVariants}
        initial="hidden"
        animate="show"
        className="relative grid w-full max-w-4xl grid-cols-1 overflow-hidden rounded-3xl glass-panel md:grid-cols-2"
      >
        {/* Holographic scanner beam during authentication loading */}
        {isLoading && (
          <motion.div
            className="absolute left-0 right-0 h-1.5 bg-cyan-electric shadow-[0_0_12px_#00f2fe,0_0_24px_#00f2fe] z-50 pointer-events-none"
            animate={{ top: ['0%', '100%', '0%'] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: 'linear' }}
          />
        )}
        {/* Left illustration side */}
        <div className="hidden flex-col justify-between bg-brand-gradient p-10 md:flex">
          <a href="/" className="font-display text-lg font-extrabold text-slate-deep">
            EduConnect
          </a>
          <div>
            <h2 className="font-display text-2xl font-bold text-slate-deep">
              Learning, one great tutor away.
            </h2>
            <p className="mt-2 text-sm text-slate-deep/70">
              Join thousands of students and tutors already growing together.
            </p>
          </div>
          <div className="text-xs text-slate-deep/60">© {new Date().getFullYear()} EduConnect</div>
        </div>

        {/* Right form side */}
        <div className="p-8 sm:p-10">
          <motion.h1 variants={formItemVariants} className="font-display text-2xl font-bold text-white text-glow-cyan">
            Welcome back
          </motion.h1>
          <motion.p variants={formItemVariants} className="mt-1 text-sm text-white/50">
            Log in to continue your learning journey.
          </motion.p>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <motion.div variants={formItemVariants} className="relative">
              <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
              <input
                type="email"
                required
                placeholder="Email address"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full rounded-xl border border-white/10 bg-white/5 py-3 pl-10 pr-4 text-sm text-white placeholder-white/40 outline-none focus:border-cyan-electric focus:ring-1 focus:ring-cyan-electric/40 focus:bg-white/10 transition-all duration-300"
              />
            </motion.div>

            <motion.div variants={formItemVariants} className="relative">
              <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                placeholder="Password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="w-full rounded-xl border border-white/10 bg-white/5 py-3 pl-10 pr-10 text-sm text-white placeholder-white/40 outline-none focus:border-cyan-electric focus:ring-1 focus:ring-cyan-electric/40 focus:bg-white/10 transition-all duration-300"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </motion.div>

            <motion.div variants={formItemVariants} className="flex justify-end">
              <Link to="/forgot-password" className="text-xs font-medium text-cyan-electric hover:underline">
                Forgot password?
              </Link>
            </motion.div>

            {error && <motion.p variants={formItemVariants} className="text-xs text-red-400">{error}</motion.p>}

            <motion.button
              variants={formItemVariants}
              type="submit"
              disabled={isLoading}
              className="w-full rounded-xl bg-brand-gradient py-3 text-sm font-semibold text-slate-deep transition-transform active:scale-[0.98] disabled:opacity-60 hover:shadow-glow-cyan"
            >
              {isLoading ? 'Logging in…' : 'Log In'}
            </motion.button>
          </form>

          <motion.div variants={formItemVariants} className="my-5 flex items-center gap-3">
            <div className="h-px flex-1 bg-white/10" />
            <span className="text-xs text-white/40">or</span>
            <div className="h-px flex-1 bg-white/10" />
          </motion.div>

          <motion.div
            variants={formItemVariants}
            id="google-btn-container"
            className="w-full flex justify-center [&_iframe]:!w-full [&_iframe]:!max-w-full"
          />

          <motion.p variants={formItemVariants} className="mt-6 text-center text-sm text-white/50">
            Don't have an account?{' '}
            <Link to="/signup" className="font-medium text-cyan-electric hover:underline">
              Sign up
            </Link>
          </motion.p>
        </div>
      </motion.div>
    </div>
  );
}
