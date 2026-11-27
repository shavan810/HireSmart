const User = require('../models/User');
const Job = require('../models/Job');
const Application = require('../models/Application');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const { escapeRegex } = require('../utils/helpers');
const { ROLES, APPLICATION_STATUS } = require('../utils/constants');
const { notify } = require('../services/notification.service');
const { deleteUserCascade } = require('../utils/cascade');

const paging = (req, def = 10) => ({
  page: Math.max(parseInt(req.query.page, 10) || 1, 1),
  limit: Math.min(Math.max(parseInt(req.query.limit, 10) || def, 1), 50),
});
const pagesOf = (total, limit) => Math.max(Math.ceil(total / limit), 1);

// GET /api/admin/users?q=&role=&status=&page=
exports.getUsers = asyncHandler(async (req, res) => {
  const { page, limit } = paging(req);
  const { q, role, status } = req.query;
  const filter = {};
  if (q && q.trim()) {
    const rx = new RegExp(escapeRegex(q.trim()), 'i');
    filter.$or = [{ name: rx }, { email: rx }, { companyName: rx }];
  }
  if (Object.values(ROLES).includes(role)) filter.role = role;
  if (status === 'active') filter.isActive = true;
  if (status === 'inactive') filter.isActive = false;

  const [users, total] = await Promise.all([
    User.find(filter).sort('-createdAt').skip((page - 1) * limit).limit(limit).lean(),
    User.countDocuments(filter),
  ]);
  res.json({ success: true, users, total, page, pages: pagesOf(total, limit) });
});

// PATCH /api/admin/users/:id/status   body: { isActive }
exports.setUserStatus = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) throw new ApiError(404, 'User not found');
  if (user.role === ROLES.ADMIN) throw new ApiError(403, 'Administrator accounts cannot be deactivated');
  user.isActive = typeof req.body.isActive === 'boolean' ? req.body.isActive : !user.isActive;
  await user.save({ validateBeforeSave: false });
  res.json({ success: true, user });
});

// DELETE /api/admin/users/:id
exports.deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) throw new ApiError(404, 'User not found');
  if (user.role === ROLES.ADMIN) throw new ApiError(403, 'Administrator accounts cannot be deleted');
  await deleteUserCascade(user._id);
  res.json({ success: true, message: 'User and related data deleted' });
});

// GET /api/admin/jobs?q=&status=&page=
exports.getJobs = asyncHandler(async (req, res) => {
  const { page, limit } = paging(req);
  const { q, status } = req.query;
  const filter = {};
  if (q && q.trim()) {
    const rx = new RegExp(escapeRegex(q.trim()), 'i');
    filter.$or = [{ title: rx }, { company: rx }, { location: rx }];
  }
  if (['open', 'closed'].includes(status)) filter.status = status;

  const [jobs, total, counts] = await Promise.all([
    Job.find(filter).populate('recruiter', 'name email').sort('-createdAt').skip((page - 1) * limit).limit(limit).lean(),
    Job.countDocuments(filter),
    Application.aggregate([{ $group: { _id: '$job', count: { $sum: 1 } } }]),
  ]);
  const map = Object.fromEntries(counts.map((c) => [String(c._id), c.count]));
  res.json({ success: true, jobs: jobs.map((j) => ({ ...j, applicantCount: map[String(j._id)] || 0 })), total, page, pages: pagesOf(total, limit) });
});

// PATCH /api/admin/jobs/:id/status   body: { status }
exports.setJobStatus = asyncHandler(async (req, res) => {
  if (!['open', 'closed'].includes(req.body.status)) throw new ApiError(400, 'Status must be open or closed');
  const job = await Job.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true });
  if (!job) throw new ApiError(404, 'Job not found');
  res.json({ success: true, job });
});

// DELETE /api/admin/jobs/:id  - removes an inappropriate post and tells the recruiter
exports.deleteJob = asyncHandler(async (req, res) => {
  const job = await Job.findById(req.params.id);
  if (!job) throw new ApiError(404, 'Job not found');
  await Application.deleteMany({ job: job._id });
  await job.deleteOne();
  await notify({
    recipient: job.recruiter,
    sender: req.user._id,
    type: 'job_removed',
    message: `Your job post "${job.title}" was removed by an administrator for violating platform guidelines`,
  });
  res.json({ success: true, message: 'Job removed' });
});

// GET /api/admin/applications?status=&q=&page=
exports.getApplications = asyncHandler(async (req, res) => {
  const { page, limit } = paging(req);
  const { status } = req.query;
  const filter = {};
  if (APPLICATION_STATUS.includes(status)) filter.status = status;

  const [applications, total] = await Promise.all([
    Application.find(filter)
      .populate('applicant', 'name email')
      .populate('job', 'title company')
      .populate('recruiter', 'name companyName')
      .sort('-appliedAt')
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
    Application.countDocuments(filter),
  ]);
  res.json({ success: true, applications, total, page, pages: pagesOf(total, limit) });
});
