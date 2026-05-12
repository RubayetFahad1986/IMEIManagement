"use client";

import { createContext, useContext, useEffect, useState } from 'react';

const themes = ['default', 'ocean', 'forest', 'sunset'];

const ThemeContext = createContext({
  theme: 'default',
  setTheme: (t: string) => {},
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState('default');

  useEffect(() => {
    const savedTheme = localStorage.getItem('erp-theme') || 'default';
    setTheme(savedTheme);
    document.documentElement.setAttribute('data-theme', savedTheme);
  }, []);

  const updateTheme = (newTheme: string) => {
    setTheme(newTheme);
    localStorage.setItem('erp-theme', newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme: updateTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
