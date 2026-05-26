import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Settings from '@/models/Settings';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";

export async function PUT(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'Admin') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { allowedEmojis } = await req.json();
    await dbConnect();
    
    let settings = await Settings.findOne();
    if (!settings) {
      settings = new Settings({ allowedEmojis });
    } else {
      settings.allowedEmojis = allowedEmojis;
    }
    await settings.save();
    return NextResponse.json(settings);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
