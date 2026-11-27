const mongoose = require('mongoose');
const { APPLICATION_STATUS } = require('../utils/constants');

const historySchema = new mongoose.Schema(
  {
    status: { type: String, enum: APPLICATION_STATUS, required: true },
    changedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    note: { type: String, trim: true, maxlength: 500 },
    changedAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const applicationSchema = new mongoose.Schema(
  {
    applicant: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    job: { type: mongoose.Schema.Types.ObjectId, ref: 'Job', required: true },
    recruiter: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    resumeUrl: { type: String, required: true },
    coverLetter: { type: String, trim: true, maxlength: 2000 },
    status: { type: String, enum: APPLICATION_STATUS, default: 'Applied' },
    statusHistory: [historySchema],
    appliedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

// One application per job per candidate (enforced at the database level).
applicationSchema.index({ applicant: 1, job: 1 }, { unique: true });
applicationSchema.index({ recruiter: 1, status: 1 });

module.exports = mongoose.model('Application', applicationSchema);
