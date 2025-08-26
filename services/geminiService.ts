import { GoogleGenAI, Type } from '@google/genai';
import { QuizQuestion, LanguageCode, LANGUAGES } from '../types';

export class GeminiService {
  private static ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  private static getErrorMessage(error: unknown): string {
    if (error instanceof Error) {
        const message = error.message.toLowerCase();

        if (message.includes('could not parse the quiz') || message.includes('ai returned an empty quiz')) {
            return error.message;
        }

        if (message.includes('api key not valid') || message.includes('api key is invalid')) {
            return "Invalid API Key. Please ensure your API key is configured correctly.";
        }
        
        if (message.includes('failed to fetch')) {
            return "Network error. Please check your internet connection and try again.";
        }

        if (message.includes('blocked') && (message.includes('safety') || message.includes('policy'))) {
             return "The response was blocked due to safety settings. Please try another topic.";
        }

        if (message.includes('resource has been exhausted') || message.includes('rate limit')) {
            return "You've exceeded the request limit. Please wait a moment and try again.";
        }

        if (message.includes('internal error') || message.includes('500')) {
            return "An unexpected error occurred with the AI service. Please try again later.";
        }
        
        return "An unexpected error occurred while communicating with the AI. Please try again.";
    }
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
}