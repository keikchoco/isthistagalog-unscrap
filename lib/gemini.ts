import { GoogleGenerativeAI } from "@google/generative-ai";
import { SCRAPWISE_SYSTEM_PROMPT, WASTE_ANALYSIS_SCHEMA } from "./constants";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
const DEFAULT_GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-flash-latest';
const FALLBACK_MODELS = [
  DEFAULT_GEMINI_MODEL,
  'gemini-flash-latest',
  'gemini-1.5-flash-latest',
  'gemini-1.5-pro-latest',
];
const MAX_RETRIES_PER_MODEL = 2;

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

function dedupeModels(models: string[]): string[] {
  return Array.from(new Set(models.map((model) => model.trim()).filter(Boolean)));
}

function shouldRetryGeminiError(error: unknown): boolean {
  const status = (error as any)?.status;
  if (typeof status === 'number' && (status === 429 || status >= 500)) {
    return true;
  }

  const message = String((error as any)?.message || '').toLowerCase();
  return (
    message.includes('500') ||
    message.includes('internal server error') ||
    message.includes('internal error encountered') ||
    message.includes('429') ||
    message.includes('resource has been exhausted') ||
    message.includes('deadline exceeded') ||
    message.includes('timeout')
  );
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function tryAnalyzeWithModel(
  modelId: string,
  base64Image: string,
  mimeType: string,
): Promise<AnalysisResult> {
  const model = genAI.getGenerativeModel({
    model: modelId,
    systemInstruction: SCRAPWISE_SYSTEM_PROMPT,
    generationConfig: {
      responseMimeType: "application/json",
      responseSchema: WASTE_ANALYSIS_SCHEMA as any,
    }
  });

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
}

export async function analyzeWaste(base64Image: string, mimeType: string): Promise<AnalysisResult> {
  const preferredModel = process.env.GEMINI_MODEL || DEFAULT_GEMINI_MODEL;
  const modelCandidates = dedupeModels([preferredModel, ...FALLBACK_MODELS]);
  let lastError: unknown;

  for (const modelId of modelCandidates) {
    for (let attempt = 1; attempt <= MAX_RETRIES_PER_MODEL; attempt++) {
      try {
        return await tryAnalyzeWithModel(modelId, base64Image, mimeType);
      } catch (error) {
        lastError = error;
        const retryable = shouldRetryGeminiError(error);
        const hasMoreAttempts = attempt < MAX_RETRIES_PER_MODEL;

        console.warn(
          `Gemini analysis failed for model ${modelId} (attempt ${attempt}/${MAX_RETRIES_PER_MODEL}).`,
          error,
        );

        if (retryable && hasMoreAttempts) {
          const backoffMs = attempt * 500;
          await delay(backoffMs);
          continue;
        }

        break;
      }
    }
  }

  console.error("Gemini Analysis Error after all retries and fallbacks:", lastError);
  throw lastError instanceof Error
    ? lastError
    : new Error("Gemini analysis failed after retries and model fallbacks.");
}

