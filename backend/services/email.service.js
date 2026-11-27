const nodemailer = require('nodemailer');

let transporter;

const getTransporter = () => {
  if (!process.env.SMTP_HOST) return null; // emails are optional
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 587,
      secure: process.env.SMTP_SECURE === 'true',
      auth: process.env.SMTP_USER ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS } : undefined,
    });
  }
  return transporter;
};

const template = (title, body) => `
  <div style="font-family:Arial,sans-serif;max-width:560px;margin:auto;border:1px solid #e2e8f0;border-radius:12px;overflow:hidden">
    <div style="background:#0b1f4b;color:#fff;padding:16px 24px;font-size:18px;font-weight:700">HireSmart</div>
    <div style="padding:24px;color:#1e293b;line-height:1.6">
      <h2 style="margin:0 0 12px;color:#0b1f4b">${title}</h2>
      ${body}
    </div>
  </div>`;

// Fire-and-forget: email problems are logged but never fail an API request.
const sendEmail = async ({ to, subject, title, html }) => {
  const t = getTransporter();
  if (!t || !to) return;
  try {
    await t.sendMail({
      from: process.env.MAIL_FROM || 'HireSmart <no-reply@hiresmart.com>',
      to,
      subject,
      html: template(title || subject, html),
    });
  } catch (err) {
    console.warn('Email failed:', err.message);
  }
};

module.exports = { sendEmail };
