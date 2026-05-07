import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import { User } from '@/lib/models';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');
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
