import mongoose from 'mongoose';

const ClassRatingSchema = new mongoose.Schema({
  targetStudentName: { type: String, required: true, unique: true },
  ratings: [{
    score: { type: Number, required: true, min: 1, max: 7 }, // 7-star rating system
    alias: String,
    comment: String,
    createdAt: { type: Date, default: Date.now },
    deviceFingerprint: {
      ip: String,
      userAgent: String,
      browser: String,
      os: String,
    }
  }]
}, { timestamps: true });

export default mongoose.models.ClassRating || mongoose.model('ClassRating', ClassRatingSchema);
