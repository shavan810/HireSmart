const mongoose = require('mongoose');

const resumeAnalysisSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    resumeUrl: { type: String, required: true },
    job: { type: mongoose.Schema.Types.ObjectId, ref: 'Job' },
    score: { type: Number, min: 0, max: 100, required: true },
    summary: { type: String, default: '' },
    strengths: [String],
    weaknesses: [String],
    detectedSkills: [String],
    missingSkills: [String],
    suggestions: [String],
    jobMatch: {
      score: Number,
      matchedSkills: [String],
      missingSkills: [String],
      verdict: String,
    },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

module.exports = mongoose.model('ResumeAnalysis', resumeAnalysisSchema);
