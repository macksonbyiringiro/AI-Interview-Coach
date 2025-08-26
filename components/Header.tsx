
import React from 'react';
import { BotIcon } from './icons/BotIcon';

const Header: React.FC = () => {
  return (
    <header className="text-center">
        <div className="flex items-center justify-center gap-4 mb-2">
            <BotIcon className="w-12 h-12 text-cyan-400" />
            <h1 className="text-5xl font-bold bg-gradient-to-r from-cyan-500 to-blue-600 dark:from-cyan-400 dark:to-blue-500 text-transparent bg-clip-text">
            AI Interview Coach
            </h1>
        </div>
      <p className="text-slate-500 dark:text-slate-400 text-lg">Practice with AI-powered quizzes and master any topic.</p>
    </header>
  );
};

export default Header;