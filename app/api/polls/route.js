import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Poll from '@/models/Poll';
import { getClientInfo } from '@/lib/clientInfo';
import { isBanned } from '@/lib/banCheck';

export async function GET() {
  try {
    await dbConnect();
    const polls = await Poll.find({ status: 'Active' }).lean();
    
    const formattedPolls = polls.map(p => {
      const voteCounts = {};
      p.votes.forEach(v => {
        voteCounts[v.option] = (voteCounts[v.option] || 0) + 1;
      });
      return {
        _id: p._id,
        question: p.question,
        options: p.options,
        voteCounts,
        authorName: p.authorName || 'Anonymous'
      };
    });

    return NextResponse.json(formattedPolls);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const { question, options, authorName } = await req.json();
    if (!question || !options || options.length < 2) {
      return NextResponse.json({ error: 'Invalid poll data' }, { status: 400 });
    }

    const clientInfo = getClientInfo(req);
    if (await isBanned(clientInfo.ip)) {
      return NextResponse.json({ error: 'Your device is banned from posting.' }, { status: 403 });
    }

    await dbConnect();
    const newPoll = new Poll({ 
      question, 
      options, 
      authorName: authorName || 'Anonymous',
      status: 'Active' 
    });
    await newPoll.save();
    return NextResponse.json(newPoll, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
