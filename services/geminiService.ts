import { GoogleGenAI, Type } from '@google/genai';
import { QuizQuestion, InterviewQuestion, LanguageCode, LANGUAGES } from '../types';

export class GeminiService {
  private static ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  private static getErrorMessage(error: unknown): string {
    if (error instanceof Error) {
        // First, pass through app-specific parsing errors which are thrown internally.
        // These are already user-friendly.
        if (error.message.startsWith("Could not parse") || error.message.startsWith("The AI returned")) {
            return error.message;
        }

        const message = error.message.toLowerCase();

        // Check for common API key errors
        if (message.includes('api key not valid') || message.includes('api key is invalid') || message.includes('api_key')) {
            return "Invalid API Key. Please ensure your API key is configured correctly.";
        }
        
        // Check for network errors
        if (message.includes('failed to fetch') || message.includes('network')) {
            return "Network error. Please check your internet connection and try again.";
        }

        // Check for safety/policy blocking
        if (message.includes('blocked') && (message.includes('safety') || message.includes('policy'))) {
             return "The response was blocked due to safety settings. Please try another topic.";
        }

        // Check for rate limiting / resource exhaustion
        if (message.includes('resource has been exhausted') || message.includes('rate limit')) {
            return "You've exceeded the request limit for the AI service. Please wait a moment and try again.";
        }
        
        // Check for model permission issues
        if (message.includes('permission denied') && message.includes('model')) {
            return "You do not have permission to use the selected AI model. Please check your API key's permissions.";
        }

        // Check for internal server errors from the AI service
        if (message.includes('internal error') || message.includes('500') || message.includes('server error')) {
            return "An unexpected error occurred with the AI service. Please try again later.";
        }
        
        // Generic fallback for other AI-related errors
        return "An unexpected error occurred while communicating with the AI. Please try again.";
    }
    // Fallback for non-Error objects
    return "An unknown error occurred. Please try again.";
  }

  public static async generateQuiz(topic: string, language: LanguageCode): Promise<QuizQuestion[]> {
    const languageName = LANGUAGES[language];
    try {
        const response = await this.ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: `Generate a 10-question multiple-choice quiz about "${topic}". The quiz should be in the ${languageName} language. For each question, provide exactly 4 options. Indicate the correct answer using a zero-based index. Also, provide a brief explanation for why the answer is correct.`,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        quiz: {
                            type: Type.ARRAY,
                            description: "An array of 10 multiple-choice questions.",
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    question: { type: Type.STRING, description: "The question text." },
                                    options: {
                                        type: Type.ARRAY,
                                        description: "An array of 4 possible answers.",
                                        items: { type: Type.STRING }
                                    },
                                    correctAnswerIndex: { type: Type.NUMBER, description: "The 0-based index of the correct answer in the options array." },
                                    explanation: { type: Type.STRING, description: "A brief explanation of the correct answer." }
                                },
                                required: ["question", "options", "correctAnswerIndex", "explanation"]
                            }
                        }
                    },
                    required: ["quiz"]
                }
            }
        });
        
        try {
            const jsonText = response.text.trim();
            if (!jsonText) {
                throw new Error("The AI returned an empty quiz. Please try again.");
            }
            const parsed = JSON.parse(jsonText) as { quiz: QuizQuestion[] };
            if (!parsed.quiz || parsed.quiz.length === 0) {
                 throw new Error("Could not parse the quiz from the AI response. The format was invalid.");
            }
            return parsed.quiz;
        } catch (error) {
            console.error("Failed to parse quiz JSON:", response.text, error);
            throw new Error("Could not parse the quiz from the AI response. The format was invalid.");
        }

    } catch (error) {
        console.error("Error in generateQuiz:", error);
        throw new Error(this.getErrorMessage(error));
    }
  }

  public static async generateInterviewQuestions(topic: string, language: LanguageCode): Promise<InterviewQuestion[]> {
    const languageName = LANGUAGES[language];
    try {
        const response = await this.ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: `Generate 5 open-ended interview questions about "${topic}". The questions should be in the ${languageName} language.`,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        questions: {
                            type: Type.ARRAY,
                            description: "An array of 5 open-ended interview questions.",
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    question: { type: Type.STRING, description: "The question text." }
                                },
                                required: ["question"]
                            }
                        }
                    },
                    required: ["questions"]
                }
            }
        });

        try {
            const jsonText = response.text.trim();
            if (!jsonText) {
                throw new Error("The AI returned empty questions. Please try again.");
            }
            const parsed = JSON.parse(jsonText) as { questions: InterviewQuestion[] };
            if (!parsed.questions || parsed.questions.length === 0) {
                 throw new Error("Could not parse the questions from the AI response. The format was invalid.");
            }
            return parsed.questions;
        } catch (error) {
            console.error("Failed to parse interview questions JSON:", response.text, error);
            throw new Error("Could not parse the questions from the AI response. The format was invalid.");
        }

    } catch (error) {
        console.error("Error in generateInterviewQuestions:", error);
        throw new Error(this.getErrorMessage(error));
    }
  }
  
  public static async getFeedbackForAnswer(question: string, answer: string, language: LanguageCode): Promise<string> {
    const languageName = LANGUAGES[language];
    try {
      const response = await this.ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `In ${languageName}, acting as a helpful and encouraging interview coach, review the following interview question and the user's answer. Provide concise (2-3 sentences), constructive feedback on the answer's clarity, structure, and completeness. Start with a positive reinforcement. Question: "${question}" User's Answer: "${answer}"`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              feedback: {
                type: Type.STRING,
                description: "Concise, constructive feedback for the user's answer."
              }
            },
            required: ["feedback"]
          }
        }
      });
      
      try {
        const jsonText = response.text.trim();
        if (!jsonText) {
          throw new Error("The AI returned empty feedback.");
        }
        const parsed = JSON.parse(jsonText) as { feedback: string };
        if (!parsed.feedback) {
          throw new Error("Could not parse feedback from the AI response.");
        }
        return parsed.feedback;
      } catch (error) {
        console.error("Failed to parse feedback JSON:", response.text, error);
        throw new Error("Could not parse feedback from the AI response.");
      }

    } catch (error) {
      console.error("Error in getFeedbackForAnswer:", error);
      throw new Error(this.getErrorMessage(error));
    }
  }
}