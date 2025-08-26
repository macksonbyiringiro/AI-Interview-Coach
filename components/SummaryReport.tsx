import React from 'react';
import type { QuizSummary, UserAnswer, QuizQuestion } from '../types';
import { LoadingSpinner } from './icons/LoadingSpinner';

interface SummaryReportProps {
  summary: QuizSummary | null;
  isLoading: boolean;
  onRestart: () => void;
}

const ScoreCircle: React.FC<{ score: number }> = ({ score }) => {
    const circumference = 2 * Math.PI * 54; // 2 * pi * radius
    const scaledScore = (score / 10) * 10; // score is already out of 10 for this component
    const offset = circumference - (scaledScore / 10) * circumference;
  
    return (
      <div className="relative w-40 h-40">
        <svg className="w-full h-full" viewBox="0 0 120 120">
          <circle
            className="text-slate-700"
            strokeWidth="12"
            stroke="currentColor"
            fill="transparent"
            r="54"
            cx="60"
            cy="60"
          />
          <circle
            className="text-cyan-400"
            strokeWidth="12"
            stroke="currentColor"
            fill="transparent"
            r="54"
            cx="60"
            cy="60"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            style={{ transition: 'stroke-dashoffset 0.8s ease-out' }}
            transform="rotate(-90 60 60)"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-4xl font-bold text-white">{score.toFixed(1)}</span>
          <span className="text-sm text-slate-400">/ 10</span>
        </div>
      </div>
    );
  };

const IncorrectAnswer: React.FC<{ result: UserAnswer; question: QuizQuestion }> = ({ result, question }) => (
    <div className="bg-slate-700/50 p-6 rounded-lg">
        <p className="font-semibold text-slate-300 mb-3">{result.questionIndex + 1}. {question.question}</p>
        <p className="text-red-400 mb-1"><span className="font-medium">Your answer:</span> {question.options[result.selectedOptionIndex]}</p>
        <p className="text-green-400 mb-3"><span className="font-medium">Correct answer:</span> {question.options[question.correctAnswerIndex]}</p>
        <p className="text-slate-400 border-t border-slate-600 pt-3 mt-3"><span className="font-medium">Explanation:</span> {question.explanation}</p>
    </div>
);

const SummaryReport: React.FC<SummaryReportProps> = ({ summary, isLoading, onRestart }) => {
  if (isLoading) {
    return (
      <div className="p-8 md:p-12 flex flex-col items-center justify-center min-h-[400px]">
        <LoadingSpinner className="w-12 h-12 text-cyan-400" />
        <p className="mt-4 text-slate-300 text-lg">Generating your report...</p>
      </div>
    );
  }

  if (!summary) {
    return (
      <div className="p-8 md:p-12 text-center">
        <h2 className="text-2xl font-bold text-red-400">Error</h2>
        <p className="text-slate-300 mt-2">Could not generate your summary report.</p>
        <button
          onClick={onRestart}
          className="mt-6 px-6 py-3 bg-cyan-500 text-white font-semibold rounded-lg hover:bg-cyan-600 transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  const incorrectAnswers = summary.results.filter(r => !r.isCorrect);
  const scoreOutOf10 = (summary.score / summary.totalQuestions) * 10;

  return (
    <div className="p-8 md:p-12">
      <h2 className="text-3xl font-bold text-center text-white mb-8">Quiz Results</h2>
      
      <div className="flex flex-col md:flex-row items-center md:items-start gap-8 mb-12">
        <div className="flex-shrink-0 flex flex-col items-center w-full md:w-auto">
            <h3 className="text-2xl font-semibold text-white mb-4">Final Score</h3>
            <ScoreCircle score={scoreOutOf10} />
            <p className="text-2xl font-bold mt-4">{summary.score} / {summary.totalQuestions}</p>
        </div>
        <div className="text-center md:text-left flex-grow mt-4">
            <h3 className="text-2xl font-semibold text-white mb-2">Summary</h3>
            <p className="text-slate-300 leading-relaxed">
                You've completed the quiz! 
                {incorrectAnswers.length > 0 ? " Review your incorrect answers below to learn and improve." : " Congratulations on a perfect score!"}
            </p>
        </div>
      </div>

      {incorrectAnswers.length > 0 && (
            <div className="mb-12">
                <h3 className="text-2xl font-semibold text-amber-400 mb-4 text-center">Review Your Incorrect Answers</h3>
                <div className="space-y-6">
                    {incorrectAnswers.map(result => (
                        <IncorrectAnswer 
                            key={result.questionIndex} 
                            result={result} 
                            question={summary.questions[result.questionIndex]}
                        />
                    ))}
                </div>
            </div>
      )}
      
      <div className="text-center mt-12">
        <button
          onClick={onRestart}
          className="px-8 py-4 bg-cyan-500 text-white font-bold rounded-lg shadow-lg hover:bg-cyan-600 transition-all duration-200 transform hover:scale-105"
        >
          Take Another Quiz
        </button>
      </div>
    </div>
  );
};

export default SummaryReport;