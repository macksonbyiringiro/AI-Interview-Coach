export enum AppState {
  WELCOME,
  INTERVIEW,
  SUMMARY,
}

export interface Message {
  role: 'user' | 'model';
  text: string;
  feedback?: string;
}

export interface InterviewSummary {
  strengths: string[];
  areasForImprovement: string[];
  overallScore: number;
  summary: string;
  toneAnalysis: string;
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