import React, { useState, useEffect } from 'react';
import type { InterviewQuestion, InterviewAnswer } from '../types';
import { useSpeechRecognition } from '../useSpeechRecognition';
import { MicrophoneIcon } from './icons/MicrophoneIcon';
import { StopIcon } from './icons/StopIcon';
import { LoadingSpinner } from './icons/LoadingSpinner';

interface VoiceInterviewScreenProps {
  question: InterviewQuestion;
  language: string;
  onAnswerSubmit: (answer: string) => Promise<void>;
  onNext: () => void;
  questionNumber: number;
  totalQuestions: number;
  lastAnswer: InterviewAnswer | undefined;
  isProcessing: boolean;
}

const VoiceInterviewScreen: React.FC<VoiceInterviewScreenProps> = ({ 
    question,
    language,
    onAnswerSubmit, 
    onNext, 
    questionNumber, 
    totalQuestions,
    lastAnswer,
    isProcessing,
}) => {
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const { 
      transcript, 
      interimTranscript,
      isListening, 
      startListening, 
      stopListening, 
      hasRecognitionSupport,
      error: speechError
  } = useSpeechRecognition({ lang: language });

  useEffect(() => {
    // Reset submission state when question changes
    setHasSubmitted(false);
  }, [question]);

  const handleSubmit = async () => {
    stopListening();
    if (transcript.trim()) {
      setHasSubmitted(true);
      await onAnswerSubmit(transcript);
    }
  };

  const handleNext = () => {
    onNext();
  }

  const showFeedback = lastAnswer?.questionIndex === questionNumber - 1;

  if (!question) {
    return <div className="p-8 text-center min-h-[400px] flex items-center justify-center">Loading question...</div>;
  }

  return (
    <div className="p-4 sm:p-6 md:p-8 flex flex-col h-[75vh]">
      <div className="mb-6">
        <p className="text-center text-slate-400 mb-2">Question {questionNumber} of {totalQuestions}</p>
        <div className="w-full bg-slate-700 rounded-full h-2.5">
          <div className="bg-cyan-500 h-2.5 rounded-full" style={{ width: `${(questionNumber / totalQuestions) * 100}%`, transition: 'width 0.5s ease-in-out' }}></div>
        </div>
      </div>
      
      <div className="flex-grow flex flex-col items-center">
        <h2 className="text-2xl font-bold text-white mb-6 text-center">{question.question}</h2>
        
        {!hasRecognitionSupport && (
            <div className="p-4 bg-red-500 text-white text-center rounded-lg">
                <p>Speech recognition is not supported by your browser. Please try Chrome or Safari.</p>
            </div>
        )}

        {speechError && <p className="text-red-400 text-center my-2">{speechError}</p>}

        <div className="w-full max-w-2xl p-4 bg-slate-900/50 rounded-lg min-h-[120px] text-slate-300 border border-slate-700">
            {transcript}
            <span className="text-slate-500">{interimTranscript}</span>
            {!transcript && !interimTranscript && !isListening && (
                <span className="text-slate-500">Your answer will appear here...</span>
            )}
        </div>

        <div className="my-6">
            {!isListening ? (
                 <button onClick={startListening} disabled={!hasRecognitionSupport || isProcessing || showFeedback} className="flex items-center gap-3 px-8 py-4 bg-cyan-500 text-white font-bold rounded-full shadow-lg hover:bg-cyan-600 transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100">
                     <MicrophoneIcon className="w-6 h-6" />
                     Start Recording
                 </button>
            ) : (
                <button onClick={stopListening} className="flex items-center gap-3 px-8 py-4 bg-red-500 text-white font-bold rounded-full shadow-lg hover:bg-red-600 transition-all duration-200 animate-pulse">
                    <StopIcon className="w-6 h-6" />
                    Stop Recording
                </button>
            )}
        </div>

        {!isListening && transcript && !showFeedback && (
            <button onClick={handleSubmit} disabled={isProcessing} className="px-6 py-2 bg-slate-600 text-white font-semibold rounded-lg hover:bg-slate-700 transition-colors disabled:opacity-50">
                {isProcessing ? "Getting Feedback..." : "Submit for Feedback"}
            </button>
        )}

      </div>
      
      {isProcessing && hasSubmitted && (
          <div className="flex justify-center items-center gap-3 text-lg text-slate-300">
              <LoadingSpinner className="w-6 h-6"/>
              Analyzing your answer...
          </div>
      )}

      {showFeedback && lastAnswer && (
        <div className="mt-6 pt-6 border-t border-slate-700 animate-fade-in">
          <div className="max-w-3xl mx-auto bg-slate-900/50 p-6 rounded-lg">
            <h3 className="text-2xl font-bold text-amber-400 mb-3">Feedback</h3>
            <p className="text-slate-300 leading-relaxed">{lastAnswer.feedback}</p>
            <div className="text-center mt-6">
                <button onClick={handleNext} className="px-8 py-3 bg-cyan-500 text-white font-bold rounded-lg shadow-lg hover:bg-cyan-600 transition-all">
                    {questionNumber === totalQuestions ? "Finish Interview" : "Next Question"}
                </button>
            </div>
          </div>
          <style>{`@keyframes fade-in { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }`}</style>
        </div>
      )}
    </div>
  );
};

export default VoiceInterviewScreen;
