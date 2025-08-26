import React from 'react';
import type { InterviewSummary, Message } from '../types';
import { LoadingSpinner } from './icons/LoadingSpinner';
import { DownloadIcon } from './icons/DownloadIcon';

interface SummaryReportProps {
  summary: InterviewSummary | null;
  isLoading: boolean;
  onRestart: () => void;
  messages: Message[];
}

const ScoreCircle: React.FC<{ score: number }> = ({ score }) => {
    const circumference = 2 * Math.PI * 54; // 2 * pi * radius
    const offset = circumference - (score / 10) * circumference;
  
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

const SummaryReport: React.FC<SummaryReportProps> = ({ summary, isLoading, onRestart, messages }) => {
  if (isLoading) {
    return (
      <div className="p-8 md:p-12 flex flex-col items-center justify-center min-h-[400px]">
        <LoadingSpinner className="w-12 h-12 text-cyan-400" />
        <p className="mt-4 text-slate-300 text-lg">Generating your performance report...</p>
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

  const handleDownloadTranscript = () => {
    const transcriptText = messages.map(msg => {
      const prefix = msg.role === 'model' ? 'Interviewer' : 'You';
      return `${prefix}:\n${msg.text}\n`;
    }).join('\n\n');

    const blob = new Blob([transcriptText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'interview-transcript.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-8 md:p-12">
      <h2 className="text-3xl font-bold text-center text-white mb-8">Interview Performance Report</h2>
      
      <div className="flex flex-col md:flex-row items-center md:items-start gap-8 mb-8">
        <div className="flex-shrink-0">
            <ScoreCircle score={summary.overallScore} />
        </div>
        <div className="text-center md:text-left">
            <h3 className="text-2xl font-semibold text-white mb-2">Overall Summary</h3>
            <p className="text-slate-300">{summary.summary}</p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <div className="bg-slate-700/50 p-6 rounded-lg">
          <h3 className="text-xl font-semibold text-green-400 mb-4">Strengths</h3>
          <ul className="space-y-2 list-disc list-inside text-slate-200">
            {summary.strengths.map((item, index) => <li key={index}>{item}</li>)}
          </ul>
        </div>
        <div className="bg-slate-700/50 p-6 rounded-lg">
          <h3 className="text-xl font-semibold text-amber-400 mb-4">Areas for Improvement</h3>
          <ul className="space-y-2 list-disc list-inside text-slate-200">
            {summary.areasForImprovement.map((item, index) => <li key={index}>{item}</li>)}
          </ul>
        </div>
      </div>
      
      <div className="text-center mt-12 flex flex-col sm:flex-row justify-center items-center gap-4">
        <button
          onClick={onRestart}
          className="px-8 py-4 bg-cyan-500 text-white font-bold rounded-lg shadow-lg hover:bg-cyan-600 transition-all duration-200 transform hover:scale-105"
        >
          Start a New Interview
        </button>
        <button
          onClick={handleDownloadTranscript}
          className="flex items-center gap-2 px-6 py-3 bg-slate-600 text-white font-semibold rounded-lg hover:bg-slate-700 transition-colors"
        >
          <DownloadIcon className="w-5 h-5" />
          Download Transcript
        </button>
      </div>
    </div>
  );
};

export default SummaryReport;