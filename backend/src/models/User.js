const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  clerkId: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  email: { type: String, required: true },
  role: { type: String, enum: ['Parent', 'Mentee'], default: null },
  inviteCode: { type: String, unique: true, sparse: true },
  linkedParentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  profileImage: { type: String, default: '' },
  preferences: {
    voiceLanguage: { type: String, enum: ['English', 'Telugu', 'Both'], default: 'English' },
    theme: { type: String, enum: ['Light', 'Dark'], default: 'Light' }
  }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
