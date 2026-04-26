const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: {
    type: String,
    unique: true,
    required: true,
    lowercase: true,
    trim: true,
  },
  phone: { type: String, default: null },
  password: { type: String, required: true }, // Required for local auth
  role: {
    type: String,
    enum: ["citizen", "officer", "admin"],
    default: "citizen",
  },
  googleId: { type: String, unique: true, sparse: true }, // Google OAuth ID
  avatar: { type: String, default: null }, // Profile picture URL
  verified: { type: Boolean, default: false }, // Email verification status
  authProvider: { type: String, enum: ["local", "google"], default: "local" }, // Auth method
  twoFactorEnabled: { type: Boolean, default: false },
  twoFactorMethod: { type: String, enum: ["email", "phone"], default: "email" },
  twoFactorCodeHash: { type: String, default: null },
  twoFactorCodeExpiresAt: { type: Date, default: null },
  twoFactorLastSentAt: { type: Date, default: null },
  twoFactorAttempts: { type: Number, default: 0 },
  resetCodeHash: { type: String, default: null },
  resetCodeExpiresAt: { type: Date, default: null },
  resetLastSentAt: { type: Date, default: null },
  resetAttempts: { type: Number, default: 0 },
  lastPasswordResetDate: { type: Date, default: null },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("User", userSchema);
