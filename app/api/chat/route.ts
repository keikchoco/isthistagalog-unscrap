import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function POST(request: Request) {
  try {
    const { message } = await request.json();
    
    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash",
      systemInstruction: "You are Scrappy, Unscrap's eco companion. You help users repurpose kitchen scraps, understand sustainable living, and navigate The 3R Lab. Keep responses short, friendly, and practical. You are not a general-purpose assistant — stay focused on waste reduction, reuse, recycling, and composting. When relevant, reference the user's current rank (Reducer, Reuser, Recycler, Restorer, Zero Waste) and encourage them to scan more items."
    });

    const result = await model.generateContent(message);
    const response = await result.response;
    const text = response.text();

    return NextResponse.json({ text });
  } catch (error) {
    console.error('Chat API error:', error);
    return NextResponse.json({ error: 'Chat failed' }, { status: 500 });
  }
}


