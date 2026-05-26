import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Poll from '@/models/Poll';
import { getClientInfo } from '@/lib/clientInfo';
import { isBanned } from '@/lib/banCheck';

export async function GET(req) {
  try {
    const clientInfo = getClientInfo(req);
    await dbConnect();
    const polls = await Poll.find({ status: 'Active' }).lean();
    
    const formattedPolls = polls.map(p => {
      const voteCounts = {};
      const votesArray = p.votes || [];
      
      votesArray.forEach(v => {
        voteCounts[v.option] = (voteCounts[v.option] || 0) + 1;
      });

      const userVote = votesArray.find(v => v.deviceFingerprint?.ip === clientInfo.ip);

      const justifications = votesArray
        .filter(v => v.description && v.description.trim() !== '')
        .map(v => ({
          alias: v.alias || 'Ghost',
          option: v.option,
          description: v.description,
          createdAt: v.createdAt || new Date()
        }))
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

      return {
        _id: p._id,
        question: p.question,
        options: p.options,
        voteCounts,
        authorName: p.authorName || 'Anonymous',
        hasVoted: !!userVote,
        userVotedOption: userVote ? userVote.option : null,
        justifications
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
