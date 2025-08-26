import React, { useEffect } from 'react';
import type { QuizQuestion, UserAnswer } from '../types';

const CheckCircleIcon: React.FC<{className?: string}> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);

const XCircleIcon: React.FC<{className?: string}> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);

interface QuizScreenProps {
  question: QuizQuestion;
  onAnswerSubmit: (selectedIndex: number) => void;
  onNext: () => void;
  questionNumber: number;
  totalQuestions: number;
  userAnswer: UserAnswer | undefined;
}

const QuizScreen: React.FC<QuizScreenProps> = ({ question, onAnswerSubmit, onNext, questionNumber, totalQuestions, userAnswer }) => {
  const hasAnswered = userAnswer !== undefined;

  useEffect(() => {
    if (hasAnswered) {
      const timer = setTimeout(() => {
        onNext();
      }, 3000); // 3-second delay to read the explanation

      return () => clearTimeout(timer); // Cleanup on unmount or re-render
    }
  }, [hasAnswered, onNext]);

  const getOptionClasses = (index: number) => {
    if (!hasAnswered) {
      return "bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600";
    }
    if (index === question.correctAnswerIndex) {
      return "bg-green-700 border-green-500 !text-white";
    }
    if (index === userAnswer.selectedOptionIndex) {
      return "bg-red-700 border-red-500 !text-white";
    }
    return "bg-slate-100 dark:bg-slate-700 opacity-50";
  };
  
  if (!question) {
    return <div className="p-8 text-center min-h-[400px] flex items-center justify-center">Loading question...</div>;
  }

  return (
    <div className="p-4 sm:p-6 md:p-8 flex flex-col h-[75vh]">
        {/* Progress Bar and Counter */}
        <div className="mb-6">
            <p className="text-center text-slate-500 dark:text-slate-400 mb-2">Question {questionNumber} of {totalQuestions}</p>
            <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2.5">
                <div className="bg-cyan-500 h-2.5 rounded-full" style={{ width: `${(questionNumber / totalQuestions) * 100}%`, transition: 'width 0.5s ease-in-out' }}></div>
            </div>
        </div>
        
        {/* Question Text */}
        <div className="flex-grow">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6 text-center">{question.question}</h2>
            <div className="space-y-4 max-w-2xl mx-auto">
                {question.options.map((option, index) => (
                    <button
                        key={index}
                        onClick={() => onAnswerSubmit(index)}
                        disabled={hasAnswered}
                        className={`w-full text-left p-4 rounded-lg border-2 border-transparent transition-all duration-300 text-lg text-slate-800 dark:text-white ${getOptionClasses(index)} disabled:cursor-not-allowed`}
                    >
                        {option}
                    </button>
                ))}
            </div>
        </div>
        
        {/* Feedback Section */}
        {hasAnswered && (
            <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-700 animate-fade-in">
                <div className="max-w-3xl mx-auto bg-slate-100 dark:bg-slate-900/50 p-6 rounded-lg">
                    <div className="flex items-center mb-3">
                        {userAnswer.isCorrect ? <CheckCircleIcon className="w-8 h-8 text-green-400 mr-3" /> : <XCircleIcon className="w-8 h-8 text-red-400 mr-3" />}
                        <h3 className="text-2xl font-bold">{userAnswer.isCorrect ? "Correct!" : "Incorrect"}</h3>
                    </div>
                    <p className="text-slate-600 dark:text-slate-300 leading-relaxed">{question.explanation}</p>
                </div>
                 <style>{`@keyframes fade-in { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }`}</style>
            </div>
        )}
    </div>
  );
};

export default QuizScreen;