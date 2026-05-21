'use client';

import { createContext, useContext, useEffect, useMemo, useState } from 'react';

const ThemeContext = createContext({
  theme: 'light',
  resolvedTheme: 'light',
  setTheme: () => {},
});

const STORAGE_KEY = 'theme';

function getSystemTheme() {
  if (typeof window === 'undefined') return 'light';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export function ThemeProvider({
  children,
  defaultTheme = 'light',
  enableSystem = true,
  forcedTheme,
  attribute = 'class',
}) {
  const [theme, setThemeState] = useState(forcedTheme || defaultTheme);
  const [systemTheme, setSystemTheme] = useState('light');

  useEffect(() => {
    setSystemTheme(getSystemTheme());
  }, []);

  useEffect(() => {
    if (forcedTheme) {
      setThemeState(forcedTheme);
      return;
    }

    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (stored === 'light' || stored === 'dark' || (enableSystem && stored === 'system')) {
        setThemeState(stored);
      }
    } catch {
      setThemeState(defaultTheme);
    }
  }, [defaultTheme, enableSystem, forcedTheme]);

  useEffect(() => {
    if (typeof window === 'undefined' || !enableSystem) return;

    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const onChange = () => setSystemTheme(media.matches ? 'dark' : 'light');

    onChange();
    media.addEventListener('change', onChange);
    return () => media.removeEventListener('change', onChange);
  }, [enableSystem]);

  const resolvedTheme =
    forcedTheme || (theme === 'system' && enableSystem ? systemTheme : theme);

  useEffect(() => {
    if (typeof document === 'undefined') return;

    const root = document.documentElement;
    const finalTheme = resolvedTheme === 'dark' ? 'dark' : 'light';

    if (attribute === 'class') {
      root.classList.remove('light', 'dark');
      root.classList.add(finalTheme);
    } else {
      root.setAttribute(attribute, finalTheme);
    }

    root.style.colorScheme = finalTheme;
  }, [attribute, resolvedTheme]);

  const setTheme = (nextTheme) => {
    const value = nextTheme || defaultTheme;
    if (forcedTheme) return;

    setThemeState(value);
    try {
      window.localStorage.setItem(STORAGE_KEY, value);
    } catch {}
  };

  const value = useMemo(
    () => ({ theme, resolvedTheme, setTheme }),
    [theme, resolvedTheme]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  return useContext(ThemeContext);
}
