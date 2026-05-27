import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Confession from '@/models/Confession';
import { getClientInfo } from '@/lib/clientInfo';
import { isBanned } from '@/lib/banCheck';

export async function GET(req) {
  try {
    const clientInfo = getClientInfo(req);
    await dbConnect();
    const confessions = await Confession.find({ status: 'Accepted' }).sort({ createdAt: -1 });
    
    // 5-minute cooling window:
    // Confessions are only public after 5 minutes, but visible to their author immediately.
    const now = new Date();
    const visibleConfessions = confessions.filter(c => {
      const timeDiffMs = now - new Date(c.createdAt);
      const isAuthor = c.deviceFingerprint?.ip === clientInfo.ip;
      return timeDiffMs >= 5 * 60 * 1000 || isAuthor;
    });

    const publicConfessions = visibleConfessions.map(c => ({
      _id: c._id,
      bodyText: c.bodyText,
      authorName: c.authorName,
      createdAt: c.createdAt,
      deviceFingerprint: {
        ip: c.deviceFingerprint?.ip // pass IP down securely so the frontend can check if the current user is the author
      },
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
      status: 'Accepted' // Set to Accepted automatically by default (no admin required!)
    });
    await newConfession.save();

    return NextResponse.json({ 
      message: 'Confession posted successfully. It will go live for everyone in 5 minutes.', 
      confession: newConfession 
    }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(req) {
  try {
    const clientInfo = getClientInfo(req);
    const banned = await isBanned(clientInfo.ip);
    if (banned) {
      return NextResponse.json({ error: 'Your device has been banned.' }, { status: 403 });
    }

    const { id, bodyText } = await req.json();
    if (!id || !bodyText) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    await dbConnect();
    const confession = await Confession.findById(id);
    if (!confession) {
      return NextResponse.json({ error: 'Confession not found' }, { status: 404 });
    }

    // Check if the current user is the author
    if (confession.deviceFingerprint?.ip !== clientInfo.ip) {
      return NextResponse.json({ error: 'Unauthorized to edit this confession' }, { status: 403 });
    }

    // Check if the 5-minute window has passed
    const now = new Date();
    const timeDiffMs = now - new Date(confession.createdAt);
    if (timeDiffMs > 5 * 60 * 1000) {
      return NextResponse.json({ error: 'The 5-minute editing window has expired.' }, { status: 400 });
    }

    // Update confession text
    confession.bodyText = bodyText;
    await confession.save();

    return NextResponse.json({ message: 'Confession updated successfully.' });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
