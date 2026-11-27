import { useState } from 'react';
import { Link } from 'react-router-dom';
import { FiBriefcase, FiEdit2, FiTrash2, FiUsers } from 'react-icons/fi';
import PageHeader from '../../components/PageHeader';
import EmptyState from '../../components/EmptyState';
import ErrorState from '../../components/ErrorState';
import ConfirmationModal from '../../components/ConfirmationModal';
import { RowSkeleton } from '../../components/Skeleton';
import { jobService } from '../../services/jobService';
import { useFetch } from '../../hooks/useFetch';
import { useToast } from '../../hooks/useToast';
import { formatDate, getErrorMessage } from '../../utils/format';

export default function ManageJobs() {
  const toast = useToast();
  const { data, loading, error, reload } = useFetch(() => jobService.mine(), []);
  const [target, setTarget] = useState(null);
  const [busy, setBusy] = useState(false);

  const remove = async () => {
    setBusy(true);
    try {
      await jobService.remove(target._id);
      toast.success('Job deleted');
      setTarget(null);
      reload();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  const toggle = async (job) => {
    try {
      await jobService.update(job._id, { ...job, skills: job.skills, requirements: job.requirements, responsibilities: job.responsibilities, status: job.status === 'open' ? 'closed' : 'open' });
      toast.success(job.status === 'open' ? 'Job closed' : 'Job reopened');
      reload();
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  const Badge = ({ s }) => <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${s === 'open' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-600'}`}>{s === 'open' ? 'Open' : 'Closed'}</span>;

  const Actions = ({ j }) => (
    <div className="flex flex-wrap items-center gap-2">
      <Link to={`/recruiter/applicants?job=${j._id}`} className="btn btn-outline btn-sm"><FiUsers /> Applicants</Link>
      <Link to={`/recruiter/jobs/${j._id}/edit`} className="btn btn-ghost btn-sm" aria-label="Edit job"><FiEdit2 /></Link>
      <button onClick={() => toggle(j)} className="btn btn-ghost btn-sm">{j.status === 'open' ? 'Close' : 'Reopen'}</button>
      <button onClick={() => setTarget(j)} className="btn btn-ghost btn-sm text-red-600" aria-label="Delete job"><FiTrash2 /></button>
    </div>
  );

  return (
    <>
      <PageHeader title="Manage jobs" subtitle="Edit, close or delete your vacancies." actions={<Link to="/recruiter/post-job" className="btn btn-primary">Post a job</Link>} />
      {error ? <ErrorState message={error} onRetry={reload} /> : loading ? <RowSkeleton /> : data.jobs.length === 0 ? (
        <EmptyState icon={FiBriefcase} title="You have not posted any jobs" message="Post your first vacancy to start receiving applications." action={<Link to="/recruiter/post-job" className="btn btn-primary">Post a job</Link>} />
      ) : (
        <>
          <div className="card hidden overflow-x-auto lg:block">
            <table className="w-full min-w-[760px]">
              <thead className="border-b border-slate-200 bg-slate-50"><tr><th className="th">Job</th><th className="th">Posted</th><th className="th">Applicants</th><th className="th">Status</th><th className="th" /></tr></thead>
              <tbody className="divide-y divide-slate-100">
                {data.jobs.map((j) => (
                  <tr key={j._id}>
                    <td className="td"><p className="font-semibold text-slate-800">{j.title}</p><p className="text-slate-500">{j.location} · {j.jobType}</p></td>
                    <td className="td whitespace-nowrap text-slate-600">{formatDate(j.createdAt)}</td>
                    <td className="td font-bold text-navy-800">{j.applicantCount}</td>
                    <td className="td"><Badge s={j.status} /></td>
                    <td className="td"><Actions j={j} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <ul className="space-y-3 lg:hidden">
            {data.jobs.map((j) => (
              <li key={j._id} className="card p-4">
                <div className="flex items-start justify-between gap-3"><div className="min-w-0"><p className="truncate font-semibold text-slate-800">{j.title}</p><p className="text-sm text-slate-500">{j.location} · {j.jobType}</p></div><Badge s={j.status} /></div>
                <p className="mt-2 text-xs text-slate-400">Posted {formatDate(j.createdAt)} · {j.applicantCount} applicants</p>
                <div className="mt-3"><Actions j={j} /></div>
              </li>
            ))}
          </ul>
        </>
      )}
      <ConfirmationModal open={Boolean(target)} title="Delete this job?" confirmLabel="Delete job" loading={busy} onCancel={() => setTarget(null)} onConfirm={remove} message={`"${target?.title}" and all of its applications will be permanently deleted.`} />
    </>
  );
}
