import { GoogleGenAI, Type } from "@google/genai";

const API_KEY = (import.meta as any).env.VITE_GEMINI_API_KEY;

export const askGemini = async (prompt: string, imageBase64?: string) => {
  const ai = new GoogleGenAI({ apiKey: API_KEY });
  const model = 'gemini-3-flash-preview';

  const parts: any[] = [{ text: prompt }];
  if (imageBase64) {
    parts.push({
      inlineData: {
        mimeType: "image/jpeg",
        data: imageBase64.split(',')[1] || imageBase64
      }
    });
  }

  try {
    const response = await ai.models.generateContent({
      model,
      contents: { parts },
      config: {
        systemInstruction: "You are a helpful educational tutor. Provide clear, concise, and accurate explanations for student questions. Use markdown for formatting.",
      }
    });
    return response.text || "I'm sorry, I couldn't generate an answer at this time.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Error: Could not reach the AI tutor.";
  }
};

export const generateQuiz = async (subject: string): Promise<any> => {
  const ai = new GoogleGenAI({ apiKey: API_KEY });
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Generate a 5-question multiple choice quiz about ${subject} for a student.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            questions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  question: { type: Type.STRING },
                  options: { type: Type.ARRAY, items: { type: Type.STRING } },
                  correctAnswer: { type: Type.INTEGER, description: "0-based index of correct option" }
                },
                required: ["question", "options", "correctAnswer"]
              }
            }
          },
          required: ["title", "questions"]
        }
      }
    });
    
    const text = response.text;
    if (!text) throw new Error("Empty quiz response from AI");
    
    const cleanedText = text.replace(/^```json\s*/, '').replace(/\s*```$/, '').trim();
    return JSON.parse(cleanedText);
  } catch (error) {
    console.error("Quiz Gen Error:", error);
    throw error;
  }
};