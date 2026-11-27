const User = require('../models/User');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const generateToken = require('../utils/generateToken');
const { ROLES } = require('../utils/constants');
const { sendEmail } = require('../services/email.service');

const authResponse = (res, status, user) =>
  res.status(status).json({ success: true, token: generateToken(user._id), user });

// POST /api/auth/register  (admins can never self-register)
exports.register = asyncHandler(async (req, res) => {
  const { name, email, password, role, companyName, phone } = req.body;

  if (await User.findOne({ email })) throw new ApiError(409, 'An account with this email already exists');

  const user = await User.create({
    name,
    email,
    password,
    role,
    phone,
    ...(role === ROLES.RECRUITER ? { companyName } : {}),
  });

  sendEmail({
    to: user.email,
    subject: 'Welcome to HireSmart',
    html: `<p>Hi ${user.name}, your ${role === ROLES.RECRUITER ? 'recruiter' : 'job seeker'} account is ready.</p>`,
  });

  authResponse(res, 201, user);
});

const performLogin = async (req, res, requiredRole) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email }).select('+password');

  // Same message for unknown email and wrong password to avoid account enumeration.
  if (!user || !(await user.matchPassword(password))) throw new ApiError(401, 'Invalid email or password');
  if (requiredRole && user.role !== requiredRole) throw new ApiError(403, 'This portal is for administrators only');
  if (!user.isActive) throw new ApiError(403, 'Your account has been deactivated. Contact support.');

  user.lastLoginAt = new Date();
  await user.save({ validateBeforeSave: false });
  authResponse(res, 200, user);
};

// POST /api/auth/login
exports.login = asyncHandler((req, res) => performLogin(req, res));

// POST /api/auth/admin/login
exports.adminLogin = asyncHandler((req, res) => performLogin(req, res, ROLES.ADMIN));

// GET /api/auth/me
exports.getMe = asyncHandler(async (req, res) => {
  res.json({ success: true, user: req.user });
});

// PUT /api/auth/password
exports.changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const user = await User.findById(req.user._id).select('+password');
  if (!(await user.matchPassword(currentPassword))) throw new ApiError(400, 'Current password is incorrect');
  if (currentPassword === newPassword) throw new ApiError(400, 'New password must be different from the current one');
  user.password = newPassword; // hashed by the pre-save hook
  await user.save();
  res.json({ success: true, message: 'Password updated successfully' });
});
