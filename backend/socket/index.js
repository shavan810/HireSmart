const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

let io;

const allowedOrigins = () => (process.env.CLIENT_URL || 'http://localhost:5173').split(',').map((o) => o.trim());

const initSocket = (httpServer) => {
  io = new Server(httpServer, { cors: { origin: allowedOrigins(), credentials: true } });

  // Authenticate every socket with the same JWT used for the REST API.
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token;
      if (!token) return next(new Error('Authentication required'));
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id).select('_id isActive');
      if (!user || !user.isActive) return next(new Error('Invalid account'));
      socket.userId = user._id.toString();
      return next();
    } catch (_e) {
      return next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    // Each user gets a private room, so a notification can be targeted by user id
    // and still reaches every open tab/device of that user.
    socket.join(`user:${socket.userId}`);
  });

  return io;
};

const emitToUser = (userId, event, payload) => {
  if (io) io.to(`user:${userId.toString()}`).emit(event, payload);
};

module.exports = { initSocket, emitToUser };
