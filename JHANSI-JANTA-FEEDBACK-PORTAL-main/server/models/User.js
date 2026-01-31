const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, unique: true, required: true },
  phone: { type: String, default: null },
  password: { type: String, required: false }, // Optional for Google auth
  role: { type: String, enum: ['citizen','officer','admin'], default: 'citizen' },
  googleId: { type: String, unique: true, sparse: true }, // Google OAuth ID
  avatar: { type: String, default: null }, // Profile picture URL
  verified: { type: Boolean, default: false }, // Email verification status
  authProvider: { type: String, enum: ['local', 'google'], default: 'local' }, // Auth method
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', userSchema);
