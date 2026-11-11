import React, { createContext, useContext, useState, useEffect } from 'react';
import { ThemePreference } from '@yccify/types';
import api from '@yccify/api';

interface ThemeContextType {
  theme: ThemePreference;
  setTheme: (theme: ThemePreference) => Promise<void>;
  isDark: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<ThemePreference>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('yccify_theme') as ThemePreference;
      if (saved && ['light', 'dark', 'system'].includes(saved)) {
        return saved;
      }
    }
    return 'light';
  });

  const [isDark, setIsDark] = useState(false);

  // Apply theme class to root html element
  useEffect(() => {
    const root = document.documentElement;
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const apply = () => {
      let activeIsDark = false;
      if (theme === 'dark') {
        activeIsDark = true;
      } else if (theme === 'system') {
        activeIsDark = mediaQuery.matches;
      } else {
        activeIsDark = false;
      }

      setIsDark(activeIsDark);
      if (activeIsDark) {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
    };

    apply();

    const listener = () => {
      if (theme === 'system') apply();
    };

    mediaQuery.addEventListener('change', listener);
    return () => mediaQuery.removeEventListener('change', listener);
  }, [theme]);

  // Load preferences from backend when available
  useEffect(() => {
    api.settings
      .getPreferences()
      .then((pref) => {
        if (pref && pref.theme) {
          setThemeState(pref.theme);
          localStorage.setItem('yccify_theme', pref.theme);
        }
      })
      .catch(() => {
        // Fallback to local
      });
  }, []);

  const setTheme = async (newTheme: ThemePreference) => {
    setThemeState(newTheme);
    localStorage.setItem('yccify_theme', newTheme);
    try {
      await api.settings.updatePreferences({ theme: newTheme });
    } catch (e) {
      console.warn('Failed to save theme preference to server:', e);
    }
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme, isDark }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

