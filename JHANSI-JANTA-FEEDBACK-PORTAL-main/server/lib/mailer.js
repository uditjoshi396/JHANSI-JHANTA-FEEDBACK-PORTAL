const nodemailer = require('nodemailer');
require('dotenv').config();

const smtpHost = process.env.SMTP_HOST;
const smtpPort = Number(process.env.SMTP_PORT || 587);
const smtpUser = process.env.SMTP_USER;
const smtpPass = process.env.SMTP_PASS;
const logOnly =
  String(process.env.MAILER_LOG_ONLY || "").toLowerCase() === "true";

const PLACEHOLDER_PATTERNS = [
  /your-email/i,
  /your-app-password/i,
  /your-email-app-password/i
];

function isPlaceholder(value) {
  if (!value) return true;
  return PLACEHOLDER_PATTERNS.some((pattern) => pattern.test(String(value)));
}

function isMailerConfigured() {
  if (logOnly) return true;
  return (
    Boolean(smtpHost && smtpUser && smtpPass) &&
    !isPlaceholder(smtpUser) &&
    !isPlaceholder(smtpPass)
  );
}

const transporter = !logOnly && smtpHost
  ? nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: smtpPort === 465,
      auth: {
        user: smtpUser,
        pass: smtpPass
      }
    })
  : null;

async function sendMail(to, subject, html) {
  if (logOnly) {
    console.log("[mailer] LOG ONLY - no email sent");
    console.log("[mailer] To:", to);
    console.log("[mailer] Subject:", subject);
    console.log("[mailer] Body:", html);
    return;
  }
  if (!isMailerConfigured()) {
    const error = new Error(
      'SMTP is not configured. Set SMTP_HOST, SMTP_USER, and SMTP_PASS with real credentials.'
    );
    error.code = 'SMTP_NOT_CONFIGURED';
    throw error;
  }
  if (!transporter) {
    const error = new Error("SMTP transport not initialized");
    error.code = "SMTP_NOT_CONFIGURED";
    throw error;
  }
  await transporter.sendMail({ from: smtpUser, to, subject, html });
}

module.exports = { sendMail, isMailerConfigured };
