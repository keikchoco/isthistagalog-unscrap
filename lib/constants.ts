import { SchemaType } from "@google/generative-ai";

export const SCRAPWISE_SYSTEM_PROMPT = `You are Unscrap's 3R Lab engine. Analyze the provided image of kitchen or organic waste and return ONLY a valid JSON object matching the defined schema. 

Your analysis should include:
1. Item identification with coordinates.
2. A "Texture Check" (safe_to_use) to detect rot or mold. If false, suppress any culinary suggestions.
3. Rarity grading (Everyday, Reusable, Recyclable, Rare Resource, Raw). Rarity reflects how unusual or multi-use the item is.
4. Practical repurposing suggestions (compost, fertilizer, cleaner, etc.).
5. Measurable impact: CO2 diverted in grams and peso savings (Philippine Peso ₱).
6. 3R Lab XP rewards.

Be practical, science-grounded, and safety-conscious. Use a friendly, encouraging "eco-conscious" tone.`;

export const WASTE_ANALYSIS_SCHEMA = {
  type: SchemaType.OBJECT,
  properties: {
    item: { type: SchemaType.STRING, description: "Main item identified" },
    category: { type: SchemaType.STRING, description: "e.g., Fruit Scraps, Vegetable Peels" },
    rarity: { type: SchemaType.STRING, enum: ["Everyday", "Reusable", "Recyclable", "Rare Resource", "Raw"] },
    safe_to_use: { type: SchemaType.BOOLEAN, description: "false if rot or mold is detected" },
    identifiedItems: {
      type: SchemaType.ARRAY,
      items: {
        type: SchemaType.OBJECT,
        properties: {
          name: { type: SchemaType.STRING },
          coordinates: {
            type: SchemaType.OBJECT,
            properties: {
              x: { type: SchemaType.NUMBER },
              y: { type: SchemaType.NUMBER },
              width: { type: SchemaType.NUMBER },
              height: { type: SchemaType.NUMBER }
            },
            required: ["x", "y", "width", "height"]
          }
        },
        required: ["name", "coordinates"]
      }
    },
    suggestions: {
      type: SchemaType.ARRAY,
      items: {
        type: SchemaType.OBJECT,
        properties: {
          title: { type: SchemaType.STRING },
          description: { type: SchemaType.STRING },
          type: { type: SchemaType.STRING, enum: ["fertilizer", "cleaner", "compost", "recipe", "other"] }
        },
        required: ["title", "description", "type"]
      }
    },
    co2_diverted_grams: { type: SchemaType.INTEGER },
    peso_saved: { type: SchemaType.INTEGER },
    xp_reward: { type: SchemaType.INTEGER }
  },
  required: ["item", "category", "rarity", "safe_to_use", "identifiedItems", "suggestions", "co2_diverted_grams", "peso_saved", "xp_reward"]
};


