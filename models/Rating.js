import mongoose from 'mongoose';

const RatingSchema = new mongoose.Schema({
  targetStudentName: { type: String, required: true, unique: true },
  ratings: [{
    score: { type: Number, required: true, min: 1, max: 5 },
    alias: String,
    deviceFingerprint: {
      ip: String,
      userAgent: String,
      browser: String,
      os: String,
    }
  }]
}, { timestamps: true });

export default mongoose.models.Rating || mongoose.model('Rating', RatingSchema);
