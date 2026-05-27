import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Visitor from '@/models/Visitor';
import Confession from '@/models/Confession';
import Rating from '@/models/Rating';
import ClassRating from '@/models/ClassRating';
import Poll from '@/models/Poll';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/authOptions';

export async function GET(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role?.toLowerCase() !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();
    const visitors = await Visitor.find().sort({ lastSeen: -1 }).lean();
    
    // Aggregate activities for each visitor
    const visitorsWithDetails = await Promise.all(visitors.map(async (visitor) => {
      const ip = visitor.deviceFingerprint?.ip;
      if (!ip) return { ...visitor, confessions: [], comments: [], ratings: [], votes: [] };

      // 1. Fetch Confessions
      const confessions = await Confession.find({ "deviceFingerprint.ip": ip }).select('bodyText status createdAt').lean();

      // 2. Fetch Comments
      const confessionsWithComments = await Confession.find({ "comments.deviceFingerprint.ip": ip }).select('bodyText comments').lean();
      const comments = [];
      confessionsWithComments.forEach(c => {
        c.comments.forEach(comm => {
          if (comm.deviceFingerprint?.ip === ip) {
            comments.push({
              confessionId: c._id,
              confessionText: c.bodyText,
              commentText: comm.bodyText,
              createdAt: comm.createdAt
            });
          }
        });
      });

      // 3. Fetch Classmate Ratings (5-Star & 7-Star)
      const fiveStarRatings = await Rating.find({ "ratings.deviceFingerprint.ip": ip }).select('targetStudentName ratings').lean();
      const ratingsList = [];
      fiveStarRatings.forEach(r => {
        r.ratings.forEach(sub => {
          if (sub.deviceFingerprint?.ip === ip) {
            ratingsList.push({
              target: r.targetStudentName,
              score: sub.score,
              comment: sub.comment || '',
              system: '5-Star',
              createdAt: sub.createdAt
            });
          }
        });
      });

      const sevenStarRatings = await ClassRating.find({ "ratings.deviceFingerprint.ip": ip }).select('targetStudentName ratings').lean();
      sevenStarRatings.forEach(r => {
        r.ratings.forEach(sub => {
          if (sub.deviceFingerprint?.ip === ip) {
            ratingsList.push({
              target: r.targetStudentName,
              score: sub.score,
              comment: sub.comment || '',
              system: '7-Star',
              createdAt: sub.createdAt
            });
          }
        });
      });

      // 4. Fetch Poll Votes
      const pollsList = await Poll.find({ "votes.deviceFingerprint.ip": ip }).select('question votes').lean();
      const votes = [];
      pollsList.forEach(p => {
        p.votes.forEach(v => {
          if (v.deviceFingerprint?.ip === ip) {
            votes.push({
              question: p.question,
              option: v.option,
              description: v.description || '',
              createdAt: v.createdAt
            });
          }
        });
      });

      return {
        ...visitor,
        confessions,
        comments,
        ratings: ratingsList,
        votes
      };
    }));

    return NextResponse.json(visitorsWithDetails);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role?.toLowerCase() !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id, alias, location } = await req.json();
    await dbConnect();

    const visitor = await Visitor.findById(id);
    if (!visitor) {
      return NextResponse.json({ error: 'Visitor profile not found' }, { status: 404 });
    }

    if (alias) visitor.alias = alias.trim();
    if (location) {
      visitor.location = {
        lat: Number(location.lat) || 0,
        lng: Number(location.lng) || 0,
        accuracy: Number(location.accuracy) || 10
      };
    }

    await visitor.save();
    return NextResponse.json({ message: 'Visitor updated successfully.', visitor });
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

    if (!id) {
      return NextResponse.json({ error: 'ID parameter required' }, { status: 400 });
    }

    await dbConnect();
    await Visitor.findByIdAndDelete(id);
    return NextResponse.json({ message: 'Visitor profile deleted successfully.' });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
