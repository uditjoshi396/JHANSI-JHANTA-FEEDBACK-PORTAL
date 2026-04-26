const ActivityLog = require('../models/ActivityLog');

/**
 * Helper function to log activities
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
      severity = 'info'
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

    return await ActivityLog.logActivity(activityData);
  } catch (error) {
    console.error('Error logging activity:', error);
    return null;
  }
};

/**
 * Log user login
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
    details: {
      grievanceId: grievance._id,
      category: grievance.category,
      description: grievance.description?.substring(0, 100),
      department: grievance.department
    },
    visibility: 'public',
    affectedUsers: [{ userId: user._id, name: user.name, email: user.email, role: user.role }],
    ipAddress,
    userAgent
  });
};

/**
 * Log grievance status change
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
    details: {
      grievanceId: grievance._id,
      previousStatus,
      newStatus,
      category: grievance.category
    },
    visibility: 'public',
    affectedUsers,
    ipAddress,
    userAgent
  });
};

/**
 * Log grievance assignment
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
    userAgent
  });
};

/**
 * Log comment on grievance
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
    details: {
      grievanceId: grievance._id,
      comment: comment?.substring(0, 100)
    },
    visibility: 'public',
    affectedUsers: [{ userId: commentedBy._id, name: commentedBy.name, email: commentedBy.email, role: commentedBy.role }],
    ipAddress,
    userAgent
  });
};

/**
 * Log grievance resolution
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
    details: {
      grievanceId: grievance._id,
      resolutionNotes: resolutionNotes?.substring(0, 100),
      category: grievance.category
    },
    visibility: 'public',
    affectedUsers: [{ userId: resolvedBy._id, name: resolvedBy.name, email: resolvedBy.email, role: resolvedBy.role }],
    ipAddress,
    userAgent
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
  logGrievanceResolved
};
