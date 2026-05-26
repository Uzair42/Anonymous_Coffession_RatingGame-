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
      const avgScore = ratingArray.length > 0 ? (totalScore / ratingArray.length) : 0;
      
      // Calculate star breakdown count (5, 4, 3, 2, 1)
      const breakdown = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
      ratingArray.forEach(rt => {
        if (rt.score >= 1 && rt.score <= 5) {
          breakdown[rt.score]++;
        }
      });

      // Map the reviews/comments list (excluding sensitive IP info)
      const reviews = ratingArray.map(rt => ({
        score: rt.score,
        alias: rt.alias || 'Ghost',
        comment: rt.comment || '',
        createdAt: rt.createdAt || new Date()
      })).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

      return {
        _id: r.targetStudentName,
        averageScore: avgScore,
        count: ratingArray.length,
        breakdown,
        reviews
      };
    }).sort((a, b) => b.averageScore - a.averageScore);
    return NextResponse.json(formatted);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const { targetStudentName, score, alias, comment } = await req.json();
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
         // Update existing score and comment
         targetDoc.ratings[existingRatingIndex].score = score;
         targetDoc.ratings[existingRatingIndex].alias = alias || 'Ghost';
         targetDoc.ratings[existingRatingIndex].comment = comment || '';
         targetDoc.ratings[existingRatingIndex].createdAt = new Date();
      } else {
         targetDoc.ratings.push({ score, alias: alias || 'Ghost', comment: comment || '', deviceFingerprint: clientInfo });
      }
      await targetDoc.save();
      return NextResponse.json(targetDoc, { status: 200 });
    } else {
      const newRating = new Rating({
        targetStudentName,
        ratings: [{ score, alias: alias || 'Ghost', comment: comment || '', deviceFingerprint: clientInfo }]
      });
      await newRating.save();
      return NextResponse.json(newRating, { status: 201 });
    }
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
