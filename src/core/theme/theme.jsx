import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

const THEME_KEY = 'lenovo_theme_mode';

const ThemeContext = createContext({
  mode: 'dark',
  isBlack: false,
  toggleMode: () => {},
  shellClass: '',
  panelClass: '',
  borderClass: '',
  mutedText: '',
});

export function ThemeProvider({ children }) {
  const [mode, setMode] = useState(() => {
    try {
      return localStorage.getItem(THEME_KEY) || 'dark';
    } catch {
      return 'dark';
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(THEME_KEY, mode);
    } catch {
      // noop
    }
  }, [mode]);

  const value = useMemo(() => {
    const isBlack = mode === 'black';
    return {
      mode,
      isBlack,
      toggleMode: () => setMode((prev) => (prev === 'dark' ? 'black' : 'dark')),
      shellClass: isBlack
        ? 'bg-[#000000] text-white'
        : 'bg-[radial-gradient(circle_at_top,#151515_0%,#090909_55%,#040404_100%)] text-white',
      panelClass: isBlack
        ? 'bg-white/[0.03] backdrop-blur-xl'
        : 'bg-white/[0.04] backdrop-blur-xl',
      borderClass: 'border border-white/15',
      mutedText: 'text-slate-300',
    };
  }, [mode]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useThemeMode() {
  return useContext(ThemeContext);
}
