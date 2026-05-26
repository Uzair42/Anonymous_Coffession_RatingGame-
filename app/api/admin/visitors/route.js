import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Visitor from '@/models/Visitor';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/authOptions';

export async function GET(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();
    const visitors = await Visitor.find().sort({ lastSeen: -1 });
    return NextResponse.json(visitors);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// Bust turbopack cache
