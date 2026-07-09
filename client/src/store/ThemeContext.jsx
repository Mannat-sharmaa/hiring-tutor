import { createContext, useContext, useState, useEffect } from 'react';

// ─── Preset Themes — more visibly distinct backgrounds ───────────────────────
export const THEMES = {
  midnight: {
    name: 'Midnight Dark',
    emoji: '🌙',
    description: 'Classic deep space dark mode',
    bg: '#0F0F1A',
    primary: '#6C63FF',
    secondary: '#00F2FE',
    gradient: 'linear-gradient(135deg, #6C63FF 0%, #00F2FE 100%)',
    orb1: 'rgba(108,99,255,0.25)',
    orb2: 'rgba(0,242,254,0.18)',
    orb3: 'rgba(255,100,130,0.12)',
  },
  cyberpunk: {
    name: 'Cyberpunk',
    emoji: '⚡',
    description: 'Neon green electric future',
    bg: '#050505',
    primary: '#39FF14',
    secondary: '#FF006E',
    gradient: 'linear-gradient(135deg, #39FF14 0%, #FF006E 100%)',
    orb1: 'rgba(57,255,20,0.25)',
    orb2: 'rgba(255,0,110,0.18)',
    orb3: 'rgba(0,200,255,0.12)',
  },
  sunset: {
    name: 'Sunset Glow',
    emoji: '🌅',
    description: 'Warm amber and rose tones',
    bg: '#1A0800',
    primary: '#FF6B35',
    secondary: '#FFD700',
    gradient: 'linear-gradient(135deg, #FF6B35 0%, #FFD700 100%)',
    orb1: 'rgba(255,107,53,0.28)',
    orb2: 'rgba(255,215,0,0.18)',
    orb3: 'rgba(255,69,0,0.14)',
  },
  ocean: {
    name: 'Ocean Deep',
    emoji: '🌊',
    description: 'Cool blue-teal underwater vibes',
    bg: '#020B18',
    primary: '#0080FF',
    secondary: '#00FFD1',
    gradient: 'linear-gradient(135deg, #0080FF 0%, #00FFD1 100%)',
    orb1: 'rgba(0,128,255,0.25)',
    orb2: 'rgba(0,255,209,0.18)',
    orb3: 'rgba(0,50,200,0.12)',
  },
  aurora: {
    name: 'Aurora Borealis',
    emoji: '🌌',
    description: 'Green and purple northern lights',
    bg: '#030A0F',
    primary: '#00C896',
    secondary: '#A855F7',
    gradient: 'linear-gradient(135deg, #00C896 0%, #A855F7 100%)',
    orb1: 'rgba(0,200,150,0.25)',
    orb2: 'rgba(168,85,247,0.18)',
    orb3: 'rgba(0,180,200,0.12)',
  },
  royal: {
    name: 'Royal Purple',
    emoji: '👑',
    description: 'Deep purple velvet luxury',
    bg: '#0D0018',
    primary: '#BF5FFF',
    secondary: '#FF8C00',
    gradient: 'linear-gradient(135deg, #BF5FFF 0%, #FF8C00 100%)',
    orb1: 'rgba(191,95,255,0.25)',
    orb2: 'rgba(255,140,0,0.18)',
    orb3: 'rgba(100,0,200,0.12)',
  },
};

// ─── Apply theme colors to CSS variables ────────────────────────────────────
function applyThemeVars(t) {
  const root = document.documentElement;
  root.style.setProperty('--color-bg', t.bg);
  root.style.setProperty('--color-primary', t.primary);
  root.style.setProperty('--color-secondary', t.secondary);
  root.style.setProperty('--gradient-brand', t.gradient);
  root.style.setProperty('--orb-color-1', t.orb1 || 'rgba(108,99,255,0.25)');
  root.style.setProperty('--orb-color-2', t.orb2 || 'rgba(0,242,254,0.18)');
  root.style.setProperty('--orb-color-3', t.orb3 || 'rgba(255,100,130,0.12)');
}

// ─── Apply saved theme BEFORE React first paint (no flash) ──────────────────
(function applyInitialTheme() {
  try {
    // Check for custom theme first
    const customRaw = localStorage.getItem('ec_custom_theme');
    if (customRaw) {
      const custom = JSON.parse(customRaw);
      applyThemeVars(custom);
      document.body.style.backgroundColor = custom.bg;
      return;
    }
    const saved = localStorage.getItem('ec_theme') || 'midnight';
    const t = THEMES[saved] || THEMES.midnight;
    applyThemeVars(t);
    document.body.style.backgroundColor = t.bg;
  } catch (_) {}
})();

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  const [themeKey, setThemeKey] = useState(() => localStorage.getItem('ec_theme') || 'midnight');
  // customTheme overrides preset — null means use preset
  const [customTheme, setCustomThemeState] = useState(() => {
    try {
      const raw = localStorage.getItem('ec_custom_theme');
      return raw ? JSON.parse(raw) : null;
    } catch { return null; }
  });

  const baseTheme = THEMES[themeKey] || THEMES.midnight;

  // Merge custom colors on top of preset
  const theme = customTheme
    ? {
        ...baseTheme,
        bg: customTheme.bg,
        primary: customTheme.primary,
        secondary: customTheme.secondary,
        gradient: `linear-gradient(135deg, ${customTheme.primary} 0%, ${customTheme.secondary} 100%)`,
        orb1: `${customTheme.primary}40`,
        orb2: `${customTheme.secondary}30`,
        orb3: `${customTheme.primary}20`,
      }
    : baseTheme;

  // Apply to DOM whenever theme changes
  useEffect(() => {
    localStorage.setItem('ec_theme', themeKey);
    applyThemeVars(theme);
    document.body.style.backgroundColor = theme.bg;
  }, [themeKey, theme.bg, theme.primary, theme.secondary, theme.gradient]);

  const setCustomTheme = (colors) => {
    if (!colors) {
      localStorage.removeItem('ec_custom_theme');
      setCustomThemeState(null);
    } else {
      localStorage.setItem('ec_custom_theme', JSON.stringify(colors));
      setCustomThemeState(colors);
    }
  };

  return (
    <ThemeContext.Provider value={{ themeKey, setThemeKey, theme, themes: THEMES, customTheme, setCustomTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
