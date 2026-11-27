const ContactMessage = require('../models/ContactMessage');
const asyncHandler = require('../utils/asyncHandler');
const { sendEmail } = require('../services/email.service');

// POST /api/contact
exports.sendMessage = asyncHandler(async (req, res) => {
  const { name, email, subject, message } = req.body;
  await ContactMessage.create({ name, email, subject, message });

  if (process.env.SUPPORT_EMAIL) {
    sendEmail({
      to: process.env.SUPPORT_EMAIL,
      subject: `[Contact] ${subject}`,
      html: `<p><b>From:</b> ${name} (${email})</p><p>${String(message).replace(/</g, '&lt;').replace(/\n/g, '<br>')}</p>`,
    });
  }
  res.status(201).json({ success: true, message: 'Thanks for reaching out. We will reply within two working days.' });
});
