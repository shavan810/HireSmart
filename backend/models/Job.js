const mongoose = require('mongoose');
const { JOB_TYPES, EXPERIENCE_LEVELS, CATEGORIES, CURRENCIES, JOB_STATUS } = require('../utils/constants');

const jobSchema = new mongoose.Schema(
  {
    title: { type: String, required: [true, 'Job title is required'], trim: true, maxlength: 120 },
    description: { type: String, required: [true, 'Description is required'], trim: true, minlength: 30, maxlength: 6000 },
    requirements: [{ type: String, trim: true }],
    responsibilities: [{ type: String, trim: true }],
    skills: [{ type: String, trim: true }],
    location: { type: String, required: [true, 'Location is required'], trim: true, maxlength: 100 },
    salaryMin: { type: Number, min: 0, default: 0 },
    salaryMax: { type: Number, min: 0, default: 0 },
    currency: { type: String, enum: CURRENCIES, default: 'INR' },
    jobType: { type: String, enum: JOB_TYPES, required: true },
    experienceLevel: { type: String, enum: EXPERIENCE_LEVELS, required: true },
    category: { type: String, enum: CATEGORIES, required: true },
    company: { type: String, trim: true }, // denormalised from recruiter for fast search
    recruiter: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    status: { type: String, enum: JOB_STATUS, default: 'open' },
    deadline: Date,
  },
  { timestamps: true }
);

jobSchema.pre('validate', function checkSalary(next) {
  if (this.salaryMax && this.salaryMin && this.salaryMax < this.salaryMin) {
    this.invalidate('salaryMax', 'Maximum salary must be greater than or equal to minimum salary');
  }
  next();
});

jobSchema.index({ status: 1, createdAt: -1 });
jobSchema.index({ category: 1, jobType: 1, experienceLevel: 1 });

module.exports = mongoose.model('Job', jobSchema);
