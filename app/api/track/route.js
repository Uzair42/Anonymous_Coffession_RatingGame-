import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Visitor from '@/models/Visitor';
import { getClientInfo } from '@/lib/clientInfo';

export async function POST(req) {
  try {
    const { alias, location } = await req.json();
    if (!alias) {
      return NextResponse.json({ error: 'Alias required' }, { status: 400 });
    }

    const clientInfo = getClientInfo(req);
    await dbConnect();

    // Check if this IP already exists
    let visitor = await Visitor.findOne({ 'deviceFingerprint.ip': clientInfo.ip });

    if (visitor) {
      visitor.alias = alias;
      visitor.lastSeen = new Date();
      visitor.visitCount += 1;
      visitor.deviceFingerprint = clientInfo;
      
      // Only update location if new valid location is provided
      if (location && location.lat && location.lng) {
        visitor.location = location;
      }
      
      await visitor.save();
    } else {
      visitor = new Visitor({
        alias,
        deviceFingerprint: clientInfo,
        location: (location && location.lat) ? location : undefined,
        lastSeen: new Date(),
        visitCount: 1
      });
      await visitor.save();
    }

    return NextResponse.json({ success: true, visitor }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
