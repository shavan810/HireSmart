export const ROLES = { SEEKER: 'jobseeker', RECRUITER: 'recruiter', ADMIN: 'admin' };

export const JOB_TYPES = ['Full-time', 'Part-time', 'Contract', 'Internship', 'Remote'];
export const EXPERIENCE_LEVELS = ['Fresher', 'Junior', 'Mid-level', 'Senior', 'Lead'];
export const CATEGORIES = [
  'Software Development',
  'Data Science & AI',
  'Design',
  'Marketing',
  'Sales',
  'Finance',
  'Human Resources',
  'Operations',
  'Customer Support',
  'Healthcare',
  'Education',
  'Other',
];
export const CURRENCIES = ['INR', 'USD', 'EUR', 'GBP'];
export const APPLICATION_STATUS = ['Applied', 'Under Review', 'Shortlisted', 'Rejected', 'Hired'];

export const STATUS_STYLES = {
  Applied: 'bg-slate-100 text-slate-700',
  'Under Review': 'bg-amber-100 text-amber-800',
  Shortlisted: 'bg-blue-100 text-blue-800',
  Rejected: 'bg-red-100 text-red-700',
  Hired: 'bg-emerald-100 text-emerald-800',
};

export const STATUS_COLORS = {
  Applied: '#94a3b8',
  'Under Review': '#f59e0b',
  Shortlisted: '#2563eb',
  Rejected: '#ef4444',
  Hired: '#10b981',
};

export const dashboardPath = (role) =>
  ({ jobseeker: '/seeker', recruiter: '/recruiter', admin: '/admin' }[role] || '/');
