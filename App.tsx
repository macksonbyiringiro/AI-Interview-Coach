import React, { useState, useCallback, useEffect } from 'react';
import { AppState, QuizQuestion, UserAnswer, QuizSummary, InterviewQuestion, InterviewAnswer, InterviewSummary, LanguageCode } from './types';
import { GeminiService } from './services/geminiService';
import WelcomeScreen from './components/WelcomeScreen';
import InterviewScreen from './components/InterviewScreen';
import VoiceInterviewScreen from './components/VoiceInterviewScreen';
import SummaryReport from './components/SummaryReport';
import InterviewSummaryReport from './components/InterviewSummaryReport';
import Header from './components/Header';
import SettingsModal from './components/SettingsModal';
import ConfirmationModal from './components/ConfirmationModal';
import { SettingsIcon } from './components/icons/SettingsIcon';
import { HomeIcon } from './components/icons/HomeIcon';

const App: React.FC = () => {
  // General State
  const [appState, setAppState] = useState<AppState>(AppState.WELCOME);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [language, setLanguage] = useState<LanguageCode>('en-US');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [theme, setTheme] = useState<'light' | 'dark'>(() => 
    document.documentElement.classList.contains('dark') ? 'dark' : 'light'
  );

  // Quiz State
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([]);
  const [userAnswers, setUserAnswers] = useState<UserAnswer[]>([]);
  const [quizSummary, setQuizSummary] = useState<QuizSummary | null>(null);
  
  // Interview State
  const [interviewQuestions, setInterviewQuestions] = useState<InterviewQuestion[]>([]);
  const [userInterviewAnswers, setUserInterviewAnswers] = useState<InterviewAnswer[]>([]);
  const [interviewSummary, setInterviewSummary] = useState<InterviewSummary | null>(null);
  const [isProcessing, setIsProcessing] = useState(false); // For feedback generation

  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    try {
      localStorage.setItem('theme', theme);
    } catch (e) {
      console.error("Failed to set theme in localStorage", e);
    }
  }, [theme]);

  const resetState = () => {
    setAppState(AppState.WELCOME);
    setError(null);
    setIsLoading(false);
    setCurrentQuestionIndex(0);
    // Quiz
    setQuizQuestions([]);
    setUserAnswers([]);
    setQuizSummary(null);
    // Interview
    setInterviewQuestions([]);
    setUserInterviewAnswers([]);
    setInterviewSummary(null);
  };

  const handleStart = useCallback(async (topic: string, mode: 'quiz' | 'voice') => {
    setIsLoading(true);
    resetState(); // Reset everything before starting a new session
    setAppState(mode === 'quiz' ? AppState.QUIZ : AppState.INTERVIEW);

    try {
      if (mode === 'quiz') {
        const questions = await GeminiService.generateQuiz(topic, language);
        if (questions.length === 0) throw new Error("The AI failed to generate a quiz.");
        setQuizQuestions(questions);
      } else {
        const questions = await GeminiService.generateInterviewQuestions(topic, language);
        if (questions.length === 0) throw new Error("The AI failed to generate interview questions.");
        setInterviewQuestions(questions);
      }
    } catch (e) {
      console.error(e);
      const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred.';
      setError(errorMessage);
      setAppState(AppState.WELCOME); // Go back to welcome on error
    } finally {
      setIsLoading(false);
    }
  }, [language]);

  // --- Quiz Logic ---
  const handleAnswerSubmit = (selectedOptionIndex: number) => {
    const currentQuestion = quizQuestions[currentQuestionIndex];
    const answer: UserAnswer = {
      questionIndex: currentQuestionIndex,
      selectedOptionIndex,
      isCorrect: currentQuestion.correctAnswerIndex === selectedOptionIndex,
    };
    setUserAnswers(prev => [...prev, answer]);
  };

  const handleNextQuizQuestion = () => {
    if (currentQuestionIndex < quizQuestions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      const summary: QuizSummary = {
        score: userAnswers.filter(a => a.isCorrect).length,
        totalQuestions: quizQuestions.length,
        results: userAnswers,
        questions: quizQuestions,
      };
      setQuizSummary(summary);
      setAppState(AppState.SUMMARY);
    }
  };

  // --- Interview Logic ---
  const handleInterviewAnswerSubmit = async (answer: string) => {
      setIsProcessing(true);
      setError(null);
      try {
        const feedback = await GeminiService.getFeedbackForAnswer(interviewQuestions[currentQuestionIndex].question, answer, language);
        const interviewAnswer: InterviewAnswer = {
          questionIndex: currentQuestionIndex,
          answer,
          feedback,
        };
        setUserInterviewAnswers(prev => [...prev, interviewAnswer]);
      } catch (e) {
        const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred getting feedback.';
        setError(errorMessage);
      } finally {
        setIsProcessing(false);
      }
  };
  
  const handleNextInterviewQuestion = () => {
    setError(null); // Clear feedback errors on next
    if (currentQuestionIndex < interviewQuestions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      const summary: InterviewSummary = {
        questions: interviewQuestions,
        results: userInterviewAnswers
      };
      setInterviewSummary(summary);
      setAppState(AppState.SUMMARY);
    }
  };
  
  const handleRestart = () => {
    resetState();
    setIsConfirmModalOpen(false);
  };

  const handleLanguageChange = (newLanguage: LanguageCode) => {
    setLanguage(newLanguage);
  };

  const handleThemeChange = (newTheme: 'light' | 'dark') => {
    setTheme(newTheme);
  };

  const handleHomeClick = () => {
    if (appState === AppState.QUIZ || appState === AppState.INTERVIEW) {
      setIsConfirmModalOpen(true);
    } else {
      handleRestart();
    }
  };

  const renderContent = () => {
    switch (appState) {
      case AppState.QUIZ:
        if (quizQuestions.length === 0) return <div className="p-8 text-center"><p className="text-slate-600 dark:text-slate-300">Loading quiz...</p></div>;
        return (
          <InterviewScreen
            question={quizQuestions[currentQuestionIndex]}
            onAnswerSubmit={handleAnswerSubmit}
            onNext={handleNextQuizQuestion}
            questionNumber={currentQuestionIndex + 1}
            totalQuestions={quizQuestions.length}
            userAnswer={userAnswers.find(a => a.questionIndex === currentQuestionIndex)}
          />
        );
      case AppState.INTERVIEW:
          if (interviewQuestions.length === 0) return <div className="p-8 text-center"><p className="text-slate-600 dark:text-slate-300">Loading interview...</p></div>;
          return (
              <VoiceInterviewScreen
                question={interviewQuestions[currentQuestionIndex]}
                language={language}
                onAnswerSubmit={handleInterviewAnswerSubmit}
                onNext={handleNextInterviewQuestion}
                questionNumber={currentQuestionIndex + 1}
                totalQuestions={interviewQuestions.length}
                lastAnswer={userInterviewAnswers.find(a => a.questionIndex === currentQuestionIndex)}
                isProcessing={isProcessing}
              />
          );
      case AppState.SUMMARY:
        if (quizSummary) {
          return <SummaryReport summary={quizSummary} isLoading={isLoading} onRestart={handleRestart} />;
        }
        if (interviewSummary) {
          return <InterviewSummaryReport summary={interviewSummary} onRestart={handleRestart} />;
        }
        // Fallback if no summary is available
        handleRestart();
        return null;

      case AppState.WELCOME:
      default:
        return (
          <WelcomeScreen onStart={handleStart} isLoading={isLoading} />
        );
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 transition-colors duration-300">
       <div className="w-full max-w-4xl mx-auto relative">
         {appState !== AppState.WELCOME && (
           <button
             onClick={handleHomeClick}
             className="absolute top-0 left-0 p-2 text-slate-500 dark:text-slate-400 hover:text-cyan-500 dark:hover:text-cyan-400 transition-colors z-10"
             aria-label="Return to home screen"
           >
             <HomeIcon className="w-6 h-6" />
           </button>
         )}
         <button 
          onClick={() => setIsSettingsOpen(true)}
          className="absolute top-0 right-0 p-2 text-slate-500 dark:text-slate-400 hover:text-cyan-500 dark:hover:text-cyan-400 transition-colors z-10"
          aria-label="Open settings"
        >
          <SettingsIcon className="w-6 h-6" />
        </button>

        <Header />
        <main className="mt-8 bg-white dark:bg-slate-800 rounded-2xl shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-700">
            {error && <div className="p-4 bg-red-500 text-white text-center rounded-t-2xl">{error}</div>}
            {renderContent()}
        </main>
      </div>
      <SettingsModal 
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        language={language}
        onLanguageChange={handleLanguageChange}
        theme={theme}
        onThemeChange={handleThemeChange}
      />
      <ConfirmationModal
        isOpen={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
        onConfirm={handleRestart}
        title="End Session?"
        confirmText="End Session"
      >
        <p>Are you sure you want to end this session and return to the home screen? Your progress will be lost.</p>
      </ConfirmationModal>
    </div>
  );
};

export default App;