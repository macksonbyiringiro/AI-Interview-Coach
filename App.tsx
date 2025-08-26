import React, { useState, useCallback, useRef } from 'react';
import type { Chat } from '@google/genai';
import { AppState, Message, InterviewSummary, LanguageCode } from './types';
import { GeminiService } from './services/geminiService';
import WelcomeScreen from './components/WelcomeScreen';
import InterviewScreen from './components/InterviewScreen';
import SummaryReport from './components/SummaryReport';
import Header from './components/Header';
import SettingsModal from './components/SettingsModal';
import ConfirmationModal from './components/ConfirmationModal';
import { SettingsIcon } from './components/icons/SettingsIcon';
import { HomeIcon } from './components/icons/HomeIcon';

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>(AppState.WELCOME);
  const [messages, setMessages] = useState<Message[]>([]);
  const [summary, setSummary] = useState<InterviewSummary | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [language, setLanguage] = useState<LanguageCode>('en-US');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const chatRef = useRef<Chat | null>(null);

  const handleStartInterview = useCallback(async (topic: string) => {
    setIsLoading(true);
    setError(null);
    setMessages([]);
    setSummary(null);

    try {
      const { chat, firstQuestion } = await GeminiService.startInterviewSession(topic, language);
      chatRef.current = chat;
      setMessages([{ role: 'model', text: firstQuestion }]);
      setAppState(AppState.INTERVIEW);
    } catch (e) {
      console.error(e);
      setError('Failed to start the interview session. Please check your API key and try again.');
    } finally {
      setIsLoading(false);
    }
  }, [language]);

  const handleUserAnswer = useCallback(async (answer: string) => {
    if (!chatRef.current) return;
    setIsLoading(true);
    setError(null);
    
    const currentQuestion = messages[messages.length - 1].text;
    
    const userMessage: Message = { role: 'user', text: answer };
    setMessages(prev => [...prev, userMessage]);

    try {
      const { feedback, nextQuestion } = await GeminiService.sendAnswerAndGetFeedback(chatRef.current, currentQuestion, answer);
      
      setMessages(prev => {
        const newMessages = [...prev];
        const lastMessage = newMessages[newMessages.length - 1];
        if (lastMessage.role === 'user') {
          lastMessage.feedback = feedback;
        }
        return newMessages;
      });

      if (nextQuestion.toLowerCase().includes("thank you for your time")) {
         await handleEndInterview();
      } else {
        const modelMessage: Message = { role: 'model', text: nextQuestion };
        setMessages(prev => [...prev, modelMessage]);
      }
    } catch (e) {
      console.error(e);
      setError('Failed to get feedback. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [messages]);

  const handleEndInterview = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    setAppState(AppState.SUMMARY);

    try {
      const fullTranscript = messages.map(msg => `${msg.role === 'user' ? 'You' : 'Interviewer'}: ${msg.text}`).join('\n\n');
      const interviewSummary = await GeminiService.getInterviewSummary(fullTranscript);
      setSummary(interviewSummary);
    } catch (e) {
      console.error(e);
      setError('Failed to generate the interview summary.');
    } finally {
      setIsLoading(false);
    }
  }, [messages]);
  
  const handleRestart = () => {
    setAppState(AppState.WELCOME);
    setMessages([]);
    setSummary(null);
    setError(null);
    chatRef.current = null;
    setIsConfirmModalOpen(false);
  };

  const handleLanguageChange = (newLanguage: LanguageCode) => {
    setLanguage(newLanguage);
  };

  const handleHomeClick = () => {
    if (appState === AppState.INTERVIEW) {
      setIsConfirmModalOpen(true);
    } else {
      handleRestart();
    }
  };

  const renderContent = () => {
    switch (appState) {
      case AppState.INTERVIEW:
        return (
          <InterviewScreen
            messages={messages}
            onAnswerSubmit={handleUserAnswer}
            onEndInterview={handleEndInterview}
            isLoading={isLoading}
            language={language}
          />
        );
      case AppState.SUMMARY:
        return (
          <SummaryReport
            summary={summary}
            isLoading={isLoading}
            onRestart={handleRestart}
            messages={messages}
          />
        );
      case AppState.WELCOME:
      default:
        return (
          <WelcomeScreen onStart={handleStartInterview} isLoading={isLoading} />
        );
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-4">
       <div className="w-full max-w-4xl mx-auto relative">
         {appState !== AppState.WELCOME && (
           <button
             onClick={handleHomeClick}
             className="absolute top-0 left-0 p-2 text-slate-400 hover:text-cyan-400 transition-colors z-10"
             aria-label="Return to home screen"
           >
             <HomeIcon className="w-6 h-6" />
           </button>
         )}
         <button 
          onClick={() => setIsSettingsOpen(true)}
          className="absolute top-0 right-0 p-2 text-slate-400 hover:text-cyan-400 transition-colors z-10"
          aria-label="Open settings"
        >
          <SettingsIcon className="w-6 h-6" />
        </button>

        <Header />
        <main className="mt-8 bg-slate-800 rounded-2xl shadow-2xl overflow-hidden border border-slate-700">
            {error && <div className="p-4 bg-red-500 text-white text-center rounded-t-2xl">{error}</div>}
            {renderContent()}
        </main>
      </div>
      <SettingsModal 
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        language={language}
        onLanguageChange={handleLanguageChange}
      />
      <ConfirmationModal
        isOpen={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
        onConfirm={handleRestart}
        title="End Interview?"
        confirmText="End Interview"
      >
        <p>Are you sure you want to end this interview and return to the home screen? Your progress will be lost.</p>
      </ConfirmationModal>
    </div>
  );
};

export default App;