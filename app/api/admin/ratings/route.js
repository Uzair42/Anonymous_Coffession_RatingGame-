import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Rating from '@/models/Rating';
import ClassRating from '@/models/ClassRating';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";

export async function GET(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role?.toLowerCase() !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();
    const [fiveStarRatings, sevenStarRatings] = await Promise.all([
      Rating.find().lean(),
      ClassRating.find().lean()
    ]);

    const formattedFive = fiveStarRatings.map(r => {
      const ratingArray = r.ratings || [];
      const totalScore = ratingArray.reduce((a, b) => a + b.score, 0);
      const avgScore = ratingArray.length > 0 ? (totalScore / ratingArray.length).toFixed(1) : (r.score || 0);
      return {
        _id: r._id,
        targetStudentName: r.targetStudentName,
        averageScore: avgScore,
        count: ratingArray.length > 0 ? ratingArray.length : 1,
        ratings: ratingArray,
        system: '5-Star',
        createdAt: r.createdAt
      };
    });

    const formattedSeven = sevenStarRatings.map(r => {
      const ratingArray = r.ratings || [];
      const totalScore = ratingArray.reduce((a, b) => a + b.score, 0);
      const avgScore = ratingArray.length > 0 ? (totalScore / ratingArray.length).toFixed(1) : (r.score || 0);
      return {
        _id: r._id,
        targetStudentName: r.targetStudentName,
        averageScore: avgScore,
        count: ratingArray.length > 0 ? ratingArray.length : 1,
        ratings: ratingArray,
        system: '7-Star',
        createdAt: r.createdAt
      };
    });

    const unifiedRatings = [...formattedFive, ...formattedSeven].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    return NextResponse.json(unifiedRatings);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role?.toLowerCase() !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    const system = searchParams.get('system');

    await dbConnect();
    if (system === '7-Star') {
      await ClassRating.findByIdAndDelete(id);
    } else {
      await Rating.findByIdAndDelete(id);
    }
    return NextResponse.json({ message: 'Rating deleted successfully.' });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
