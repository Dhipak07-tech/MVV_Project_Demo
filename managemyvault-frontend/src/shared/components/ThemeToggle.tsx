import { Sun, Moon } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function ThemeToggle() {
  const [isDark, setIsDark] = useState(() => {
    // Check initial preference from localStorage or html element
    const localTheme = localStorage.getItem('theme');
    if (localTheme) {
      return localTheme === 'dark';
    }
    // Default to dark mode if no saved preference
    return true;
  });

  useEffect(() => {
    const root = window.document.documentElement;
    if (isDark) {
      root.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDark]);

  return (
    <button
      onClick={() => setIsDark(!isDark)}
      className="p-2 rounded-lg hover:bg-vault-elevated text-text-secondary hover:text-text-primary transition-colors focus:outline-none"
      aria-label="Toggle theme"
      id="theme-toggle-btn"
    >
      {isDark ? (
        <Sun className="w-5 h-5 text-amber-400" />
      ) : (
        <Moon className="w-5 h-5 text-slate-700 dark:text-slate-300" />
      )}
    </button>
  );
}
