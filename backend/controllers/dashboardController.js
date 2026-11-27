const User = require('../models/User');
const Job = require('../models/Job');
const Application = require('../models/Application');
const ResumeAnalysis = require('../models/ResumeAnalysis');
const asyncHandler = require('../utils/asyncHandler');
const { sinceMonths, monthSeries, groupByMonth, escapeRegex } = require('../utils/helpers');
const { APPLICATION_STATUS } = require('../utils/constants');

// Turns [{_id:'Applied', count:2}] into {Applied:2, 'Under Review':0, ...}
const statusMap = (rows) => {
  const base = Object.fromEntries(APPLICATION_STATUS.map((s) => [s, 0]));
  rows.forEach((r) => {
    base[r._id] = r.count;
  });
  return base;
};

const countByStatus = (match) =>
  Application.aggregate([{ $match: match }, { $group: { _id: '$status', count: { $sum: 1 } } }]);

const monthly = (Model, match, field) =>
  Model.aggregate([{ $match: { ...match, [field]: { $gte: sinceMonths(6) } } }, { $group: groupByMonth(field) }]).then((rows) =>
    monthSeries(rows, 6)
  );

// GET /api/dashboard/seeker
exports.seekerDashboard = asyncHandler(async (req, res) => {
  const user = req.user;
  const match = { applicant: user._id };

  const skillRegexes = (user.skills || []).slice(0, 15).map((s) => new RegExp(escapeRegex(s), 'i'));

  const [byStatus, trend, recent, latestAnalysis, recommended] = await Promise.all([
    countByStatus(match),
    monthly(Application, match, 'appliedAt'),
    Application.find(match).sort('-appliedAt').limit(5).populate('job', 'title company location').lean(),
    ResumeAnalysis.findOne({ user: user._id }).sort('-createdAt').select('score createdAt').lean(),
    skillRegexes.length
      ? Job.find({ status: 'open', skills: { $in: skillRegexes } }).sort('-createdAt').limit(4).lean()
      : Job.find({ status: 'open' }).sort('-createdAt').limit(4).lean(),
  ]);

  const statuses = statusMap(byStatus);
  const total = Object.values(statuses).reduce((a, b) => a + b, 0);

  const checks = [user.name, user.phone, user.headline, user.location, user.bio, user.skills?.length, user.education?.length, user.profileImage, user.resumeUrl];
  const completeness = Math.round((checks.filter(Boolean).length / checks.length) * 100);

  res.json({
    success: true,
    stats: { total, ...statuses },
    statuses,
    trend,
    recent,
    recommended,
    latestScore: latestAnalysis?.score ?? null,
    completeness,
  });
});

// GET /api/dashboard/recruiter
exports.recruiterDashboard = asyncHandler(async (req, res) => {
  const match = { recruiter: req.user._id };

  const [totalJobs, activeJobs, byStatus, trend, topJobs, recent] = await Promise.all([
    Job.countDocuments({ recruiter: req.user._id }),
    Job.countDocuments({ recruiter: req.user._id, status: 'open' }),
    countByStatus(match),
    monthly(Application, match, 'appliedAt'),
    Application.aggregate([
      { $match: match },
      { $group: { _id: '$job', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 },
      { $lookup: { from: 'jobs', localField: '_id', foreignField: '_id', as: 'job' } },
      { $unwind: '$job' },
      { $project: { _id: 0, label: '$job.title', value: '$count' } },
    ]),
    Application.find(match).sort('-appliedAt').limit(6).populate('applicant', 'name profileImage headline').populate('job', 'title').lean(),
  ]);

  const statuses = statusMap(byStatus);
  res.json({
    success: true,
    stats: {
      totalJobs,
      activeJobs,
      totalApplicants: Object.values(statuses).reduce((a, b) => a + b, 0),
      shortlisted: statuses.Shortlisted,
      rejected: statuses.Rejected,
      hired: statuses.Hired,
    },
    statuses,
    trend,
    topJobs,
    recent,
  });
});

// GET /api/dashboard/admin  (also feeds the Platform Analytics page)
exports.adminDashboard = asyncHandler(async (_req, res) => {
  const [roleRows, activeUsers, jobRows, byStatus, jobsByCategory, topCompanies, userTrend, jobTrend, appTrend, recentUsers, recentJobs, recentApps] =
    await Promise.all([
      User.aggregate([{ $group: { _id: '$role', count: { $sum: 1 } } }]),
      User.countDocuments({ isActive: true }),
      Job.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
      countByStatus({}),
      Job.aggregate([{ $group: { _id: '$category', count: { $sum: 1 } } }, { $sort: { count: -1 } }, { $project: { _id: 0, label: '$_id', value: '$count' } }]),
      Job.aggregate([{ $group: { _id: '$company', count: { $sum: 1 } } }, { $sort: { count: -1 } }, { $limit: 5 }, { $project: { _id: 0, label: '$_id', value: '$count' } }]),
      monthly(User, {}, 'createdAt'),
      monthly(Job, {}, 'createdAt'),
      monthly(Application, {}, 'appliedAt'),
      User.find().sort('-createdAt').limit(5).select('name email role createdAt profileImage').lean(),
      Job.find().sort('-createdAt').limit(5).select('title company createdAt').lean(),
      Application.find().sort('-appliedAt').limit(5).populate('applicant', 'name').populate('job', 'title').lean(),
    ]);

  const roles = Object.fromEntries(roleRows.map((r) => [r._id, r.count]));
  const jobStatus = Object.fromEntries(jobRows.map((r) => [r._id, r.count]));
  const statuses = statusMap(byStatus);
  const totalApplications = Object.values(statuses).reduce((a, b) => a + b, 0);

  // Merge the latest events from three collections into one activity feed.
  const activity = [
    ...recentUsers.map((u) => ({ type: 'user', text: `${u.name} joined as ${u.role === 'jobseeker' ? 'a job seeker' : `a ${u.role}`}`, at: u.createdAt })),
    ...recentJobs.map((j) => ({ type: 'job', text: `${j.company || 'A company'} posted "${j.title}"`, at: j.createdAt })),
    ...recentApps.map((a) => ({ type: 'application', text: `${a.applicant?.name || 'A candidate'} applied for "${a.job?.title || 'a job'}"`, at: a.appliedAt })),
  ]
    .sort((a, b) => new Date(b.at) - new Date(a.at))
    .slice(0, 10);

  res.json({
    success: true,
    stats: {
      totalUsers: Object.values(roles).reduce((a, b) => a + b, 0),
      jobSeekers: roles.jobseeker || 0,
      recruiters: roles.recruiter || 0,
      admins: roles.admin || 0,
      activeUsers,
      totalJobs: (jobStatus.open || 0) + (jobStatus.closed || 0),
      openJobs: jobStatus.open || 0,
      totalApplications,
    },
    statuses,
    jobsByCategory,
    topCompanies,
    trends: { users: userTrend, jobs: jobTrend, applications: appTrend },
    activity,
  });
});
