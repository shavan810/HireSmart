import { useState } from 'react';
import { Link } from 'react-router-dom';
import { FiBriefcase, FiSearch, FiTrash2 } from 'react-icons/fi';
import PageHeader from '../../components/PageHeader';
import EmptyState from '../../components/EmptyState';
import ErrorState from '../../components/ErrorState';
import Pagination from '../../components/Pagination';
import ConfirmationModal from '../../components/ConfirmationModal';
import { RowSkeleton } from '../../components/Skeleton';
import { adminService } from '../../services/adminService';
import { useFetch } from '../../hooks/useFetch';
import { useDebounce } from '../../hooks/useDebounce';
import { useToast } from '../../hooks/useToast';
import { formatDate, getErrorMessage } from '../../utils/format';

export default function ManageJobs() {
  const toast = useToast();
  const [q, setQ] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [target, setTarget] = useState(null);
  const [busy, setBusy] = useState(false);
  const dq = useDebounce(q);
  const { data, loading, error, reload } = useFetch(() => adminService.jobs({ q: dq || undefined, status: status || undefined, page, limit: 10 }), [dq, status, page]);

  const toggle = async (j) => {
    try {
      await adminService.setJobStatus(j._id, j.status === 'open' ? 'closed' : 'open');
      toast.success(j.status === 'open' ? 'Job closed' : 'Job reopened');
      reload();
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  const remove = async () => {
    setBusy(true);
    try {
      await adminService.deleteJob(target._id);
      toast.success('Job removed and recruiter notified');
      setTarget(null);
      reload();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <PageHeader title="Manage jobs" subtitle="Review listings and remove inappropriate posts." />
      <div className="mb-5 grid gap-3 sm:grid-cols-[1fr_200px]">
        <div className="relative"><FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" /><input className="input pl-10" placeholder="Search title, company or location" value={q} onChange={(e) => { setQ(e.target.value); setPage(1); }} aria-label="Search jobs" /></div>
        <select className="input" value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }} aria-label="Filter by status"><option value="">All statuses</option><option value="open">Open</option><option value="closed">Closed</option></select>
      </div>

      {error ? <ErrorState message={error} onRetry={reload} /> : loading ? <RowSkeleton /> : data.jobs.length === 0 ? <EmptyState icon={FiBriefcase} title="No jobs found" message="Try a different search or filter." /> : (
        <>
          <div className="card overflow-x-auto">
            <table className="w-full min-w-[760px]">
              <thead className="border-b border-slate-200 bg-slate-50"><tr><th className="th">Job</th><th className="th">Recruiter</th><th className="th">Posted</th><th className="th">Applicants</th><th className="th">Status</th><th className="th" /></tr></thead>
              <tbody className="divide-y divide-slate-100">
                {data.jobs.map((j) => (
                  <tr key={j._id}>
                    <td className="td"><Link to={`/jobs/${j._id}`} className="font-semibold text-slate-800 hover:text-blue-600">{j.title}</Link><p className="text-slate-500">{j.company} · {j.location}</p></td>
                    <td className="td text-slate-600">{j.recruiter?.name || '-'}</td>
                    <td className="td whitespace-nowrap text-slate-600">{formatDate(j.createdAt)}</td>
                    <td className="td font-bold text-navy-800">{j.applicantCount}</td>
                    <td className="td"><button onClick={() => toggle(j)} className={`rounded-full px-2.5 py-1 text-xs font-semibold ${j.status === 'open' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-600'}`} title="Click to toggle">{j.status === 'open' ? 'Open' : 'Closed'}</button></td>
                    <td className="td text-right"><button onClick={() => setTarget(j)} className="btn btn-ghost btn-sm text-red-600" aria-label={`Delete ${j.title}`}><FiTrash2 /></button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-3 text-sm text-slate-500">{data.total} jobs</p>
          <Pagination page={data.page} pages={data.pages} onChange={setPage} />
        </>
      )}

      <ConfirmationModal open={Boolean(target)} title="Remove this job post?" confirmLabel="Remove job" loading={busy} onCancel={() => setTarget(null)} onConfirm={remove} message={`"${target?.title}" and its ${target?.applicantCount || 0} applications will be deleted. The recruiter will be notified.`} />
    </>
  );
}
