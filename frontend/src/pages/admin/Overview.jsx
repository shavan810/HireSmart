import { FiBriefcase, FiCheckSquare, FiUserCheck, FiUsers, FiBriefcase as FiJob, FiUser } from 'react-icons/fi';
import PageHeader from '../../components/PageHeader';
import DashboardStats from '../../components/DashboardStats';
import { BarChart, DonutChart } from '../../components/Charts';
import { DashboardSkeleton } from '../../components/Skeleton';
import ErrorState from '../../components/ErrorState';
import { dashboardService } from '../../services/dashboardService';
import { useFetch } from '../../hooks/useFetch';
import { STATUS_COLORS } from '../../utils/constants';
import { timeAgo } from '../../utils/format';

const ICON = { user: FiUser, job: FiJob, application: FiCheckSquare };

export default function Overview() {
  const { data, loading, error, reload } = useFetch(() => dashboardService.admin(), []);
  if (loading) return <><PageHeader title="Overview" /><DashboardSkeleton /></>;
  if (error) return <ErrorState message={error} onRetry={reload} />;

  const { stats, statuses, trends, activity } = data;
  return (
    <>
      <PageHeader title="Admin overview" subtitle="Platform health at a glance." />
      <DashboardStats items={[
        { label: 'Total users', value: stats.totalUsers, icon: FiUsers, tone: 'navy', hint: `${stats.activeUsers} active` },
        { label: 'Job seekers', value: stats.jobSeekers, icon: FiUserCheck, tone: 'blue' },
        { label: 'Recruiters', value: stats.recruiters, icon: FiBriefcase, tone: 'amber' },
        { label: 'Total jobs', value: stats.totalJobs, icon: FiJob, tone: 'emerald', hint: `${stats.openJobs} open` },
      ]} />

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <section className="card p-5 lg:col-span-2"><h2 className="mb-1 text-base font-bold">Applications per month</h2><BarChart data={trends.applications} emptyText="No applications yet" /></section>
        <section className="card p-5"><h2 className="mb-4 text-base font-bold">Application status</h2><DonutChart centerLabel="Applications" data={Object.entries(statuses).map(([label, value]) => ({ label, value, color: STATUS_COLORS[label] }))} /></section>
      </div>

      <section className="card mt-6 p-5">
        <h2 className="mb-3 text-base font-bold">Recent activity</h2>
        {activity.length === 0 ? <p className="py-8 text-center text-sm text-slate-400">No activity yet</p> : (
          <ul className="divide-y divide-slate-100">
            {activity.map((a, i) => {
              const Icon = ICON[a.type];
              return (
                <li key={i} className="flex items-center gap-3 py-3">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-navy-50 text-navy-600"><Icon /></span>
                  <p className="min-w-0 flex-1 truncate text-sm text-slate-700">{a.text}</p>
                  <span className="shrink-0 text-xs text-slate-400">{timeAgo(a.at)}</span>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </>
  );
}
