import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function POST(request: Request) {
  try {
    const { message } = await request.json();

    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    const modelId = process.env.GEMINI_MODEL || 'gemini-flash-latest';
    const systemInstruction = "You are Scrappy, Unscrap's eco companion. You help users repurpose kitchen scraps, understand sustainable living, and navigate The 3R Lab. Keep responses short, friendly, and practical. You are not a general-purpose assistant — stay focused on waste reduction, reuse, recycling, and composting. When relevant, reference the user's current rank (Reducer, Reuser, Recycler, Restorer, Zero Waste) and encourage them to scan more items.";

    const model = genAI.getGenerativeModel({ model: modelId, systemInstruction });

    // Simple retry with exponential backoff for 429 responses
    const maxAttempts = 4;
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        const result = await model.generateContent(message);
        const response = await result.response;
        const text = response.text();
        return NextResponse.json({ text });
      } catch (err: any) {
        const is429 = err && (err.status === 429 || err?.cause?.status === 429);
        console.error(`Chat attempt ${attempt} failed:`, err?.message || err);
        if (!is429 || attempt === maxAttempts) {
          console.error('Chat API error:', err);
          return NextResponse.json({ error: 'Chat failed' }, { status: 500 });
        }

        // If API provided RetryInfo, try to parse a delay
        let delayMs = 1000 * Math.pow(2, attempt); // exponential backoff
        try {
          const retryInfo = err?.details?.find((d: any) => d['@type']?.includes('RetryInfo')) || err?.cause?.retryDelay;
          if (retryInfo && typeof retryInfo === 'string') {
            // retryInfo might be like '22s' or '22.5s'
            const match = retryInfo.match(/(\d+(?:\.\d+)?)s/);
            if (match) delayMs = Math.ceil(parseFloat(match[1]) * 1000) + 200;
          }
        } catch (e) {
          // ignore parse errors
        }

        await new Promise((res) => setTimeout(res, delayMs));
        continue;
      }
    }
  } catch (error) {
    console.error('Chat API handler error:', error);
    return NextResponse.json({ error: 'Chat failed' }, { status: 500 });
  }
}


