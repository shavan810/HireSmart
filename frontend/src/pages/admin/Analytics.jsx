import PageHeader from '../../components/PageHeader';
import { BarChart, DonutChart, HorizontalBars, LineChart } from '../../components/Charts';
import { DashboardSkeleton } from '../../components/Skeleton';
import ErrorState from '../../components/ErrorState';
import { dashboardService } from '../../services/dashboardService';
import { useFetch } from '../../hooks/useFetch';
import { STATUS_COLORS } from '../../utils/constants';

const Card = ({ title, children, className = '' }) => <section className={`card p-5 ${className}`}><h2 className="mb-3 text-base font-bold">{title}</h2>{children}</section>;

export default function Analytics() {
  const { data, loading, error, reload } = useFetch(() => dashboardService.admin(), []);
  if (loading) return <><PageHeader title="Platform analytics" /><DashboardSkeleton /></>;
  if (error) return <ErrorState message={error} onRetry={reload} />;

  const { stats, statuses, trends, jobsByCategory, topCompanies } = data;
  const funnel = Object.entries(statuses).map(([label, value]) => ({ label, value }));
  return (
    <>
      <PageHeader title="Platform analytics" subtitle="Growth and hiring activity over the last 6 months." />
      <div className="grid gap-6 lg:grid-cols-2">
        <Card title="New users per month"><LineChart data={trends.users} /></Card>
        <Card title="Jobs posted per month"><BarChart data={trends.jobs} color="#0b1f4b" /></Card>
        <Card title="Applications per month"><LineChart data={trends.applications} color="#10b981" /></Card>
        <Card title="User breakdown"><DonutChart centerLabel="Users" data={[{ label: 'Job seekers', value: stats.jobSeekers, color: '#2563eb' }, { label: 'Recruiters', value: stats.recruiters, color: '#f59e0b' }, { label: 'Admins', value: stats.admins, color: '#0b1f4b' }]} /></Card>
        <Card title="Application pipeline">
          <DonutChart centerLabel="Applications" data={Object.entries(statuses).map(([label, value]) => ({ label, value, color: STATUS_COLORS[label] }))} />
        </Card>
        <Card title="Applications by stage"><BarChart data={funnel} color="#2563eb" /></Card>
        <Card title="Jobs by category"><HorizontalBars data={jobsByCategory.slice(0, 8)} /></Card>
        <Card title="Top hiring companies"><HorizontalBars data={topCompanies} color="#0b1f4b" /></Card>
      </div>
    </>
  );
}
