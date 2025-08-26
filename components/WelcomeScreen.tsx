import React, { useState } from 'react';
import { LoadingSpinner } from './icons/LoadingSpinner';
import { BotIcon } from './icons/BotIcon';
import { MicrophoneIcon } from './icons/MicrophoneIcon';

interface WelcomeScreenProps {
  onStart: (topic: string, mode: 'quiz' | 'voice') => void;
  isLoading: boolean;
}

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onStart, isLoading }) => {
  const [quizTopic, setQuizTopic] = useState('');
  const [interviewTopic, setInterviewTopic] = useState('');

  const handleQuizSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (quizTopic.trim() && !isLoading) {
      onStart(quizTopic.trim(), 'quiz');
    }
  };
  
  const handleInterviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (interviewTopic.trim() && !isLoading) {
      onStart(interviewTopic.trim(), 'voice');
    }
  };

  const suggestedTopics = ["JavaScript", "World History", "Project Management", "Biology"];

  return (
    <div className="p-8 md:p-12">
      {isLoading ? (
        <div className="flex flex-col items-center justify-center min-h-[400px]">
          <LoadingSpinner className="w-12 h-12 text-cyan-400"/>
          <p className="mt-4 text-slate-300 text-lg">Generating your session...</p>
        </div>
      ) : (
        <div className="max-w-5xl mx-auto">
            <div className="text-center mb-12">
                <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">Choose Your Practice Mode</h2>
                <p className="text-slate-300 max-w-2xl mx-auto">
                    Select how you want to prepare. Take a quick multiple-choice quiz or practice your verbal answers in a simulated voice interview.
                </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
                {/* Quiz Card */}
                <div className="bg-slate-800/50 p-8 rounded-xl border border-slate-700 flex flex-col hover:border-cyan-500/50 transition-all">
                    <div className="flex-grow">
                        <BotIcon className="w-10 h-10 text-cyan-400 mb-4"/>
                        <h3 className="text-2xl font-bold text-white mb-2">Multiple-Choice Quiz</h3>
                        <p className="text-slate-400 mb-6">
                            Test your knowledge with a 10-question quiz on any topic. Get instant feedback and explanations.
                        </p>
                    </div>
                    <form onSubmit={handleQuizSubmit} className="flex flex-col gap-3">
                        <input
                            type="text"
                            value={quizTopic}
                            onChange={(e) => setQuizTopic(e.target.value)}
                            placeholder="e.g., Data Structures..."
                            className="w-full px-4 py-3 bg-slate-700 text-white border border-slate-600 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none transition-shadow"
                            aria-label="Quiz topic"
                        />
                        <button
                            type="submit"
                            disabled={!quizTopic.trim() || isLoading}
                            className="w-full px-8 py-3 bg-cyan-500 text-white font-bold rounded-lg shadow-lg hover:bg-cyan-600 transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100"
                        >
                            Start Quiz
                        </button>
                    </form>
                </div>
                
                {/* Voice Interview Card */}
                <div className="bg-slate-800/50 p-8 rounded-xl border border-slate-700 flex flex-col hover:border-cyan-500/50 transition-all">
                    <div className="flex-grow">
                        <MicrophoneIcon className="w-10 h-10 text-cyan-400 mb-4"/>
                        <h3 className="text-2xl font-bold text-white mb-2">Voice Interview</h3>
                        <p className="text-slate-400 mb-6">
                            Practice your verbal responses to 5 open-ended questions. Get AI feedback on your answers.
                        </p>
                    </div>
                     <form onSubmit={handleInterviewSubmit} className="flex flex-col gap-3">
                        <input
                            type="text"
                            value={interviewTopic}
                            onChange={(e) => setInterviewTopic(e.target.value)}
                            placeholder="e.g., Art History..."
                            className="w-full px-4 py-3 bg-slate-700 text-white border border-slate-600 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none transition-shadow"
                            aria-label="Interview topic"
                        />
                        <button
                            type="submit"
                            disabled={!interviewTopic.trim() || isLoading}
                            className="w-full px-8 py-3 bg-cyan-500 text-white font-bold rounded-lg shadow-lg hover:bg-cyan-600 transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100"
                        >
                            Start Interview
                        </button>
                    </form>
                </div>
            </div>

            <div className="mt-10 text-center">
              <p className="text-sm text-slate-400 mb-3">Or try one of these suggestions:</p>
              <div className="flex flex-wrap justify-center gap-2">
                {suggestedTopics.map((suggestedTopic) => (
                  <button
                    key={suggestedTopic}
                    onClick={() => { setQuizTopic(suggestedTopic); setInterviewTopic(suggestedTopic); }}
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