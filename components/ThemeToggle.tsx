import React from 'react';
import { SunIcon } from './icons/SunIcon';
import { MoonIcon } from './icons/MoonIcon';

interface ThemeToggleProps {
  theme: 'light' | 'dark';
  onToggle: () => void;
}

const ThemeToggle: React.FC<ThemeToggleProps> = ({ theme, onToggle }) => {
  return (
    <button
      onClick={onToggle}
      aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
      className="relative flex items-center w-14 h-8 rounded-full bg-slate-200 dark:bg-slate-700 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 dark:focus:ring-offset-slate-800"
    >
      <span className="sr-only">Toggle theme</span>
      {/* Icons */}
      <SunIcon className={`w-5 h-5 absolute left-1.5 text-yellow-500 transition-opacity duration-300 ${theme === 'dark' ? 'opacity-0' : 'opacity-100'}`} />
      <MoonIcon className={`w-5 h-5 absolute right-1.5 text-slate-300 transition-opacity duration-300 ${theme === 'light' ? 'opacity-0' : 'opacity-100'}`} />
      {/* Switch */}
      <span
        className={`absolute block w-6 h-6 rounded-full bg-white dark:bg-slate-900 shadow-md transform transition-transform duration-300 ease-in-out ${
          theme === 'light' ? 'translate-x-1' : 'translate-x-7'
        }`}
      />
    </button>
  );
};

export default ThemeToggle;
