const mongoose = require('mongoose');

const activityLogSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  userRole: { type: String, enum: ['citizen', 'officer', 'admin'], required: true },
  action: { type: String, required: true }, // e.g., 'CREATE_GRIEVANCE', 'ASSIGN_GRIEVANCE', 'UPDATE_STATUS'
  actionType: { type: String, enum: ['CREATE', 'UPDATE', 'ASSIGN', 'RESOLVE', 'VIEW', 'COMMENT', 'REJECT', 'DELETE'], required: true },
  grievanceId: { type: mongoose.Schema.Types.ObjectId, ref: 'Grievance', default: null },
  targetUserId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null }, // User affected by the action
  description: { type: String, required: true },
  changes: {
    before: { type: mongoose.Schema.Types.Mixed, default: null }, // Previous values
    after: { type: mongoose.Schema.Types.Mixed, default: null }   // New values
  },
  metadata: {
    ipAddress: { type: String, default: null },
    userAgent: { type: String, default: null },
    status: { type: String, default: null },
    priority: { type: String, default: null }
  },
  timestamp: { type: Date, default: Date.now, index: true },
  createdAt: { type: Date, default: Date.now }
});

// Index for efficient queries
activityLogSchema.index({ userId: 1, timestamp: -1 });
activityLogSchema.index({ grievanceId: 1, timestamp: -1 });
activityLogSchema.index({ userRole: 1, timestamp: -1 });

module.exports = mongoose.model('ActivityLog', activityLogSchema);
