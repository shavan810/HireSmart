import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { FiUsers } from 'react-icons/fi';
import PageHeader from '../../components/PageHeader';
import ApplicantCard from '../../components/ApplicantCard';
import EmptyState from '../../components/EmptyState';
import ErrorState from '../../components/ErrorState';
import Pagination from '../../components/Pagination';
import ConfirmationModal from '../../components/ConfirmationModal';
import { RowSkeleton } from '../../components/Skeleton';
import { applicationService } from '../../services/applicationService';
import { jobService } from '../../services/jobService';
import { useFetch } from '../../hooks/useFetch';
import { useToast } from '../../hooks/useToast';
import { APPLICATION_STATUS } from '../../utils/constants';
import { getErrorMessage } from '../../utils/format';

// Shared by "Applicants" (all statuses) and "Shortlisted" (fixedStatus="Shortlisted").
export default function ApplicantsList({ title, subtitle, fixedStatus }) {
  const toast = useToast();
  const [params, setParams] = useSearchParams();
  const [page, setPage] = useState(1);
  const [busy, setBusy] = useState(false);
  const [reject, setReject] = useState(null);

  const job = params.get('job') || '';
  const status = fixedStatus || params.get('status') || '';

  const jobs = useFetch(() => jobService.mine(), []);
  const { data, loading, error, reload } = useFetch(() => applicationService.forRecruiter({ job: job || undefined, status: status || undefined, page, limit: 8 }), [job, status, page]);

  const setFilter = (key, value) => {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value); else next.delete(key);
    setParams(next);
    setPage(1);
  };

  const change = async (application, newStatus) => {
    if (newStatus === 'Rejected' && reject?._id !== application._id) return setReject(application);
    setBusy(true);
    try {
      await applicationService.updateStatus(application._id, { status: newStatus });
      toast.success(`${application.applicant.name} marked as ${newStatus}`);
      setReject(null);
      reload();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <PageHeader title={title} subtitle={subtitle} />
      <div className="mb-5 grid gap-3 sm:grid-cols-2 lg:max-w-2xl">
        <select className="input" value={job} onChange={(e) => setFilter('job', e.target.value)} aria-label="Filter by job">
          <option value="">All jobs</option>
          {jobs.data?.jobs.map((j) => <option key={j._id} value={j._id}>{j.title}</option>)}
        </select>
        {!fixedStatus && (
          <select className="input" value={status} onChange={(e) => setFilter('status', e.target.value)} aria-label="Filter by status">
            <option value="">All statuses</option>
            {APPLICATION_STATUS.map((s) => <option key={s}>{s}</option>)}
          </select>
        )}
      </div>

      {error ? <ErrorState message={error} onRetry={reload} /> : loading ? <RowSkeleton rows={4} /> : data.applications.length === 0 ? (
        <EmptyState icon={FiUsers} title={fixedStatus ? 'No shortlisted candidates yet' : 'No applicants found'} message={fixedStatus ? 'Shortlist candidates from the Applicants page and they will appear here.' : 'Applications will appear here as candidates apply to your jobs.'} />
      ) : (
        <>
          <p className="mb-3 text-sm text-slate-500"><span className="font-bold text-navy-800">{data.total}</span> {data.total === 1 ? 'candidate' : 'candidates'}</p>
          <div className="space-y-4">{data.applications.map((a) => <ApplicantCard key={a._id} application={a} busy={busy} onStatusChange={change} />)}</div>
          <Pagination page={data.page} pages={data.pages} onChange={setPage} />
        </>
      )}

      <ConfirmationModal open={Boolean(reject)} title="Reject this candidate?" confirmLabel="Reject" loading={busy} onCancel={() => setReject(null)} onConfirm={() => change(reject, 'Rejected')} message={`${reject?.applicant?.name} will be notified that their application was rejected.`} />
    </>
  );
}
