const jwt = require('jsonwebtoken');
const User = require('../models/User');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');

const getToken = (req) => {
  const header = req.headers.authorization || '';
  return header.startsWith('Bearer ') ? header.split(' ')[1] : null;
};

const loadUser = async (token) => {
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  return User.findById(decoded.id);
};

// Requires a valid JWT and an active account.
const protect = asyncHandler(async (req, _res, next) => {
  const token = getToken(req);
  if (!token) throw new ApiError(401, 'Not authenticated. Please log in.');
  const user = await loadUser(token);
  if (!user) throw new ApiError(401, 'The account for this token no longer exists.');
  if (!user.isActive) throw new ApiError(403, 'Your account has been deactivated. Contact support.');
  req.user = user;
  next();
});

// Attaches req.user when a valid token is present but never blocks the request.
const optionalAuth = asyncHandler(async (req, _res, next) => {
  const token = getToken(req);
  if (token) {
    try {
      const user = await loadUser(token);
      if (user && user.isActive) req.user = user;
    } catch (_e) {
      /* ignore invalid token on public routes */
    }
  }
  next();
});

// Role based access control: authorize('recruiter', 'admin')
const authorize =
  (...roles) =>
  (req, _res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return next(new ApiError(403, 'You do not have permission to perform this action.'));
    }
    return next();
  };

module.exports = { protect, optionalAuth, authorize };
