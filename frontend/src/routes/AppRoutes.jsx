import { lazy, Suspense } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';
import PublicLayout from '../layouts/PublicLayout';
import DashboardLayout from '../layouts/DashboardLayout';
import LoadingSpinner from '../components/LoadingSpinner';
import { useAuth } from '../hooks/useAuth';
import { dashboardPath } from '../utils/constants';

const page = (loader) => lazy(loader);

// Public
const Home = page(() => import('../pages/public/Home'));
const Jobs = page(() => import('../pages/public/Jobs'));
const JobDetails = page(() => import('../pages/public/JobDetails'));
const Login = page(() => import('../pages/public/Login'));
const Register = page(() => import('../pages/public/Register'));
const About = page(() => import('../pages/public/About'));
const Contact = page(() => import('../pages/public/Contact'));
const NotFound = page(() => import('../pages/public/NotFound'));

// Shared
const Notifications = page(() => import('../pages/shared/Notifications'));
const Settings = page(() => import('../pages/shared/Settings'));

// Job seeker
const SeekerOverview = page(() => import('../pages/seeker/Overview'));
const SeekerProfile = page(() => import('../pages/seeker/Profile'));
const SeekerResume = page(() => import('../pages/seeker/Resume'));
const BrowseJobs = page(() => import('../pages/seeker/BrowseJobs'));
const MyApplications = page(() => import('../pages/seeker/MyApplications'));
const ApplicationTracking = page(() => import('../pages/seeker/ApplicationTracking'));
const ResumeAnalyzer = page(() => import('../pages/seeker/ResumeAnalyzer'));

// Recruiter
const RecruiterOverview = page(() => import('../pages/recruiter/Overview'));
const CompanyProfile = page(() => import('../pages/recruiter/CompanyProfile'));
const PostJob = page(() => import('../pages/recruiter/PostJob'));
const ManageJobs = page(() => import('../pages/recruiter/ManageJobs'));
const Applicants = page(() => import('../pages/recruiter/Applicants'));
const Shortlisted = page(() => import('../pages/recruiter/Shortlisted'));

// Admin
const AdminOverview = page(() => import('../pages/admin/Overview'));
const ManageUsers = page(() => import('../pages/admin/ManageUsers'));
const AdminJobs = page(() => import('../pages/admin/ManageJobs'));
const ManageApplications = page(() => import('../pages/admin/ManageApplications'));
const Analytics = page(() => import('../pages/admin/Analytics'));

// Logged-in users visiting /login or /register are sent to their dashboard.
function GuestOnly({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <LoadingSpinner fullScreen />;
  return user ? <Navigate to={dashboardPath(user.role)} replace /> : children;
}

export default function AppRoutes() {
  return (
    <Suspense fallback={<LoadingSpinner fullScreen />}>
      <Routes>
        <Route element={<PublicLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/jobs" element={<Jobs />} />
          <Route path="/jobs/:id" element={<JobDetails />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/login" element={<GuestOnly><Login /></GuestOnly>} />
          <Route path="/register" element={<GuestOnly><Register /></GuestOnly>} />
          <Route path="/admin/login" element={<GuestOnly><Login admin /></GuestOnly>} />
        </Route>

        <Route path="/seeker" element={<ProtectedRoute roles={['jobseeker']} />}>
          <Route element={<DashboardLayout />}>
            <Route index element={<SeekerOverview />} />
            <Route path="profile" element={<SeekerProfile />} />
            <Route path="resume" element={<SeekerResume />} />
            <Route path="jobs" element={<BrowseJobs />} />
            <Route path="applications" element={<MyApplications />} />
            <Route path="tracking" element={<ApplicationTracking />} />
            <Route path="analyzer" element={<ResumeAnalyzer />} />
            <Route path="notifications" element={<Notifications />} />
            <Route path="settings" element={<Settings />} />
          </Route>
        </Route>

        <Route path="/recruiter" element={<ProtectedRoute roles={['recruiter']} />}>
          <Route element={<DashboardLayout />}>
            <Route index element={<RecruiterOverview />} />
            <Route path="company" element={<CompanyProfile />} />
            <Route path="post-job" element={<PostJob />} />
            <Route path="jobs" element={<ManageJobs />} />
            <Route path="jobs/:id/edit" element={<PostJob />} />
            <Route path="applicants" element={<Applicants />} />
            <Route path="shortlisted" element={<Shortlisted />} />
            <Route path="notifications" element={<Notifications />} />
            <Route path="settings" element={<Settings />} />
          </Route>
        </Route>

        <Route path="/admin" element={<ProtectedRoute roles={['admin']} />}>
          <Route element={<DashboardLayout />}>
            <Route index element={<AdminOverview />} />
            <Route path="users" element={<ManageUsers />} />
            <Route path="jobs" element={<AdminJobs />} />
            <Route path="applications" element={<ManageApplications />} />
            <Route path="analytics" element={<Analytics />} />
            <Route path="notifications" element={<Notifications />} />
            <Route path="settings" element={<Settings />} />
          </Route>
        </Route>

        <Route element={<PublicLayout />}>
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </Suspense>
  );
}
