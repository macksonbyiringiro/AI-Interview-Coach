export enum AppState {
  WELCOME,
  QUIZ,
  INTERVIEW,
  SUMMARY,
}

export interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswerIndex: number;
  explanation: string;
}

export interface UserAnswer {
  questionIndex: number;
  selectedOptionIndex: number;
  isCorrect: boolean;
}

export interface QuizSummary {
  score: number;
  totalQuestions: number;
  results: UserAnswer[];
  questions: QuizQuestion[];
}

export interface InterviewQuestion {
    question: string;
}

export interface InterviewAnswer {
    questionIndex: number;
    answer: string;
    feedback: string;
}

export interface InterviewSummary {
    questions: InterviewQuestion[];
    results: InterviewAnswer[];
}

export const LANGUAGES = {
  'en-US': 'English',
  'es-ES': 'Español',
  'fr-FR': 'Français',
  'de-DE': 'Deutsch',
  'ja-JP': '日本語',
  'rw-RW': 'Kinyarwanda',
};

export type LanguageCode = keyof typeof LANGUAGES;