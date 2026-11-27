import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiBell, FiCheckCircle, FiInfo, FiUserPlus, FiTrash2 } from 'react-icons/fi';
import { useNotifications } from '../hooks/useNotifications';
import { useAuth } from '../hooks/useAuth';
import { dashboardPath } from '../utils/constants';
import { timeAgo } from '../utils/format';

const ICONS = { application_received: FiUserPlus, status_changed: FiCheckCircle, job_removed: FiTrash2 };

export default function NotificationDropdown() {
  const { user } = useAuth();
  const { notifications, unreadCount, markRead, markAllRead } = useNotifications();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const close = (e) => ref.current && !ref.current.contains(e.target) && setOpen(false);
    const esc = (e) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('mousedown', close);
    document.addEventListener('keydown', esc);
    return () => {
      document.removeEventListener('mousedown', close);
      document.removeEventListener('keydown', esc);
    };
  }, []);

  const open_ = (n) => {
    markRead(n._id);
    setOpen(false);
    if (n.link) navigate(n.link);
  };

  return (
    <div className="relative" ref={ref}>
      <button onClick={() => setOpen((o) => !o)} aria-label={`Notifications${unreadCount ? `, ${unreadCount} unread` : ''}`} aria-expanded={open} className="relative rounded-lg p-2 text-slate-500 hover:bg-slate-100">
        <FiBell className="h-5 w-5" />
        {unreadCount > 0 && <span className="absolute right-0.5 top-0.5 flex h-4 min-w-[1rem] items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">{unreadCount > 9 ? '9+' : unreadCount}</span>}
      </button>

      {open && (
        <div className="modal-in fixed inset-x-3 top-16 z-50 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-pop sm:absolute sm:inset-x-auto sm:right-0 sm:top-full sm:mt-2 sm:w-96">
          <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
            <h2 className="text-sm font-bold">Notifications</h2>
            {unreadCount > 0 && <button onClick={markAllRead} className="text-xs font-semibold text-blue-600 hover:text-blue-700">Mark all as read</button>}
          </div>
          <ul className="max-h-80 divide-y divide-slate-100 overflow-y-auto">
            {notifications.length === 0 && <li className="px-4 py-10 text-center text-sm text-slate-400">You are all caught up</li>}
            {notifications.map((n) => {
              const Icon = ICONS[n.type] || FiInfo;
              return (
                <li key={n._id}>
                  <button onClick={() => open_(n)} className={`flex w-full gap-3 px-4 py-3 text-left hover:bg-slate-50 ${n.isRead ? '' : 'bg-blue-50/50'}`}>
                    <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-navy-50 text-navy-600"><Icon /></span>
                    <span className="min-w-0 flex-1">
                      <span className={`block text-sm ${n.isRead ? 'text-slate-600' : 'font-semibold text-slate-800'}`}>{n.message}</span>
                      <span className="text-xs text-slate-400">{timeAgo(n.createdAt)}</span>
                    </span>
                    {!n.isRead && <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-blue-600" />}
                  </button>
                </li>
              );
            })}
          </ul>
          <Link to={`${dashboardPath(user.role)}/notifications`} onClick={() => setOpen(false)} className="block border-t border-slate-100 px-4 py-3 text-center text-sm font-semibold text-blue-600 hover:bg-slate-50">
            View all notifications
          </Link>
        </div>
      )}
    </div>
  );
}
