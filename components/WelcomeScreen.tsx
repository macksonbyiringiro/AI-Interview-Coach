import React, { useState } from 'react';
import { LoadingSpinner } from './icons/LoadingSpinner';
import { Illustration } from './icons/Illustration';

interface WelcomeScreenProps {
  onStart: (topic: string) => void;
  isLoading: boolean;
}

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onStart, isLoading }) => {
  const [topic, setTopic] = useState('');
  const suggestedTopics = ["JavaScript", "World History", "General Science", "Project Management"];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (topic.trim() && !isLoading) {
      onStart(topic.trim());
    }
  };

  return (
    <div className="p-8 md:p-12">
      {isLoading ? (
        <div className="flex flex-col items-center justify-center min-h-[400px]">
          <LoadingSpinner className="w-12 h-12 text-cyan-400"/>
          <p className="mt-4 text-slate-300 text-lg">Generating your custom quiz...</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-12 items-center max-w-6xl mx-auto">
          {/* Left Column: Illustration and Features */}
          <div className="hidden md:block">
            <Illustration className="w-full h-auto rounded-lg shadow-lg" />
            <div className="mt-8 space-y-4">
                <h3 className="text-2xl font-bold text-white">Master Any Topic, Faster.</h3>
                <ul className="space-y-3 text-slate-300">
                    <li className="flex items-start">
                        <svg className="w-6 h-6 text-cyan-400 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                        <span>Practice with AI-generated quizzes tailored to any subject.</span>
                    </li>
                    <li className="flex items-start">
                        <svg className="w-6 h-6 text-cyan-400 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                        <span>Receive instant feedback and explanations for every question.</span>
                    </li>
                    <li className="flex items-start">
                        <svg className="w-6 h-6 text-cyan-400 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                        <span>Review your results to identify strengths and areas for improvement.</span>
                    </li>
                </ul>
            </div>
          </div>

          {/* Right Column: Call to Action */}
          <div className="text-center md:text-left">
            <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">Start Your Practice Quiz</h2>
            <p className="text-slate-300 mb-8 max-w-2xl mx-auto md:mx-0">
              Enter a subject or topic below. Our AI will generate a 10-question multiple-choice quiz to test your knowledge.
            </p>
            
            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g., Data Structures, Art History..."
                className="flex-grow px-4 py-3 bg-slate-700 text-white border border-slate-600 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none transition-shadow"
                aria-label="Quiz topic"
              />
              <button
                type="submit"
                disabled={!topic.trim() || isLoading}
                className="px-8 py-3 bg-cyan-500 text-white font-bold rounded-lg shadow-lg hover:bg-cyan-600 transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100"
              >
                Start
              </button>
            </form>

            <div className="mt-6">
              <p className="text-sm text-slate-400 mb-3">Or try one of these suggestions:</p>
              <div className="flex flex-wrap justify-center md:justify-start gap-2">
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
        </div>
      )}
    </div>
  );
};

export default WelcomeScreen;