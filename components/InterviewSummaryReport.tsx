import React from 'react';
import type { InterviewSummary } from '../types';

interface InterviewSummaryReportProps {
  summary: InterviewSummary | null;
  onRestart: () => void;
}

const InterviewSummaryReport: React.FC<InterviewSummaryReportProps> = ({ summary, onRestart }) => {
  if (!summary) {
    return (
      <div className="p-8 md:p-12 text-center">
        <h2 className="text-2xl font-bold text-red-400">Error</h2>
        <p className="text-slate-300 mt-2">Could not generate your interview summary.</p>
        <button
          onClick={onRestart}
          className="mt-6 px-6 py-3 bg-cyan-500 text-white font-semibold rounded-lg hover:bg-cyan-600 transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="p-8 md:p-12">
      <h2 className="text-3xl font-bold text-center text-white mb-4">Interview Report</h2>
      <p className="text-slate-300 text-center mb-10 max-w-2xl mx-auto">
        You've completed the interview. Review your answers and the AI feedback below to identify areas for improvement.
      </p>
      
      <div className="space-y-8 max-w-4xl mx-auto">
        {summary.results.map((result, index) => (
          <div key={index} className="bg-slate-700/50 p-6 rounded-lg">
            <p className="font-bold text-lg text-slate-300 mb-4">
              {index + 1}. {summary.questions[result.questionIndex].question}
            </p>
            
            <div className="mb-4">
              <h4 className="font-semibold text-cyan-400 mb-2">Your Answer:</h4>
              <p className="text-slate-300 pl-4 border-l-2 border-slate-600 italic">"{result.answer}"</p>
            </div>

            <div>
              <h4 className="font-semibold text-amber-400 mb-2">AI Feedback:</h4>
              <p className="text-slate-300 pl-4 border-l-2 border-slate-600">{result.feedback}</p>
            </div>
          </div>
        ))}
      </div>
      
      <div className="text-center mt-12">
        <button
          onClick={onRestart}
          className="px-8 py-4 bg-cyan-500 text-white font-bold rounded-lg shadow-lg hover:bg-cyan-600 transition-all duration-200 transform hover:scale-105"
        >
          Practice Again
        </button>
      </div>
    </div>
  );
};

export default InterviewSummaryReport;
