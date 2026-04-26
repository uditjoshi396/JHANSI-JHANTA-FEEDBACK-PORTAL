const mongoose = require('mongoose');

/**
 * TransparencyTracker Schema
 * Tracks all interactions, status changes, and communications between User, Admin, and Officer
 */
const TransparencyTrackerSchema = new mongoose.Schema({
  // Reference to grievance
  grievanceId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Grievance',
    required: true,
    index: true
  },

  // Grievance details snapshot
  grievanceSnapshot: {
    title: String,
    category: String,
    description: String,
    departmentAssigned: String
  },

  // Event details
  eventType: {
    type: String,
    enum: [
      'SUBMITTED',
      'ACKNOWLEDGED',
      'ASSIGNED_TO_OFFICER',
      'STATUS_UPDATED',
      'PROGRESS_UPDATE',
      'RESOLUTION_PROVIDED',
      'CLOSED',
      'REJECTED',
      'COMMENT_ADDED',
      'ATTACHMENT_ADDED',
      'ESCALATED',
      'REASSIGNED',
      'PENDING_USER_ACTION',
      'INTERNAL_NOTE',
      'USER_MESSAGE',
      'ADMIN_MESSAGE',
      'OFFICER_MESSAGE',
      'USER_ACKNOWLEDGED',
      'LOGIN',
      'LOGOUT',
      'REGISTER',
      'GRIEVANCE_SUBMITTED',
      'GRIEVANCE_UPDATED',
      'GRIEVANCE_ASSIGNED',
      'GRIEVANCE_RESOLVED',
      'GRIEVANCE_CLOSED',
      'GRIEVANCE_REJECTED',
      'STATUS_CHANGED',
      'ACCOUNT_CREATED',
      'ACCOUNT_UPDATED',
      'PASSWORD_CHANGED',
      'PROFILE_UPDATED',
      'OFFICER_ASSIGNED',
      'GRIEVANCE_VIEWED',
      'REPORT_GENERATED',
      'DATA_EXPORTED'
    ],
    required: true,
    index: true
  },

  // Who performed the action
  performedBy: {
    userId: mongoose.Schema.Types.ObjectId,
    name: String,
    email: String,
    role: {
      type: String,
      enum: ['user', 'citizen', 'admin', 'officer'],
      required: true
    },
    department: String
  },

  // From and To status
  statusTransition: {
    from: String,
    to: String
  },

  // Event description and details
  eventDescription: {
    title: String,
    message: String,
    details: mongoose.Schema.Types.Mixed
  },

  // Timeline metadata
  timestamp: {
    type: Date,
    default: Date.now,
    index: true
  },

  // Public message (visible to User)
  publicMessage: {
    type: String,
    default: null
  },

  // Public visibility status
  visibleToUser: {
    type: Boolean,
    default: true
  },

  // Visibility scope for role-to-role transparency interactions
  visibility: {
    type: String,
    enum: ['public', 'staff', 'admin-only', 'officer-only', 'private'],
    default: 'public'
  },

  // Interaction metadata for conversations between user/admin/officer
  interaction: {
    channel: {
      type: String,
      enum: ['timeline', 'public-chat', 'staff-note'],
      default: 'timeline'
    },
    replyToEventId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null
    },
    audience: [{
      type: String,
      enum: ['user', 'citizen', 'admin', 'officer']
    }]
  },

  // Read tracking by role/user
  readReceipts: [{
    userId: mongoose.Schema.Types.ObjectId,
    role: {
      type: String,
      enum: ['user', 'citizen', 'admin', 'officer']
    },
    readAt: Date
  }],

  // Response time (if applicable)
  responseTime: {
    firstResponseAt: Date,
    resolutionTime: Number // in milliseconds
  },

  // SLA tracking
  slaMetrics: {
    expectedResolutionDate: Date,
    isDelayed: Boolean,
    delayDays: Number
  },

  // Attachments or evidence
  attachments: [{
    fileName: String,
    fileUrl: String,
    uploadedBy: String,
    uploadedAt: Date
  }],

  // Sentiment tracking (for officer/admin feedback about grievance)
  sentiment: {
    type: String,
    enum: ['positive', 'neutral', 'negative'],
    default: null
  },

  // Priority level at this point
  priorityLevel: {
    type: String,
    enum: ['Low', 'Medium', 'High', 'Critical'],
    default: 'Medium'
  },

  // Department info
  department: {
    departmentId: mongoose.Schema.Types.ObjectId,
    departmentName: String,
    officerAssigned: {
      officerId: mongoose.Schema.Types.ObjectId,
      officerName: String,
      officerEmail: String
    }
  },

  // Resolution details
  resolution: {
    resolutionDetails: String,
    resolutionEvidence: String,
    satisfactionRating: Number, // 1-5
    resolutionNotes: String
  },

  // Communication log
  communications: [{
    type: {
      type: String,
      enum: ['email', 'sms', 'in-app', 'comment'],
      default: 'in-app'
    },
    sentTo: String,
    sentBy: String,
    subject: String,
    message: String,
    sentAt: Date,
    readAt: Date
  }],

  // Metadata
  metadata: {
    ipAddress: String,
    userAgent: String,
    location: String,
    deviceInfo: String
  },

  // Audit trail
  auditLog: [{
    action: String,
    changedBy: String,
    timestamp: Date,
    details: mongoose.Schema.Types.Mixed
  }]

}, {
  timestamps: true,
  collection: 'transparency_trackers'
});

// Indexes
TransparencyTrackerSchema.index({ grievanceId: 1, timestamp: -1 });
TransparencyTrackerSchema.index({ 'performedBy.role': 1, timestamp: -1 });
TransparencyTrackerSchema.index({ eventType: 1, timestamp: -1 });
TransparencyTrackerSchema.index({ 'performedBy.userId': 1 });
TransparencyTrackerSchema.index({ visibleToUser: 1 });
TransparencyTrackerSchema.index({ visibility: 1, timestamp: -1 });
TransparencyTrackerSchema.index({ 'interaction.channel': 1, timestamp: -1 });
TransparencyTrackerSchema.index({ 'readReceipts.userId': 1 });

// Statics for common queries
TransparencyTrackerSchema.statics.logEvent = async function(eventData) {
  try {
    const tracker = new this(eventData);
    await tracker.save();
    return tracker;
  } catch (error) {
    console.error('Error logging transparency event:', error);
    throw error;
  }
};

// Get complete timeline for a grievance
TransparencyTrackerSchema.statics.getGrievanceTimeline = async function(grievanceId) {
  return this.find({ grievanceId })
    .sort({ timestamp: 1 })
    .lean();
};

// Get user-visible timeline
TransparencyTrackerSchema.statics.getUserVisibleTimeline = async function(grievanceId) {
  return this.find({
    grievanceId,
    visibleToUser: true
  })
    .sort({ timestamp: 1 })
    .lean();
};

// Get interaction feed between user/admin/officer
TransparencyTrackerSchema.statics.getInteractionFeed = async function(grievanceId, userRole = 'citizen') {
  const role = userRole === 'user' ? 'citizen' : userRole;
  const interactionEventTypes = ['USER_MESSAGE', 'ADMIN_MESSAGE', 'OFFICER_MESSAGE', 'COMMENT_ADDED', 'PROGRESS_UPDATE'];

  let query = {
    grievanceId,
    eventType: { $in: interactionEventTypes }
  };

  if (role !== 'admin' && role !== 'officer') {
    query = {
      ...query,
      visibleToUser: true
    };
  }

  return this.find(query).sort({ timestamp: 1 }).lean();
};

// Get role-specific activities
TransparencyTrackerSchema.statics.getRoleActivities = async function(role, limit = 50, skip = 0) {
  return this.find({ 'performedBy.role': role })
    .sort({ timestamp: -1 })
    .limit(limit)
    .skip(skip)
    .lean();
};

// Get daily activity count
TransparencyTrackerSchema.statics.getDailyActivityStats = async function(grievanceId) {
  return this.aggregate([
    { $match: { grievanceId: mongoose.Types.ObjectId(grievanceId) } },
    {
      $group: {
        _id: {
          $dateToString: { format: '%Y-%m-%d', date: '$timestamp' }
        },
        count: { $sum: 1 },
        events: { $push: '$eventType' }
      }
    },
    { $sort: { _id: -1 } }
  ]);
};

// Get SLA compliance
TransparencyTrackerSchema.statics.getSLACompliance = async function(grievanceId) {
  return this.aggregate([
    { $match: { grievanceId: mongoose.Types.ObjectId(grievanceId) } },
    { $sort: { timestamp: 1 } },
    {
      $group: {
        _id: '$grievanceId',
        firstResponseTime: {
          $min: {
            $cond: [{ $eq: ['$eventType', 'ACKNOWLEDGED'] }, '$timestamp', null]
          }
        },
        resolutionTime: {
          $min: {
            $cond: [{ $eq: ['$eventType', 'RESOLVED'] }, '$timestamp', null]
          }
        },
        totalEvents: { $sum: 1 }
      }
    }
  ]);
};

module.exports = mongoose.model('TransparencyTracker', TransparencyTrackerSchema);
