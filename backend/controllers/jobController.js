const Job = require('../models/Job');
const Application = require('../models/Application');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const { escapeRegex, toList, pick } = require('../utils/helpers');
const { ROLES, CATEGORIES } = require('../utils/constants');

const FIELDS = ['title', 'description', 'location', 'salaryMin', 'salaryMax', 'currency', 'jobType', 'experienceLevel', 'category', 'status', 'deadline'];

const buildPayload = (body) => {
  const data = pick(body, FIELDS);
  data.skills = toList(body.skills);
  data.requirements = toList(body.requirements, '\n');
  data.responsibilities = toList(body.responsibilities, '\n');
  ['salaryMin', 'salaryMax'].forEach((k) => {
    if (data[k] === '' || data[k] === null) data[k] = 0;
  });
  if (!data.deadline) data.deadline = undefined;
  return data;
};

const inList = (value) => {
  const list = toList(value);
  return list.length > 1 ? { $in: list } : list[0];
};

// GET /api/jobs  - public search, filter and pagination
exports.getJobs = asyncHandler(async (req, res) => {
  const { q, location, category, jobType, experienceLevel, minSalary, maxSalary, sort = 'newest' } = req.query;
  const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
  const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 9, 1), 50);

  const filter = { status: 'open' };

  if (q && q.trim()) {
    const rx = new RegExp(escapeRegex(q.trim()), 'i');
    filter.$or = [{ title: rx }, { company: rx }, { skills: rx }, { description: rx }];
  }
  if (location && location.trim()) filter.location = new RegExp(escapeRegex(location.trim()), 'i');
  if (category) filter.category = inList(category);
  if (jobType) filter.jobType = inList(jobType);
  if (experienceLevel) filter.experienceLevel = inList(experienceLevel);

  // A job matches when its salary band overlaps the requested band.
  if (minSalary && Number(minSalary) > 0) filter.salaryMax = { $gte: Number(minSalary) };
  if (maxSalary && Number(maxSalary) > 0) filter.salaryMin = { $lte: Number(maxSalary) };

  const sortMap = { newest: { createdAt: -1 }, oldest: { createdAt: 1 }, salary: { salaryMax: -1, createdAt: -1 } };

  const [jobs, total] = await Promise.all([
    Job.find(filter)
      .populate('recruiter', 'name companyName profileImage')
      .sort(sortMap[sort] || sortMap.newest)
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
    Job.countDocuments(filter),
  ]);

  res.json({ success: true, jobs, total, page, pages: Math.max(Math.ceil(total / limit), 1) });
});

// GET /api/jobs/stats  - numbers for the home page
exports.getPublicStats = asyncHandler(async (_req, res) => {
  const [totalJobs, companies, categories] = await Promise.all([
    Job.countDocuments({ status: 'open' }),
    Job.distinct('company', { status: 'open' }),
    Job.aggregate([{ $match: { status: 'open' } }, { $group: { _id: '$category', count: { $sum: 1 } } }, { $sort: { count: -1 } }]),
  ]);
  const counts = Object.fromEntries(categories.map((c) => [c._id, c.count]));
  res.json({
    success: true,
    totalJobs,
    totalCompanies: companies.length,
    categories: CATEGORIES.map((name) => ({ name, count: counts[name] || 0 })).sort((a, b) => b.count - a.count),
  });
});

// GET /api/jobs/:id
exports.getJob = asyncHandler(async (req, res) => {
  const job = await Job.findById(req.params.id)
    .populate('recruiter', 'name companyName companyWebsite companyDescription companyLocation companySize industry profileImage')
    .lean();
  if (!job) throw new ApiError(404, 'Job not found');

  const isOwner = req.user && String(job.recruiter._id) === String(req.user._id);
  if (job.status !== 'open' && !isOwner && req.user?.role !== ROLES.ADMIN) throw new ApiError(404, 'Job not found');

  let hasApplied = false;
  if (req.user?.role === ROLES.SEEKER) {
    hasApplied = Boolean(await Application.exists({ applicant: req.user._id, job: job._id }));
  }
  res.json({ success: true, job, hasApplied });
});

// GET /api/jobs/mine/list  (recruiter)
exports.getMyJobs = asyncHandler(async (req, res) => {
  const [jobs, counts] = await Promise.all([
    Job.find({ recruiter: req.user._id }).sort('-createdAt').lean(),
    Application.aggregate([{ $match: { recruiter: req.user._id } }, { $group: { _id: '$job', count: { $sum: 1 } } }]),
  ]);
  const map = Object.fromEntries(counts.map((c) => [String(c._id), c.count]));
  res.json({ success: true, jobs: jobs.map((j) => ({ ...j, applicantCount: map[String(j._id)] || 0 })) });
});

// POST /api/jobs  (recruiter)
exports.createJob = asyncHandler(async (req, res) => {
  if (!req.user.companyName) throw new ApiError(400, 'Complete your company profile before posting jobs');
  const job = await Job.create({ ...buildPayload(req.body), recruiter: req.user._id, company: req.user.companyName });
  res.status(201).json({ success: true, job });
});

const findOwnedJob = async (id, user) => {
  const job = await Job.findById(id);
  if (!job) throw new ApiError(404, 'Job not found');
  if (user.role !== ROLES.ADMIN && String(job.recruiter) !== String(user._id)) {
    throw new ApiError(403, 'You can only manage your own jobs');
  }
  return job;
};

// PUT /api/jobs/:id  (owner recruiter)
exports.updateJob = asyncHandler(async (req, res) => {
  const job = await findOwnedJob(req.params.id, req.user);
  Object.assign(job, buildPayload(req.body));
  await job.save(); // runs validators
  res.json({ success: true, job });
});

// DELETE /api/jobs/:id  (owner recruiter) - also removes its applications
exports.deleteJob = asyncHandler(async (req, res) => {
  const job = await findOwnedJob(req.params.id, req.user);
  await Application.deleteMany({ job: job._id });
  await job.deleteOne();
  res.json({ success: true, message: 'Job deleted' });
});
