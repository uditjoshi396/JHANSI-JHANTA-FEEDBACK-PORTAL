const mongoose = require("mongoose");

const grievanceSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  category: { type: String, default: "General" },
  status: {
    type: String,
    enum: ["Pending", "Assigned", "In Progress", "Resolved", "Closed"],
    default: "Pending",
  },
  priority: {
    type: String,
    enum: ["Low", "Medium", "High", "Urgent"],
    default: "Low",
  },
  citizenId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    default: null,
  },
  attachment: { type: String, default: null },
  location: {
    lat: { type: Number, default: null },
    lng: { type: Number, default: null },
    accuracy: { type: Number, default: null },
    source: { type: String, default: "manual" },
    capturedAt: { type: Date, default: null },
  },
  response: { type: String, default: "" },
  // AI-powered fields
  sentimentScore: { type: Number, min: -1, max: 1, default: 0 }, // -1 to 1 scale
  aiSuggestions: [{ type: String }], // AI-generated improvement suggestions
  aiCategory: { type: String, default: null }, // AI-suggested category
  aiPriority: { type: String, enum: ["Low", "Medium", "High"], default: null }, // AI-suggested priority
  aiResponse: { type: String, default: "" }, // AI-generated response draft
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Grievance", grievanceSchema);
