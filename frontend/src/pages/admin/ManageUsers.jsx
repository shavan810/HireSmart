import { useState } from 'react';
import { FiSearch, FiTrash2, FiUsers } from 'react-icons/fi';
import PageHeader from '../../components/PageHeader';
import Avatar from '../../components/Avatar';
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

const ROLE = { jobseeker: 'Job seeker', recruiter: 'Recruiter', admin: 'Admin' };

export default function ManageUsers() {
  const toast = useToast();
  const [q, setQ] = useState('');
  const [role, setRole] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [target, setTarget] = useState(null);
  const [busy, setBusy] = useState(false);
  const dq = useDebounce(q);

  const { data, loading, error, reload } = useFetch(() => adminService.users({ q: dq || undefined, role: role || undefined, status: status || undefined, page, limit: 10 }), [dq, role, status, page]);

  const toggle = async (u) => {
    try {
      await adminService.setUserStatus(u._id, !u.isActive);
      toast.success(`${u.name} ${u.isActive ? 'deactivated' : 'activated'}`);
      reload();
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  const remove = async () => {
    setBusy(true);
    try {
      await adminService.deleteUser(target._id);
      toast.success('User deleted');
      setTarget(null);
      reload();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  const Switch = ({ u }) => u.role === 'admin' ? <span className="text-xs text-slate-400">Protected</span> : (
    <button role="switch" aria-checked={u.isActive} aria-label={`${u.isActive ? 'Deactivate' : 'Activate'} ${u.name}`} onClick={() => toggle(u)} className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${u.isActive ? 'bg-emerald-500' : 'bg-slate-300'}`}>
      <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all ${u.isActive ? 'left-[1.375rem]' : 'left-0.5'}`} />
    </button>
  );

  return (
    <>
      <PageHeader title="Manage users" subtitle="Activate, deactivate or remove accounts." />
      <div className="mb-5 grid gap-3 sm:grid-cols-[1fr_180px_180px]">
        <div className="relative"><FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" /><input className="input pl-10" placeholder="Search name, email or company" value={q} onChange={(e) => { setQ(e.target.value); setPage(1); }} aria-label="Search users" /></div>
        <select className="input" value={role} onChange={(e) => { setRole(e.target.value); setPage(1); }} aria-label="Filter by role"><option value="">All roles</option><option value="jobseeker">Job seekers</option><option value="recruiter">Recruiters</option><option value="admin">Admins</option></select>
        <select className="input" value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }} aria-label="Filter by status"><option value="">All statuses</option><option value="active">Active</option><option value="inactive">Inactive</option></select>
      </div>

      {error ? <ErrorState message={error} onRetry={reload} /> : loading ? <RowSkeleton /> : data.users.length === 0 ? <EmptyState icon={FiUsers} title="No users found" message="Try a different search or filter." /> : (
        <>
          <div className="card overflow-x-auto">
            <table className="w-full min-w-[720px]">
              <thead className="border-b border-slate-200 bg-slate-50"><tr><th className="th">User</th><th className="th">Role</th><th className="th">Joined</th><th className="th">Active</th><th className="th" /></tr></thead>
              <tbody className="divide-y divide-slate-100">
                {data.users.map((u) => (
                  <tr key={u._id} className={u.isActive ? '' : 'bg-slate-50/70'}>
                    <td className="td"><div className="flex items-center gap-3"><Avatar name={u.name} src={u.profileImage} size="sm" /><div className="min-w-0"><p className="truncate font-semibold text-slate-800">{u.name}</p><p className="truncate text-slate-500">{u.email}{u.companyName ? ` · ${u.companyName}` : ''}</p></div></div></td>
                    <td className="td"><span className="chip">{ROLE[u.role]}</span></td>
                    <td className="td whitespace-nowrap text-slate-600">{formatDate(u.createdAt)}</td>
                    <td className="td"><Switch u={u} /></td>
                    <td className="td text-right">{u.role !== 'admin' && <button onClick={() => setTarget(u)} className="btn btn-ghost btn-sm text-red-600" aria-label={`Delete ${u.name}`}><FiTrash2 /></button>}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-3 text-sm text-slate-500">{data.total} users</p>
          <Pagination page={data.page} pages={data.pages} onChange={setPage} />
        </>
      )}

      <ConfirmationModal open={Boolean(target)} title="Delete this user?" confirmLabel="Delete user" loading={busy} onCancel={() => setTarget(null)} onConfirm={remove} message={`${target?.name} and all related data (${target?.role === 'recruiter' ? 'jobs and received applications' : 'applications and analyses'}) will be permanently deleted.`} />
    </>
  );
}
