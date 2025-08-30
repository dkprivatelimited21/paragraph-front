import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from './AuthContext';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const { user } = useAuth();
  const [theme, setTheme] = useState({
    mode: 'light',
    accentColor: '#3B82F6'
  });

  useEffect(() => {
    if (user?.theme) {
      setTheme(user.theme);
    } else {
      // Check system preference
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setTheme(prev => ({ ...prev, mode: prefersDark ? 'dark' : 'light' }));
    }
  }, [user]);

  useEffect(() => {
    // Apply theme to document
    if (theme.mode === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }

    // Set CSS custom property for accent color
    document.documentElement.style.setProperty('--accent-color', theme.accentColor);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => ({
      ...prev,
      mode: prev.mode === 'light' ? 'dark' : 'light'
    }));
  };

  const setAccentColor = (color) => {
    setTheme(prev => ({ ...prev, accentColor: color }));
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setAccentColor }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};