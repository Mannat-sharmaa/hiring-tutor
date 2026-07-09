import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import useAuthStore from '../store/authStore';
import api from '../services/api';

const TABS = ['Edit Profile', 'Change Password', 'Payment Methods', 'Notifications'];

export default function SettingsTabs() {
  const { user, updateUser } = useAuthStore();
  const [tab, setTab] = useState(TABS[0]);
  const [notifPrefs, setNotifPrefs] = useState({ email: true, sms: false, push: true });

  // Profile Form States
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [profileSuccess, setProfileSuccess] = useState('');
  const [profileError, setProfileError] = useState('');
  const [profileLoading, setProfileLoading] = useState(false);

  // Password Form States
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setFullName(user.fullName || '');
      setEmail(user.email || '');
      setPhone(user.phone || '');
    }
  }, [user]);

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setProfileLoading(true);
    setProfileSuccess('');
    setProfileError('');
    try {
      const { data } = await api.put('/auth/profile', { fullName, phone });
      updateUser(data.user);
      setProfileSuccess('Profile updated successfully!');
    } catch (err) {
      setProfileError(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setProfileLoading(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setPasswordError("New passwords do not match");
      return;
    }
    if (newPassword.length < 8) {
      setPasswordError("Password must be at least 8 characters");
      return;
    }
    setPasswordLoading(true);
    setPasswordSuccess('');
    setPasswordError('');
    try {
      await api.put('/auth/password', { currentPassword, newPassword });
      setPasswordSuccess('Password updated successfully!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setPasswordError(err.response?.data?.message || 'Failed to update password');
    } finally {
      setPasswordLoading(false);
    }
  };

  return (
    <div className="glass-panel rounded-2xl p-6">
      <div className="mb-6 flex flex-wrap gap-2">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`rounded-full px-4 py-2 text-xs font-medium transition-colors ${
              tab === t ? 'bg-violet/20 text-violet' : 'text-white/50 hover:bg-white/5'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div key={tab} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
          {tab === 'Edit Profile' && (
            <form onSubmit={handleProfileSubmit} className="max-w-md space-y-4">
              <label className="block text-xs font-medium text-white/50">
                Full Name
                <input
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none focus:border-violet"
                />
              </label>
              <label className="block text-xs font-medium text-white/50">
                Email (Cannot be modified)
                <input
                  disabled
                  value={email}
                  className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/40 outline-none cursor-not-allowed"
                />
              </label>
              <label className="block text-xs font-medium text-white/50">
                Phone Number
                <input
                  type="tel"
                  placeholder="e.g., +91 98765 43210"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none focus:border-violet"
                />
              </label>

              {profileSuccess && (
                <p className="text-xs text-green-400 font-semibold">{profileSuccess}</p>
              )}
              {profileError && (
                <p className="text-xs text-red-400 font-semibold">{profileError}</p>
              )}

              <button
                type="submit"
                disabled={profileLoading}
                className="rounded-xl bg-brand-gradient px-5 py-2.5 text-sm font-semibold text-slate-deep disabled:opacity-60"
              >
                {profileLoading ? 'Saving…' : 'Save Changes'}
              </button>
            </form>
          )}

          {tab === 'Change Password' && (
            <form onSubmit={handlePasswordSubmit} className="max-w-md space-y-4">
              <div>
                <input
                  type="password"
                  required
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Current password"
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-white/40 outline-none focus:border-violet"
                />
              </div>
              <div>
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="New password (min 8 chars)"
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-white/40 outline-none focus:border-violet"
                />
              </div>
              <div>
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm new password"
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-white/40 outline-none focus:border-violet"
                />
              </div>

              {passwordSuccess && (
                <p className="text-xs text-green-400 font-semibold">{passwordSuccess}</p>
              )}
              {passwordError && (
                <p className="text-xs text-red-400 font-semibold">{passwordError}</p>
              )}

              <button
                type="submit"
                disabled={passwordLoading}
                className="rounded-xl bg-brand-gradient px-5 py-2.5 text-sm font-semibold text-slate-deep disabled:opacity-60"
              >
                {passwordLoading ? 'Updating…' : 'Update Password'}
              </button>
            </form>
          )}

          {tab === 'Payment Methods' && (
            <div className="max-w-md space-y-3">
              <div className="flex items-center justify-between rounded-xl bg-white/5 p-4">
                <div>
                  <p className="text-sm text-white">Visa •••• 4242</p>
                  <p className="text-xs text-white/40">Expires 08/28</p>
                </div>
                <button className="text-xs text-red-400 hover:underline">Remove</button>
              </div>
              <button className="rounded-xl border border-white/15 px-4 py-2.5 text-sm text-white/70 hover:bg-white/5">
                + Add Payment Method
              </button>
            </div>
          )}

          {tab === 'Notifications' && (
            <div className="max-w-md space-y-3">
              {Object.entries(notifPrefs).map(([key, val]) => (
                <label key={key} className="flex items-center justify-between rounded-xl bg-white/5 p-4">
                  <span className="text-sm capitalize text-white/80">{key} notifications</span>
                  <input
                    type="checkbox"
                    checked={val}
                    onChange={() => setNotifPrefs((p) => ({ ...p, [key]: !p[key] }))}
                    className="h-4 w-4 accent-violet"
                  />
                </label>
              ))}
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
