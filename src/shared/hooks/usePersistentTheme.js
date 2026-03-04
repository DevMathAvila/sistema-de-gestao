import { useCallback, useState } from 'react';

export function usePersistentTheme(storageKey = 'theme', defaultTheme = 'dark') {
  const [theme, setTheme] = useState(localStorage.getItem(storageKey) || defaultTheme);

  const toggleTheme = useCallback(() => {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    localStorage.setItem(storageKey, next);
  }, [theme, storageKey]);

  return { theme, setTheme, toggleTheme };
}
