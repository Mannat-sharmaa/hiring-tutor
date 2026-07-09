import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

// Flattens the filters object into a list of removable pills. Each pill
// knows how to remove just itself, so clicking the X updates only that
// one filter and lets the results grid reflow around it.
function flattenFilters(filters) {
  const chips = [];
  const arrayKeys = ['studentLevel', 'board', 'language'];

  arrayKeys.forEach((key) => {
    (filters[key] || []).forEach((value) => {
      chips.push({ id: `${key}:${value}`, label: value, key, value, isArray: true });
    });
  });

  if (filters.minRating) {
    chips.push({ id: 'minRating', label: `${filters.minRating}+ ★`, key: 'minRating', isArray: false });
  }
  if (filters.teachingMode) {
    chips.push({ id: 'teachingMode', label: filters.teachingMode, key: 'teachingMode', isArray: false });
  }
  if (filters.maxPrice && filters.maxPrice < 200) {
    chips.push({ id: 'maxPrice', label: `Under $${filters.maxPrice}/hr`, key: 'maxPrice', isArray: false });
  }
  if (filters.idVerified) {
    chips.push({ id: 'idVerified', label: 'Verified ID', key: 'idVerified', isArray: false });
  }

  return chips;
}

export default function FilterChips({ filters, onChange }) {
  const chips = flattenFilters(filters);
  if (chips.length === 0) return null;

  const removeChip = (chip) => {
    if (chip.isArray) {
      onChange({ ...filters, [chip.key]: filters[chip.key].filter((v) => v !== chip.value) });
    } else {
      const next = { ...filters };
      delete next[chip.key];
      onChange(next);
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      <AnimatePresence initial={false}>
        {chips.map((chip) => (
          <motion.button
            key={chip.id}
            layout
            initial={{ opacity: 0, scale: 0.8, y: -6 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            onClick={() => removeChip(chip)}
            className="flex items-center gap-1.5 rounded-full bg-violet/15 px-3 py-1.5 text-xs font-medium text-violet"
          >
            {chip.label}
            <X size={12} />
          </motion.button>
        ))}
      </AnimatePresence>
    </div>
  );
}
