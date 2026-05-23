import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type Theme = 'dark' | 'light';

interface ThemeContextValue {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (t: Theme) => void;
  isTelegram: boolean;
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: 'dark',
  toggleTheme: () => {},
  setTheme: () => {},
  isTelegram: false,
});

export const useTheme = () => useContext(ThemeContext);

const getTgTheme = (): Theme | null => {
  try {
    const tg = (window as any).Telegram?.WebApp;
    if (tg?.colorScheme) {
      return tg.colorScheme === 'dark' ? 'dark' : 'light';
    }
  } catch (e) {}
  return null;
};

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const isTelegram = typeof window !== 'undefined' && !!(window as any).Telegram?.WebApp;

  const [theme, setThemeState] = useState<Theme>(() => {
    // TG Mini App: respect native theme first
    const tgTheme = getTgTheme();
    if (tgTheme) return tgTheme;
    return (localStorage.getItem('edoska-theme') as Theme) || 'dark';
  });

  useEffect(() => {
    // Listen for Telegram theme changes
    if (isTelegram) {
      try {
        const tg = (window as any).Telegram.WebApp;
        tg.onEvent('themeChanged', () => {
          const tgTheme = getTgTheme();
          if (tgTheme) setThemeState(tgTheme);
        });
      } catch (e) {}
    }
  }, [isTelegram]);

  useEffect(() => {
    localStorage.setItem('edoska-theme', theme);
    document.documentElement.classList.toggle('dark', theme === 'dark');
    document.documentElement.classList.toggle('light', theme === 'light');
    document.querySelector('meta[name="theme-color"]')?.setAttribute(
      'content',
      theme === 'dark' ? '#0f172a' : '#f8fafc'
    );
  }, [theme]);

  const toggleTheme = () => setThemeState((t) => (t === 'dark' ? 'light' : 'dark'));
  const setTheme = (t: Theme) => setThemeState(t);

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme, isTelegram }}>
      {children}
    </ThemeContext.Provider>
  );
};
