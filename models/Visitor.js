import mongoose from 'mongoose';

const VisitorSchema = new mongoose.Schema({
  alias: { type: String, required: true },
  deviceFingerprint: {
    ip: { type: String, required: true },
    userAgent: String,
    browser: String,
    os: String,
  },
  location: {
    lat: Number,
    lng: Number,
    accuracy: Number,
  },
  lastSeen: { type: Date, default: Date.now },
  visitCount: { type: Number, default: 1 }
}, { timestamps: true });

export default mongoose.models.Visitor || mongoose.model('Visitor', VisitorSchema);
