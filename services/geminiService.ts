
import { GoogleGenAI, Type } from "@google/genai";

export const improveLabelContent = async (topic: string, currentText: string) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Melhore e profissionalize o seguinte texto para uma etiqueta de produto: "${currentText}". O tópico é "${topic}". Seja conciso e profissional em português.`,
  });

  return response.text || currentText;
};

export const generateNutritionTable = async (productName: string) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Gere uma tabela nutricional realista para o produto "${productName}" no formato JSON.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING },
            amount: { type: Type.STRING },
            dailyValue: { type: Type.STRING },
          },
          required: ["name", "amount", "dailyValue"]
        }
      }
    }
  });

  try {
    const text = response.text.trim();
    return JSON.parse(text);
  } catch (e) {
    console.error("Failed to parse AI response", e);
    return null;
  }
};
