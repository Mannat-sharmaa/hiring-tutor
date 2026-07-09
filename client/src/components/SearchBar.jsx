import { useState } from 'react';
import { motion } from 'framer-motion';
import { Search } from 'lucide-react';

export default function SearchBar({ value, onChange, onSubmit }) {
  const [focused, setFocused] = useState(false);

  return (
    <motion.form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit?.(value);
      }}
      animate={{ scale: focused ? 1.02 : 1 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      className={`glass-panel flex w-full items-center gap-3 rounded-full px-5 py-3 transition-shadow ${
        focused ? 'shadow-glow-cyan' : ''
      }`}
    >
      <Search size={18} className="text-white/50" />
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        placeholder="Search by subject, tutor name, or skill…"
        className="w-full bg-transparent text-sm text-white placeholder-white/40 outline-none"
      />
      <button
        type="submit"
        className="hidden rounded-full bg-brand-gradient px-4 py-1.5 text-xs font-semibold text-slate-deep sm:block"
      >
        Search
      </button>
    </motion.form>
  );
}
