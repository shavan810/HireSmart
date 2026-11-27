const Job = require('../models/Job');
const ResumeAnalysis = require('../models/ResumeAnalysis');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const { analyzeResume } = require('../services/gemini.service');

// POST /api/ai/analyze   body: { jobId? }
exports.analyze = asyncHandler(async (req, res) => {
  if (!req.user.resumeUrl) throw new ApiError(400, 'Upload your resume first, then run the analysis');

  let job = null;
  if (req.body.jobId) {
    job = await Job.findById(req.body.jobId).lean();
    if (!job) throw new ApiError(404, 'The selected job was not found');
  }

  const result = await analyzeResume(req.user.resumeUrl, job);
  const analysis = await ResumeAnalysis.create({
    user: req.user._id,
    resumeUrl: req.user.resumeUrl,
    job: job?._id,
    ...result,
  });
  const populated = await analysis.populate('job', 'title company');
  res.status(201).json({ success: true, analysis: populated });
});

// GET /api/ai/history
exports.history = asyncHandler(async (req, res) => {
  const analyses = await ResumeAnalysis.find({ user: req.user._id })
    .populate('job', 'title company')
    .sort('-createdAt')
    .limit(20)
    .lean();
  res.json({ success: true, analyses });
});
