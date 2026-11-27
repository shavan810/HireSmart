import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiChevronDown, FiGrid, FiLogOut, FiSettings } from 'react-icons/fi';
import Avatar from './Avatar';
import { useAuth } from '../hooks/useAuth';
import { dashboardPath } from '../utils/constants';

export default function UserMenu() {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const close = (e) => ref.current && !ref.current.contains(e.target) && setOpen(false);
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, []);

  const base = dashboardPath(user.role);
  const item = 'flex w-full items-center gap-2.5 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50';
  return (
    <div className="relative" ref={ref}>
      <button onClick={() => setOpen((o) => !o)} aria-expanded={open} aria-label="Account menu" className="flex items-center gap-2 rounded-lg p-1 pr-2 hover:bg-slate-100">
        <Avatar name={user.name} src={user.profileImage} size="sm" />
        <span className="hidden max-w-[8rem] truncate text-sm font-semibold text-slate-700 md:block">{user.name}</span>
        <FiChevronDown className="hidden text-slate-400 md:block" />
      </button>
      {open && (
        <div className="modal-in absolute right-0 z-50 mt-2 w-56 overflow-hidden rounded-xl border border-slate-200 bg-white py-1 shadow-pop">
          <div className="border-b border-slate-100 px-4 py-3">
            <p className="truncate text-sm font-bold text-navy-800">{user.name}</p>
            <p className="truncate text-xs text-slate-500">{user.email}</p>
          </div>
          <Link to={base} className={item} onClick={() => setOpen(false)}><FiGrid /> Dashboard</Link>
          <Link to={`${base}/settings`} className={item} onClick={() => setOpen(false)}><FiSettings /> Settings</Link>
          <button className={`${item} text-red-600`} onClick={() => { logout(); setOpen(false); navigate('/'); }}><FiLogOut /> Log out</button>
        </div>
      )}
    </div>
  );
}
