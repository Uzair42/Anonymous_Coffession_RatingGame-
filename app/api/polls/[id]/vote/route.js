import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Poll from '@/models/Poll';
import { getClientInfo } from '@/lib/clientInfo';
import { isBanned } from '@/lib/banCheck';

export async function POST(req, { params }) {
  try {
    const { id } = params;
    const clientInfo = getClientInfo(req);
    const banned = await isBanned(clientInfo.ip);
    if (banned) {
      return NextResponse.json({ error: 'Your device has been banned from posting.' }, { status: 403 });
    }

    const { option, description } = await req.json();
    if (!option) {
      return NextResponse.json({ error: 'Missing option' }, { status: 400 });
    }

    await dbConnect();
    const poll = await Poll.findById(id);
    if (!poll || poll.status !== 'Active') {
      return NextResponse.json({ error: 'Poll not found or inactive' }, { status: 404 });
    }

    if (!poll.options.includes(option)) {
      return NextResponse.json({ error: 'Invalid option' }, { status: 400 });
    }

    // Check if IP already voted
    const alreadyVoted = poll.votes.some(v => v.deviceFingerprint.ip === clientInfo.ip);
    if (alreadyVoted) {
      return NextResponse.json({ error: 'You have already voted in this poll' }, { status: 403 });
    }

    poll.votes.push({
      option,
      description,
      deviceFingerprint: clientInfo
    });
    await poll.save();

    return NextResponse.json({ message: 'Vote submitted successfully.' }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
