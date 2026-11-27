import { Link } from 'react-router-dom';
import { FiAward, FiBriefcase, FiCheckCircle, FiClock, FiSend, FiStar } from 'react-icons/fi';
import PageHeader from '../../components/PageHeader';
import DashboardStats from '../../components/DashboardStats';
import { LineChart, DonutChart } from '../../components/Charts';
import { DashboardSkeleton } from '../../components/Skeleton';
import ErrorState from '../../components/ErrorState';
import StatusBadge from '../../components/StatusBadge';
import JobCard from '../../components/JobCard';
import EmptyState from '../../components/EmptyState';
import { dashboardService } from '../../services/dashboardService';
import { useFetch } from '../../hooks/useFetch';
import { useAuth } from '../../hooks/useAuth';
import { STATUS_COLORS } from '../../utils/constants';
import { timeAgo } from '../../utils/format';

export default function Overview() {
  const { user } = useAuth();
  const { data, loading, error, reload } = useFetch(() => dashboardService.seeker(), []);

  if (loading) return <><PageHeader title="Overview" /><DashboardSkeleton /></>;
  if (error) return <ErrorState message={error} onRetry={reload} />;

  const { stats, statuses, trend, recent, recommended, completeness, latestScore } = data;
  return (
    <>
      <PageHeader title={`Hi ${user.name.split(' ')[0]}, here is your progress`} subtitle="A snapshot of your job search." actions={<Link to="/seeker/jobs" className="btn btn-primary">Browse jobs</Link>} />

      <DashboardStats items={[
        { label: 'Applications sent', value: stats.total, icon: FiSend, tone: 'blue' },
        { label: 'Under review', value: stats['Under Review'], icon: FiClock, tone: 'amber' },
        { label: 'Shortlisted', value: stats.Shortlisted, icon: FiStar, tone: 'navy' },
        { label: 'Hired', value: stats.Hired, icon: FiCheckCircle, tone: 'emerald' },
      ]} />

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <section className="card p-5 lg:col-span-2">
          <h2 className="mb-1 text-base font-bold">Applications over the last 6 months</h2>
          <LineChart data={trend} emptyText="Apply to a job to see your activity here" />
        </section>
        <section className="card p-5">
          <h2 className="mb-4 text-base font-bold">Application status</h2>
          <DonutChart centerLabel="Applications" data={Object.entries(statuses).map(([label, value]) => ({ label, value, color: STATUS_COLORS[label] }))} />
        </section>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <section className="card p-5">
          <h2 className="text-base font-bold">Profile strength</h2>
          <div className="mt-4 h-3 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-blue-600" style={{ width: `${completeness}%` }} /></div>
          <p className="mt-2 text-sm text-slate-500"><span className="font-bold text-navy-800">{completeness}%</span> complete</p>
          {completeness < 100 && <Link to="/seeker/profile" className="mt-3 inline-block text-sm font-bold text-blue-600 hover:underline">Complete your profile</Link>}
          <div className="mt-6 flex items-center justify-between rounded-lg bg-slate-50 p-4">
            <div className="flex items-center gap-3"><FiAward className="h-6 w-6 text-blue-600" /><div><p className="text-sm font-semibold text-slate-800">Latest resume score</p><p className="text-xs text-slate-500">{latestScore === null ? 'Not analyzed yet' : 'From your last AI analysis'}</p></div></div>
            <span className="text-2xl font-extrabold text-navy-800">{latestScore ?? '-'}</span>
          </div>
          <Link to="/seeker/analyzer" className="btn btn-outline mt-4 w-full">{latestScore === null ? 'Analyze my resume' : 'Run a new analysis'}</Link>
        </section>

        <section className="card p-5 lg:col-span-2">
          <div className="mb-3 flex items-center justify-between"><h2 className="text-base font-bold">Recent applications</h2><Link to="/seeker/applications" className="text-sm font-bold text-blue-600 hover:underline">View all</Link></div>
          {recent.length === 0 ? <EmptyState icon={FiBriefcase} title="No applications yet" message="Find a role you like and apply in one click." action={<Link to="/seeker/jobs" className="btn btn-primary">Browse jobs</Link>} /> : (
            <ul className="divide-y divide-slate-100">
              {recent.map((a) => (
                <li key={a._id} className="flex items-center justify-between gap-3 py-3">
                  <div className="min-w-0"><p className="truncate font-semibold text-slate-800">{a.job?.title || 'Job removed'}</p><p className="truncate text-sm text-slate-500">{a.job?.company} · {timeAgo(a.appliedAt)}</p></div>
                  <StatusBadge status={a.status} />
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      {recommended.length > 0 && (
        <section className="mt-8">
          <h2 className="mb-4 text-lg font-bold">Recommended for you</h2>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{recommended.map((j) => <JobCard key={j._id} job={j} />)}</div>
        </section>
      )}
    </>
  );
}
