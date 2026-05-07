import { NextResponse } from 'next/server';
import { analyzeWaste } from '@/lib/gemini';
import dbConnect from '@/lib/dbConnect';
import { Scan, User } from '@/lib/models';

export async function POST(request: Request) {
  try {
    const { image, mimeType, userId } = await request.json();
    
    if (!image) {
      return NextResponse.json({ error: 'Image is required' }, { status: 400 });
    }

    const analysis = await analyzeWaste(image, mimeType);
    
    await dbConnect();

    // Save scan to DB
    const newScan = await Scan.create({
      ...analysis,
      userId,
      timestamp: new Date()
    });

    // Update user stats (mocked user for now)
    await User.findOneAndUpdate(
      { email: 'manaigeurie20@gmail.com' }, // Using provided user email as default for now
      { 
        $inc: { 
          totalXP: analysis.xp_reward,
          impactScore: analysis.peso_saved,
          matterDiverted: (analysis.co2_diverted_grams / 1000) // Rough conversion
        } 
      },
      { upsert: true }
    );

    return NextResponse.json(analysis);
  } catch (error) {
    console.error('Scan API error:', error);
    return NextResponse.json({ error: 'Analysis failed' }, { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    await dbConnect();
    const scans = await Scan.find({ userId }).sort({ timestamp: -1 }).limit(10);
    
    return NextResponse.json(scans);
  } catch (error) {
    return NextResponse.json({ error: 'Fetch failed' }, { status: 500 });
  }
}
