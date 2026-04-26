const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const {
  createUserAccount,
  sendCredentialsViaGmail,
  generateBulkAccounts,
  generateAccountsFromCSV,
  getAccountsTemplate,
} = require("../lib/accountGenerator");

const JWT_SECRET = process.env.JWT_SECRET || "defaultsecret";

/**
 * Auth middleware
 */
function auth(req, res, next) {
  const header = req.headers["authorization"];
  if (!header) return res.status(401).json({ error: "Missing auth header" });
  const token = header.split(" ")[1];
  if (!token) return res.status(401).json({ error: "Invalid auth header" });
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.user = payload;
    next();
  } catch (err) {
    return res.status(401).json({ error: "Invalid token" });
  }
}

/**
 * Admin middleware
 */
function adminOnly(req, res, next) {
  if (req.user.role !== "admin") {
    return res.status(403).json({ error: "Admin access required" });
  }
  next();
}

/**
 * POST /api/admin/generate-account
 * Generate single account for admin or officer
 *
 * Request body:
 * {
 *   "name": "Rajesh Kumar",
 *   "email": "rajesh@government.in",
 *   "role": "admin" | "officer",
 *   "department": "Police",
 *   "sendEmail": true
 * }
 */
router.post("/generate-account", auth, adminOnly, async (req, res) => {
  try {
    const { name, email, role, department, sendEmail = true } = req.body;

    if (!name || !email || !role) {
      return res
        .status(400)
        .json({ error: "Missing required fields: name, email, role" });
    }

    if (!["admin", "officer"].includes(role)) {
      return res
        .status(400)
        .json({ error: 'Role must be "admin" or "officer"' });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: "Invalid email format" });
    }

    // Create account
    const createResult = await createUserAccount(
      name,
      email,
      role,
      department || "",
    );

    if (!createResult.success) {
      return res.status(409).json({
        error: createResult.error,
        email,
      });
    }

    // Send email if requested
    let emailResult = null;
    if (sendEmail) {
      emailResult = await sendCredentialsViaGmail(
        createResult.user,
        createResult.user.password,
        process.env.PORTAL_URL || "http://localhost:3000",
      );
    }

    res.status(201).json({
      success: true,
      message: "Account created successfully",
      user: {
        id: createResult.user.id,
        name: createResult.user.name,
        email: createResult.user.email,
        username: createResult.user.username,
        role: createResult.user.role,
        department: createResult.user.department,
        createdAt: createResult.user.createdAt,
      },
      email: sendEmail
        ? {
            sent: emailResult.success,
            message: emailResult.success
              ? "Credentials sent to email"
              : `Email failed: ${emailResult.error}`,
          }
        : { sent: false, message: "Email not sent (disabled)" },
    });
  } catch (error) {
    console.error("Error generating account:", error);
    res.status(500).json({ error: "Server error", details: error.message });
  }
});

/**
 * POST /api/admin/generate-accounts-bulk
 * Generate multiple accounts
 *
 * Request body:
 * {
 *   "accounts": [
 *     { "name": "...", "email": "...", "role": "admin|officer", "department": "..." },
 *     { ... }
 *   ],
 *   "sendEmails": true
 * }
 */
router.post("/generate-accounts-bulk", auth, adminOnly, async (req, res) => {
  try {
    const { accounts, sendEmails = true } = req.body;

    if (!accounts || !Array.isArray(accounts) || accounts.length === 0) {
      return res.status(400).json({ error: "Invalid accounts array" });
    }

    if (accounts.length > 100) {
      return res
        .status(400)
        .json({ error: "Maximum 100 accounts per request" });
    }

    // Validate all accounts
    for (const account of accounts) {
      if (!account.name || !account.email || !account.role) {
        return res
          .status(400)
          .json({ error: "Each account must have: name, email, role" });
      }
      if (!["admin", "officer"].includes(account.role)) {
        return res
          .status(400)
          .json({
            error: `Invalid role: ${account.role}. Must be "admin" or "officer"`,
          });
      }
    }

    // Generate accounts
    const results = await generateBulkAccounts(accounts, sendEmails);

    res.status(201).json({
      success: true,
      message: "Bulk account generation completed",
      summary: {
        total: accounts.length,
        created: results.created.length,
        failed: results.failed.length,
        emailsSent: results.emailsSent.length,
        emailsFailed: results.emailsFailed.length,
      },
      created: results.created,
      failed: results.failed,
      emailsSent: results.emailsSent,
      emailsFailed: results.emailsFailed,
    });
  } catch (error) {
    console.error("Error generating bulk accounts:", error);
    res.status(500).json({ error: "Server error", details: error.message });
  }
});

/**
 * POST /api/admin/generate-accounts-csv
 * Generate accounts from CSV data
 *
 * Request body:
 * {
 *   "csvData": "Name,Email,Role,Department\nRajesh Kumar,rajesh@gov.in,admin,Admin\n...",
 *   "sendEmails": true
 * }
 */
router.post("/generate-accounts-csv", auth, adminOnly, async (req, res) => {
  try {
    const { csvData, sendEmails = true } = req.body;

    if (!csvData || typeof csvData !== "string") {
      return res.status(400).json({ error: "Invalid CSV data" });
    }

    // Generate accounts from CSV
    const results = await generateAccountsFromCSV(csvData);

    if (results.created.length === 0 && results.failed.length === 0) {
      return res
        .status(400)
        .json({ error: "No valid accounts found in CSV data" });
    }

    res.status(201).json({
      success: true,
      message: "CSV account generation completed",
      summary: {
        created: results.created.length,
        failed: results.failed.length,
        emailsSent: results.emailsSent.length,
        emailsFailed: results.emailsFailed.length,
      },
      created: results.created,
      failed: results.failed,
      emailsSent: results.emailsSent,
      emailsFailed: results.emailsFailed,
    });
  } catch (error) {
    console.error("Error generating CSV accounts:", error);
    res.status(500).json({ error: "Server error", details: error.message });
  }
});

/**
 * GET /api/admin/accounts/template
 * Get CSV template for account generation
 */
router.get("/accounts/template", auth, adminOnly, (req, res) => {
  try {
    const template = getAccountsTemplate();
    res.set("Content-Type", "text/csv");
    res.set(
      "Content-Disposition",
      'attachment; filename="account-template.csv"',
    );
    res.send(template);
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

/**
 * POST /api/admin/resend-credentials/:userId
 * Resend credentials to existing user
 */
router.post(
  "/resend-credentials/:userId",
  auth,
  adminOnly,
  async (req, res) => {
    try {
      const user = await User.findById(req.params.userId);

      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      // Generate new temporary password
      const tempPassword =
        require("../lib/accountGenerator").generatePassword();
      const hashedPassword = await require("bcryptjs").hash(tempPassword, 10);

      // Update user password
      user.password = hashedPassword;
      user.lastPasswordResetDate = new Date();
      await user.save();

      // Send new credentials
      const emailResult = await sendCredentialsViaGmail(
        user,
        tempPassword,
        process.env.PORTAL_URL || "http://localhost:3000",
      );

      res.json({
        success: emailResult.success,
        message: emailResult.success
          ? "Credentials resent successfully"
          : `Failed to send email: ${emailResult.error}`,
        email: user.email,
        messageId: emailResult.messageId || null,
      });
    } catch (error) {
      console.error("Error resending credentials:", error);
      res.status(500).json({ error: "Server error", details: error.message });
    }
  },
);

/**
 * GET /api/admin/accounts
 * List all admin and officer accounts
 */
router.get("/accounts", auth, adminOnly, async (req, res) => {
  try {
    const { role, department, limit = 50, skip = 0 } = req.query;

    let query = { role: { $in: ["admin", "officer"] } };

    if (role && ["admin", "officer"].includes(role)) {
      query.role = role;
    }

    if (department) {
      query.department = new RegExp(department, "i");
    }

    const accounts = await User.find(query)
      .select("name email role department username createdAt")
      .limit(parseInt(limit))
      .skip(parseInt(skip))
      .sort({ createdAt: -1 });

    const total = await User.countDocuments(query);

    res.json({
      success: true,
      accounts,
      pagination: {
        total,
        limit: parseInt(limit),
        skip: parseInt(skip),
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

/**
 * GET /api/users/all
 * List all users for admin dashboard (Admin.js) - all roles including citizens
 */
router.get("/users/all", auth, adminOnly, async (req, res) => {
  try {
    console.log("Fetching all users for admin dashboard");
    const users = await User.find({})
      .select("name email phone role createdAt")
      .sort({ createdAt: -1 })
      .limit(100); // Reasonable limit for dashboard

    console.log(`Found ${users.length} users`);
    res.json(users); // Direct array - matches client expectation
  } catch (error) {
    console.error("Error fetching all users:", error);
    res.status(500).json({ error: "Server error fetching users" });
  }
});

/**
 * GET /api/admin/accounts/stats
 * Get stats about admin and officer accounts
 */
router.get("/accounts/stats", auth, adminOnly, async (req, res) => {
  try {
    const adminCount = await User.countDocuments({ role: "admin" });
    const officerCount = await User.countDocuments({ role: "officer" });

    const officersByDepartment = await User.aggregate([
      { $match: { role: "officer" } },
      { $group: { _id: "$department", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    const autoGeneratedCount = await User.countDocuments({
      accountGeneratedAutomatically: true,
      role: { $in: ["admin", "officer"] },
    });

    res.json({
      success: true,
      stats: {
        totalAdmins: adminCount,
        totalOfficers: officerCount,
        totalManagement: adminCount + officerCount,
        officersByDepartment,
        autoGeneratedAccounts: autoGeneratedCount,
      },
    });
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

/**
 * DELETE /api/admin/accounts/:userId
 * Deactivate account (soft delete)
 */
router.delete("/accounts/:userId", auth, adminOnly, async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    if (user.role !== "admin" && user.role !== "officer") {
      return res
        .status(403)
        .json({ error: "Can only deactivate admin and officer accounts" });
    }

    user.isActive = false;
    user.deactivatedAt = new Date();
    user.deactivatedBy = req.user.id;
    await user.save();

    res.json({
      success: true,
      message: "Account deactivated successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        status: "deactivated",
      },
    });
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

/**
 * PUT /api/admin/accounts/:userId
 * Update admin or officer account
 */
router.put("/accounts/:userId", auth, adminOnly, async (req, res) => {
  try {
    const { name, department, isActive } = req.body;
    const user = await User.findById(req.params.userId);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    if (user.role !== "admin" && user.role !== "officer") {
      return res
        .status(403)
        .json({ error: "Can only update admin and officer accounts" });
    }

    if (name) user.name = name;
    if (department) user.department = department;
    if (typeof isActive === "boolean") user.isActive = isActive;

    user.updatedAt = new Date();
    user.updatedBy = req.user.id;
    await user.save();

    res.json({
      success: true,
      message: "Account updated successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
        isActive: user.isActive,
      },
    });
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
