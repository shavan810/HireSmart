import {
  FiBarChart2, FiBell, FiBriefcase, FiCheckSquare, FiCpu, FiFileText, FiGrid, FiHome, FiMapPin,
  FiPlusSquare, FiSearch, FiSettings, FiStar, FiUser, FiUsers, FiClipboard, FiActivity,
} from 'react-icons/fi';

export const NAV = {
  jobseeker: [
    { to: '/seeker', label: 'Overview', icon: FiHome, end: true },
    { to: '/seeker/profile', label: 'My Profile', icon: FiUser },
    { to: '/seeker/resume', label: 'My Resume', icon: FiFileText },
    { to: '/seeker/jobs', label: 'Browse Jobs', icon: FiSearch },
    { to: '/seeker/applications', label: 'My Applications', icon: FiBriefcase },
    { to: '/seeker/tracking', label: 'Application Tracking', icon: FiMapPin },
    { to: '/seeker/analyzer', label: 'AI Resume Analyzer', icon: FiCpu },
    { to: '/seeker/notifications', label: 'Notifications', icon: FiBell },
    { to: '/seeker/settings', label: 'Settings', icon: FiSettings },
  ],
  recruiter: [
    { to: '/recruiter', label: 'Overview', icon: FiHome, end: true },
    { to: '/recruiter/company', label: 'Company Profile', icon: FiBriefcase },
    { to: '/recruiter/post-job', label: 'Post a Job', icon: FiPlusSquare },
    { to: '/recruiter/jobs', label: 'Manage Jobs', icon: FiClipboard },
    { to: '/recruiter/applicants', label: 'Applicants', icon: FiUsers },
    { to: '/recruiter/shortlisted', label: 'Shortlisted', icon: FiStar },
    { to: '/recruiter/notifications', label: 'Notifications', icon: FiBell },
    { to: '/recruiter/settings', label: 'Settings', icon: FiSettings },
  ],
  admin: [
    { to: '/admin', label: 'Overview', icon: FiGrid, end: true },
    { to: '/admin/users', label: 'Manage Users', icon: FiUsers },
    { to: '/admin/jobs', label: 'Manage Jobs', icon: FiBriefcase },
    { to: '/admin/applications', label: 'Manage Applications', icon: FiCheckSquare },
    { to: '/admin/analytics', label: 'Platform Analytics', icon: FiBarChart2 },
    { to: '/admin/settings', label: 'Settings', icon: FiSettings },
  ],
};

export const ACTIVITY_ICON = FiActivity;
