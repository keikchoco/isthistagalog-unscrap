import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function POST(request: Request) {
  try {
    const { message } = await request.json();

    if (!message) {
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 },
      );
    }

    const modelId = process.env.GEMINI_MODEL || "gemini-flash-latest";
    const systemInstruction = `
You are Scrappy, an eco companion focused on kitchen scraps, composting, reuse, recycling, and waste reduction.

Rules:
- Reply only with the final response.
- Never reveal reasoning or internal thoughts.
- Keep replies short, friendly, and practical.
- Do not repeat yourself.
- Do not act as a general assistant.
- Mention user ranks only if explicitly provided.
- Encourage scanning scraps when relevant.
`;

    const model = genAI.getGenerativeModel({
      model: modelId,
      systemInstruction,
    });

    // Simple retry with exponential backoff for 429 responses
    const maxAttempts = 4;
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        const result = await model.generateContent({
          contents: [
            {
              role: "user",
              parts: [
                {
                  text: message,
                },
              ],
            },
          ],
          generationConfig: {
            temperature: 0.2,
            topP: 0.8,
            topK: 20,
            maxOutputTokens: 80,
          },
        });
        const response = await result.response;

        let text = response.text().trim();

        text = text
          .replace(/^\s*[\*\-].*$/gm, "")
          .replace(/Wait,.*$/gim, "")
          .replace(/Self-correction.*$/gim, "")
          .replace(/Constraints:.*$/gim, "")
          .trim();

        const quoteMatches = text.match(/"([^"]+)"/g);

        if (quoteMatches?.length) {
          text = quoteMatches[quoteMatches.length - 1].replace(/"/g, "");
        }
        console.log(`Chat response (attempt ${attempt}):`, text);
        return NextResponse.json({ text });
      } catch (err: any) {
        const is429 = err && (err.status === 429 || err?.cause?.status === 429);
        console.error(`Chat attempt ${attempt} failed:`, err?.message || err);
        if (!is429 || attempt === maxAttempts) {
          console.error("Chat API error:", err);
          return NextResponse.json({ error: "Chat failed" }, { status: 500 });
        }

        // If API provided RetryInfo, try to parse a delay
        let delayMs = 1000 * Math.pow(2, attempt); // exponential backoff
        try {
          const retryInfo =
            err?.details?.find((d: any) => d["@type"]?.includes("RetryInfo")) ||
            err?.cause?.retryDelay;
          if (retryInfo && typeof retryInfo === "string") {
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
    console.error("Chat API handler error:", error);
    return NextResponse.json({ error: "Chat failed" }, { status: 500 });
  }
}
