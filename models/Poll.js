import mongoose from 'mongoose';

const PollSchema = new mongoose.Schema({
  question: { type: String, required: true },
  options: [{ type: String }],
  authorName: { type: String, default: 'Anonymous' },
  status: { type: String, enum: ['Active', 'Closed'], default: 'Active' },
  votes: [{
    option: String,
    description: String,
    deviceFingerprint: {
      ip: String,
      userAgent: String,
      browser: String,
      os: String,
    }
  }]
}, { timestamps: true });

export default mongoose.models.Poll || mongoose.model('Poll', PollSchema);
