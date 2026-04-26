/**
 * Enhanced Activity Logger with Transparency Integration
 * Combines existing ActivityLog with new TransparencyTracker
 * for comprehensive system tracking
 */

const ActivityLog = require('../models/ActivityLog');
const { logTransparencyEvent } = require('./transparencyUtils');

/**
 * Enhanced logActivity - now logs to BOTH ActivityLog (existing) and TransparencyTracker (new)
 * @param {Object} config - Configuration object
 */
const logActivity = async (config) => {
  try {
    const {
      performedBy = {},
      action = 'UNKNOWN',
      target = 'system',
      targetId = null,
      details = {},
      visibility = 'public',
      affectedUsers = [],
      ipAddress = '',
      userAgent = '',
      notes = '',
      severity = 'info',
      grievanceId = null,
      publicMessage = null
    } = config;

    const activityData = {
      performedBy,
      action,
      target,
      targetId,
      details,
      visibility,
      affectedUsers,
      ipAddress,
      userAgent,
      notes,
      severity
    };

    // Log to existing ActivityLog
    const activityLogResult = await ActivityLog.logActivity(activityData);

    // ENHANCEMENT: Also log to TransparencyTracker if it's a grievance-related action
    if (grievanceId && target === 'grievance') {
      try {
        await logTransparencyEvent(
          grievanceId,
          action,
          performedBy,
          `${action}: ${notes || details.description || ''}`,
          details,
          publicMessage
        );
      } catch (error) {
        console.warn('Warning: Could not log to TransparencyTracker:', error.message);
        // Don't fail if transparency logging fails - continue with normal operation
      }
    }

    return activityLogResult;
  } catch (error) {
    console.error('Error logging activity:', error);
    return null;
  }
};

/**
 * Log user login
 * Enhanced with transparency tracking
 */
const logLogin = async (user, ipAddress, userAgent) => {
  return logActivity({
    performedBy: {
      userId: user._id,
      name: user.name,
      email: user.email,
      role: user.role
    },
    action: 'LOGIN',
    target: 'user',
    targetId: user._id,
    details: {
      userId: user._id,
      email: user.email,
      role: user.role
    },
    visibility: 'admin-only',
    ipAddress,
    userAgent,
    severity: 'info'
  });
};

/**
 * Log user logout
 */
const logLogout = async (user, ipAddress, userAgent) => {
  return logActivity({
    performedBy: {
      userId: user._id,
      name: user.name,
      email: user.email,
      role: user.role
    },
    action: 'LOGOUT',
    target: 'user',
    targetId: user._id,
    details: {
      userId: user._id,
      email: user.email
    },
    visibility: 'admin-only',
    ipAddress,
    userAgent
  });
};

/**
 * Log user registration
 */
const logRegistration = async (user, ipAddress, userAgent) => {
  return logActivity({
    performedBy: {
      userId: user._id,
      name: user.name,
      email: user.email,
      role: user.role
    },
    action: 'REGISTER',
    target: 'account',
    targetId: user._id,
    details: {
      userId: user._id,
      name: user.name,
      email: user.email,
      role: user.role
    },
    visibility: 'admin-only',
    ipAddress,
    userAgent
  });
};

/**
 * Log grievance submission
 * NOW ALSO LOGS TO TRANSPARENCY TRACKER
 */
const logGrievanceSubmitted = async (grievance, user, ipAddress, userAgent) => {
  return logActivity({
    performedBy: {
      userId: user._id,
      name: user.name,
      email: user.email,
      role: user.role
    },
    action: 'GRIEVANCE_SUBMITTED',
    target: 'grievance',
    targetId: grievance._id,
    grievanceId: grievance._id, // NEW: for transparency tracking
    details: {
      grievanceId: grievance._id,
      category: grievance.category,
      description: grievance.description?.substring(0, 100),
      department: grievance.department
    },
    visibility: 'public',
    affectedUsers: [{ userId: user._id, name: user.name, email: user.email, role: user.role }],
    ipAddress,
    userAgent,
    publicMessage: `Thank you for submitting your grievance: "${grievance.title}"` // NEW: public message for transparency
  });
};

/**
 * Log grievance status change
 * NOW ALSO LOGS TO TRANSPARENCY TRACKER
 */
const logGrievanceStatusChanged = async (grievance, previousStatus, newStatus, performedByUser, affectedUsers = [], ipAddress = '', userAgent = '') => {
  return logActivity({
    performedBy: {
      userId: performedByUser._id,
      name: performedByUser.name,
      email: performedByUser.email,
      role: performedByUser.role
    },
    action: 'STATUS_CHANGED',
    target: 'grievance',
    targetId: grievance._id,
    grievanceId: grievance._id, // NEW: for transparency tracking
    details: {
      grievanceId: grievance._id,
      previousStatus,
      newStatus,
      category: grievance.category
    },
    visibility: 'public',
    affectedUsers,
    ipAddress,
    userAgent,
    notes: `Status changed from ${previousStatus} to ${newStatus}`, // NEW: for transparency
    publicMessage: `Your grievance status has been updated to: ${newStatus}` // NEW: citizen notification
  });
};

/**
 * Log grievance assignment
 * NOW ALSO LOGS TO TRANSPARENCY TRACKER
 */
const logGrievanceAssigned = async (grievance, assignedTo, assignedBy, ipAddress = '', userAgent = '') => {
  return logActivity({
    performedBy: {
      userId: assignedBy._id,
      name: assignedBy.name,
      email: assignedBy.email,
      role: assignedBy.role
    },
    action: 'GRIEVANCE_ASSIGNED',
    target: 'grievance',
    targetId: grievance._id,
    grievanceId: grievance._id, // NEW: for transparency tracking
    details: {
      grievanceId: grievance._id,
      assignedTo: {
        name: assignedTo.name,
        email: assignedTo.email,
        role: assignedTo.role
      },
      category: grievance.category
    },
    visibility: 'public',
    affectedUsers: [
      { userId: assignedBy._id, name: assignedBy.name, email: assignedBy.email, role: assignedBy.role },
      { userId: assignedTo._id, name: assignedTo.name, email: assignedTo.email, role: assignedTo.role }
    ],
    ipAddress,
    userAgent,
    notes: `Grievance assigned to ${assignedTo.name}`, // NEW: for transparency
    publicMessage: `Your grievance has been assigned to ${assignedTo.name} from the ${assignedTo.department || 'Government'} department for further investigation.` // NEW: citizen notification
  });
};

/**
 * Log comment on grievance
 * NOW ALSO LOGS TO TRANSPARENCY TRACKER
 */
const logCommentAdded = async (grievance, commentedBy, comment, ipAddress = '', userAgent = '') => {
  return logActivity({
    performedBy: {
      userId: commentedBy._id,
      name: commentedBy.name,
      email: commentedBy.email,
      role: commentedBy.role
    },
    action: 'COMMENT_ADDED',
    target: 'grievance',
    targetId: grievance._id,
    grievanceId: grievance._id, // NEW: for transparency tracking
    details: {
      grievanceId: grievance._id,
      comment: comment?.substring(0, 100),
      commentedByRole: commentedBy.role
    },
    visibility: 'public',
    affectedUsers: [{ userId: commentedBy._id, name: commentedBy.name, email: commentedBy.email, role: commentedBy.role }],
    ipAddress,
    userAgent,
    notes: `Comment added by ${commentedBy.name} (${commentedBy.role})`, // NEW: for transparency
    publicMessage: comment // NEW: make comment public in transparency
  });
};

/**
 * Log grievance resolution
 * NOW ALSO LOGS TO TRANSPARENCY TRACKER
 */
const logGrievanceResolved = async (grievance, resolvedBy, resolutionNotes = '', ipAddress = '', userAgent = '') => {
  return logActivity({
    performedBy: {
      userId: resolvedBy._id,
      name: resolvedBy.name,
      email: resolvedBy.email,
      role: resolvedBy.role
    },
    action: 'GRIEVANCE_RESOLVED',
    target: 'grievance',
    targetId: grievance._id,
    grievanceId: grievance._id, // NEW: for transparency tracking
    details: {
      grievanceId: grievance._id,
      resolutionNotes: resolutionNotes?.substring(0, 100),
      category: grievance.category
    },
    visibility: 'public',
    affectedUsers: [{ userId: resolvedBy._id, name: resolvedBy.name, email: resolvedBy.email, role: resolvedBy.role }],
    ipAddress,
    userAgent,
    notes: `Grievance resolved: ${resolutionNotes}`, // NEW: for transparency
    publicMessage: `Your grievance has been resolved. Resolution: ${resolutionNotes}` // NEW: citizen notification
  });
};

/**
 * NEW: Log grievance acknowledgment (for transparency)
 */
const logGrievanceAcknowledged = async (grievance, acknowledgedBy, ipAddress = '', userAgent = '') => {
  return logActivity({
    performedBy: {
      userId: acknowledgedBy._id,
      name: acknowledgedBy.name,
      email: acknowledgedBy.email,
      role: acknowledgedBy.role
    },
    action: 'ACKNOWLEDGED',
    target: 'grievance',
    targetId: grievance._id,
    grievanceId: grievance._id, // NEW: for transparency tracking
    details: {
      grievanceId: grievance._id,
      category: grievance.category,
      title: grievance.title
    },
    visibility: 'public',
    affectedUsers: [{ userId: acknowledgedBy._id, name: acknowledgedBy.name, email: acknowledgedBy.email, role: acknowledgedBy.role }],
    ipAddress,
    userAgent,
    notes: 'Grievance received and acknowledged',
    publicMessage: 'We have received your grievance and will begin investigating it. You will be updated on the progress.'
  });
};

/**
 * NEW: Log grievance escalation (for transparency)
 */
const logGrievanceEscalated = async (grievance, escalatedBy, reason = '', ipAddress = '', userAgent = '') => {
  return logActivity({
    performedBy: {
      userId: escalatedBy._id,
      name: escalatedBy.name,
      email: escalatedBy.email,
      role: escalatedBy.role
    },
    action: 'ESCALATED',
    target: 'grievance',
    targetId: grievance._id,
    grievanceId: grievance._id, // NEW: for transparency tracking
    details: {
      grievanceId: grievance._id,
      reason: reason,
      category: grievance.category
    },
    visibility: 'public',
    affectedUsers: [{ userId: escalatedBy._id, name: escalatedBy.name, email: escalatedBy.email, role: escalatedBy.role }],
    ipAddress,
    userAgent,
    notes: `Grievance escalated: ${reason}`,
    publicMessage: `Your grievance has been escalated for priority handling. Reason: ${reason}`
  });
};

/**
 * NEW: Log progress update (for transparency)
 */
const logProgressUpdate = async (grievance, updatedBy, progressMessage = '', ipAddress = '', userAgent = '') => {
  return logActivity({
    performedBy: {
      userId: updatedBy._id,
      name: updatedBy.name,
      email: updatedBy.email,
      role: updatedBy.role
    },
    action: 'PROGRESS_UPDATE',
    target: 'grievance',
    targetId: grievance._id,
    grievanceId: grievance._id, // NEW: for transparency tracking
    details: {
      grievanceId: grievance._id,
      progressMessage: progressMessage,
      category: grievance.category
    },
    visibility: 'public',
    affectedUsers: [{ userId: updatedBy._id, name: updatedBy.name, email: updatedBy.email, role: updatedBy.role }],
    ipAddress,
    userAgent,
    notes: `Progress update: ${progressMessage}`,
    publicMessage: progressMessage // NEW: make update public
  });
};

module.exports = {
  logActivity,
  logLogin,
  logLogout,
  logRegistration,
  logGrievanceSubmitted,
  logGrievanceStatusChanged,
  logGrievanceAssigned,
  logCommentAdded,
  logGrievanceResolved,
  logGrievanceAcknowledged, // NEW
  logGrievanceEscalated,     // NEW
  logProgressUpdate          // NEW
};
