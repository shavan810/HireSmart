import { Link } from 'react-router-dom';
import { FiBriefcase, FiCheckCircle, FiStar, FiUsers, FiUserX, FiActivity } from 'react-icons/fi';
import PageHeader from '../../components/PageHeader';
import DashboardStats from '../../components/DashboardStats';
import { LineChart, DonutChart, HorizontalBars } from '../../components/Charts';
import { DashboardSkeleton } from '../../components/Skeleton';
import ErrorState from '../../components/ErrorState';
import StatusBadge from '../../components/StatusBadge';
import Avatar from '../../components/Avatar';
import EmptyState from '../../components/EmptyState';
import { dashboardService } from '../../services/dashboardService';
import { useFetch } from '../../hooks/useFetch';
import { STATUS_COLORS } from '../../utils/constants';
import { timeAgo } from '../../utils/format';

export default function Overview() {
  const { data, loading, error, reload } = useFetch(() => dashboardService.recruiter(), []);
  if (loading) return <><PageHeader title="Overview" /><DashboardSkeleton /></>;
  if (error) return <ErrorState message={error} onRetry={reload} />;

  const { stats, statuses, trend, topJobs, recent } = data;
  return (
    <>
      <PageHeader title="Recruiter overview" subtitle="Your hiring pipeline at a glance." actions={<Link to="/recruiter/post-job" className="btn btn-primary">Post a job</Link>} />
      <DashboardStats columns="sm:grid-cols-2 xl:grid-cols-3" items={[
        { label: 'Total jobs', value: stats.totalJobs, icon: FiBriefcase, tone: 'navy', hint: `${stats.activeJobs} open` },
        { label: 'Total applicants', value: stats.totalApplicants, icon: FiUsers, tone: 'blue' },
        { label: 'Shortlisted', value: stats.shortlisted, icon: FiStar, tone: 'amber' },
        { label: 'Rejected', value: stats.rejected, icon: FiUserX, tone: 'red' },
        { label: 'Hired', value: stats.hired, icon: FiCheckCircle, tone: 'emerald' },
        { label: 'Open positions', value: stats.activeJobs, icon: FiActivity, tone: 'slate' },
      ]} />

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <section className="card p-5 lg:col-span-2"><h2 className="mb-1 text-base font-bold">Applicants per month</h2><LineChart data={trend} emptyText="Applicants will appear here once candidates apply" /></section>
        <section className="card p-5"><h2 className="mb-4 text-base font-bold">Pipeline</h2><DonutChart centerLabel="Applicants" data={Object.entries(statuses).map(([label, value]) => ({ label, value, color: STATUS_COLORS[label] }))} /></section>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <section className="card p-5"><h2 className="mb-4 text-base font-bold">Most applied jobs</h2><HorizontalBars data={topJobs} emptyText="No applications yet" /></section>
        <section className="card p-5">
          <div className="mb-3 flex items-center justify-between"><h2 className="text-base font-bold">Recent applicants</h2><Link to="/recruiter/applicants" className="text-sm font-bold text-blue-600 hover:underline">View all</Link></div>
          {recent.length === 0 ? <EmptyState icon={FiUsers} title="No applicants yet" message="Share your job posts to start receiving applications." /> : (
            <ul className="divide-y divide-slate-100">
              {recent.map((a) => (
                <li key={a._id} className="flex items-center gap-3 py-3">
                  <Avatar name={a.applicant?.name} src={a.applicant?.profileImage} size="sm" />
                  <div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold text-slate-800">{a.applicant?.name}</p><p className="truncate text-xs text-slate-500">{a.job?.title} · {timeAgo(a.appliedAt)}</p></div>
                  <StatusBadge status={a.status} />
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </>
  );
}
