import React from 'react';
import { LANGUAGES, LanguageCode } from '../types';
import ThemeToggle from './ThemeToggle';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: LanguageCode;
  onLanguageChange: (language: LanguageCode) => void;
  theme: 'light' | 'dark';
  onThemeChange: (theme: 'light' | 'dark') => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, language, onLanguageChange, theme, onThemeChange }) => {
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 transition-opacity duration-300"
      onClick={onClose}
    >
      <div 
        className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl p-8 border border-slate-200 dark:border-slate-700 w-full max-w-md transform transition-all duration-300 scale-95 opacity-0 animate-scale-in"
        onClick={(e) => e.stopPropagation()}
        style={{animation: 'scale-in 0.2s ease-out forwards'}}
      >
        <style>
          {`
            @keyframes scale-in {
              from {
                transform: scale(0.95);
                opacity: 0;
              }
              to {
                transform: scale(1);
                opacity: 1;
              }
            }
          `}
        </style>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">Settings</h2>
        
        <div className="mb-6">
          <label htmlFor="language-select" className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-2">
            Interview Language
          </label>
          <select
            id="language-select"
            value={language}
            onChange={(e) => onLanguageChange(e.target.value as LanguageCode)}
            className="w-full px-4 py-2 bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-white border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
          >
            {Object.entries(LANGUAGES).map(([code, name]) => (
              <option key={code} value={code}>{name}</option>
            ))}
          </select>
        </div>

        <div className="mb-8">
            <div className="flex items-center justify-between">
              <label className="block text-sm font-medium text-slate-600 dark:text-slate-300">
                Appearance
              </label>
              <ThemeToggle theme={theme} onToggle={() => onThemeChange(theme === 'light' ? 'dark' : 'light')} />
            </div>
        </div>

        <div className="text-right">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-cyan-500 text-white font-semibold rounded-lg hover:bg-cyan-600 transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;