const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { ROLES } = require('../utils/constants');

const educationSchema = new mongoose.Schema(
  {
    degree: { type: String, trim: true, maxlength: 120 },
    institution: { type: String, trim: true, maxlength: 120 },
    year: { type: Number, min: 1950, max: 2100 },
  },
  { _id: false }
);

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: [true, 'Name is required'], trim: true, minlength: 2, maxlength: 60 },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email'],
    },
    password: { type: String, required: [true, 'Password is required'], minlength: 8, select: false },
    role: { type: String, enum: Object.values(ROLES), default: ROLES.SEEKER, index: true },
    isActive: { type: Boolean, default: true },

    // Shared profile
    profileImage: { type: String, default: '' },
    profileImagePublicId: { type: String, select: false },
    phone: { type: String, trim: true, maxlength: 20 },
    headline: { type: String, trim: true, maxlength: 120 },
    bio: { type: String, trim: true, maxlength: 1000 },
    location: { type: String, trim: true, maxlength: 100 },

    // Job seeker
    skills: [{ type: String, trim: true }],
    experience: { type: Number, min: 0, max: 60, default: 0 }, // years
    education: [educationSchema],
    resumeUrl: { type: String, default: '' },
    resumeName: { type: String, default: '' },
    resumePublicId: { type: String, select: false },
    resumeUpdatedAt: Date,

    // Recruiter
    companyName: { type: String, trim: true, maxlength: 100 },
    companyWebsite: { type: String, trim: true, maxlength: 200 },
    companyLocation: { type: String, trim: true, maxlength: 100 },
    companyDescription: { type: String, trim: true, maxlength: 2000 },
    companySize: { type: String, trim: true, maxlength: 40 },
    industry: { type: String, trim: true, maxlength: 80 },

    // Preferences
    emailNotifications: { type: Boolean, default: true },
    lastLoginAt: Date,
  },
  { timestamps: true }
);

userSchema.pre('save', async function hashPassword(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  return next();
});

userSchema.methods.matchPassword = function matchPassword(candidate) {
  return bcrypt.compare(candidate, this.password);
};

userSchema.set('toJSON', {
  transform: (_doc, ret) => {
    delete ret.password;
    delete ret.__v;
    return ret;
  },
});

module.exports = mongoose.model('User', userSchema);
