import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Rating from '@/models/Rating';
import { getClientInfo } from '@/lib/clientInfo';
import { isBanned } from '@/lib/banCheck';

export async function GET() {
  try {
    await dbConnect();
    const ratings = await Rating.find().lean();
    const formatted = ratings.map(r => {
      const ratingArray = r.ratings || [];
      const totalScore = ratingArray.reduce((a, b) => a + b.score, 0);
      const avgScore = ratingArray.length > 0 ? (totalScore / ratingArray.length) : (r.score || 0);
      return {
        _id: r.targetStudentName,
        averageScore: avgScore,
        count: ratingArray.length > 0 ? ratingArray.length : 1
      };
    }).sort((a, b) => b.averageScore - a.averageScore);
    return NextResponse.json(formatted);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const { targetStudentName, score, alias } = await req.json();
    if (!targetStudentName || !score || score < 1 || score > 5) {
      return NextResponse.json({ error: 'Invalid data' }, { status: 400 });
    }

    const clientInfo = getClientInfo(req);
    if (await isBanned(clientInfo.ip)) {
      return NextResponse.json({ error: 'Your device is banned.' }, { status: 403 });
    }

    await dbConnect();
    
    // Find existing target (case insensitive)
    let targetDoc = await Rating.findOne({ targetStudentName: new RegExp(`^${targetStudentName}$`, 'i') });
    
    if (targetDoc) {
      // Check if this IP already rated
      const existingRatingIndex = targetDoc.ratings.findIndex(r => r.deviceFingerprint?.ip === clientInfo.ip);
      if (existingRatingIndex > -1) {
         // Update existing score
         targetDoc.ratings[existingRatingIndex].score = score;
         targetDoc.ratings[existingRatingIndex].alias = alias || 'Ghost';
      } else {
         targetDoc.ratings.push({ score, alias: alias || 'Ghost', deviceFingerprint: clientInfo });
      }
      await targetDoc.save();
      return NextResponse.json(targetDoc, { status: 200 });
    } else {
      const newRating = new Rating({
        targetStudentName,
        ratings: [{ score, alias: alias || 'Ghost', deviceFingerprint: clientInfo }]
      });
      await newRating.save();
      return NextResponse.json(newRating, { status: 201 });
    }
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
