import dbConnect from './db';
import Ban from '@/models/Ban';

export async function isBanned(ip) {
  await dbConnect();
  const ban = await Ban.findOne({ ip });
  return !!ban;
}
