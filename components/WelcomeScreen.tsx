import React, { useState } from 'react';
import { LoadingSpinner } from './icons/LoadingSpinner';

interface WelcomeScreenProps {
  onStart: (topic: string) => void;
  isLoading: boolean;
}

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onStart, isLoading }) => {
  const [topic, setTopic] = useState('');
  const suggestedTopics = ["Software Engineer", "Product Manager", "UX Designer", "General Behavioral"];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (topic.trim() && !isLoading) {
      onStart(topic.trim());
    }
  };

  return (
    <div className="p-8 md:p-12 text-center">
      <h2 className="text-3xl font-bold text-white mb-4">Welcome to Your Interview Practice Session</h2>
      <p className="text-slate-300 mb-8 max-w-2xl mx-auto">
        Enter a job title or interview topic below. Our AI coach will ask you relevant questions and provide instant feedback.
      </p>
      {isLoading ? (
        <div className="flex flex-col items-center justify-center h-48">
          <LoadingSpinner className="w-12 h-12 text-cyan-400"/>
          <p className="mt-4 text-slate-300">Initializing your session...</p>
        </div>
      ) : (
        <div className="max-w-xl mx-auto">
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g., Data Scientist, Marketing Manager..."
              className="flex-grow px-4 py-3 bg-slate-700 text-white border border-slate-600 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none transition-shadow"
              aria-label="Interview topic"
            />
            <button
              type="submit"
              disabled={!topic.trim() || isLoading}
              className="px-8 py-3 bg-cyan-500 text-white font-bold rounded-lg shadow-lg hover:bg-cyan-600 transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100"
            >
              Start
            </button>
          </form>
          <div className="mt-6 text-center">
            <p className="text-sm text-slate-400 mb-3">Or try one of these suggestions:</p>
            <div className="flex flex-wrap justify-center gap-2">
              {suggestedTopics.map((suggestedTopic) => (
                <button
                  key={suggestedTopic}
                  onClick={() => setTopic(suggestedTopic)}
                  className="px-4 py-1 bg-slate-700 text-slate-200 rounded-full text-sm hover:bg-slate-600 transition-colors"
                >
                  {suggestedTopic}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WelcomeScreen;