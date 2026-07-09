import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import { GraduationCap, BookOpen } from 'lucide-react';
import useAuthStore from '../store/authStore';
import api from '../services/api';

const STEPS = ['role', 'details', 'otp'];

export default function SignupPage() {
  const navigate = useNavigate();
  const { register, verifyOtp, googleLogin, isLoading, error } = useAuthStore();

  const [step, setStep] = useState(0);
  const [role, setRole] = useState('student');
  const [form, setForm] = useState({ fullName: '', email: '', password: '', confirmPassword: '' });
  const [userId, setUserId] = useState(null);
  const [otp, setOtp] = useState(new Array(6).fill(''));
  const otpRefs = useRef([]);
  const [resendTimer, setResendTimer] = useState(0);
  const [resendStatus, setResendStatus] = useState('');
  const [googleIdToken, setGoogleIdToken] = useState(null);

  useEffect(() => {
    let active = true;
    const initGoogleSignUp = async () => {
      try {
        const { data } = await api.get('/auth/config');
        if (!active) return;
        const clientId = data.googleClientId;
        if (clientId && window.google) {
          window.google.accounts.id.initialize({
            client_id: clientId,
            callback: async (response) => {
              try {
                const payload = JSON.parse(atob(response.credential.split('.')[1]));
                const email = payload.email;
                const checkRes = await api.post('/auth/check-email', { email });
                if (checkRes.data.exists) {
                  alert('Email already registered. Please log in.');
                  return;
                }
                setGoogleIdToken(response.credential);
              } catch (err) {
                console.error('Email check failed:', err);
                alert('Verification failed. Please try again.');
              }
            },
          });
          const btnContainer = document.getElementById('google-signup-btn');
          if (btnContainer) {
            window.google.accounts.id.renderButton(btnContainer, {
              theme: 'outline',
              size: 'large',
              width: 320,
              text: 'signup_with',
              shape: 'rectangular',
            });
          }
        }
      } catch (err) {
        console.error('Google signup init error:', err);
      }
    };

    if (step === 1 && !googleIdToken) {
      setTimeout(initGoogleSignUp, 300);
    }

    return () => {
      active = false;
    };
  }, [step, googleIdToken]);

  useEffect(() => {
    let interval;
    if (resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [resendTimer]);

  const handleResendOtp = async () => {
    if (resendTimer > 0) return;
    setResendStatus('Resending code...');
    try {
      await api.post('/auth/resend-otp', { userId });
      setResendStatus('Verification code resent successfully!');
      setResendTimer(30);
      setTimeout(() => setResendStatus(''), 3000);
    } catch (err) {
      setResendStatus(err.response?.data?.message || 'Failed to resend code');
      setTimeout(() => setResendStatus(''), 4000);
    }
  };

  const handleDetailsSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) return;
    try {
      if (googleIdToken) {
        const data = await googleLogin({ idToken: googleIdToken, role, password: form.password });
        if (data.user.role === 'tutor') {
          navigate('/tutor/profile');
        } else {
          navigate('/student/dashboard');
        }
      } else {
        const data = await register({ fullName: form.fullName, email: form.email, password: form.password, role });
        setUserId(data.userId);
        setStep(2);
        setResendTimer(30);
      }
    } catch {
      /* error surfaced via store */
    }
  };

  const handleOtpChange = (index, value) => {
    if (!/^\d?$/.test(value)) return;
    const next = [...otp];
    next[index] = value;
    setOtp(next);
    if (value && index < 5) otpRefs.current[index + 1]?.focus();
  };

  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = await verifyOtp({ userId, otp: otp.join('') });
      if (data.user.role === 'tutor') {
        navigate('/tutor/profile');
      } else {
        navigate('/student/dashboard');
      }
    } catch {
      /* error surfaced via store */
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-6 py-12">
      <div className="pointer-events-none fixed left-1/2 top-0 -z-10 h-[600px] w-[600px] -translate-x-1/2 animate-breathe bg-orb-gradient blur-3xl" />

      <div className="w-full max-w-md">
        {/* Step indicator */}
        <div className="mb-8 flex items-center justify-center gap-2">
          {STEPS.map((s, i) => (
            <div key={s} className={`h-1.5 w-10 rounded-full transition-colors ${i <= step ? 'bg-violet' : 'bg-white/10'}`} />
          ))}
        </div>

        <div className="glass-panel rounded-3xl p-8">
          <AnimatePresence mode="wait">
            {step === 0 && (
              <motion.div
                key="role"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <h1 className="font-display text-xl font-bold text-white">I want to join as a…</h1>
                <div className="mt-6 grid grid-cols-2 gap-4">
                  {[
                    { key: 'student', label: 'Student', icon: GraduationCap, desc: 'I want to learn' },
                    { key: 'tutor', label: 'Tutor', icon: BookOpen, desc: 'I want to teach' },
                  ].map((opt) => (
                    <button
                      key={opt.key}
                      onClick={() => setRole(opt.key)}
                      className={`rounded-2xl border p-5 text-left transition-all ${
                        role === opt.key ? 'border-violet bg-violet/10 shadow-glow' : 'border-white/10 hover:border-white/25'
                      }`}
                    >
                      <opt.icon size={22} className={role === opt.key ? 'text-violet' : 'text-white/50'} />
                      <p className="mt-3 font-semibold text-white">{opt.label}</p>
                      <p className="text-xs text-white/40">{opt.desc}</p>
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => setStep(1)}
                  className="mt-6 w-full rounded-xl bg-brand-gradient py-3 text-sm font-semibold text-slate-deep"
                >
                  Continue
                </button>
              </motion.div>
            )}

            {step === 1 && (
              <motion.form
                key="details"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                onSubmit={handleDetailsSubmit}
                className="space-y-4"
              >
                <h1 className="font-display text-xl font-bold text-white">
                  {googleIdToken ? 'Complete Google Sign Up' : 'Create your account'}
                </h1>
                {!googleIdToken && (
                  <>
                    <input
                      required
                      placeholder="Full name"
                      value={form.fullName}
                      onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                      className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-white/40 outline-none focus:border-violet"
                    />
                    <input
                      required
                      type="email"
                      placeholder="Email address"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-white/40 outline-none focus:border-violet"
                    />
                  </>
                )}
                {googleIdToken && (
                  <p className="text-xs text-white/60">
                    Create a password to secure your newly linked Google account.
                  </p>
                )}
                <input
                  required
                  type="password"
                  minLength={8}
                  placeholder="Password (min 8 characters)"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-white/40 outline-none focus:border-violet"
                />
                <input
                  required
                  type="password"
                  placeholder="Confirm password"
                  value={form.confirmPassword}
                  onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-white/40 outline-none focus:border-violet"
                />
                {form.confirmPassword && form.password !== form.confirmPassword && (
                  <p className="text-xs text-red-400">Passwords don't match</p>
                )}
                {error && <p className="text-xs text-red-400">{error}</p>}

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      if (googleIdToken) {
                        setGoogleIdToken(null);
                      } else {
                        setStep(0);
                      }
                    }}
                    className="flex-1 rounded-xl border border-white/15 py-3 text-sm font-medium text-white/70"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="flex-1 rounded-xl bg-brand-gradient py-3 text-sm font-semibold text-slate-deep disabled:opacity-60"
                  >
                    {isLoading ? 'Processing…' : googleIdToken ? 'Complete Sign Up' : 'Create Account'}
                  </button>
                </div>

                {!googleIdToken && (
                  <>
                    <div className="my-4 flex items-center gap-3">
                      <div className="h-px flex-1 bg-white/10" />
                      <span className="text-xs text-white/40">or</span>
                      <div className="h-px flex-1 bg-white/10" />
                    </div>
                    <div id="google-signup-btn" className="w-full flex justify-center [&_iframe]:!w-full [&_iframe]:!max-w-full" />
                  </>
                )}
              </motion.form>
            )}

            {step === 2 && (
              <motion.form
                key="otp"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                onSubmit={handleOtpSubmit}
                className="text-center"
              >
                <h1 className="font-display text-xl font-bold text-white">Verify your email</h1>
                <p className="mt-1 text-sm text-white/50">Enter the 6-digit code we sent to {form.email}</p>

                <div className="mt-6 flex justify-center gap-2">
                  {otp.map((digit, i) => (
                    <input
                      key={i}
                      ref={(el) => (otpRefs.current[i] = el)}
                      value={digit}
                      onChange={(e) => handleOtpChange(i, e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Backspace' && !digit && i > 0) otpRefs.current[i - 1]?.focus();
                      }}
                      maxLength={1}
                      inputMode="numeric"
                      className="h-12 w-10 rounded-lg border border-white/15 bg-white/5 text-center text-lg font-semibold text-white outline-none focus:border-violet"
                    />
                  ))}
                </div>

                {error && <p className="mt-3 text-xs text-red-400">{error}</p>}

                <div className="mt-4 flex flex-col items-center">
                  <button
                    type="button"
                    disabled={resendTimer > 0}
                    onClick={handleResendOtp}
                    className="text-xs font-semibold text-cyan-electric hover:underline disabled:text-white/30 disabled:no-underline"
                  >
                    {resendTimer > 0 ? `Resend OTP in ${resendTimer}s` : 'Resend OTP'}
                  </button>
                  {resendStatus && <p className="mt-2 text-[11px] text-white/60">{resendStatus}</p>}
                </div>

                <button
                  type="submit"
                  disabled={isLoading || otp.some((d) => !d)}
                  className="mt-6 w-full rounded-xl bg-brand-gradient py-3 text-sm font-semibold text-slate-deep disabled:opacity-60"
                >
                  {isLoading ? 'Verifying…' : 'Verify & Continue'}
                </button>
              </motion.form>
            )}
          </AnimatePresence>
        </div>

        {step !== 2 && (
          <p className="mt-6 text-center text-sm text-white/50">
            Already have an account?{' '}
            <Link to="/login" className="font-medium text-cyan-electric hover:underline">
              Log in
            </Link>
          </p>
        )}
      </div>
    </div>
  );
}
