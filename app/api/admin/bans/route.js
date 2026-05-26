import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Ban from '@/models/Ban';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";

export async function GET(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'Admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();
    const bans = await Ban.find().sort({ createdAt: -1 });
    return NextResponse.json(bans);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'Admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { ip, reason } = await req.json();
    if (!ip) {
      return NextResponse.json({ error: 'IP is required' }, { status: 400 });
    }

    await dbConnect();
    const existingBan = await Ban.findOne({ ip });
    if (existingBan) {
      return NextResponse.json({ error: 'IP already banned' }, { status: 400 });
    }

    const newBan = new Ban({ ip, reason });
    await newBan.save();
    return NextResponse.json(newBan, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'Admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const ip = searchParams.get('ip');

    if (!ip) {
      return NextResponse.json({ error: 'IP is required' }, { status: 400 });
    }

    await dbConnect();
    await Ban.findOneAndDelete({ ip });
    return NextResponse.json({ message: 'Ban removed' });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
