const nodemailer = require('nodemailer');
require('dotenv').config();

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT || 587),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

async function sendMail(to, subject, html) {
  if (!process.env.SMTP_USER) {
    console.warn('SMTP not configured; skipping mail');
    return;
  }
  await transporter.sendMail({ from: process.env.SMTP_USER, to, subject, html });
}

module.exports = { sendMail };
