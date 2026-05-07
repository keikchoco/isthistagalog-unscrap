import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import { User } from '@/lib/models';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email')?.toLowerCase();
    const name = searchParams.get('name');

    if (!email) {
      return NextResponse.json({ error: 'Email required' }, { status: 400 });
    }

    await dbConnect();
    let user = await User.findOne({ email });

    if (!user) {
      user = await User.create({
        email,
        displayName: name || email.split('@')[0],
        rank: 'Reducer',
        totalXP: 0,
        impactScore: 0,
        matterDiverted: 0
      });
    }

    return NextResponse.json(user);
  } catch (error) {
    return NextResponse.json({ error: 'Fetch failed' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const email = typeof body.email === 'string' ? body.email.toLowerCase() : '';
    const displayName = typeof body.displayName === 'string'
      ? body.displayName.trim()
      : typeof body.name === 'string'
        ? body.name.trim()
        : '';

    if (!email) {
      return NextResponse.json({ error: 'Email required' }, { status: 400 });
    }

    if (!displayName) {
      return NextResponse.json({ error: 'Display name required' }, { status: 400 });
    }

    await dbConnect();

    const user = await User.findOneAndUpdate(
      { email },
      {
        $set: {
          displayName,
        },
      },
      {
        new: true,
        upsert: true,
        setDefaultsOnInsert: true,
      },
    );

    return NextResponse.json(user);
  } catch (error) {
    return NextResponse.json({ error: 'Update failed' }, { status: 500 });
  }
}
