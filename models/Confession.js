import mongoose from 'mongoose';

const ConfessionSchema = new mongoose.Schema({
  bodyText: { type: String, required: true },
  authorName: { type: String, required: true },
  status: { type: String, enum: ['Pending', 'Accepted', 'Rejected'], default: 'Accepted' },
  deviceFingerprint: {
    ip: String,
    userAgent: String,
    browser: String,
    os: String,
  },
  reactions: [{
    emoji: String,
    users: [{ ip: String, alias: String }],
  }],
  comments: [{
    bodyText: String,
    authorName: String,
    deviceFingerprint: {
      ip: String,
      userAgent: String,
      browser: String,
      os: String,
    },
    createdAt: { type: Date, default: Date.now }
  }]
}, { timestamps: true });

export default mongoose.models.Confession || mongoose.model('Confession', ConfessionSchema);
