import { GoogleGenAI, Chat, Type, GenerateContentResponse } from '@google/genai';
import { InterviewSummary, LanguageCode, LANGUAGES } from '../types';

const getSystemInstruction = (topic: string, languageCode: LanguageCode) => {
    const languageName = LANGUAGES[languageCode];
    return `You are an expert-level interview coach for a candidate applying for a ${topic} position.
Your role is to conduct a realistic job interview in ${languageName}. All your questions and feedback must be in ${languageName}.
- Start the interview with a standard opening question in ${languageName}.
- Ask one question at a time.
- After the user answers a question, provide constructive feedback based on the STAR method (Situation, Task, Action, Result), clarity, and conciseness. Format the feedback in markdown.
- After providing feedback, ask the next logical interview question.
- Keep the interview to about 5 questions. After the 5th question's feedback, conclude the interview by saying "Thank you for your time. That's all the questions I have for you today." (or its equivalent in ${languageName}).
- Your tone should be professional, encouraging, and helpful.
`;
}

const getFeedbackPrompt = (question: string, answer: string) => `
The user was asked: "${question}"
They responded: "${answer}"

Please provide feedback on their response. Analyze it for clarity, conciseness, and effective use of the STAR method where applicable. 
Format your feedback in markdown with these headings:
- **Clarity**
- **Conciseness**
- **STAR Method**

After the feedback, present the next interview question. If you have asked around 5 questions, conclude the interview.
`;

export class GeminiService {
  private static ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  public static async startInterviewSession(topic: string, language: LanguageCode): Promise<{ chat: Chat; firstQuestion: string }> {
    const chat = this.ai.chats.create({
      model: 'gemini-2.5-flash',
      config: {
        systemInstruction: getSystemInstruction(topic, language),
      },
    });

    const response: GenerateContentResponse = await chat.sendMessage({ message: "Let's start the interview." });
    return { chat, firstQuestion: response.text };
  }

  public static async sendAnswerAndGetFeedback(chat: Chat, question: string, answer: string): Promise<{ feedback: string; nextQuestion: string }> {
    const prompt = getFeedbackPrompt(question, answer);
    const response: GenerateContentResponse = await chat.sendMessage({ message: prompt });
    const fullText = response.text;
    
    const feedbackRegex = /([\s\S]*?)(\n\n.*Next Question:|Next Question:|\n\n.*Here is your next question:|Here is your next question:|\n\n.*What is your next question\?|Thank you for your time\.)/i;
    const match = fullText.match(feedbackRegex);

    if (match) {
        let feedback = match[1].trim();
        let nextQuestion = fullText.replace(feedback, '').replace(match[2], '').trim();
        
        if (nextQuestion.startsWith("Next Question:") || nextQuestion.startsWith("Here is your next question:")) {
            nextQuestion = nextQuestion.split(":").slice(1).join(":").trim();
        }

        if (fullText.toLowerCase().includes("thank you for your time")) {
            nextQuestion = "Thank you for your time. That's all the questions I have for you today.";
        }

        return { feedback, nextQuestion };
    }
    
    // Fallback if regex fails
    const parts = fullText.split('Next Question:');
    if (parts.length > 1) {
      return { feedback: parts[0].trim(), nextQuestion: parts[1].trim() };
    }

    return { feedback: "Could not parse feedback.", nextQuestion: fullText };
  }

  public static async getInterviewSummary(fullTranscript: string): Promise<InterviewSummary> {
    const response = await this.ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Based on the following interview transcript, please provide a comprehensive summary of the candidate's performance. Highlight strengths and areas for improvement. Provide an overall score out of 10 and a brief summary paragraph.\n\nTranscript:\n${fullTranscript}`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            strengths: {
              type: Type.ARRAY,
              description: "A list of the candidate's key strengths.",
              items: { type: Type.STRING },
            },
            areasForImprovement: {
              type: Type.ARRAY,
              description: "A list of areas where the candidate can improve.",
              items: { type: Type.STRING },
            },
            overallScore: {
              type: Type.NUMBER,
              description: "An overall performance score out of 10.",
            },
            summary: {
                type: Type.STRING,
                description: "A brief summary paragraph of the overall performance."
            }
          },
          required: ["strengths", "areasForImprovement", "overallScore", "summary"],
        },
      },
    });

    try {
        const jsonText = response.text.trim();
        return JSON.parse(jsonText) as InterviewSummary;
    } catch (error) {
        console.error("Failed to parse summary JSON:", response.text);
        throw new Error("Could not parse the summary from the AI response.");
    }
  }
}