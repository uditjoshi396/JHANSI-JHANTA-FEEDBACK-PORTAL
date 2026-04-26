const express = require('express');
const router = express.Router();
const TransparencyTracker = require('../models/TransparencyTracker');
const Grievance = require('../models/Grievance');
const User = require('../models/User');
const jwt = require('jsonwebtoken');

const normalizeRole = (role) => {
  if (role === 'user' || role === 'citizen') return 'citizen';
  if (role === 'admin' || role === 'officer') return role;
  return 'citizen';
};

const interactionEventTypeForRole = (role) => {
  const normalized = normalizeRole(role);
  if (normalized === 'admin') return 'ADMIN_MESSAGE';
  if (normalized === 'officer') return 'OFFICER_MESSAGE';
  return 'USER_MESSAGE';
};

const getInteractionVisibility = (requestedVisibility, role) => {
  const normalizedRole = normalizeRole(role);
  const requested = (requestedVisibility || 'public').toLowerCase();

  if (normalizedRole === 'citizen') {
    return 'public';
  }

  if (['public', 'staff', 'admin-only'].includes(requested)) {
    return requested;
  }
  return 'public';
};

const canAccessGrievance = (user, grievance) => {
  const role = normalizeRole(user.role);
  if (role === 'admin' || role === 'officer') return true;
  return grievance.citizenId.toString() === user.id;
};

/**
 * Middleware to verify JWT token
 */
const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token' });
  }
};

/**
 * POST: Log a transparency event
 */
router.post('/log-event', authMiddleware, async (req, res) => {
  try {
    const {
      grievanceId,
      eventType,
      description,
      details,
      publicMessage,
      visibleToUser,
      statusFrom,
      statusTo,
      attachments
    } = req.body;

    const grievance = await Grievance.findById(grievanceId);
    if (!grievance) {
      return res.status(404).json({ error: 'Grievance not found' });
    }

    const performer = await User.findById(req.user.id);
    if (!performer) {
      return res.status(404).json({ error: 'User not found' });
    }

    const eventData = {
      grievanceId,
      grievanceSnapshot: {
        title: grievance.title,
        category: grievance.category,
        description: grievance.description.substring(0, 100),
        departmentAssigned: grievance.department || 'General'
      },
      eventType,
      performedBy: {
        userId: performer._id,
        name: performer.name,
        email: performer.email,
        role: normalizeRole(performer.role),
        department: performer.department || 'N/A'
      },
      eventDescription: {
        title: description?.title || eventType,
        message: description?.message || '',
        details: details || {}
      },
      statusTransition: statusFrom && statusTo ? { from: statusFrom, to: statusTo } : undefined,
      publicMessage: publicMessage || null,
      visibleToUser: visibleToUser !== false,
      attachments: attachments || []
    };

    const tracker = await TransparencyTracker.logEvent(eventData);

    res.json({
      success: true,
      message: 'Transparency event logged',
      tracker
    });
  } catch (error) {
    console.error('Error logging transparency event:', error);
    res.status(500).json({ error: 'Failed to log event' });
  }
});

/**
 * GET: Complete timeline for a grievance (for admins)
 */
router.get('/timeline/:grievanceId', authMiddleware, async (req, res) => {
  try {
    const { grievanceId } = req.params;

    // Verify access
    const grievance = await Grievance.findById(grievanceId);
    if (!grievance) {
      return res.status(404).json({ error: 'Grievance not found' });
    }

    // Admin can see all, Officer/User can only see public events
    let timeline;
    const requesterRole = normalizeRole(req.user.role);
    if (requesterRole === 'admin') {
      timeline = await TransparencyTracker.getGrievanceTimeline(grievanceId);
    } else if (requesterRole === 'officer') {
      // Officer sees internal and public events
      timeline = await TransparencyTracker.find({
        grievanceId,
        $or: [
          { visibleToUser: true },
          { visibility: 'staff' },
          { 'performedBy.role': { $in: ['officer', 'admin'] } }
        ]
      })
        .sort({ timestamp: 1 })
        .lean();
    } else {
      // User sees only public events
      timeline = await TransparencyTracker.getUserVisibleTimeline(grievanceId);
    }

    res.json({
      success: true,
      grievanceId,
      timelineEvents: timeline,
      totalEvents: timeline.length
    });
  } catch (error) {
    console.error('Error fetching timeline:', error);
    res.status(500).json({ error: 'Failed to fetch timeline' });
  }
});

/**
 * GET: User-visible timeline (for citizens)
 */
router.get('/user-timeline/:grievanceId', authMiddleware, async (req, res) => {
  try {
    const { grievanceId } = req.params;

    // Verify user owns this grievance
    const grievance = await Grievance.findById(grievanceId);
    if (!grievance) {
      return res.status(404).json({ error: 'Grievance not found' });
    }

    if (grievance.citizenId.toString() !== req.user.id && normalizeRole(req.user.role) !== 'admin') {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const timeline = await TransparencyTracker.getUserVisibleTimeline(grievanceId);

    res.json({
      success: true,
      grievanceId,
      timelineEvents: timeline,
      totalEvents: timeline.length
    });
  } catch (error) {
    console.error('Error fetching user timeline:', error);
    res.status(500).json({ error: 'Failed to fetch timeline' });
  }
});

/**
 * GET: Transparency report for a specific grievance
 */
router.get('/report/:grievanceId', authMiddleware, async (req, res) => {
  try {
    const { grievanceId } = req.params;

    const grievance = await Grievance.findById(grievanceId);
    if (!grievance) {
      return res.status(404).json({ error: 'Grievance not found' });
    }

    // Verify access
    if (grievance.citizenId.toString() !== req.user.id &&
        normalizeRole(req.user.role) !== 'admin' &&
        normalizeRole(req.user.role) !== 'officer') {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const timeline = await TransparencyTracker.getGrievanceTimeline(grievanceId);
    const slaData = await TransparencyTracker.getSLACompliance(grievanceId);

    const report = {
      grievanceId,
      grievanceDetails: {
        title: grievance.title,
        category: grievance.category,
        status: grievance.status,
        priority: grievance.priority
      },
      timeline,
      statistics: {
        totalEvents: timeline.length,
        eventsByType: {},
        eventsByRole: {},
        lastUpdate: timeline.length > 0 ? timeline[timeline.length - 1].timestamp : null
      },
      slaMetrics: slaData[0] || {},
      roleParticipation: {}
    };

    // Process statistics
    timeline.forEach(event => {
      report.statistics.eventsByType[event.eventType] = (report.statistics.eventsByType[event.eventType] || 0) + 1;
      const role = normalizeRole(event.performedBy.role);
      report.statistics.eventsByRole[role] = (report.statistics.eventsByRole[role] || 0) + 1;
    });

    res.json({
      success: true,
      report
    });
  } catch (error) {
    console.error('Error generating report:', error);
    res.status(500).json({ error: 'Failed to generate report' });
  }
});

/**
 * GET: Role-wise activity dashboard (admins only)
 */
router.get('/dashboard/roles', authMiddleware, async (req, res) => {
  try {
    if (normalizeRole(req.user.role) !== 'admin') {
      return res.status(403).json({ error: 'Only admins can access this' });
    }

    const { days = 30 } = req.query;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const activities = await TransparencyTracker.find({
      timestamp: { $gte: startDate }
    }).lean();

    const dashboard = {
      period: { days, startDate },
      summary: {
        totalActivities: activities.length,
        byRole: {},
        byEventType: {},
        averageResponseTime: 0
      },
      roleAnalysis: {}
    };

    // Process activities
    activities.forEach(activity => {
      const role = normalizeRole(activity.performedBy.role);
      dashboard.summary.byRole[role] = (dashboard.summary.byRole[role] || 0) + 1;
      dashboard.summary.byEventType[activity.eventType] = (dashboard.summary.byEventType[activity.eventType] || 0) + 1;
    });

    // Role-wise breakdown
    for (const role of ['citizen', 'admin', 'officer']) {
      const roleActivities = activities.filter(a => normalizeRole(a.performedBy.role) === role);
      dashboard.roleAnalysis[role] = {
        totalActivities: roleActivities.length,
        eventTypes: {},
        averageActivityPerDay: (roleActivities.length / days).toFixed(2)
      };

      roleActivities.forEach(activity => {
        dashboard.roleAnalysis[role].eventTypes[activity.eventType] = 
          (dashboard.roleAnalysis[role].eventTypes[activity.eventType] || 0) + 1;
      });
    }

    res.json({
      success: true,
      dashboard
    });
  } catch (error) {
    console.error('Error fetching dashboard:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard' });
  }
});

/**
 * GET: Grievance progression analytics
 */
router.get('/analytics/grievance/:grievanceId', authMiddleware, async (req, res) => {
  try {
    const { grievanceId } = req.params;

    const grievance = await Grievance.findById(grievanceId);
    if (!grievance) {
      return res.status(404).json({ error: 'Grievance not found' });
    }

    const timeline = await TransparencyTracker.getGrievanceTimeline(grievanceId);
    const dailyStats = await TransparencyTracker.getDailyActivityStats(grievanceId);

    const analytics = {
      grievanceId,
      lifecycle: {
        submittedAt: timeline[0]?.timestamp || null,
        lastUpdatedAt: timeline[timeline.length - 1]?.timestamp || null,
        totalDaysInSystem: Math.floor(
          (timeline[timeline.length - 1]?.timestamp - timeline[0]?.timestamp) / (1000 * 60 * 60 * 24)
        ) || 0
      },
      roleInteractions: {},
      keyMilestones: [],
      activityTrend: dailyStats
    };

    // Track role interactions
    timeline.forEach(event => {
      const role = normalizeRole(event.performedBy.role);
      if (!analytics.roleInteractions[role]) {
        analytics.roleInteractions[role] = {
          count: 0,
          firstInteraction: null,
          lastInteraction: null,
          events: []
        };
      }
      analytics.roleInteractions[role].count++;
      if (!analytics.roleInteractions[role].firstInteraction) {
        analytics.roleInteractions[role].firstInteraction = event.timestamp;
      }
      analytics.roleInteractions[role].lastInteraction = event.timestamp;
      analytics.roleInteractions[role].events.push(event.eventType);
    });

    // Key milestones
    const milestones = timeline.filter(e => 
      ['SUBMITTED', 'ASSIGNED_TO_OFFICER', 'PROGRESS_UPDATE', 'RESOLVED', 'RESOLUTION_PROVIDED', 'CLOSED'].includes(e.eventType)
    );
    analytics.keyMilestones = milestones;

    res.json({
      success: true,
      analytics
    });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
});

/**
 * GET: Department-wise performance (admins only)
 */
router.get('/analytics/department', authMiddleware, async (req, res) => {
  try {
    if (normalizeRole(req.user.role) !== 'admin') {
      return res.status(403).json({ error: 'Only admins can access this' });
    }

    const { days = 30 } = req.query;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const activities = await TransparencyTracker.find({
      timestamp: { $gte: startDate }
    }).lean();

    const departmentAnalytics = {};

    activities.forEach(activity => {
      const dept = activity.department?.departmentName || 'Unassigned';
      if (!departmentAnalytics[dept]) {
        departmentAnalytics[dept] = {
          totalActivities: 0,
          officersInvolved: new Set(),
          eventTypes: {},
          averageResolutionTime: 0
        };
      }
      departmentAnalytics[dept].totalActivities++;
      if (activity.department?.officerAssigned?.officerName) {
        departmentAnalytics[dept].officersInvolved.add(activity.department.officerAssigned.officerName);
      }
      departmentAnalytics[dept].eventTypes[activity.eventType] = 
        (departmentAnalytics[dept].eventTypes[activity.eventType] || 0) + 1;
    });

    // Convert Sets to arrays
    Object.keys(departmentAnalytics).forEach(dept => {
      departmentAnalytics[dept].officersInvolved = Array.from(departmentAnalytics[dept].officersInvolved);
    });

    res.json({
      success: true,
      period: { days, startDate },
      departmentAnalytics
    });
  } catch (error) {
    console.error('Error fetching department analytics:', error);
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
});

/**
 * GET: Role-to-role interactions for a grievance
 * Visible communication between citizen, admin and government officer
 */
router.get('/interactions/:grievanceId', authMiddleware, async (req, res) => {
  try {
    const { grievanceId } = req.params;
    const { limit = 200 } = req.query;
    const userRole = normalizeRole(req.user.role);

    const grievance = await Grievance.findById(grievanceId);
    if (!grievance) {
      return res.status(404).json({ error: 'Grievance not found' });
    }

    if (!canAccessGrievance(req.user, grievance)) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const interactionEvents = ['USER_MESSAGE', 'ADMIN_MESSAGE', 'OFFICER_MESSAGE', 'COMMENT_ADDED', 'PROGRESS_UPDATE'];
    let query = {
      grievanceId,
      eventType: { $in: interactionEvents }
    };

    if (userRole === 'citizen') {
      query = { ...query, visibleToUser: true };
    } else if (userRole === 'officer') {
      query = {
        ...query,
        visibility: { $in: ['public', 'staff', 'officer-only', null] }
      };
    }

    const interactions = await TransparencyTracker.find(query)
      .sort({ timestamp: 1 })
      .limit(parseInt(limit))
      .lean();

    const unreadCount = interactions.filter((item) => {
      const receipts = item.readReceipts || [];
      return !receipts.some((r) => String(r.userId) === req.user.id || normalizeRole(r.role) === userRole);
    }).length;

    const byRole = {};
    interactions.forEach((entry) => {
      const role = normalizeRole(entry?.performedBy?.role);
      byRole[role] = (byRole[role] || 0) + 1;
    });

    res.json({
      success: true,
      grievanceId,
      interactions,
      stats: {
        total: interactions.length,
        unread: unreadCount,
        byRole
      }
    });
  } catch (error) {
    console.error('Error fetching interactions:', error);
    res.status(500).json({ error: 'Failed to fetch interactions' });
  }
});

/**
 * POST: Add transparent interaction message between citizen/admin/officer
 */
router.post('/interactions/:grievanceId', authMiddleware, async (req, res) => {
  try {
    const { grievanceId } = req.params;
    const { message, visibility = 'public', replyToEventId = null } = req.body;
    const userRole = normalizeRole(req.user.role);

    const sanitizedMessage = typeof message === 'string' ? message.trim().slice(0, 2000) : '';
    if (!sanitizedMessage) {
      return res.status(400).json({ error: 'Message is required' });
    }

    const grievance = await Grievance.findById(grievanceId);
    if (!grievance) {
      return res.status(404).json({ error: 'Grievance not found' });
    }

    if (!canAccessGrievance(req.user, grievance)) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const effectiveVisibility = getInteractionVisibility(visibility, userRole);
    if (userRole === 'citizen' && effectiveVisibility !== 'public') {
      return res.status(403).json({ error: 'Citizens can post only public interaction messages' });
    }

    const performer = await User.findById(req.user.id);
    if (!performer) {
      return res.status(404).json({ error: 'User not found' });
    }

    const eventType = interactionEventTypeForRole(userRole);
    const isPublic = effectiveVisibility === 'public';

    const tracker = await TransparencyTracker.logEvent({
      grievanceId,
      grievanceSnapshot: {
        title: grievance.title,
        category: grievance.category,
        description: grievance.description?.substring(0, 100) || '',
        departmentAssigned: grievance.department || 'General'
      },
      eventType,
      performedBy: {
        userId: performer._id,
        name: performer.name,
        email: performer.email,
        role: userRole,
        department: performer.department || 'N/A'
      },
      eventDescription: {
        title: `${userRole.toUpperCase()} MESSAGE`,
        message: sanitizedMessage,
        details: {
          replyToEventId,
          interactionVisibility: effectiveVisibility
        }
      },
      publicMessage: isPublic ? sanitizedMessage : null,
      visibleToUser: isPublic,
      visibility: effectiveVisibility,
      interaction: {
        channel: isPublic ? 'public-chat' : 'staff-note',
        replyToEventId,
        audience: isPublic ? ['citizen', 'admin', 'officer'] : ['admin', 'officer']
      }
    });

    res.status(201).json({
      success: true,
      message: 'Interaction message posted',
      interaction: tracker
    });
  } catch (error) {
    console.error('Error posting interaction:', error);
    res.status(500).json({ error: 'Failed to post interaction' });
  }
});

/**
 * PATCH: Mark an interaction message as read
 */
router.patch('/interactions/:eventId/read', authMiddleware, async (req, res) => {
  try {
    const { eventId } = req.params;
    const userRole = normalizeRole(req.user.role);

    const interaction = await TransparencyTracker.findById(eventId);
    if (!interaction) {
      return res.status(404).json({ error: 'Interaction not found' });
    }

    const grievance = await Grievance.findById(interaction.grievanceId);
    if (!grievance) {
      return res.status(404).json({ error: 'Grievance not found' });
    }

    if (!canAccessGrievance(req.user, grievance)) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    interaction.readReceipts = interaction.readReceipts || [];
    const existingIndex = interaction.readReceipts.findIndex(
      (receipt) => String(receipt.userId) === req.user.id
    );

    if (existingIndex >= 0) {
      interaction.readReceipts[existingIndex].readAt = new Date();
      interaction.readReceipts[existingIndex].role = userRole;
    } else {
      interaction.readReceipts.push({
        userId: req.user.id,
        role: userRole,
        readAt: new Date()
      });
    }

    await interaction.save();

    res.json({
      success: true,
      message: 'Interaction marked as read',
      readReceipts: interaction.readReceipts
    });
  } catch (error) {
    console.error('Error marking interaction as read:', error);
    res.status(500).json({ error: 'Failed to update read status' });
  }
});

/**
 * GET: Export transparency report (PDF/CSV)
 */
router.get('/export/:grievanceId', authMiddleware, async (req, res) => {
  try {
    const { grievanceId } = req.params;
    const { format = 'json' } = req.query;

    const grievance = await Grievance.findById(grievanceId);
    if (!grievance) {
      return res.status(404).json({ error: 'Grievance not found' });
    }

    // Verify access
    if (!canAccessGrievance(req.user, grievance)) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const timeline = await TransparencyTracker.getGrievanceTimeline(grievanceId);

    const reportData = {
      grievanceId,
      exportDate: new Date(),
      grievanceDetails: {
        title: grievance.title,
        category: grievance.category,
        status: grievance.status,
        priority: grievance.priority,
        submittedAt: grievance.createdAt,
        lastUpdated: grievance.updatedAt
      },
      timeline: timeline.map(event => ({
        timestamp: event.timestamp,
        eventType: event.eventType,
        performedBy: `${event.performedBy.name} (${event.performedBy.role})`,
        description: event.eventDescription?.message,
        publicMessage: event.publicMessage
      }))
    };

    if (format === 'json') {
      res.json({
        success: true,
        data: reportData
      });
    } else if (format === 'csv') {
      // Generate CSV
      let csv = 'Timestamp,Event Type,Performer,Role,Description,Public Message\n';
      timeline.forEach(event => {
        csv += `"${event.timestamp}","${event.eventType}","${event.performedBy.name}","${event.performedBy.role}","${event.eventDescription?.message || ''}","${event.publicMessage || ''}"\n`;
      });
      
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="grievance-${grievanceId}-report.csv"`);
      res.send(csv);
    }
  } catch (error) {
    console.error('Error exporting report:', error);
    res.status(500).json({ error: 'Failed to export report' });
  }
});

/**
 * POST: Add public message to timeline
 */
router.post('/add-public-message/:grievanceId', authMiddleware, async (req, res) => {
  try {
    const { grievanceId } = req.params;
    const { message, eventType } = req.body;

    // Only admin/officer can add public messages
    if (!['admin', 'officer'].includes(normalizeRole(req.user.role))) {
      return res.status(403).json({ error: 'Only admins and officers can add messages' });
    }

    const grievance = await Grievance.findById(grievanceId);
    if (!grievance) {
      return res.status(404).json({ error: 'Grievance not found' });
    }

    const performer = await User.findById(req.user.id);

    const eventData = {
      grievanceId,
      eventType: eventType || 'PROGRESS_UPDATE',
      performedBy: {
        userId: performer._id,
        name: performer.name,
        email: performer.email,
        role: normalizeRole(performer.role)
      },
      publicMessage: message,
      visibleToUser: true,
      visibility: 'public',
      eventDescription: {
        title: 'Status Update',
        message: message
      }
    };

    const tracker = await TransparencyTracker.logEvent(eventData);

    res.json({
      success: true,
      message: 'Public message added',
      tracker
    });
  } catch (error) {
    console.error('Error adding public message:', error);
    res.status(500).json({ error: 'Failed to add message' });
  }
});

module.exports = router;
