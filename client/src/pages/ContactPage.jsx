import { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Phone, MapPin, Send, CheckCircle2 } from 'lucide-react';
import StaticPageLayout from '../components/StaticPageLayout';

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [sent, setSent] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    // Wire to POST /api/contact once that endpoint exists on the backend.
    setSent(true);
  };

  return (
    <StaticPageLayout title="Contact Us" subtitle="Questions, feedback, or partnership ideas — we'd love to hear from you.">
      <div className="grid grid-cols-1 gap-8 sm:grid-cols-2">
        <div>
          {sent ? (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="glass-panel rounded-2xl p-6 text-center">
              <CheckCircle2 size={32} className="mx-auto text-cyan-electric" />
              <p className="mt-3 font-display font-semibold text-white">Message sent!</p>
              <p className="mt-1 text-xs text-white/50">We'll get back to you within 1–2 business days.</p>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-3">
              <input
                required
                placeholder="Your name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
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
              <input
                required
                placeholder="Subject"
                value={form.subject}
                onChange={(e) => setForm({ ...form, subject: e.target.value })}
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-white/40 outline-none focus:border-violet"
              />
              <textarea
                required
                rows={4}
                placeholder="Your message"
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-white/40 outline-none focus:border-violet"
              />
              <button type="submit" className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand-gradient py-3 text-sm font-semibold text-slate-deep">
                <Send size={14} /> Send Message
              </button>
            </form>
          )}
        </div>

        <div className="space-y-4">
          <div className="glass-panel flex items-center gap-3 rounded-xl p-4">
            <Mail size={18} className="text-violet" />
            <div>
              <p className="text-xs text-white/40">Email</p>
              <p className="text-sm text-white">support@educonnect.com</p>
            </div>
          </div>
          <div className="glass-panel flex items-center gap-3 rounded-xl p-4">
            <Phone size={18} className="text-violet" />
            <div>
              <p className="text-xs text-white/40">Phone</p>
              <p className="text-sm text-white">+1 (555) 010-2020</p>
            </div>
          </div>
          <div className="glass-panel flex items-center gap-3 rounded-xl p-4">
            <MapPin size={18} className="text-violet" />
            <div>
              <p className="text-xs text-white/40">Office</p>
              <p className="text-sm text-white">San Francisco, CA</p>
            </div>
          </div>
        </div>
      </div>
    </StaticPageLayout>
  );
}
