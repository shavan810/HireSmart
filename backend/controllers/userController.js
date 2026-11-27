const User = require('../models/User');
const Job = require('../models/Job');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const { pick, toList } = require('../utils/helpers');
const { ROLES } = require('../utils/constants');
const { uploadResume, uploadImage, deleteAsset } = require('../services/cloudinary.service');
const { assertPdfSignature, assertImageSignature } = require('../middleware/upload');
const { deleteUserCascade } = require('../utils/cascade');

const COMMON = ['name', 'phone', 'headline', 'bio', 'location'];
const SEEKER = ['experience'];
const RECRUITER = ['companyName', 'companyWebsite', 'companyLocation', 'companyDescription', 'companySize', 'industry'];

// PUT /api/users/profile
exports.updateProfile = asyncHandler(async (req, res) => {
  const user = req.user;
  const allowed = [...COMMON, ...(user.role === ROLES.RECRUITER ? RECRUITER : SEEKER)]; // whitelist: no role/email/password changes
  const updates = pick(req.body, allowed);

  if (user.role === ROLES.SEEKER || user.role === ROLES.ADMIN) {
    if (req.body.skills !== undefined) updates.skills = toList(req.body.skills);
    if (Array.isArray(req.body.education)) {
      updates.education = req.body.education
        .filter((e) => e && (e.degree || e.institution))
        .slice(0, 10)
        .map((e) => ({ degree: e.degree, institution: e.institution, year: e.year ? Number(e.year) : undefined }));
    }
  }
  if (updates.experience === '') updates.experience = 0;
  if (user.role === ROLES.RECRUITER && updates.companyName !== undefined && !String(updates.companyName).trim()) {
    throw new ApiError(400, 'Company name cannot be empty');
  }

  Object.assign(user, updates);
  await user.save();

  // Keep the denormalised company name on this recruiter's jobs in sync.
  if (user.role === ROLES.RECRUITER && updates.companyName) {
    await Job.updateMany({ recruiter: user._id }, { company: user.companyName });
  }
  res.json({ success: true, user });
});

// POST /api/users/avatar  (multipart field: image)
exports.uploadAvatar = asyncHandler(async (req, res) => {
  if (!req.file) throw new ApiError(400, 'Please choose an image to upload');
  assertImageSignature(req.file.buffer);

  const user = await User.findById(req.user._id).select('+profileImagePublicId');
  const result = await uploadImage(req.file.buffer, user._id);
  await deleteAsset(user.profileImagePublicId, 'image');

  user.profileImage = result.secure_url;
  user.profileImagePublicId = result.public_id;
  await user.save({ validateBeforeSave: false });
  res.json({ success: true, user });
});

// POST /api/users/resume  (multipart field: resume)
exports.uploadResume = asyncHandler(async (req, res) => {
  if (!req.file) throw new ApiError(400, 'Please choose a PDF resume to upload');
  assertPdfSignature(req.file.buffer);

  const user = await User.findById(req.user._id).select('+resumePublicId');
  const result = await uploadResume(req.file.buffer, user._id);
  await deleteAsset(user.resumePublicId, 'raw');

  user.resumeUrl = result.secure_url;
  user.resumePublicId = result.public_id;
  user.resumeName = req.file.originalname;
  user.resumeUpdatedAt = new Date();
  await user.save({ validateBeforeSave: false });
  res.json({ success: true, message: 'Resume uploaded', user });
});

// DELETE /api/users/resume
exports.deleteResume = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select('+resumePublicId');
  await deleteAsset(user.resumePublicId, 'raw');
  user.resumeUrl = '';
  user.resumeName = '';
  user.resumePublicId = undefined;
  user.resumeUpdatedAt = undefined;
  await user.save({ validateBeforeSave: false });
  res.json({ success: true, message: 'Resume removed', user });
});

// PUT /api/users/preferences
exports.updatePreferences = asyncHandler(async (req, res) => {
  req.user.emailNotifications = Boolean(req.body.emailNotifications);
  await req.user.save({ validateBeforeSave: false });
  res.json({ success: true, user: req.user });
});

// DELETE /api/users/me   (body: { password })
exports.deleteAccount = asyncHandler(async (req, res) => {
  if (req.user.role === ROLES.ADMIN) throw new ApiError(403, 'Administrator accounts cannot be deleted here');
  const user = await User.findById(req.user._id).select('+password');
  if (!req.body.password || !(await user.matchPassword(req.body.password))) {
    throw new ApiError(400, 'Password is incorrect');
  }
  await deleteUserCascade(user._id);
  res.json({ success: true, message: 'Your account has been deleted' });
});
