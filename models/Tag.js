const mongoose = require('mongoose');

const tagSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true, trim: true },
  createdBy: { type: String, enum: ['system', 'admin'], default: 'system' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.models.Tag || mongoose.model('Tag', tagSchema);