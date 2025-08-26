import React, { useState, useCallback } from 'react';
import { AppState, QuizQuestion, UserAnswer, QuizSummary, LanguageCode } from './types';
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
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([]);
  const [userAnswers, setUserAnswers] = useState<UserAnswer[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [quizSummary, setQuizSummary] = useState<QuizSummary | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [language, setLanguage] = useState<LanguageCode>('en-US');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);

  const handleStartQuiz = useCallback(async (topic: string) => {
    setIsLoading(true);
    setError(null);
    setQuizQuestions([]);
    setUserAnswers([]);
    setCurrentQuestionIndex(0);
    setQuizSummary(null);

    try {
      const questions = await GeminiService.generateQuiz(topic, language);
      if (questions.length === 0) {
        setError("The AI failed to generate a quiz for this topic. Please try another one.");
        return;
      }
      setQuizQuestions(questions);
      setAppState(AppState.QUIZ);
    } catch (e) {
      console.error(e);
      if (e instanceof Error) {
        setError(e.message);
      } else {
        setError('An unknown error occurred while starting the quiz.');
      }
    } finally {
      setIsLoading(false);
    }
  }, [language]);

  const handleAnswerSubmit = (selectedOptionIndex: number) => {
    const currentQuestion = quizQuestions[currentQuestionIndex];
    const isCorrect = currentQuestion.correctAnswerIndex === selectedOptionIndex;

    const answer: UserAnswer = {
      questionIndex: currentQuestionIndex,
      selectedOptionIndex,
      isCorrect,
    };

    setUserAnswers(prev => [...prev, answer]);
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < quizQuestions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      // End of quiz, generate summary
      const score = userAnswers.filter(a => a.isCorrect).length;
      const summary: QuizSummary = {
        score,
        totalQuestions: quizQuestions.length,
        results: userAnswers,
        questions: quizQuestions,
      };
      setQuizSummary(summary);
      setAppState(AppState.SUMMARY);
    }
  };
  
  const handleRestart = () => {
    setAppState(AppState.WELCOME);
    setQuizQuestions([]);
    setUserAnswers([]);
    setCurrentQuestionIndex(0);
    setQuizSummary(null);
    setError(null);
    setIsConfirmModalOpen(false);
  };

  const handleLanguageChange = (newLanguage: LanguageCode) => {
    setLanguage(newLanguage);
  };

  const handleHomeClick = () => {
    if (appState === AppState.QUIZ) {
      setIsConfirmModalOpen(true);
    } else {
      handleRestart();
    }
  };

  const renderContent = () => {
    switch (appState) {
      case AppState.QUIZ:
        if (quizQuestions.length === 0) {
            return (
                <div className="p-8 text-center">
                    <p className="text-slate-300">Loading quiz...</p>
                </div>
            )
        }
        return (
          <InterviewScreen
            question={quizQuestions[currentQuestionIndex]}
            onAnswerSubmit={handleAnswerSubmit}
            onNext={handleNextQuestion}
            questionNumber={currentQuestionIndex + 1}
            totalQuestions={quizQuestions.length}
            userAnswer={userAnswers.find(a => a.questionIndex === currentQuestionIndex)}
          />
        );
      case AppState.SUMMARY:
        return (
          <SummaryReport
            summary={quizSummary}
            isLoading={isLoading}
            onRestart={handleRestart}
          />
        );
      case AppState.WELCOME:
      default:
        return (
          <WelcomeScreen onStart={handleStartQuiz} isLoading={isLoading} />
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
        title="End Quiz?"
        confirmText="End Quiz"
      >
        <p>Are you sure you want to end this quiz and return to the home screen? Your progress will be lost.</p>
      </ConfirmationModal>
    </div>
  );
};

export default App;