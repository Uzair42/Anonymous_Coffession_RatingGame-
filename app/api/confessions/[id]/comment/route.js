import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Confession from '@/models/Confession';
import { getClientInfo } from '@/lib/clientInfo';
import { isBanned } from '@/lib/banCheck';

export async function POST(req, { params }) {
  try {
    const { id } = await params;
    const { bodyText, authorName } = await req.json();
    
    if (!bodyText || !authorName) return NextResponse.json({ error: 'Missing fields' }, { status: 400 });

    const clientInfo = getClientInfo(req);
    if (await isBanned(clientInfo.ip)) {
      return NextResponse.json({ error: 'Your device has been banned from posting.' }, { status: 403 });
    }

    await dbConnect();
    const confession = await Confession.findById(id);
    if (!confession) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    confession.comments.push({
      bodyText,
      authorName,
      deviceFingerprint: clientInfo
    });

    await confession.save();
    return NextResponse.json({ message: 'Comment added' }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
