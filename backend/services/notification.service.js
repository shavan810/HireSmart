const Notification = require('../models/Notification');
const { emitToUser } = require('../socket');

// Persists the notification (history) and pushes it live over Socket.io.
const notify = async ({ recipient, sender, message, type = 'system', link }) => {
  const notification = await Notification.create({ recipient, sender, message, type, link });
  emitToUser(recipient, 'notification', notification);
  return notification;
};

module.exports = { notify };
