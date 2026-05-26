import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Confession from '@/models/Confession';
import { getClientInfo } from '@/lib/clientInfo';

export async function POST(req, { params }) {
  try {
    const { id } = await params;
    const { emoji, alias } = await req.json();
    const clientInfo = getClientInfo(req);
    const ip = clientInfo.ip;

    await dbConnect();
    const confession = await Confession.findById(id);
    if (!confession) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    let reaction = confession.reactions.find(r => r.emoji === emoji);
    if (!reaction) {
      confession.reactions.push({ emoji, users: [{ ip, alias: alias || 'Ghost' }] });
    } else {
      const existingUserIndex = reaction.users.findIndex(u => u.ip === ip);
      if (existingUserIndex === -1) {
        reaction.users.push({ ip, alias: alias || 'Ghost' });
      } else {
        reaction.users.splice(existingUserIndex, 1);
      }
    }

    confession.markModified('reactions');
    await confession.save();
    return NextResponse.json({ message: 'Reaction toggled' }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
