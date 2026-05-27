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

    const cleanAlias = alias.trim();

    // Enforce case-insensitive uniqueness check:
    // Reject if a different device (with a different IP) has claimed this alias.
    const duplicate = await Visitor.findOne({
      alias: { $regex: new RegExp(`^${cleanAlias}$`, 'i') },
      'deviceFingerprint.ip': { $ne: clientInfo.ip }
    });

    if (duplicate) {
      return NextResponse.json({ 
        error: 'This ghost alias is already claimed by another node in the void. Choose another.' 
      }, { status: 400 });
    }

    // Lookup existing profile matching BOTH device IP and this specific alias.
    // This allows the same device fingerprint/location to register multiple different names cleanly.
    let visitor = await Visitor.findOne({ 
      'deviceFingerprint.ip': clientInfo.ip, 
      alias: cleanAlias 
    });

    if (visitor) {
      visitor.lastSeen = new Date();
      visitor.visitCount += 1;
      visitor.deviceFingerprint = clientInfo;
      
      if (location && location.lat && location.lng) {
        visitor.location = location;
      }
      
      await visitor.save();
    } else {
      visitor = new Visitor({
        alias: cleanAlias,
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
