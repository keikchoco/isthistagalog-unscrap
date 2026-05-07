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

    if (!data?.userId || !data?.title || !data?.location?.lat || !data?.location?.lng) {
      return NextResponse.json({ error: 'userId, title, and location are required' }, { status: 400 });
    }

    // Enforce one community hub pin per user.
    const existingPin = await Pin.findOne({ userId: data.userId });
    if (existingPin) {
      return NextResponse.json(
        { error: 'You already created a hub point.', existingPin },
        { status: 409 },
      );
    }
    
    const newPin = await Pin.create({
      ...data,
      type: data.type || 'drop-off',
      createdAt: new Date()
    });

    return NextResponse.json(newPin);
  } catch (error) {
    return NextResponse.json({ error: 'Create failed' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const data = await request.json();
    await dbConnect();

    const { id, userId, title, description, location } = data || {};
    if (!id || !userId) {
      return NextResponse.json({ error: 'Pin id and userId are required' }, { status: 400 });
    }

    const pin = await Pin.findById(id);
    if (!pin) {
      return NextResponse.json({ error: 'Pin not found' }, { status: 404 });
    }

    // Only pin owner can edit.
    if (pin.userId !== userId) {
      return NextResponse.json({ error: 'You can only edit your own hub point.' }, { status: 403 });
    }

    if (typeof title === 'string' && title.trim()) {
      pin.title = title.trim();
    }
    if (typeof description === 'string') {
      pin.description = description.trim();
    }
    if (location && typeof location.lat === 'number' && typeof location.lng === 'number') {
      pin.location = { lat: location.lat, lng: location.lng };
    }

    await pin.save();
    return NextResponse.json(pin);
  } catch (error) {
    return NextResponse.json({ error: 'Update failed' }, { status: 500 });
  }
}
