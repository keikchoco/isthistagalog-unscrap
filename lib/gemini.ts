import { GoogleGenerativeAI } from "@google/generative-ai";
import { SCRAPWISE_SYSTEM_PROMPT, WASTE_ANALYSIS_SCHEMA } from "./constants";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
const DEFAULT_GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-flash-latest';

export interface AnalysisResult {
  item: string;
  category: string;
  rarity: 'Everyday' | 'Reusable' | 'Recyclable' | 'Rare Resource' | 'Raw';
  safe_to_use: boolean;
  identifiedItems: {
    name: string;
    coordinates: { x: number; y: number; width: number; height: number };
  }[];
  suggestions: {
    title: string;
    description: string;
    type: 'fertilizer' | 'cleaner' | 'compost' | 'recipe' | 'other';
  }[];
  co2_diverted_grams: number;
  peso_saved: number;
  xp_reward: number;
}

export async function analyzeWaste(base64Image: string, mimeType: string): Promise<AnalysisResult> {
  const modelId = process.env.GEMINI_MODEL || DEFAULT_GEMINI_MODEL;
  const model = genAI.getGenerativeModel({
    model: modelId,
    systemInstruction: SCRAPWISE_SYSTEM_PROMPT,
    generationConfig: {
      responseMimeType: "application/json",
      responseSchema: WASTE_ANALYSIS_SCHEMA as any,
    }
  });

  try {
    const result = await model.generateContent([
      { text: "Analyze the kitchen waste in this image." },
      { inlineData: { data: base64Image, mimeType } }
    ]);
    
    const response = await result.response;
    const text = response.text();
    
    if (!text) {
      throw new Error("Empty response from AI");
    }

    return JSON.parse(text) as AnalysisResult;
  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    throw error;
  }
}

