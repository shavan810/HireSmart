import { useState } from 'react';
import { FiCheckSquare } from 'react-icons/fi';
import PageHeader from '../../components/PageHeader';
import StatusBadge from '../../components/StatusBadge';
import EmptyState from '../../components/EmptyState';
import ErrorState from '../../components/ErrorState';
import Pagination from '../../components/Pagination';
import { RowSkeleton } from '../../components/Skeleton';
import { adminService } from '../../services/adminService';
import { useFetch } from '../../hooks/useFetch';
import { APPLICATION_STATUS } from '../../utils/constants';
import { formatDate } from '../../utils/format';

export default function ManageApplications() {
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const { data, loading, error, reload } = useFetch(() => adminService.applications({ status: status || undefined, page, limit: 12 }), [status, page]);

  return (
    <>
      <PageHeader title="Applications" subtitle="Monitor every application on the platform." />
      <div className="mb-5 max-w-xs">
        <select className="input" value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }} aria-label="Filter by status"><option value="">All statuses</option>{APPLICATION_STATUS.map((s) => <option key={s}>{s}</option>)}</select>
      </div>
      {error ? <ErrorState message={error} onRetry={reload} /> : loading ? <RowSkeleton /> : data.applications.length === 0 ? <EmptyState icon={FiCheckSquare} title="No applications found" message="Applications will show up here as candidates apply." /> : (
        <>
          <div className="card overflow-x-auto">
            <table className="w-full min-w-[720px]">
              <thead className="border-b border-slate-200 bg-slate-50"><tr><th className="th">Candidate</th><th className="th">Job</th><th className="th">Recruiter</th><th className="th">Applied</th><th className="th">Status</th></tr></thead>
              <tbody className="divide-y divide-slate-100">
                {data.applications.map((a) => (
                  <tr key={a._id}>
                    <td className="td"><p className="font-semibold text-slate-800">{a.applicant?.name || 'Deleted user'}</p><p className="text-slate-500">{a.applicant?.email}</p></td>
                    <td className="td"><p className="text-slate-800">{a.job?.title || 'Job removed'}</p><p className="text-slate-500">{a.job?.company}</p></td>
                    <td className="td text-slate-600">{a.recruiter?.companyName || a.recruiter?.name || '-'}</td>
                    <td className="td whitespace-nowrap text-slate-600">{formatDate(a.appliedAt)}</td>
                    <td className="td"><StatusBadge status={a.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-3 text-sm text-slate-500">{data.total} applications</p>
          <Pagination page={data.page} pages={data.pages} onChange={setPage} />
        </>
      )}
    </>
  );
}
