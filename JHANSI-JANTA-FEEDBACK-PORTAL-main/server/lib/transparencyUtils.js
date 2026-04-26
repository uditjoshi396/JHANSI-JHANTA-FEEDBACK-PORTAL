/**
 * Transparency Role-Based Utilities
 * Handles visibility and access control based on user roles
 */

const TransparencyTracker = require('../models/TransparencyTracker');
const User = require('../models/User');
const Grievance = require('../models/Grievance');

const EVENT_TYPE_MAP = {
  GRIEVANCE_SUBMITTED: 'SUBMITTED',
  GRIEVANCE_ASSIGNED: 'ASSIGNED_TO_OFFICER',
  STATUS_CHANGED: 'STATUS_UPDATED',
  GRIEVANCE_RESOLVED: 'RESOLUTION_PROVIDED',
  GRIEVANCE_CLOSED: 'CLOSED',
  GRIEVANCE_REJECTED: 'REJECTED',
  COMMENT_ADDED: 'COMMENT_ADDED',
  PROGRESS_UPDATE: 'PROGRESS_UPDATE',
  ACKNOWLEDGED: 'ACKNOWLEDGED',
  ESCALATED: 'ESCALATED'
};

const normalizeRole = (role) => {
  if (role === 'user' || role === 'citizen') return 'citizen';
  if (role === 'admin' || role === 'officer') return role;
  return 'citizen';
};

const normalizeEventType = (eventType) => EVENT_TYPE_MAP[eventType] || eventType;

/**
 * Check visibility permission for a user
 */
const checkVisibilityPermission = (event, userRole, userId) => {
  const normalizedRole = normalizeRole(userRole);

  // Admin can see everything
  if (normalizedRole === 'admin') {
    return true;
  }

  // Officers can see internal and public events
  if (normalizedRole === 'officer') {
    if (event.visibleToUser) return true;
    if (['officer', 'admin'].includes(normalizeRole(event.performedBy.role))) return true;
    return false;
  }

  // Citizens can only see public events
  if (normalizedRole === 'citizen') {
    return event.visibleToUser;
  }

  return false;
};

/**
 * Get visibility constraints for a role
 */
const getVisibilityConstraints = (userRole, userId = null) => {
  const normalizedRole = normalizeRole(userRole);
  switch (normalizedRole) {
    case 'admin':
      // Admins see all events
      return {};

    case 'officer':
      // Officers see public + internal officer events
      return {
        $or: [
          { visibleToUser: true },
          { 'performedBy.role': 'officer' }
        ]
      };

    case 'citizen':
      // Citizens see only public events
      return { visibleToUser: true };

    default:
      return { visibleToUser: true };
  }
};

/**
 * Log transparency event with automatic visibility rules
 */
const logTransparencyEvent = async (grievanceId, eventType, performedBy, description, details, publicMessage = null) => {
  try {
    const grievance = await Grievance.findById(grievanceId);
    if (!grievance) {
      throw new Error('Grievance not found');
    }

    const normalizedRole = normalizeRole(performedBy.role);
    const mappedEventType = normalizeEventType(eventType);

    // Determine visibility based on event type and role
    let visibleToUser = true;
    let visibility = 'public';

    // Admin-only events
    if (['ESCALATED', 'REASSIGNED'].includes(mappedEventType)) {
      visibleToUser = true; // User should know about these
      visibility = 'public';
    }

    // Officer-internal events (not public)
    else if (['PROGRESS_UPDATE', 'INTERNAL_NOTE'].includes(mappedEventType) && normalizedRole === 'officer') {
      visibleToUser = publicMessage ? true : false; // Only visible if public message provided
      visibility = publicMessage ? 'public' : 'staff';
    }

    // Standard user-visible events
    else {
      visibleToUser = true;
      visibility = 'public';
    }

    const eventData = {
      grievanceId,
      eventType: mappedEventType,
      performedBy: {
        ...performedBy,
        role: normalizedRole
      },
      eventDescription: {
        title: description || mappedEventType,
        message: description || '',
        details: details || {}
      },
      publicMessage: publicMessage || null,
      visibleToUser,
      visibility,
      grievanceSnapshot: {
        title: grievance.title,
        category: grievance.category,
        description: grievance.description.substring(0, 100),
        departmentAssigned: grievance.department || 'General'
      }
    };

    return await TransparencyTracker.logEvent(eventData);
  } catch (error) {
    console.error('Error logging transparency event:', error);
    throw error;
  }
};

/**
 * Send notification to relevant roles about grievance update
 */
const notifyRolesAboutUpdate = async (grievanceId, eventType, performedBy, publicMessage) => {
  try {
    const grievance = await Grievance.findById(grievanceId);
    if (!grievance) {
      throw new Error('Grievance not found');
    }

    const notifications = [];

    // Notify User
    if (eventType !== 'INTERNAL_NOTE') {
      notifications.push({
        recipientId: grievance.citizenId,
        role: 'citizen',
        message: `Your grievance "${grievance.title}" has been updated. ${publicMessage || ''}`,
        type: eventType,
        grievanceId: grievanceId
      });
    }

    // Notify Admin
    notifications.push({
      recipientId: null, // Broadcast to all admins
      role: 'admin',
      message: `Grievance "${grievance.title}" - New event: ${eventType}`,
      type: eventType,
      grievanceId: grievanceId
    });

    // Notify Assigned Officer
    if (grievance.assignedTo) {
      notifications.push({
        recipientId: grievance.assignedTo,
        role: 'officer',
        message: `Grievance "${grievance.title}" requires attention - ${eventType}`,
        type: eventType,
        grievanceId: grievanceId
      });
    }

    return notifications;
  } catch (error) {
    console.error('Error preparing notifications:', error);
    return [];
  }
};

/**
 * Get filtered timeline based on user role and permissions
 */
const getFilteredTimeline = async (grievanceId, userRole, userId = null) => {
  try {
    const constraints = getVisibilityConstraints(userRole, userId);
    const timeline = await TransparencyTracker.find({
      grievanceId,
      ...constraints
    }).sort({ timestamp: 1 }).lean();

    return timeline;
  } catch (error) {
    console.error('Error getting filtered timeline:', error);
    throw error;
  }
};

/**
 * Get role-based analytics for a grievance
 */
const getRoleBasedAnalytics = async (grievanceId, userRole) => {
  try {
    const timeline = await getFilteredTimeline(grievanceId, userRole);

    const analytics = {
      totalEvents: timeline.length,
      eventsByType: {},
      eventsByRole: {},
      timeline
    };

    timeline.forEach(event => {
      analytics.eventsByType[event.eventType] = (analytics.eventsByType[event.eventType] || 0) + 1;
      analytics.eventsByRole[event.performedBy.role] = (analytics.eventsByRole[event.performedBy.role] || 0) + 1;
    });

    return analytics;
  } catch (error) {
    console.error('Error getting role-based analytics:', error);
    throw error;
  }
};

/**
 * Generate role-specific report
 */
const generateRoleSpecificReport = async (grievanceId, userRole, userId = null) => {
  try {
    const grievance = await Grievance.findById(grievanceId);
    if (!grievance) {
      throw new Error('Grievance not found');
    }

    const timeline = await getFilteredTimeline(grievanceId, userRole, userId);
    const analytics = await getRoleBasedAnalytics(grievanceId, userRole);

    const normalizedRole = normalizeRole(userRole);
    const report = {
      grievanceId,
      generatedFor: normalizedRole,
      generatedAt: new Date(),
      grievanceDetails: {
        title: grievance.title,
        category: grievance.category,
        status: grievance.status,
        priority: grievance.priority,
        createdAt: grievance.createdAt,
        updatedAt: grievance.updatedAt
      },
      analytics,
      timeline
    };

    // Add role-specific information
    if (normalizedRole === 'citizen') {
      report.userGuidance = {
        message: 'This is your complete grievance history. All visible updates and status changes are shown below.',
        nextSteps: getNextStepsForUser(grievance.status)
      };
    } else if (normalizedRole === 'officer') {
      report.officerGuidance = {
        message: 'Internal notes and public updates are shown. Use this to track case progress.',
        assignmentInfo: grievance.assignedTo ? 'Assigned to you' : 'Not assigned'
      };
    } else if (normalizedRole === 'admin') {
      report.adminGuidance = {
        message: 'Full audit trail. All events and activities are visible.',
        systemStats: generateSystemStats(timeline)
      };
    }

    return report;
  } catch (error) {
    console.error('Error generating role-specific report:', error);
    throw error;
  }
};

/**
 * Get next steps for user
 */
const getNextStepsForUser = (status) => {
  const steps = {
    'Pending': 'Your grievance is pending review by the administration.',
    'Assigned': 'Your grievance has been assigned to a government officer for investigation.',
    'In Progress': 'Your grievance is being actively investigated. Updates will be provided soon.',
    'Resolved': 'Your grievance has been resolved. Review the resolution details above.',
    'Closed': 'Your grievance has been closed. If you have additional concerns, you can submit a new grievance.'
  };
  return steps[status] || 'Your grievance is being processed.';
};

/**
 * Generate system stats from timeline
 */
const generateSystemStats = (timeline) => {
  const stats = {
    totalEvents: timeline.length,
    eventBreakdown: {},
    averageResponseTime: 0,
    participatingRoles: new Set()
  };

  timeline.forEach(event => {
    stats.eventBreakdown[event.eventType] = (stats.eventBreakdown[event.eventType] || 0) + 1;
    stats.participatingRoles.add(event.performedBy.role);
  });

  stats.participatingRoles = Array.from(stats.participatingRoles);

  return stats;
};

/**
 * Mask sensitive information for non-admin users
 */
const maskSensitiveData = (data, userRole) => {
  const normalizedRole = normalizeRole(userRole);
  if (normalizedRole === 'admin') {
    return data; // Admins see everything
  }

  // Mask sensitive fields for non-admin users
  const masked = { ...data };

  if (masked.performedBy) {
    // Keep name and role, hide email if not authorized
    if (normalizedRole === 'citizen') {
      masked.performedBy.email = masked.performedBy.email.replace(/(.{2})(.*)(@.*)/, '$1***$3');
    }
  }

  if (masked.ipAddress && userRole !== 'admin') {
    masked.ipAddress = '***'; // Hide IP for non-admins
  }

  return masked;
};

module.exports = {
  checkVisibilityPermission,
  getVisibilityConstraints,
  logTransparencyEvent,
  notifyRolesAboutUpdate,
  getFilteredTimeline,
  getRoleBasedAnalytics,
  generateRoleSpecificReport,
  getNextStepsForUser,
  generateSystemStats,
  maskSensitiveData
};
