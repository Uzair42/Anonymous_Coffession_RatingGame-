import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Rating from '@/models/Rating';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";

export async function GET(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'Admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();
    const ratings = await Rating.find().lean().sort({ createdAt: -1 });
    const formatted = ratings.map(r => {
      const ratingArray = r.ratings || [];
      const totalScore = ratingArray.reduce((a, b) => a + b.score, 0);
      const avgScore = ratingArray.length > 0 ? (totalScore / ratingArray.length).toFixed(1) : (r.score || 0);
      return {
        _id: r._id,
        targetStudentName: r.targetStudentName,
        averageScore: avgScore,
        count: ratingArray.length > 0 ? ratingArray.length : 1,
        ratings: ratingArray,
        createdAt: r.createdAt
      };
    });
    return NextResponse.json(formatted);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'Admin') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    await dbConnect();
    await Rating.findByIdAndDelete(id);
    return NextResponse.json({ message: 'Rating deleted' });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
