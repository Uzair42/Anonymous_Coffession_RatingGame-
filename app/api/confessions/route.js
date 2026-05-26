import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Confession from '@/models/Confession';
import { getClientInfo } from '@/lib/clientInfo';
import { isBanned } from '@/lib/banCheck';

export async function GET(req) {
  try {
    await dbConnect();
    const confessions = await Confession.find({ status: 'Accepted' }).sort({ createdAt: -1 });
    // Strip device fingerprint for public API
    const publicConfessions = confessions.map(c => ({
      _id: c._id,
      bodyText: c.bodyText,
      authorName: c.authorName,
      createdAt: c.createdAt,
      comments: c.comments?.map(comment => ({
        _id: comment._id,
        bodyText: comment.bodyText,
        authorName: comment.authorName,
        createdAt: comment.createdAt
      })) || [],
      reactions: c.reactions?.map(r => ({
        emoji: r.emoji,
        count: r.users?.length || 0,
        aliases: r.users?.map(u => u.alias) || []
      })) || []
    }));
    return NextResponse.json(publicConfessions);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const clientInfo = getClientInfo(req);
    const banned = await isBanned(clientInfo.ip);
    if (banned) {
      return NextResponse.json({ error: 'Your device has been banned from posting.' }, { status: 403 });
    }

    const { bodyText, authorName } = await req.json();
    if (!bodyText || !authorName) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    await dbConnect();
    const newConfession = new Confession({
      bodyText,
      authorName,
      deviceFingerprint: clientInfo,
      status: 'Pending'
    });
    await newConfession.save();

    return NextResponse.json({ message: 'Confession submitted successfully, pending approval.' }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
