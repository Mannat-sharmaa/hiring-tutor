import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Palette, Check, Sparkles, Sliders, RotateCcw, Eye } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import BackgroundOrbs from '../components/BackgroundOrbs';
import { useTheme, THEMES } from '../store/ThemeContext';

// ─── Preset theme color dots ──────────────────────────────────────────────────
const THEME_PREVIEWS = {
  midnight:  { dots: ['#6C63FF', '#00F2FE', '#FF6B82'] },
  cyberpunk: { dots: ['#39FF14', '#FF006E', '#00C8FF'] },
  sunset:    { dots: ['#FF6B35', '#FFD700', '#FF1744'] },
  ocean:     { dots: ['#0080FF', '#00FFD1', '#0040A0'] },
  aurora:    { dots: ['#00C896', '#A855F7', '#00B4C8'] },
  royal:     { dots: ['#BF5FFF', '#FF8C00', '#7B00D4'] },
};

// ─── Small color swatch input ─────────────────────────────────────────────────
function ColorField({ label, value, onChange }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-medium text-white/60">{label}</label>
      <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2">
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="h-7 w-7 cursor-pointer rounded-md border-0 bg-transparent p-0 outline-none"
          style={{ appearance: 'none' }}
        />
        <span className="font-mono text-xs text-white/70">{value.toUpperCase()}</span>
      </div>
    </div>
  );
}

export default function ThemeCustomizerPage() {
  const { themeKey, setThemeKey, theme, setCustomTheme } = useTheme();
  const [tab, setTab] = useState('presets'); // 'presets' | 'custom'

  // Custom color state — starts from current theme
  const [customBg, setCustomBg] = useState(theme.bg);
  const [customPrimary, setCustomPrimary] = useState(theme.primary);
  const [customSecondary, setCustomSecondary] = useState(theme.secondary);

  const applyCustom = () => {
    setCustomTheme({
      bg: customBg,
      primary: customPrimary,
      secondary: customSecondary,
    });
  };

  const resetCustom = () => {
    const t = THEMES[themeKey] || THEMES.midnight;
    setCustomBg(t.bg);
    setCustomPrimary(t.primary);
    setCustomSecondary(t.secondary);
    setCustomTheme(null); // revert to preset
  };

  return (
    <div className="relative min-h-screen overflow-hidden">
      <BackgroundOrbs />
      <Navbar />

      <div className="mx-auto max-w-4xl px-6 pb-20 pt-10">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-10 text-center">
          <div
            className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl shadow-glow"
            style={{ background: theme.gradient }}
          >
            <Palette size={32} className="text-white" />
          </div>
          <h1 className="font-display text-3xl font-extrabold text-white">
            Theme <span style={{ background: theme.gradient, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Customizer</span>
          </h1>
          <p className="mt-2 text-white/50">Choose a preset or build your own — entire platform adapts instantly.</p>
        </motion.div>

        {/* Live Preview Bar */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 }}
          className="mb-8 overflow-hidden rounded-2xl glass-panel"
        >
          <div className="h-2 w-full" style={{ background: theme.gradient }} />
          <div className="flex items-center gap-4 p-5">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-xl" style={{ background: theme.gradient }}>
              {THEMES[themeKey]?.emoji || '🎨'}
            </div>
            <div className="flex-1">
              <p className="font-display text-sm font-bold text-white">
                {THEMES[themeKey]?.name || 'Custom'}
              </p>
              <p className="text-xs text-white/50">{THEMES[themeKey]?.description || 'Your custom colors'}</p>
            </div>
            <div className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium" style={{ background: `${theme.primary}25`, color: theme.primary }}>
              <Sparkles size={11} /> Active
            </div>
          </div>
          {/* Color palette strip */}
          <div className="flex gap-0 overflow-hidden rounded-b-2xl">
            <div className="h-6 flex-1" style={{ backgroundColor: theme.bg }} />
            <div className="h-6 flex-1" style={{ backgroundColor: theme.primary }} />
            <div className="h-6 flex-1" style={{ backgroundColor: theme.secondary }} />
            <div className="h-6 flex-1" style={{ background: theme.gradient }} />
          </div>
        </motion.div>

        {/* Tab switcher */}
        <div className="mb-7 flex gap-1 rounded-xl glass-panel p-1 w-fit">
          {[
            { key: 'presets', label: 'Preset Themes', icon: Palette },
            { key: 'custom', label: 'Custom Colors', icon: Sliders },
          ].map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all ${
                tab === key
                  ? 'text-slate-deep'
                  : 'text-white/50 hover:text-white'
              }`}
              style={tab === key ? { background: theme.gradient } : {}}
            >
              <Icon size={15} /> {label}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {/* ── PRESET THEMES ──────────────────────────────── */}
          {tab === 'presets' && (
            <motion.div
              key="presets"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
            >
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {Object.entries(THEMES).map(([key, t], i) => {
                  const isActive = themeKey === key;
                  const previews = THEME_PREVIEWS[key];
                  return (
                    <motion.button
                      key={key}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.07, type: 'spring', stiffness: 130 }}
                      whileHover={{ y: -4, scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => {
                        setThemeKey(key);
                        // Sync custom sliders to match preset
                        setCustomBg(t.bg);
                        setCustomPrimary(t.primary);
                        setCustomSecondary(t.secondary);
                        if (typeof setCustomTheme === 'function') setCustomTheme(null);
                      }}
                      className="relative overflow-hidden rounded-2xl border-2 p-5 text-left transition-all"
                      style={{
                        borderColor: isActive ? t.primary : 'rgba(255,255,255,0.1)',
                        background: isActive ? `${t.bg}` : 'rgba(255,255,255,0.04)',
                        boxShadow: isActive ? `0 0 30px ${t.primary}40` : 'none',
                      }}
                    >
                      {/* Gradient bar */}
                      <div className="mb-4 h-1.5 rounded-full" style={{ background: t.gradient }} />

                      <div className="mb-3 flex items-center justify-between">
                        <span className="text-2xl">{t.emoji}</span>
                        {isActive && (
                          <motion.div
                            initial={{ scale: 0 }} animate={{ scale: 1 }}
                            className="flex h-6 w-6 items-center justify-center rounded-full"
                            style={{ background: t.gradient }}
                          >
                            <Check size={13} className="text-white" />
                          </motion.div>
                        )}
                      </div>

                      <p className="font-display font-bold text-white">{t.name}</p>
                      <p className="mb-4 mt-0.5 text-xs text-white/50">{t.description}</p>

                      {/* Color dots */}
                      <div className="flex gap-2">
                        {(previews?.dots || []).map((c, di) => (
                          <div key={di} className="h-5 w-5 rounded-full shadow" style={{ backgroundColor: c }} />
                        ))}
                      </div>

                      {/* Background swatch */}
                      <div className="mt-3 flex items-center gap-2">
                        <div className="h-4 w-4 rounded border border-white/20" style={{ backgroundColor: t.bg }} />
                        <span className="font-mono text-[10px] text-white/40">{t.bg}</span>
                      </div>
                    </motion.button>
                  );
                })}
              </div>
            </motion.div>
          )}

          {/* ── CUSTOM COLORS ──────────────────────────────── */}
          {tab === 'custom' && (
            <motion.div
              key="custom"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="glass-panel rounded-3xl p-7"
            >
              <h2 className="mb-1 font-display text-lg font-bold text-white">Pick Your Own Colors</h2>
              <p className="mb-7 text-xs text-white/50">
                Set your own background, primary accent, and secondary accent. Instantly previewed.
              </p>

              <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
                <ColorField label="🖼️ Background Color" value={customBg} onChange={(v) => { setCustomBg(v); }} />
                <ColorField label="🎨 Primary Accent" value={customPrimary} onChange={(v) => { setCustomPrimary(v); }} />
                <ColorField label="✨ Secondary Accent" value={customSecondary} onChange={(v) => { setCustomSecondary(v); }} />
              </div>

              {/* Live preview strip */}
              <div className="mt-6 overflow-hidden rounded-xl">
                <div
                  className="flex items-center justify-between p-4"
                  style={{ backgroundColor: customBg, border: `1px solid ${customPrimary}40` }}
                >
                  <div>
                    <p className="text-sm font-bold text-white">Preview</p>
                    <p className="text-xs" style={{ color: customSecondary }}>Secondary color text</p>
                  </div>
                  <div className="flex gap-2">
                    <div className="h-8 w-20 rounded-lg" style={{ background: `linear-gradient(135deg, ${customPrimary}, ${customSecondary})` }} />
                    <div className="h-8 w-8 rounded-lg border" style={{ backgroundColor: customPrimary, borderColor: customPrimary }} />
                    <div className="h-8 w-8 rounded-lg border" style={{ backgroundColor: customSecondary, borderColor: customSecondary }} />
                  </div>
                </div>
              </div>

              {/* Gradient bar preview */}
              <div className="mt-3 h-3 rounded-full" style={{ background: `linear-gradient(135deg, ${customPrimary}, ${customSecondary})` }} />

              <div className="mt-7 flex flex-wrap gap-3">
                <motion.button
                  whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                  onClick={applyCustom}
                  className="flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold text-white shadow-lg"
                  style={{ background: `linear-gradient(135deg, ${customPrimary}, ${customSecondary})` }}
                >
                  <Eye size={16} /> Apply Custom Theme
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                  onClick={resetCustom}
                  className="flex items-center gap-2 rounded-xl border border-white/15 px-6 py-3 text-sm font-medium text-white/70 hover:bg-white/5"
                >
                  <RotateCcw size={15} /> Reset to Preset
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
          className="mt-10 rounded-2xl glass-panel p-5 text-center"
        >
          <p className="text-sm text-white/50">
            🎨 Theme changes apply instantly across all pages and are saved automatically in your browser.
          </p>
        </motion.div>
      </div>
      <Footer />
    </div>
  );
}
