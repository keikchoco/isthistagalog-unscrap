import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import { Pin } from '@/lib/models';

export async function GET() {
  try {
    await dbConnect();
    const pins = await Pin.find({}).sort({ createdAt: -1 });
    return NextResponse.json(pins);
  } catch (error) {
    return NextResponse.json({ error: 'Fetch failed' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    await dbConnect();
    
    const newPin = await Pin.create({
      ...data,
      createdAt: new Date()
    });

    return NextResponse.json(newPin);
  } catch (error) {
    return NextResponse.json({ error: 'Create failed' }, { status: 500 });
  }
}
