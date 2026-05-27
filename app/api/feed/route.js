import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Confession from '@/models/Confession';
import Poll from '@/models/Poll';
import Rating from '@/models/Rating';
import { getClientInfo } from '@/lib/clientInfo';

export async function GET(req) {
  try {
    const clientInfo = getClientInfo(req);
    await dbConnect();
    const [confessions, polls, ratings] = await Promise.all([
      Confession.find({ status: 'Accepted' }).lean(),
      Poll.find({ status: 'Active' }).lean(),
      Rating.find().lean()
    ]);

    // 5-minute cooling window:
    const now = new Date();
    const visibleConfessions = confessions.filter(c => {
      const timeDiffMs = now - new Date(c.createdAt);
      const isAuthor = c.deviceFingerprint?.ip === clientInfo.ip;
      return timeDiffMs >= 5 * 60 * 1000 || isAuthor;
    });

    const formattedConfessions = visibleConfessions.map(c => ({
      _id: c._id,
      bodyText: c.bodyText,
      authorName: c.authorName,
      createdAt: c.createdAt,
      feedType: 'confession',
      deviceFingerprint: {
        ip: c.deviceFingerprint?.ip
      },
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
        feedType: 'poll',
        question: p.question,
        options: p.options,
        voteCounts,
        authorName: p.authorName || 'Anonymous',
        hasVoted: !!userVote,
        userVotedOption: userVote ? userVote.option : null,
        justifications,
        createdAt: p.createdAt
      };
    });

    // Fetch active bans to dynamically filter out any ratings from banned IPs
    const Ban = (await import('@/models/Ban')).default;
    const bannedIps = await Ban.find().select('ip').lean();
    const bannedIpSet = new Set(bannedIps.map(b => b.ip));

    const formattedRatings = ratings.map(r => {
      const ratingArray = (r.ratings || []).filter(rt => !bannedIpSet.has(rt.deviceFingerprint?.ip));
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
