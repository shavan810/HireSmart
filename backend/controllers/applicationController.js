const Application = require('../models/Application');
const Job = require('../models/Job');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const { notify } = require('../services/notification.service');
const { sendEmail } = require('../services/email.service');
const { ROLES, APPLICATION_STATUS } = require('../utils/constants');

const APPLICANT_FIELDS = 'name email phone profileImage headline location skills experience education resumeUrl';

// POST /api/applications/:jobId  (job seeker)
exports.apply = asyncHandler(async (req, res) => {
  const job = await Job.findById(req.params.jobId);
  if (!job || job.status !== 'open') throw new ApiError(404, 'This job is no longer accepting applications');
  if (job.deadline && job.deadline < new Date()) throw new ApiError(400, 'The application deadline has passed');
  if (!req.user.resumeUrl) throw new ApiError(400, 'Upload your resume before applying');

  // Friendly pre-check; the unique index still protects against race conditions.
  if (await Application.exists({ applicant: req.user._id, job: job._id })) {
    throw new ApiError(409, 'You have already applied for this job');
  }

  const application = await Application.create({
    applicant: req.user._id,
    job: job._id,
    recruiter: job.recruiter,
    resumeUrl: req.user.resumeUrl,
    coverLetter: req.body.coverLetter,
    statusHistory: [{ status: 'Applied', changedBy: req.user._id, note: 'Application submitted' }],
  });

  await notify({
    recipient: job.recruiter,
    sender: req.user._id,
    type: 'application_received',
    message: `${req.user.name} applied for ${job.title}`,
    link: '/recruiter/applicants',
  });

  res.status(201).json({ success: true, application });
});

// GET /api/applications/mine  (job seeker)
exports.getMyApplications = asyncHandler(async (req, res) => {
  const applications = await Application.find({ applicant: req.user._id })
    .populate('job', 'title company location jobType salaryMin salaryMax currency status')
    .sort('-appliedAt')
    .lean();
  res.json({ success: true, applications });
});

// DELETE /api/applications/:id  (job seeker can withdraw while still "Applied")
exports.withdraw = asyncHandler(async (req, res) => {
  const application = await Application.findOne({ _id: req.params.id, applicant: req.user._id });
  if (!application) throw new ApiError(404, 'Application not found');
  if (application.status !== 'Applied') throw new ApiError(400, 'You can only withdraw an application that has not been reviewed yet');
  await application.deleteOne();
  res.json({ success: true, message: 'Application withdrawn' });
});

// GET /api/applications/recruiter?job=&status=&page=&limit=  (recruiter)
exports.getRecruiterApplications = asyncHandler(async (req, res) => {
  const { job, status } = req.query;
  const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
  const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 10, 1), 50);

  const filter = { recruiter: req.user._id };
  if (job) filter.job = job;
  if (status && APPLICATION_STATUS.includes(status)) filter.status = status;

  const [applications, total] = await Promise.all([
    Application.find(filter)
      .populate('applicant', APPLICANT_FIELDS)
      .populate('job', 'title location')
      .sort('-appliedAt')
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
    Application.countDocuments(filter),
  ]);
  res.json({ success: true, applications, total, page, pages: Math.max(Math.ceil(total / limit), 1) });
});

// PATCH /api/applications/:id/status  (owner recruiter)
exports.updateStatus = asyncHandler(async (req, res) => {
  const { status, note } = req.body;
  const application = await Application.findOne({ _id: req.params.id, recruiter: req.user._id })
    .populate('job', 'title')
    .populate('applicant', 'name email emailNotifications');
  if (!application) throw new ApiError(404, 'Application not found');
  if (application.status === status) throw new ApiError(400, `Application is already marked as ${status}`);

  application.status = status;
  application.statusHistory.push({ status, changedBy: req.user._id, note });
  await application.save();

  const jobTitle = application.job?.title || 'a job';
  await notify({
    recipient: application.applicant._id,
    sender: req.user._id,
    type: 'status_changed',
    message: `Your application for ${jobTitle} is now "${status}"`,
    link: '/seeker/tracking',
  });

  if (application.applicant.emailNotifications) {
    sendEmail({
      to: application.applicant.email,
      subject: `Application update: ${jobTitle}`,
      html: `<p>Hi ${application.applicant.name},</p><p>Your application for <b>${jobTitle}</b> is now <b>${status}</b>.</p>${note ? `<p>Note from the recruiter: ${note}</p>` : ''}`,
    });
  }

  res.json({ success: true, application });
});

// GET /api/applications/:id  (applicant, owner recruiter or admin)
exports.getApplication = asyncHandler(async (req, res) => {
  const application = await Application.findById(req.params.id)
    .populate('applicant', APPLICANT_FIELDS)
    .populate('job', 'title company location')
    .lean();
  if (!application) throw new ApiError(404, 'Application not found');

  const uid = String(req.user._id);
  const allowed =
    req.user.role === ROLES.ADMIN || String(application.applicant._id) === uid || String(application.recruiter) === uid;
  if (!allowed) throw new ApiError(403, 'You do not have access to this application');
  res.json({ success: true, application });
});
