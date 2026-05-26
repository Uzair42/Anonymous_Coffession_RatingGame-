import mongoose from 'mongoose';

const SettingsSchema = new mongoose.Schema({
  allowedEmojis: [{ type: String }],
}, { timestamps: true });

export default mongoose.models.Settings || mongoose.model('Settings', SettingsSchema);
