const User = require('../models/User');
const Job = require('../models/Job');
const Application = require('../models/Application');
const Notification = require('../models/Notification');
const ResumeAnalysis = require('../models/ResumeAnalysis');
const { deleteAsset } = require('../services/cloudinary.service');

// Removes a user and everything that depends on them so no orphaned documents remain.
const deleteUserCascade = async (userId) => {
  const user = await User.findById(userId).select('+resumePublicId +profileImagePublicId role');
  if (!user) return;

  if (user.role === 'recruiter') {
    const jobs = await Job.find({ recruiter: user._id }).select('_id');
    const jobIds = jobs.map((j) => j._id);
    await Application.deleteMany({ job: { $in: jobIds } });
    await Job.deleteMany({ recruiter: user._id });
  } else {
    await Application.deleteMany({ applicant: user._id });
    await ResumeAnalysis.deleteMany({ user: user._id });
  }

  await Notification.deleteMany({ $or: [{ recipient: user._id }, { sender: user._id }] });
  await deleteAsset(user.resumePublicId, 'raw');
  await deleteAsset(user.profileImagePublicId, 'image');
  await user.deleteOne();
};

module.exports = { deleteUserCascade };
