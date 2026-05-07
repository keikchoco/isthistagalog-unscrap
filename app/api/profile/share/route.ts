import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const emailParam = searchParams.get('email');
    const email = typeof emailParam === 'string' ? emailParam.toLowerCase() : '';

    if (!email) {
      return NextResponse.json({ error: 'Email required' }, { status: 400 });
    }

    const client = await clientPromise;
    if (!client) {
      return NextResponse.json({ error: 'Database unavailable' }, { status: 500 });
    }

    const db = process.env.MONGODB_DB ? client.db(process.env.MONGODB_DB) : client.db();
    const authUser = await db.collection('user').findOne({ email });

    if (!authUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const accountId = authUser._id?.toString?.() || authUser.id || null;
    if (!accountId) {
      return NextResponse.json({ error: 'Account not found' }, { status: 404 });
    }

    return NextResponse.json({ accountId });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to resolve account id' }, { status: 500 });
  }
}