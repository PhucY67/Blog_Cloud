const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true, trim: true, minlength: 3 },
  displayName: { type: String, trim: true, default: '' },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  avatar: { type: String, default: 'https://ui-avatars.com/api/?background=0D8F81&color=fff&name=User' },
  background: { type: String, default: 'https://picsum.photos/id/104/800/200' },
  savedPosts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Post' }],
  createdAt: { type: Date, default: Date.now }
});

userSchema.pre('save', function(next) {
  if (!this.displayName) {
    this.displayName = this.username;
  }
  next();
});

module.exports = mongoose.models.User || mongoose.model('User', userSchema);