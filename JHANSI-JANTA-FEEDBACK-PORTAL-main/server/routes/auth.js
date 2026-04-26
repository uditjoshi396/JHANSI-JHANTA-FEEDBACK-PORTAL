const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const passport = require("passport");
const User = require("../models/User");
const { sendMail, isMailerConfigured } = require("../lib/mailer");

const JWT_SECRET = process.env.JWT_SECRET || "dev_jwt_secret_change_me";
if (!process.env.JWT_SECRET) {
  console.warn(
    "[config] JWT_SECRET is not set. Using insecure fallback secret.",
  );
}
const ADMIN_REGISTRATION_CODE = process.env.ADMIN_REGISTRATION_CODE || "";
const OFFICER_REGISTRATION_CODE = process.env.OFFICER_REGISTRATION_CODE || "";
const ALLOWED_ROLES = new Set(["citizen", "officer", "admin"]);
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const TWO_FACTOR_CODE_TTL_MS = Number(process.env.TWO_FACTOR_CODE_TTL_MS || 10 * 60 * 1000);
const TWO_FACTOR_RESEND_COOLDOWN_MS = Number(process.env.TWO_FACTOR_RESEND_COOLDOWN_MS || 30 * 1000);
const TWO_FACTOR_MAX_ATTEMPTS = Number(process.env.TWO_FACTOR_MAX_ATTEMPTS || 5);
const PASSWORD_RESET_CODE_TTL_MS = Number(
  process.env.PASSWORD_RESET_CODE_TTL_MS || 15 * 60 * 1000,
);
const PASSWORD_RESET_RESEND_COOLDOWN_MS = Number(
  process.env.PASSWORD_RESET_RESEND_COOLDOWN_MS || 30 * 1000,
);
const PASSWORD_RESET_MAX_ATTEMPTS = Number(
  process.env.PASSWORD_RESET_MAX_ATTEMPTS || 5,
);

function normalizeRole(role) {
  if (!role || role === "user") return "citizen";
  return role;
}

function isValidEmailFormat(email) {
  return EMAIL_REGEX.test(email);
}

function buildAuthPayload(user) {
  return {
    id: user._id,
    name: user.name,
    email: user.email,
    role: normalizeRole(user.role),
  };
}

function isTwoFactorConfigured() {
  return isMailerConfigured();
}

function isPasswordResetConfigured() {
  return isMailerConfigured();
}

function shouldRequireTwoFactor(user) {
  if (String(process.env.DISABLE_2FA || "").toLowerCase() === "true") {
    return false;
  }
  if (!isTwoFactorConfigured()) return false;
  if (user.twoFactorEnabled === false) return false;
  return true;
}

function generateTwoFactorCode() {
  return crypto.randomInt(0, 1000000).toString().padStart(6, "0");
}

function generatePasswordResetCode() {
  return crypto.randomInt(0, 1000000).toString().padStart(6, "0");
}

async function sendTwoFactorEmail(user, code) {
  const subject = "Your verification code";
  const html = `
    <p>Hi ${user.name || "there"},</p>
    <p>Your verification code is:</p>
    <h2 style="letter-spacing: 4px;">${code}</h2>
    <p>This code expires in ${Math.round(TWO_FACTOR_CODE_TTL_MS / 60000)} minutes.</p>
    <p>If you did not attempt to log in, you can ignore this email.</p>
  `;
  await sendMail(user.email, subject, html);
}

async function sendPasswordResetEmail(user, code) {
  const subject = "Your password reset code";
  const html = `
    <p>Hi ${user.name || "there"},</p>
    <p>Use the verification code below to reset your password:</p>
    <h2 style="letter-spacing: 4px;">${code}</h2>
    <p>This code expires in ${Math.round(PASSWORD_RESET_CODE_TTL_MS / 60000)} minutes.</p>
    <p>If you did not request a password reset, you can ignore this email.</p>
  `;
  await sendMail(user.email, subject, html);
}

async function issueTwoFactorCode(user, method = "email") {
  if (method !== "email") {
    throw new Error("SMS 2FA is not configured");
  }

  const code = generateTwoFactorCode();
  const hash = await bcrypt.hash(code, 10);
  user.twoFactorCodeHash = hash;
  user.twoFactorCodeExpiresAt = new Date(Date.now() + TWO_FACTOR_CODE_TTL_MS);
  user.twoFactorLastSentAt = new Date();
  user.twoFactorAttempts = 0;
  user.twoFactorMethod = method;
  await user.save();

  await sendTwoFactorEmail(user, code);
}

async function issuePasswordResetCode(user) {
  const code = generatePasswordResetCode();
  const hash = await bcrypt.hash(code, 10);
  user.resetCodeHash = hash;
  user.resetCodeExpiresAt = new Date(Date.now() + PASSWORD_RESET_CODE_TTL_MS);
  user.resetLastSentAt = new Date();
  user.resetAttempts = 0;
  await user.save();

  await sendPasswordResetEmail(user, code);
}

function checkPasswordStrength(password) {
  let strength = 0;
  if (password.length >= 8) strength++;
  if (/[A-Z]/.test(password)) strength++;
  if (/[a-z]/.test(password)) strength++;
  if (/[0-9]/.test(password)) strength++;
  if (/[^A-Za-z0-9]/.test(password)) strength++;
  return strength;
}

function isValidPasswordFormat(password) {
  return (
    typeof password === "string" &&
    password.length >= 8 &&
    password.length <= 128 &&
    checkPasswordStrength(password) >= 3
  );
}

// Register
router.post("/register", async (req, res) => {
  try {
    const { name, email, phone, password, role, adminCode, registrationCode } =
      req.body;
    const normalizedRole = normalizeRole(role);

    // Validate required fields
    if (!name || !email || !password) {
      return res
        .status(400)
        .json({
          error:
            "Missing required fields: name, email, and password are required",
        });
    }

    if (!ALLOWED_ROLES.has(normalizedRole)) {
      return res
        .status(400)
        .json({
          error: "Invalid role. Allowed roles: citizen, officer, admin",
        });
    }

    if (
      normalizedRole === "admin" &&
      ADMIN_REGISTRATION_CODE &&
      adminCode !== ADMIN_REGISTRATION_CODE
    ) {
      return res.status(403).json({ error: "Invalid admin registration code" });
    }

    if (
      normalizedRole === "officer" &&
      OFFICER_REGISTRATION_CODE &&
      registrationCode !== OFFICER_REGISTRATION_CODE
    ) {
      return res
        .status(403)
        .json({ error: "Invalid officer registration code" });
    }

    // Check for existing user
    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(409).json({ error: "Email already registered" });
    }

    // Hash password
    const hash = await bcrypt.hash(password, 10);

    // Create user
    const user = new User({
      name,
      email: email.toLowerCase(),
      phone,
      password: hash,
      role: normalizedRole,
    });

    // Save to database
    const savedUser = await user.save();
    const authPayload = buildAuthPayload(savedUser);
    const token = jwt.sign(authPayload, JWT_SECRET, { expiresIn: "7d" });

    res.status(201).json({
      success: true,
      token,
      user: {
        id: savedUser._id,
        name: savedUser.name,
        email: savedUser.email,
        role: normalizeRole(savedUser.role),
      },
    });
  } catch (err) {
    console.error("Registration error:", err.message);
    res.status(500).json({ error: "Server error" });
  }
});

// Check if an email is available before registration
router.post("/check-email", async (req, res) => {
  try {
    const email = req.body?.email?.toLowerCase?.().trim?.();
    if (!email || !isValidEmailFormat(email)) {
      return res.status(400).json({ error: "Valid email is required" });
    }

    const existing = await User.findOne({ email }).select("_id");
    res.json({ available: !existing });
  } catch (err) {
    console.error("Check email error:", err.message);
    res.status(500).json({ error: "Server error" });
  }
});

// Lightweight endpoint for client-side auth attempt audit hooks
router.post("/log-attempt", async (req, res) => {
  try {
    const { email, success, error, timestamp } = req.body || {};
    const normalizedEmail = email?.toLowerCase?.().trim?.() || "unknown";
    console.log("[auth-attempt]", {
      email: normalizedEmail,
      success: Boolean(success),
      error: error || null,
      timestamp: timestamp || new Date().toISOString(),
      ip: req.ip,
    });
    res.status(201).json({ success: true });
  } catch (err) {
    console.error("Log attempt error:", err.message);
    res.status(500).json({ error: "Server error" });
  }
});

// Unified login helper (optionally enforce role)
function loginHandler(requiredRole) {
  return async (req, res) => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ error: "Email and password required" });
      }

      const user = await User.findOne({ email: email.toLowerCase() });
      if (!user) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      // If a role is required (admin/officer), ensure the user has it
      if (requiredRole) {
        const userRole = normalizeRole(user.role);
        if (userRole !== requiredRole) {
          return res
            .status(403)
            .json({ error: "Insufficient role for this login endpoint" });
        }
      }

      const ok = await bcrypt.compare(password, user.password);
      if (!ok) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      if (shouldRequireTwoFactor(user)) {
        try {
          await issueTwoFactorCode(user, "email");
        } catch (error) {
          console.error("2FA email error:", error.message);
          if (error.code === "SMTP_NOT_CONFIGURED") {
            return res.status(503).json({ error: "Email service is not configured" });
          }
          return res.status(500).json({ error: "Unable to send verification code" });
        }
        return res.json({
          requires2FA: true,
          method: "email",
          expiresIn: Math.floor(TWO_FACTOR_CODE_TTL_MS / 1000),
        });
      }

      const authPayload = buildAuthPayload(user);
      const token = jwt.sign(authPayload, JWT_SECRET, { expiresIn: "7d" });

      res.json({
        success: true,
        token,
        user: authPayload,
      });
    } catch (err) {
      console.error("Login error:", err.message);
      res.status(500).json({ error: "Server error" });
    }
  };
}

// Login endpoints
router.post("/login", loginHandler(null));
router.post("/admin-login", loginHandler("admin"));
router.post("/officer-login", loginHandler("officer"));

router.post("/verify-2fa", async (req, res) => {
  try {
    const { email, code, method = "email" } = req.body || {};
    const normalizedEmail = email?.toLowerCase?.().trim?.();
    if (!normalizedEmail || !code) {
      return res.status(400).json({ error: "Email and code are required" });
    }

    if (method !== "email") {
      return res.status(400).json({ error: "SMS 2FA is not configured" });
    }

    const user = await User.findOne({ email: normalizedEmail });
    if (!user) return res.status(404).json({ error: "User not found" });

    if (!user.twoFactorCodeHash || !user.twoFactorCodeExpiresAt) {
      return res.status(400).json({ error: "No verification code pending" });
    }

    if (user.twoFactorCodeExpiresAt.getTime() < Date.now()) {
      user.twoFactorCodeHash = null;
      user.twoFactorCodeExpiresAt = null;
      user.twoFactorAttempts = 0;
      await user.save();
      return res.status(400).json({ error: "Verification code expired" });
    }

    if (user.twoFactorAttempts >= TWO_FACTOR_MAX_ATTEMPTS) {
      user.twoFactorCodeHash = null;
      user.twoFactorCodeExpiresAt = null;
      user.twoFactorAttempts = 0;
      await user.save();
      return res.status(429).json({ error: "Too many attempts. Please request a new code." });
    }

    const match = await bcrypt.compare(String(code), user.twoFactorCodeHash);
    if (!match) {
      user.twoFactorAttempts += 1;
      await user.save();
      return res.status(401).json({ error: "Invalid verification code" });
    }

    user.twoFactorCodeHash = null;
    user.twoFactorCodeExpiresAt = null;
    user.twoFactorAttempts = 0;
    user.twoFactorLastSentAt = null;
    await user.save();

    const authPayload = buildAuthPayload(user);
    const token = jwt.sign(authPayload, JWT_SECRET, { expiresIn: "7d" });
    return res.json({ success: true, token, user: authPayload });
  } catch (err) {
    console.error("2FA verify error:", err.message);
    return res.status(500).json({ error: "Server error" });
  }
});

router.post("/resend-2fa", async (req, res) => {
  try {
    const { email, method = "email" } = req.body || {};
    const normalizedEmail = email?.toLowerCase?.().trim?.();
    if (!normalizedEmail) {
      return res.status(400).json({ error: "Email is required" });
    }

    if (method !== "email") {
      return res.status(400).json({ error: "SMS 2FA is not configured" });
    }

    const user = await User.findOne({ email: normalizedEmail });
    if (!user) return res.status(404).json({ error: "User not found" });

    if (!shouldRequireTwoFactor(user)) {
      return res.status(400).json({ error: "Two-factor authentication is not enabled" });
    }

    if (user.twoFactorLastSentAt) {
      const elapsed = Date.now() - user.twoFactorLastSentAt.getTime();
      if (elapsed < TWO_FACTOR_RESEND_COOLDOWN_MS) {
        const retryAfter = Math.ceil((TWO_FACTOR_RESEND_COOLDOWN_MS - elapsed) / 1000);
        return res.status(429).json({ error: `Please wait ${retryAfter}s before resending`, retryAfter });
      }
    }

    try {
      await issueTwoFactorCode(user, "email");
    } catch (error) {
      console.error("2FA resend error:", error.message);
      return res.status(500).json({ error: "Unable to send verification code" });
    }

    return res.json({ success: true });
  } catch (err) {
    console.error("2FA resend error:", err.message);
    return res.status(500).json({ error: "Server error" });
  }
});

// Password reset: request code
router.post("/forgot-password", async (req, res) => {
  try {
    const normalizedEmail = req.body?.email?.toLowerCase?.().trim?.();
    if (!normalizedEmail || !isValidEmailFormat(normalizedEmail)) {
      return res.status(400).json({ error: "Valid email is required" });
    }

    if (!isPasswordResetConfigured()) {
      return res.status(503).json({ error: "Email service is not configured" });
    }

    const user = await User.findOne({ email: normalizedEmail });

    // Always return success to prevent account enumeration
    if (!user) {
      return res.json({ success: true });
    }

    if (user.resetLastSentAt) {
      const elapsed = Date.now() - user.resetLastSentAt.getTime();
      if (elapsed < PASSWORD_RESET_RESEND_COOLDOWN_MS) {
        const retryAfter = Math.ceil(
          (PASSWORD_RESET_RESEND_COOLDOWN_MS - elapsed) / 1000,
        );
        return res
          .status(429)
          .json({ error: `Please wait ${retryAfter}s before requesting a new code`, retryAfter });
      }
    }

    try {
      await issuePasswordResetCode(user);
    } catch (error) {
      console.error("Password reset email error:", error.message);
      user.resetCodeHash = null;
      user.resetCodeExpiresAt = null;
      user.resetLastSentAt = null;
      user.resetAttempts = 0;
      await user.save();
      if (error.code === "SMTP_NOT_CONFIGURED") {
        return res.status(503).json({ error: "Email service is not configured" });
      }
      return res.status(500).json({ error: "Unable to send reset code" });
    }

    return res.json({ success: true });
  } catch (err) {
    console.error("Forgot password error:", err.message);
    return res.status(500).json({ error: "Server error" });
  }
});

// Password reset: verify code
router.post("/verify-reset-code", async (req, res) => {
  try {
    const { email, code } = req.body || {};
    const normalizedEmail = email?.toLowerCase?.().trim?.();

    if (!normalizedEmail || !code) {
      return res.status(400).json({ error: "Email and code are required" });
    }

    if (!isValidEmailFormat(normalizedEmail)) {
      return res.status(400).json({ error: "Valid email is required" });
    }

    const user = await User.findOne({ email: normalizedEmail });
    if (!user || !user.resetCodeHash || !user.resetCodeExpiresAt) {
      return res.status(400).json({ error: "Invalid or expired verification code" });
    }

    if (user.resetCodeExpiresAt.getTime() < Date.now()) {
      user.resetCodeHash = null;
      user.resetCodeExpiresAt = null;
      user.resetAttempts = 0;
      await user.save();
      return res.status(400).json({ error: "Verification code expired" });
    }

    const resetAttempts = Number.isFinite(Number(user.resetAttempts))
      ? Number(user.resetAttempts)
      : 0;

    if (resetAttempts >= PASSWORD_RESET_MAX_ATTEMPTS) {
      user.resetCodeHash = null;
      user.resetCodeExpiresAt = null;
      user.resetAttempts = 0;
      await user.save();
      return res
        .status(429)
        .json({ error: "Too many attempts. Please request a new code." });
    }

    const match = await bcrypt.compare(String(code), user.resetCodeHash);
    if (!match) {
      user.resetAttempts = resetAttempts + 1;
      await user.save();
      return res.status(401).json({ error: "Invalid verification code" });
    }

    return res.json({ success: true });
  } catch (err) {
    console.error("Verify reset code error:", err.message);
    return res.status(500).json({ error: "Server error" });
  }
});

// Password reset: set new password
router.post("/reset-password", async (req, res) => {
  try {
    const { email, code, password } = req.body || {};
    const normalizedEmail = email?.toLowerCase?.().trim?.();

    if (!normalizedEmail || !code || !password) {
      return res.status(400).json({ error: "Email, code, and password are required" });
    }

    if (!isValidEmailFormat(normalizedEmail)) {
      return res.status(400).json({ error: "Valid email is required" });
    }

    if (!isValidPasswordFormat(password)) {
      return res.status(400).json({
        error: "Password must be 8-128 characters with uppercase, lowercase, numbers, and symbols",
      });
    }

    const user = await User.findOne({ email: normalizedEmail });
    if (!user || !user.resetCodeHash || !user.resetCodeExpiresAt) {
      return res.status(400).json({ error: "Invalid or expired verification code" });
    }

    if (user.resetCodeExpiresAt.getTime() < Date.now()) {
      user.resetCodeHash = null;
      user.resetCodeExpiresAt = null;
      user.resetAttempts = 0;
      await user.save();
      return res.status(400).json({ error: "Verification code expired" });
    }

    const resetAttempts = Number.isFinite(Number(user.resetAttempts))
      ? Number(user.resetAttempts)
      : 0;

    if (resetAttempts >= PASSWORD_RESET_MAX_ATTEMPTS) {
      user.resetCodeHash = null;
      user.resetCodeExpiresAt = null;
      user.resetAttempts = 0;
      await user.save();
      return res
        .status(429)
        .json({ error: "Too many attempts. Please request a new code." });
    }

    const match = await bcrypt.compare(String(code), user.resetCodeHash);
    if (!match) {
      user.resetAttempts = resetAttempts + 1;
      await user.save();
      return res.status(401).json({ error: "Invalid verification code" });
    }

    const hash = await bcrypt.hash(password, 10);
    user.password = hash;
    user.lastPasswordResetDate = new Date();
    user.resetCodeHash = null;
    user.resetCodeExpiresAt = null;
    user.resetLastSentAt = null;
    user.resetAttempts = 0;
    await user.save();

    return res.json({ success: true });
  } catch (err) {
    console.error("Reset password error:", err.message);
    return res.status(500).json({ error: "Server error" });
  }
});

// Google OAuth routes - Only if Google strategy is configured
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  router.get(
    "/google",
    passport.authenticate("google", { scope: ["profile", "email"] }),
  );

  router.get(
    "/google/callback",
    passport.authenticate("google", { failureRedirect: "/login" }),
    async (req, res) => {
      try {
        // Generate JWT token for the authenticated user
        const token = jwt.sign(
          {
            id: req.user._id,
            name: req.user.name,
            email: req.user.email,
            role: req.user.role,
          },
          JWT_SECRET,
          { expiresIn: "7d" },
        );

        // Redirect to frontend with token
        const clientUrl = process.env.CLIENT_URL || "http://localhost:3000";
        res.redirect(`${clientUrl}/login?token=${token}&google=true`);
      } catch (error) {
        console.error("Google auth callback error:", error);
        res.redirect(
          `${process.env.CLIENT_URL || "http://localhost:3000"}/login?error=auth_failed`,
        );
      }
    },
  );
}

// Facebook OAuth routes - Only if Facebook strategy is configured
if (process.env.FACEBOOK_APP_ID && process.env.FACEBOOK_APP_SECRET) {
  router.get(
    "/facebook",
    passport.authenticate("facebook", { scope: ["email"] }),
  );

  router.get(
    "/facebook/callback",
    passport.authenticate("facebook", { failureRedirect: "/login" }),
    async (req, res) => {
      try {
        // Generate JWT token for the authenticated user
        const token = jwt.sign(
          {
            id: req.user._id,
            name: req.user.name,
            email: req.user.email,
            role: req.user.role,
          },
          JWT_SECRET,
          { expiresIn: "7d" },
        );

        // Redirect to frontend with token
        const clientUrl = process.env.CLIENT_URL || "http://localhost:3000";
        res.redirect(`${clientUrl}/login?token=${token}&facebook=true`);
      } catch (error) {
        console.error("Facebook auth callback error:", error);
        res.redirect(
          `${process.env.CLIENT_URL || "http://localhost:3000"}/login?error=auth_failed`,
        );
      }
    },
  );
}

// Twitter OAuth routes - Only if Twitter strategy is configured
if (process.env.TWITTER_CONSUMER_KEY && process.env.TWITTER_CONSUMER_SECRET) {
  router.get("/twitter", passport.authenticate("twitter"));

  router.get(
    "/twitter/callback",
    passport.authenticate("twitter", { failureRedirect: "/login" }),
    async (req, res) => {
      try {
        // Generate JWT token for the authenticated user
        const token = jwt.sign(
          {
            id: req.user._id,
            name: req.user.name,
            email: req.user.email,
            role: req.user.role,
          },
          JWT_SECRET,
          { expiresIn: "7d" },
        );

        // Redirect to frontend with token
        const clientUrl = process.env.CLIENT_URL || "http://localhost:3000";
        res.redirect(`${clientUrl}/login?token=${token}&twitter=true`);
      } catch (error) {
        console.error("Twitter auth callback error:", error);
        res.redirect(
          `${process.env.CLIENT_URL || "http://localhost:3000"}/login?error=auth_failed`,
        );
      }
    },
  );
}

// Instagram OAuth routes - Only if Instagram strategy is configured
if (process.env.INSTAGRAM_CLIENT_ID && process.env.INSTAGRAM_CLIENT_SECRET) {
  router.get("/instagram", passport.authenticate("instagram"));

  router.get(
    "/instagram/callback",
    passport.authenticate("instagram", { failureRedirect: "/login" }),
    async (req, res) => {
      try {
        // Generate JWT token for the authenticated user
        const token = jwt.sign(
          {
            id: req.user._id,
            name: req.user.name,
            email: req.user.email,
            role: req.user.role,
          },
          JWT_SECRET,
          { expiresIn: "7d" },
        );

        // Redirect to frontend with token
        const clientUrl = process.env.CLIENT_URL || "http://localhost:3000";
        res.redirect(`${clientUrl}/login?token=${token}&instagram=true`);
      } catch (error) {
        console.error("Instagram auth callback error:", error);
        res.redirect(
          `${process.env.CLIENT_URL || "http://localhost:3000"}/login?error=auth_failed`,
        );
      }
    },
  );
}

// Get current user info
router.get(
  "/me",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    try {
      const user = await User.findById(req.user.id).select("-password");
      if (!user) return res.status(404).json({ error: "User not found" });
      res.json({ user });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Server error" });
    }
  },
);

// Get all citizens (admin only)
router.get(
  "/citizens",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    try {
      if (req.user.role !== "admin") {
        return res
          .status(403)
          .json({ error: "Access denied. Admin role required." });
      }

      const citizens = await User.find({
        role: { $in: ["citizen", "user"] },
      }).select("-password");
      res.json({ citizens });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Server error" });
    }
  },
);

module.exports = router;
