/*
 * Development seed data.
 *   npm run seed         -> wipes the database and inserts demo data + admin
 *   npm run seed:admin   -> only creates the admin account (safe, non-destructive)
 */
require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const User = require('../models/User');
const Job = require('../models/Job');
const Application = require('../models/Application');
const Notification = require('../models/Notification');
const ResumeAnalysis = require('../models/ResumeAnalysis');
const ContactMessage = require('../models/ContactMessage');

const adminOnly = process.argv.includes('--admin-only');
const PASSWORD = 'Password@123';
const daysAgo = (n) => new Date(Date.now() - n * 24 * 60 * 60 * 1000);

const ensureAdmin = async () => {
  const email = (process.env.ADMIN_EMAIL || 'admin@hiresmart.com').toLowerCase();
  let admin = await User.findOne({ email });
  if (!admin) {
    admin = await User.create({
      name: process.env.ADMIN_NAME || 'HireSmart Admin',
      email,
      password: process.env.ADMIN_PASSWORD || 'Admin@12345',
      role: 'admin',
    });
    console.log(`Admin created: ${email}`);
  } else {
    console.log(`Admin already exists: ${email}`);
  }
  return admin;
};

const recruiters = [
  { name: 'Aarav Mehta', email: 'recruiter1@hiresmart.com', companyName: 'Nimbus Labs', industry: 'Software', companyLocation: 'Mumbai, India', companySize: '51-200', companyWebsite: 'https://nimbuslabs.example.com', companyDescription: 'Nimbus Labs builds cloud-native tools for logistics companies across India and Southeast Asia.' },
  { name: 'Priya Nair', email: 'recruiter2@hiresmart.com', companyName: 'BrightPath Analytics', industry: 'Data & AI', companyLocation: 'Bengaluru, India', companySize: '11-50', companyWebsite: 'https://brightpath.example.com', companyDescription: 'BrightPath turns messy business data into decisions with applied machine learning.' },
  { name: 'Rohan Kapoor', email: 'recruiter3@hiresmart.com', companyName: 'Orbit Finance', industry: 'Fintech', companyLocation: 'Pune, India', companySize: '201-500', companyWebsite: 'https://orbitfinance.example.com', companyDescription: 'Orbit Finance offers payments and lending APIs used by 2,000+ startups.' },
];

const seekers = [
  { name: 'Ananya Sharma', email: 'seeker1@hiresmart.com', headline: 'Full Stack Developer', location: 'Mumbai, India', experience: 2, skills: ['React', 'Node.js', 'MongoDB', 'Express', 'Tailwind CSS'], bio: 'MERN developer who enjoys building clean, accessible products.', education: [{ degree: 'B.E. Computer Engineering', institution: 'Mumbai University', year: 2022 }] },
  { name: 'Karan Verma', email: 'seeker2@hiresmart.com', headline: 'Data Analyst', location: 'Delhi, India', experience: 1, skills: ['Python', 'SQL', 'Power BI', 'Pandas'], bio: 'Analyst turning raw data into stories that teams act on.', education: [{ degree: 'B.Sc. Statistics', institution: 'Delhi University', year: 2023 }] },
  { name: 'Sneha Iyer', email: 'seeker3@hiresmart.com', headline: 'UI/UX Designer', location: 'Bengaluru, India', experience: 3, skills: ['Figma', 'User Research', 'Prototyping', 'Design Systems'], bio: 'Designer focused on research-led product work.', education: [{ degree: 'B.Des Interaction Design', institution: 'NID', year: 2021 }] },
];

const jobTemplates = [
  { r: 0, title: 'Full Stack Developer (MERN)', category: 'Software Development', jobType: 'Full-time', experienceLevel: 'Junior', location: 'Mumbai, India', salaryMin: 600000, salaryMax: 1200000, skills: ['React', 'Node.js', 'MongoDB', 'Express'], days: 2 },
  { r: 0, title: 'Senior Backend Engineer', category: 'Software Development', jobType: 'Full-time', experienceLevel: 'Senior', location: 'Mumbai, India', salaryMin: 2000000, salaryMax: 3200000, skills: ['Node.js', 'PostgreSQL', 'AWS', 'Docker'], days: 5 },
  { r: 0, title: 'Frontend Developer Intern', category: 'Software Development', jobType: 'Internship', experienceLevel: 'Fresher', location: 'Remote', salaryMin: 180000, salaryMax: 300000, skills: ['React', 'JavaScript', 'CSS'], days: 1 },
  { r: 0, title: 'DevOps Engineer', category: 'Software Development', jobType: 'Full-time', experienceLevel: 'Mid-level', location: 'Pune, India', salaryMin: 1400000, salaryMax: 2200000, skills: ['Kubernetes', 'Terraform', 'CI/CD', 'AWS'], days: 9 },
  { r: 1, title: 'Machine Learning Engineer', category: 'Data Science & AI', jobType: 'Full-time', experienceLevel: 'Mid-level', location: 'Bengaluru, India', salaryMin: 1800000, salaryMax: 3000000, skills: ['Python', 'PyTorch', 'MLOps', 'SQL'], days: 3 },
  { r: 1, title: 'Data Analyst', category: 'Data Science & AI', jobType: 'Full-time', experienceLevel: 'Junior', location: 'Bengaluru, India', salaryMin: 500000, salaryMax: 900000, skills: ['SQL', 'Python', 'Power BI', 'Excel'], days: 4 },
  { r: 1, title: 'Product Designer', category: 'Design', jobType: 'Full-time', experienceLevel: 'Mid-level', location: 'Remote', salaryMin: 1200000, salaryMax: 2000000, skills: ['Figma', 'User Research', 'Design Systems'], days: 6 },
  { r: 1, title: 'Content Marketing Manager', category: 'Marketing', jobType: 'Full-time', experienceLevel: 'Mid-level', location: 'Bengaluru, India', salaryMin: 900000, salaryMax: 1500000, skills: ['SEO', 'Copywriting', 'Analytics'], days: 12 },
  { r: 2, title: 'Financial Analyst', category: 'Finance', jobType: 'Full-time', experienceLevel: 'Junior', location: 'Pune, India', salaryMin: 600000, salaryMax: 1000000, skills: ['Excel', 'Financial Modeling', 'SQL'], days: 7 },
  { r: 2, title: 'Technical Support Specialist', category: 'Customer Support', jobType: 'Part-time', experienceLevel: 'Fresher', location: 'Pune, India', salaryMin: 240000, salaryMax: 400000, skills: ['Communication', 'Troubleshooting', 'APIs'], days: 8 },
  { r: 2, title: 'HR Business Partner', category: 'Human Resources', jobType: 'Full-time', experienceLevel: 'Senior', location: 'Mumbai, India', salaryMin: 1600000, salaryMax: 2400000, skills: ['Talent Management', 'HRIS', 'Employee Relations'], days: 15 },
  { r: 2, title: 'Sales Development Representative', category: 'Sales', jobType: 'Contract', experienceLevel: 'Fresher', location: 'Remote', salaryMin: 300000, salaryMax: 600000, skills: ['Outreach', 'CRM', 'Communication'], days: 10 },
];

const run = async () => {
  await connectDB();
  const admin = await ensureAdmin();

  if (adminOnly) {
    await mongoose.disconnect();
    return;
  }

  console.log('Clearing existing data...');
  await Promise.all([Job.deleteMany(), Application.deleteMany(), Notification.deleteMany(), ResumeAnalysis.deleteMany(), ContactMessage.deleteMany()]);
  await User.deleteMany({ _id: { $ne: admin._id } });

  const recruiterDocs = [];
  for (const r of recruiters) recruiterDocs.push(await User.create({ ...r, password: PASSWORD, role: 'recruiter' }));

  // Sample resume URL for development only: upload a real PDF in the app to use AI analysis.
  const sampleResume = 'https://example.com/sample-resume.pdf';
  const seekerDocs = [];
  for (const s of seekers) seekerDocs.push(await User.create({ ...s, password: PASSWORD, role: 'jobseeker', resumeUrl: sampleResume, resumeName: 'resume.pdf' }));

  const longDesc = (t, c) =>
    `${c} is looking for a ${t} to join a collaborative team and ship features that matter to real customers. You will own work end to end, collaborate with design and product, and grow with a supportive team.`;

  const jobDocs = [];
  for (const t of jobTemplates) {
    const rec = recruiterDocs[t.r];
    const job = await Job.create({
      title: t.title,
      description: longDesc(t.title, rec.companyName),
      requirements: [`Hands-on experience with ${t.skills[0]} and ${t.skills[1]}`, 'Strong communication and problem solving', 'Comfortable working in an agile team'],
      responsibilities: ['Deliver high quality work on time', 'Collaborate with cross-functional teammates', 'Share knowledge and improve team processes'],
      skills: t.skills,
      location: t.location,
      salaryMin: t.salaryMin,
      salaryMax: t.salaryMax,
      currency: 'INR',
      jobType: t.jobType,
      experienceLevel: t.experienceLevel,
      category: t.category,
      company: rec.companyName,
      recruiter: rec._id,
    });
    await Job.updateOne({ _id: job._id }, { createdAt: daysAgo(t.days) }, { timestamps: false });
    jobDocs.push(job);
  }

  const statuses = ['Applied', 'Under Review', 'Shortlisted', 'Rejected', 'Hired'];
  let n = 0;
  for (const seeker of seekerDocs) {
    for (let i = 0; i < 4; i += 1) {
      const job = jobDocs[(n * 3 + i * 2) % jobDocs.length];
      const status = statuses[(n + i) % statuses.length];
      const base = daysAgo(20 - n * 3 - i * 2);
      const chain = statuses.slice(0, statuses.indexOf(status) + 1).filter((s) => !(status === 'Rejected' && s === 'Shortlisted') && !(status === 'Rejected' && s === 'Hired'));
      if (status === 'Hired') chain.splice(0, chain.length, 'Applied', 'Under Review', 'Shortlisted', 'Hired');
      try {
        await Application.create({
          applicant: seeker._id,
          job: job._id,
          recruiter: job.recruiter,
          resumeUrl: seeker.resumeUrl,
          coverLetter: `Hello, I'm excited about the ${job.title} role and believe my background is a good fit.`,
          status,
          appliedAt: base,
          statusHistory: chain.map((s, idx) => ({ status: s, changedBy: idx === 0 ? seeker._id : job.recruiter, changedAt: new Date(base.getTime() + idx * 86400000) })),
        });
      } catch (_e) {
        /* skip duplicate pairs */
      }
    }
    n += 1;
  }

  await Notification.insertMany([
    { recipient: seekerDocs[0]._id, sender: recruiterDocs[0]._id, type: 'status_changed', message: 'Your application for Full Stack Developer (MERN) is now "Shortlisted"', link: '/seeker/tracking' },
    { recipient: recruiterDocs[0]._id, sender: seekerDocs[0]._id, type: 'application_received', message: 'Ananya Sharma applied for Full Stack Developer (MERN)', link: '/recruiter/applicants' },
  ]);

  console.log('\nSeed complete. Demo logins (password for all: Password@123)');
  console.log(`  Admin     : ${admin.email} / ${process.env.ADMIN_PASSWORD || 'Admin@12345'}`);
  recruiters.forEach((r) => console.log(`  Recruiter : ${r.email}`));
  seekers.forEach((s) => console.log(`  Job seeker: ${s.email}`));
  await mongoose.disconnect();
};

run().catch(async (err) => {
  console.error('Seed failed:', err);
  await mongoose.disconnect();
  process.exit(1);
});
