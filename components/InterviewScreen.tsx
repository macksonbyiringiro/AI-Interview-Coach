import React, { useState, useEffect, useCallback, useRef } from 'react';
import type { Message } from '../types';
import { LanguageCode } from '../types';
import { MicrophoneIcon } from './icons/MicrophoneIcon';
import { StopIcon } from './icons/StopIcon';
import { LoadingSpinner } from './icons/LoadingSpinner';
import { BotIcon } from './icons/BotIcon';
import { UserIcon } from './icons/UserIcon';

interface InterviewScreenProps {
  messages: Message[];
  onAnswerSubmit: (answer: string) => void;
  onEndInterview: () => void;
  isLoading: boolean;
  language: LanguageCode;
}

// FIX: Add simplified interfaces for Web Speech API to fix TypeScript errors.
// These are simplified definitions to match the usage in this component.
interface SpeechRecognitionAlternative {
  readonly transcript: string;
}
interface SpeechRecognitionResult {
  readonly isFinal: boolean;
  readonly [index: number]: SpeechRecognitionAlternative;
  readonly length: number;
}
interface SpeechRecognitionResultList {
  readonly [index: number]: SpeechRecognitionResult;
  readonly length: number;
}
interface SpeechRecognitionEvent extends Event {
  readonly resultIndex: number;
  readonly results: SpeechRecognitionResultList;
}

// Check for SpeechRecognition API
// FIX: Cast window to `any` to access browser-specific SpeechRecognition properties not in default TS types.
const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
const recognition = SpeechRecognition ? new SpeechRecognition() : null;
if (recognition) {
    recognition.continuous = true;
    recognition.interimResults = true;
}


const InterviewScreen: React.FC<InterviewScreenProps> = ({ messages, onAnswerSubmit, onEndInterview, isLoading, language }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [isSupported, setIsSupported] = useState(!!recognition);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  
  // FIX: The type `SpeechRecognitionEvent` is now defined above, resolving the error.
  const handleTranscript = useCallback((event: SpeechRecognitionEvent) => {
    let interimTranscript = '';
    let finalTranscript = '';
    for (let i = event.resultIndex; i < event.results.length; ++i) {
      if (event.results[i].isFinal) {
        finalTranscript += event.results[i][0].transcript;
      } else {
        interimTranscript += event.results[i][0].transcript;
      }
    }
    setTranscript(finalTranscript + interimTranscript);
  }, []);

  const handleRecordingEnd = useCallback(() => {
      setIsRecording(false);
      if (transcript.trim()) {
          onAnswerSubmit(transcript.trim());
      }
      setTranscript('');
  }, [transcript, onAnswerSubmit]);

  useEffect(() => {
    if (!recognition) return;

    recognition.onresult = handleTranscript;
    recognition.onend = handleRecordingEnd;

    return () => {
      if (recognition) {
        recognition.onresult = null;
        recognition.onend = null;
        recognition.stop();
      }
    };
  }, [handleTranscript, handleRecordingEnd]);
  
  const toggleRecording = () => {
    if (!recognition) return;

    if (isRecording) {
      recognition.stop();
    } else {
      setTranscript('');
      recognition.lang = language;
      recognition.start();
    }
    setIsRecording(!isRecording);
  };
  
  if (!isSupported) {
    return (
        <div className="p-8 text-center text-red-400">
            <h2 className="text-2xl font-bold mb-4">Browser Not Supported</h2>
            <p>The Web Speech API is not supported by your browser. Please use Google Chrome for the best experience.</p>
        </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 md:p-8 flex flex-col h-[75vh]">
      <div className="flex-grow overflow-y-auto pr-4 -mr-4 space-y-6">
        {messages.map((msg, index) => (
          <React.Fragment key={index}>
            <div className={`flex items-start gap-4 ${msg.role === 'user' ? 'justify-end' : ''}`}>
              {msg.role === 'model' && <BotIcon className="w-8 h-8 flex-shrink-0 text-cyan-400 mt-1" />}
              <div className={`max-w-xl p-4 rounded-xl ${msg.role === 'model' ? 'bg-slate-700' : 'bg-blue-600 text-white'}`}>
                <p>{msg.text}</p>
              </div>
              {msg.role === 'user' && <UserIcon className="w-8 h-8 flex-shrink-0 text-slate-300 mt-1" />}
            </div>
            {msg.role === 'user' && msg.feedback && (
              <div className="flex items-start gap-4">
                <BotIcon className="w-8 h-8 flex-shrink-0 text-cyan-400 mt-1" />
                <div className="max-w-xl p-4 rounded-xl bg-slate-700 border-l-4 border-cyan-400">
                  <h4 className="font-bold text-cyan-300 mb-2">Feedback</h4>
                  <div className="prose prose-invert prose-sm text-slate-200" dangerouslySetInnerHTML={{ __html: msg.feedback.replace(/\n/g, '<br />') }} />
                </div>
              </div>
            )}
          </React.Fragment>
        ))}
         {isLoading && messages.length > 0 && messages[messages.length - 1].role === 'user' && (
             <div className="flex items-start gap-4">
                <BotIcon className="w-8 h-8 flex-shrink-0 text-cyan-400 mt-1" />
                <div className="max-w-xl p-4 rounded-xl bg-slate-700 flex items-center">
                    <LoadingSpinner className="w-5 h-5 mr-3"/>
                    <span>Thinking...</span>
                </div>
             </div>
         )}
        <div ref={messagesEndRef} />
      </div>

      <div className="mt-6 pt-6 border-t border-slate-700 flex flex-col items-center">
          {isRecording && <div className="w-full bg-slate-700 rounded-lg p-4 mb-4 text-slate-300 min-h-[80px]">{transcript || 'Listening...'}</div>}

          <div className="flex items-center gap-4">
            <button
              onClick={toggleRecording}
              disabled={isLoading}
              className={`w-20 h-20 rounded-full flex items-center justify-center transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-opacity-50 ${isRecording ? 'bg-red-600 hover:bg-red-700 focus:ring-red-500' : 'bg-cyan-500 hover:bg-cyan-600 focus:ring-cyan-400'} disabled:bg-slate-600 disabled:cursor-not-allowed`}
            >
              {isRecording ? <StopIcon className="w-10 h-10 text-white" /> : <MicrophoneIcon className="w-10 h-10 text-white" />}
            </button>
            <button 
                onClick={onEndInterview}
                disabled={isLoading || isRecording}
                className="px-6 py-3 bg-slate-600 text-white font-semibold rounded-lg hover:bg-slate-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
                End Interview
            </button>
          </div>
          <p className="text-slate-400 mt-3 text-sm">{isRecording ? "Click the red button to stop recording." : "Click the microphone to start answering."}</p>
      </div>
    </div>
  );
};

export default InterviewScreen;