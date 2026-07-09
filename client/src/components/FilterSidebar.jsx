import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { useState } from 'react';

const STUDENT_LEVELS = ['Nursery', 'LKG', 'UKG', '1-5', '6-8', '9-10', '11-12', 'Diploma', 'UnderGrad', 'PostGrad', 'PhD', 'Competitive Exams'];
const BOARDS = ['CBSE', 'ICSE', 'IB', 'IGCSE', 'Cambridge', 'NIOS', 'JEE', 'NEET', 'GATE', 'UPSC', 'IELTS', 'TOEFL', 'GRE', 'SAT'];
const LANGUAGES = ['English', 'Urdu', 'Hindi', 'Arabic', 'French', 'Spanish'];

function FilterSection({ title, children, defaultOpen = true }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-white/10 py-4">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between text-sm font-semibold text-white/90"
      >
        {title}
        <motion.span animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }}>
          <ChevronDown size={16} className="text-white/50" />
        </motion.span>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="mt-3">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function CheckChip({ label, checked, onToggle }) {
  return (
    <motion.button
      layout
      whileTap={{ scale: 0.94 }}
      onClick={onToggle}
      className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
        checked
          ? 'border-violet bg-violet/20 text-violet'
          : 'border-white/15 text-white/60 hover:border-white/30'
      }`}
    >
      {label}
    </motion.button>
  );
}

export default function FilterSidebar({ filters, onChange }) {
  const toggleInArray = (key, value) => {
    const current = filters[key] || [];
    const next = current.includes(value) ? current.filter((v) => v !== value) : [...current, value];
    onChange({ ...filters, [key]: next });
  };

  return (
    <aside className="glass-panel h-fit w-full max-w-xs rounded-2xl p-5">
      <div className="mb-2 flex items-center justify-between">
        <h2 className="font-display text-sm font-bold text-white">Filters</h2>
        <button
          onClick={() => onChange({})}
          className="text-xs font-medium text-cyan-electric hover:underline"
        >
          Clear all
        </button>
      </div>

      <FilterSection title="Student Level">
        <div className="flex flex-wrap gap-2">
          {STUDENT_LEVELS.map((lvl) => (
            <CheckChip
              key={lvl}
              label={lvl}
              checked={(filters.studentLevel || []).includes(lvl)}
              onToggle={() => toggleInArray('studentLevel', lvl)}
            />
          ))}
        </div>
      </FilterSection>

      <FilterSection title="Board / Curriculum" defaultOpen={false}>
        <div className="flex flex-wrap gap-2">
          {BOARDS.map((b) => (
            <CheckChip
              key={b}
              label={b}
              checked={(filters.board || []).includes(b)}
              onToggle={() => toggleInArray('board', b)}
            />
          ))}
        </div>
      </FilterSection>

      <FilterSection title="Budget (per hour)">
        <div className="px-1">
          <input
            type="range"
            min={0}
            max={200}
            value={filters.maxPrice ?? 200}
            onChange={(e) => onChange({ ...filters, maxPrice: Number(e.target.value) })}
            className="w-full accent-violet"
          />
          <div className="mt-1 flex justify-between text-xs text-white/50">
            <span>$0</span>
            <span className="font-semibold text-cyan-electric">${filters.maxPrice ?? 200}</span>
          </div>
        </div>
      </FilterSection>

      <FilterSection title="Minimum Rating">
        <div className="flex gap-2">
          {[3, 4, 4.5].map((r) => (
            <CheckChip
              key={r}
              label={`${r}+ ★`}
              checked={filters.minRating === r}
              onToggle={() => onChange({ ...filters, minRating: filters.minRating === r ? null : r })}
            />
          ))}
        </div>
      </FilterSection>

      <FilterSection title="Teaching Mode">
        <div className="flex gap-2">
          {['online', 'offline', 'hybrid'].map((m) => (
            <CheckChip
              key={m}
              label={m[0].toUpperCase() + m.slice(1)}
              checked={filters.teachingMode === m}
              onToggle={() => onChange({ ...filters, teachingMode: filters.teachingMode === m ? null : m })}
            />
          ))}
        </div>
      </FilterSection>

      <FilterSection title="Languages" defaultOpen={false}>
        <div className="flex flex-wrap gap-2">
          {LANGUAGES.map((l) => (
            <CheckChip
              key={l}
              label={l}
              checked={(filters.language || []).includes(l)}
              onToggle={() => toggleInArray('language', l)}
            />
          ))}
        </div>
      </FilterSection>

      <FilterSection title="Verification" defaultOpen={false}>
        <label className="flex items-center gap-2 text-sm text-white/70">
          <input
            type="checkbox"
            checked={!!filters.idVerified}
            onChange={(e) => onChange({ ...filters, idVerified: e.target.checked })}
            className="accent-violet"
          />
          Verified ID only
        </label>
      </FilterSection>
    </aside>
  );
}
