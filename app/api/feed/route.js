import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Confession from '@/models/Confession';
import Poll from '@/models/Poll';
import Rating from '@/models/Rating';

export async function GET() {
  try {
    await dbConnect();
    const [confessions, polls, ratings] = await Promise.all([
      Confession.find({ status: 'Accepted' }).lean(),
      Poll.find({ status: 'Active' }).lean(),
      Rating.find().lean()
    ]);

    const formattedConfessions = confessions.map(c => ({
      _id: c._id,
      bodyText: c.bodyText,
      authorName: c.authorName,
      createdAt: c.createdAt,
      feedType: 'confession',
      reactions: c.reactions?.map(r => ({
        emoji: r.emoji,
        count: r.users?.length || 0,
        aliases: r.users?.map(u => u.alias) || []
      })) || [],
      comments: c.comments?.map(comment => ({
        _id: comment._id,
        bodyText: comment.bodyText,
        authorName: comment.authorName,
        createdAt: comment.createdAt
      })) || []
    }));

    const formattedPolls = polls.map(p => {
      const voteCounts = {};
      p.votes.forEach(v => {
        voteCounts[v.option] = (voteCounts[v.option] || 0) + 1;
      });
      return {
        _id: p._id,
        feedType: 'poll',
        question: p.question,
        options: p.options,
        voteCounts,
        authorName: p.authorName || 'Anonymous',
        createdAt: p.createdAt
      };
    });

    const formattedRatings = ratings.map(r => {
      const ratingArray = r.ratings || [];
      const totalScore = ratingArray.reduce((a, b) => a + b.score, 0);
      const avgScore = ratingArray.length > 0 ? (totalScore / ratingArray.length).toFixed(1) : (r.score || 0);
      return {
        _id: r._id,
        feedType: 'rating',
        targetStudentName: r.targetStudentName,
        score: avgScore,
        count: ratingArray.length > 0 ? ratingArray.length : 1,
        createdAt: r.createdAt
      };
    });

    const unifiedFeed = [...formattedConfessions, ...formattedPolls, ...formattedRatings]
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    return NextResponse.json(unifiedFeed);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
