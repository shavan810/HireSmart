import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiBell, FiCheck, FiTrash2 } from 'react-icons/fi';
import PageHeader from '../../components/PageHeader';
import EmptyState from '../../components/EmptyState';
import ErrorState from '../../components/ErrorState';
import Pagination from '../../components/Pagination';
import { RowSkeleton } from '../../components/Skeleton';
import { notificationService } from '../../services/notificationService';
import { useFetch } from '../../hooks/useFetch';
import { useNotifications } from '../../hooks/useNotifications';
import { useToast } from '../../hooks/useToast';
import { formatDate, getErrorMessage, timeAgo } from '../../utils/format';

export default function Notifications() {
  const [page, setPage] = useState(1);
  const [filter, setFilter] = useState('all');
  const navigate = useNavigate();
  const toast = useToast();
  const { refresh } = useNotifications();
  const { data, loading, error, reload } = useFetch(() => notificationService.list({ page, limit: 12, unread: filter === 'unread' ? 'true' : undefined }), [page, filter]);

  const sync = async () => {
    await reload();
    refresh();
  };

  const open = async (n) => {
    if (!n.isRead) {
      try { await notificationService.markRead(n._id); refresh(); } catch (_e) { /* ignore */ }
    }
    if (n.link) navigate(n.link);
    else reload();
  };

  const act = (fn, okMsg) => async () => {
    try { await fn(); if (okMsg) toast.success(okMsg); sync(); } catch (err) { toast.error(getErrorMessage(err)); }
  };

  const tab = (value, label) => (
    <button onClick={() => { setFilter(value); setPage(1); }} className={`rounded-lg px-4 py-2 text-sm font-semibold ${filter === value ? 'bg-navy-800 text-white' : 'bg-white text-slate-600 hover:bg-slate-100'}`}>{label}</button>
  );

  return (
    <>
      <PageHeader title="Notifications" subtitle="Your full notification history."
        actions={<button className="btn btn-outline" disabled={!data?.unreadCount} onClick={act(() => notificationService.markAllRead(), 'All notifications marked as read')}><FiCheck /> Mark all as read{data?.unreadCount ? ` (${data.unreadCount})` : ''}</button>} />
      <div className="mb-4 flex gap-2">{tab('all', 'All')}{tab('unread', 'Unread')}</div>

      {error ? <ErrorState message={error} onRetry={reload} /> : loading ? <RowSkeleton rows={6} /> : data.notifications.length === 0 ? (
        <EmptyState icon={FiBell} title={filter === 'unread' ? 'No unread notifications' : 'No notifications yet'} message="Updates about applications and activity will appear here in real time." />
      ) : (
        <>
          <ul className="card divide-y divide-slate-100">
            {data.notifications.map((n) => (
              <li key={n._id} className={`flex items-start gap-3 p-4 ${n.isRead ? '' : 'bg-blue-50/40'}`}>
                <span className={`mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full ${n.isRead ? 'bg-slate-200' : 'bg-blue-600'}`} />
                <button onClick={() => open(n)} className="min-w-0 flex-1 text-left">
                  <span className={`block text-sm ${n.isRead ? 'text-slate-600' : 'font-semibold text-slate-800'}`}>{n.message}</span>
                  <span className="text-xs text-slate-400" title={formatDate(n.createdAt, true)}>{timeAgo(n.createdAt)}{n.sender?.name ? ` · from ${n.sender.name}` : ''}</span>
                </button>
                <button onClick={act(() => notificationService.remove(n._id))} aria-label="Delete notification" className="rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-600"><FiTrash2 /></button>
              </li>
            ))}
          </ul>
          <Pagination page={data.page} pages={data.pages} onChange={setPage} />
        </>
      )}
    </>
  );
}
