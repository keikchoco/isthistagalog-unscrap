import { NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';
import clientPromise from '@/lib/mongodb';

export async function GET(
  request: Request,
  context: { params: Promise<{ accountId: string }> },
) {
  try {
    const params = await context.params;
    const accountId = decodeURIComponent(params.accountId || '');

    if (!accountId) {
      return NextResponse.json({ error: 'Account id required' }, { status: 400 });
    }

    const client = await clientPromise;
    if (!client) {
      return NextResponse.json({ error: 'Database unavailable' }, { status: 500 });
    }

    const db = process.env.MONGODB_DB ? client.db(process.env.MONGODB_DB) : client.db();
    let authUser: any = null;

    if (ObjectId.isValid(accountId)) {
      authUser = await db.collection('user').findOne({ _id: new ObjectId(accountId) } as any);
    }

    if (!authUser) {
      authUser = await db.collection('user').findOne({ $or: [{ _id: accountId }, { id: accountId }] } as any);
    }

    if (!authUser?.email) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    const email = String(authUser.email).toLowerCase();
    const appUser = await db.collection('users').findOne({ email });
    const scans = await db
      .collection('scans')
      .find({ userId: email })
      .sort({ timestamp: -1 })
      .limit(10)
      .toArray();

    const user = {
      email,
      name: authUser.name || appUser?.displayName || email.split('@')[0],
      displayName: appUser?.displayName || authUser.name || email.split('@')[0],
    };

    const profileData = {
      displayName: appUser?.displayName || authUser.name || email.split('@')[0],
      rank: appUser?.rank || 'Reducer',
      totalXP: appUser?.totalXP || 0,
      impactScore: appUser?.impactScore || 0,
      matterDiverted: appUser?.matterDiverted || 0,
    };

    return NextResponse.json({ user, profileData, scanHistory: scans, accountId });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to load profile' }, { status: 500 });
  }
}