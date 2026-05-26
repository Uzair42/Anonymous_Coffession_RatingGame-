import mongoose from 'mongoose';

const BanSchema = new mongoose.Schema({
  ip: { type: String, required: true, unique: true },
  reason: { type: String },
}, { timestamps: true });

export default mongoose.models.Ban || mongoose.model('Ban', BanSchema);
