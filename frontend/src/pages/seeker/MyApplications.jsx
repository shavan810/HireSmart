import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { FiBriefcase, FiTrash2 } from 'react-icons/fi';
import PageHeader from '../../components/PageHeader';
import StatusBadge from '../../components/StatusBadge';
import EmptyState from '../../components/EmptyState';
import ErrorState from '../../components/ErrorState';
import ConfirmationModal from '../../components/ConfirmationModal';
import { RowSkeleton } from '../../components/Skeleton';
import { applicationService } from '../../services/applicationService';
import { useFetch } from '../../hooks/useFetch';
import { useToast } from '../../hooks/useToast';
import { APPLICATION_STATUS } from '../../utils/constants';
import { formatDate, formatSalary, getErrorMessage } from '../../utils/format';

export default function MyApplications() {
  const toast = useToast();
  const { data, loading, error, reload } = useFetch(() => applicationService.mine(), []);
  const [status, setStatus] = useState('All');
  const [target, setTarget] = useState(null);
  const [busy, setBusy] = useState(false);

  const list = useMemo(() => (data?.applications || []).filter((a) => status === 'All' || a.status === status), [data, status]);

  const withdraw = async () => {
    setBusy(true);
    try {
      await applicationService.withdraw(target._id);
      toast.success('Application withdrawn');
      setTarget(null);
      reload();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  const Actions = ({ a }) => (
    <div className="flex items-center gap-2">
      {a.job && <Link to={`/jobs/${a.job._id}`} className="btn btn-outline btn-sm">View job</Link>}
      {a.status === 'Applied' && <button onClick={() => setTarget(a)} className="btn btn-ghost btn-sm text-red-600" aria-label="Withdraw application"><FiTrash2 /></button>}
    </div>
  );

  return (
    <>
      <PageHeader title="My applications" subtitle="Every job you have applied to." actions={<Link to="/seeker/tracking" className="btn btn-outline">Track progress</Link>} />

      <div className="mb-4 flex flex-wrap gap-2">
        {['All', ...APPLICATION_STATUS].map((s) => (
          <button key={s} onClick={() => setStatus(s)} className={`rounded-lg px-3.5 py-2 text-sm font-semibold ${status === s ? 'bg-navy-800 text-white' : 'bg-white text-slate-600 hover:bg-slate-100'}`}>
            {s}{s !== 'All' && data ? ` (${data.applications.filter((a) => a.status === s).length})` : ''}
          </button>
        ))}
      </div>

      {error ? <ErrorState message={error} onRetry={reload} /> : loading ? <RowSkeleton /> : list.length === 0 ? (
        <EmptyState icon={FiBriefcase} title={status === 'All' ? 'You have not applied yet' : `No applications marked "${status}"`} message="Browse open roles and apply with your saved resume." action={<Link to="/seeker/jobs" className="btn btn-primary">Browse jobs</Link>} />
      ) : (
        <>
          <div className="card hidden overflow-x-auto md:block">
            <table className="w-full min-w-[640px]">
              <thead className="border-b border-slate-200 bg-slate-50"><tr><th className="th">Job</th><th className="th">Salary</th><th className="th">Applied</th><th className="th">Status</th><th className="th" /></tr></thead>
              <tbody className="divide-y divide-slate-100">
                {list.map((a) => (
                  <tr key={a._id}>
                    <td className="td"><p className="font-semibold text-slate-800">{a.job?.title || 'Job removed'}</p><p className="text-slate-500">{a.job?.company} · {a.job?.location}</p></td>
                    <td className="td whitespace-nowrap text-slate-600">{a.job ? formatSalary(a.job) : '-'}</td>
                    <td className="td whitespace-nowrap text-slate-600">{formatDate(a.appliedAt)}</td>
                    <td className="td"><StatusBadge status={a.status} /></td>
                    <td className="td"><Actions a={a} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <ul className="space-y-3 md:hidden">
            {list.map((a) => (
              <li key={a._id} className="card p-4">
                <div className="flex items-start justify-between gap-3"><div className="min-w-0"><p className="truncate font-semibold text-slate-800">{a.job?.title || 'Job removed'}</p><p className="truncate text-sm text-slate-500">{a.job?.company}</p></div><StatusBadge status={a.status} /></div>
                <p className="mt-2 text-xs text-slate-400">Applied {formatDate(a.appliedAt)}</p>
                <div className="mt-3"><Actions a={a} /></div>
              </li>
            ))}
          </ul>
        </>
      )}

      <ConfirmationModal open={Boolean(target)} title="Withdraw application?" confirmLabel="Withdraw" loading={busy} onCancel={() => setTarget(null)} onConfirm={withdraw} message={`Your application for ${target?.job?.title || 'this job'} will be removed. You can apply again later.`} />
    </>
  );
}
