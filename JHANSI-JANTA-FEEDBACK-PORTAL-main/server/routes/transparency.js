const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const ActivityLog = require("../models/ActivityLog");
const Grievance = require("../models/Grievance");
const User = require("../models/User");

// Auth middleware
function auth(req, res, next) {
  const header = req.headers["authorization"];
  if (!header) return res.status(401).json({ error: "Missing auth header" });
  const token = header.split(" ")[1];
  if (!token) return res.status(401).json({ error: "Invalid auth header" });
  try {
    const payload = jwt.verify(
      token,
      process.env.JWT_SECRET || "defaultsecret",
    );
    req.user = payload;
    next();
  } catch (err) {
    return res.status(401).json({ error: "Invalid token" });
  }
}

// Log activity helper
async function logActivity(
  userId,
  userRole,
  action,
  actionType,
  grievanceId,
  targetUserId,
  description,
  changes,
  metadata = {},
) {
  try {
    const activityLog = new ActivityLog({
      userId,
      userRole,
      action,
      actionType,
      grievanceId,
      targetUserId,
      description,
      changes,
      metadata,
    });
    await activityLog.save();
  } catch (err) {
    console.error("Error logging activity:", err);
  }
}

// Get transparency dashboard data
router.get("/dashboard", auth, async (req, res) => {
  try {
    const { role, id } = req.user;

    let query = {};
    let grievanceQuery = {};

    if (role === "citizen") {
      // Citizens see only their own grievances and activities
      grievanceQuery = { citizenId: id };
      query = { userId: id };
    } else if (role === "officer") {
      // Officers see grievances assigned to them
      grievanceQuery = { assignedTo: id };
      // And all activities related to their assigned grievances
      const assignedGrievances = await Grievance.find({
        assignedTo: id,
      }).select("_id");
      const grievanceIds = assignedGrievances.map((g) => g._id);
      query = {
        $or: [{ grievanceId: { $in: grievanceIds } }, { userId: id }],
      };
    } else if (role === "admin") {
      // Admins see everything
      query = {};
      grievanceQuery = {};
    }

    // Get stats
    const totalGrievances = await Grievance.countDocuments(grievanceQuery);
    const pendingGrievances = await Grievance.countDocuments({
      ...grievanceQuery,
      status: "Pending",
    });
    const assignedGrievances = await Grievance.countDocuments({
      ...grievanceQuery,
      status: "Assigned",
    });
    const resolvedGrievances = await Grievance.countDocuments({
      ...grievanceQuery,
      status: "Resolved",
    });

    // Get recent activities
    const recentActivities = await ActivityLog.find(query)
      .populate("userId", "name email role")
      .populate("grievanceId", "title status priority")
      .populate("targetUserId", "name email role")
      .sort({ timestamp: -1 })
      .limit(20);

    // Get activity breakdown by type
    const activityBreakdown = await ActivityLog.aggregate([
      { $match: query },
      { $group: { _id: "$actionType", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    // Get activity by user role
    const activityByRole = await ActivityLog.aggregate([
      { $match: query },
      { $group: { _id: "$userRole", count: { $sum: 1 } } },
    ]);

    res.json({
      stats: {
        totalGrievances,
        pendingGrievances,
        assignedGrievances,
        resolvedGrievances,
      },
      recentActivities,
      activityBreakdown,
      activityByRole,
    });
  } catch (err) {
    console.error("Error fetching transparency dashboard:", err);
    res.status(500).json({ error: "Failed to fetch transparency data" });
  }
});

// Get activity logs with filters
router.get("/logs", auth, async (req, res) => {
  try {
    const { role, id } = req.user;
    const {
      grievanceId,
      actionType,
      startDate,
      endDate,
      limit = 50,
      skip = 0,
    } = req.query;

    let query = {};

    // Role-based access control
    if (role === "citizen") {
      query = { userId: id };
    } else if (role === "officer") {
      const assignedGrievances = await Grievance.find({
        assignedTo: id,
      }).select("_id");
      const grievanceIds = assignedGrievances.map((g) => g._id);
      query = {
        $or: [{ grievanceId: { $in: grievanceIds } }, { userId: id }],
      };
    }
    // Admins see everything (no query filters)

    // Add optional filters
    if (grievanceId) query.grievanceId = grievanceId;
    if (actionType) query.actionType = actionType;

    if (startDate || endDate) {
      query.timestamp = {};
      if (startDate) query.timestamp.$gte = new Date(startDate);
      if (endDate) query.timestamp.$lte = new Date(endDate);
    }

    const logs = await ActivityLog.find(query)
      .populate("userId", "name email role")
      .populate("grievanceId", "title status")
      .populate("targetUserId", "name email")
      .sort({ timestamp: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(skip));

    const total = await ActivityLog.countDocuments(query);

    res.json({
      logs,
      total,
      page: Math.floor(parseInt(skip) / parseInt(limit)) + 1,
      pages: Math.ceil(total / parseInt(limit)),
    });
  } catch (err) {
    console.error("Error fetching activity logs:", err);
    res.status(500).json({ error: "Failed to fetch logs" });
  }
});

// Get grievance audit trail
router.get("/grievance/:grievanceId/audit", auth, async (req, res) => {
  try {
    const { grievanceId } = req.params;
    const { role, id } = req.user;

    // Verify access
    const grievance = await Grievance.findById(grievanceId);
    if (!grievance)
      return res.status(404).json({ error: "Grievance not found" });

    const hasAccess =
      role === "admin" ||
      (role === "citizen" && grievance.citizenId.toString() === id) ||
      (role === "officer" &&
        grievance.assignedTo &&
        grievance.assignedTo.toString() === id);

    if (!hasAccess) return res.status(403).json({ error: "Access denied" });

    // Get audit trail
    const auditTrail = await ActivityLog.find({ grievanceId })
      .populate("userId", "name email role")
      .populate("targetUserId", "name email")
      .sort({ timestamp: 1 });

    res.json({
      grievance: {
        _id: grievance._id,
        title: grievance.title,
        status: grievance.status,
        priority: grievance.priority,
        createdAt: grievance.createdAt,
      },
      auditTrail,
    });
  } catch (err) {
    console.error("Error fetching audit trail:", err);
    res.status(500).json({ error: "Failed to fetch audit trail" });
  }
});

// Get user activity summary
router.get("/user/:userId/summary", auth, async (req, res) => {
  try {
    const { userId } = req.params;
    const { role, id } = req.user;

    // Access control
    if (role === "citizen" && userId !== id) {
      return res
        .status(403)
        .json({ error: "Cannot view other citizens' activities" });
    }

    const user = await User.findById(userId).select("name email role");
    if (!user) return res.status(404).json({ error: "User not found" });

    // Get activity stats
    const totalActions = await ActivityLog.countDocuments({ userId });

    const actionCounts = await ActivityLog.aggregate([
      { $match: { userId: mongoose.Types.ObjectId(userId) } },
      { $group: { _id: "$actionType", count: { $sum: 1 } } },
    ]);

    const recentActivities = await ActivityLog.find({ userId })
      .populate("grievanceId", "title status")
      .sort({ timestamp: -1 })
      .limit(10);

    res.json({
      user,
      totalActions,
      actionCounts,
      recentActivities,
    });
  } catch (err) {
    console.error("Error fetching user summary:", err);
    res.status(500).json({ error: "Failed to fetch user summary" });
  }
});

// Get system-wide transparency report (admin only)
router.get("/report/system", auth, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ error: "Admin access required" });
    }

    const { startDate, endDate } = req.query;

    let dateQuery = {};
    if (startDate || endDate) {
      dateQuery.timestamp = {};
      if (startDate) dateQuery.timestamp.$gte = new Date(startDate);
      if (endDate) dateQuery.timestamp.$lte = new Date(endDate);
    }

    // Activity statistics
    const totalActivities = await ActivityLog.countDocuments(dateQuery);
    const activitiesByRole = await ActivityLog.aggregate([
      { $match: dateQuery },
      { $group: { _id: "$userRole", count: { $sum: 1 } } },
    ]);
    const activitiesByType = await ActivityLog.aggregate([
      { $match: dateQuery },
      { $group: { _id: "$actionType", count: { $sum: 1 } } },
    ]);

    // Grievance statistics
    const totalGrievances = await Grievance.countDocuments();
    const grievancesByStatus = await Grievance.aggregate([
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]);
    const grievancesByPriority = await Grievance.aggregate([
      { $group: { _id: "$priority", count: { $sum: 1 } } },
    ]);

    // User statistics
    const userStats = await User.aggregate([
      { $group: { _id: "$role", count: { $sum: 1 } } },
    ]);

    // Most active users
    const mostActiveUsers = await ActivityLog.aggregate([
      { $match: dateQuery },
      { $group: { _id: "$userId", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "user",
        },
      },
    ]);

    res.json({
      period: { startDate, endDate },
      activities: {
        total: totalActivities,
        byRole: activitiesByRole,
        byType: activitiesByType,
      },
      grievances: {
        total: totalGrievances,
        byStatus: grievancesByStatus,
        byPriority: grievancesByPriority,
      },
      users: {
        stats: userStats,
      },
      mostActiveUsers: mostActiveUsers.map((record) => ({
        userId: record._id,
        user: record.user[0],
        activityCount: record.count,
      })),
    });
  } catch (err) {
    console.error("Error generating system report:", err);
    res.status(500).json({ error: "Failed to generate report" });
  }
});

// Export activity logs (admin only)
router.get("/export/csv", auth, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ error: "Admin access required" });
    }

    const logs = await ActivityLog.find()
      .populate("userId", "name email role")
      .populate("grievanceId", "title status")
      .lean();

    let csv = "Timestamp,User,Role,Action,Grievance ID,Description,Changes\n";
    logs.forEach((log) => {
      csv += `"${log.timestamp}","${log.userId?.name || "N/A"}","${log.userRole}","${log.action}","${log.grievanceId?._id || "N/A"}","${log.description}","${JSON.stringify(log.changes).replace(/"/g, '\\"')}"\n`;
    });

    res.setHeader("Content-Type", "text/csv");
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=transparency-logs.csv",
    );
    res.send(csv);
  } catch (err) {
    console.error("Error exporting logs:", err);
    res.status(500).json({ error: "Failed to export logs" });
  }
});

module.exports = router;
