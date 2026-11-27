import { NavLink } from 'react-router-dom';
import { FiLogOut, FiX } from 'react-icons/fi';
import Logo from './Logo';
import Avatar from './Avatar';
import { useAuth } from '../hooks/useAuth';
import { useNotifications } from '../hooks/useNotifications';

const ROLE_LABEL = { jobseeker: 'Job seeker', recruiter: 'Recruiter', admin: 'Administrator' };

export default function Sidebar({ links, open, onClose }) {
  const { user, logout } = useAuth();
  const { unreadCount } = useNotifications();

  const linkClass = ({ isActive }) =>
    `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold transition-colors ${isActive ? 'bg-white/15 text-white' : 'text-navy-200 hover:bg-white/10 hover:text-white'}`;

  return (
    <>
      {/* Mobile overlay */}
      <div onClick={onClose} className={`fixed inset-0 z-40 bg-navy-900/50 transition-opacity lg:hidden ${open ? 'opacity-100' : 'pointer-events-none opacity-0'}`} aria-hidden="true" />

      <aside className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col bg-navy-800 transition-transform duration-200 lg:translate-x-0 ${open ? 'translate-x-0' : '-translate-x-full'}`} aria-label="Dashboard navigation">
        <div className="flex h-16 items-center justify-between px-5">
          <Logo light />
          <button onClick={onClose} className="rounded-lg p-1.5 text-navy-200 hover:bg-white/10 lg:hidden" aria-label="Close menu"><FiX className="h-5 w-5" /></button>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
          {links.map(({ to, label, icon: Icon, end }) => (
            <NavLink key={to} to={to} end={end} className={linkClass} onClick={onClose}>
              <Icon className="h-5 w-5 shrink-0" />
              <span className="flex-1">{label}</span>
              {label === 'Notifications' && unreadCount > 0 && <span className="rounded-full bg-blue-500 px-2 py-0.5 text-[11px] font-bold text-white">{unreadCount}</span>}
            </NavLink>
          ))}
        </nav>

        <div className="border-t border-white/10 p-4">
          <div className="mb-3 flex items-center gap-3">
            <Avatar name={user.name} src={user.profileImage} size="md" />
            <div className="min-w-0">
              <p className="truncate text-sm font-bold text-white">{user.name}</p>
              <p className="truncate text-xs text-navy-300">{ROLE_LABEL[user.role]}</p>
            </div>
          </div>
          <button onClick={logout} className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold text-navy-200 hover:bg-white/10 hover:text-white">
            <FiLogOut /> Log out
          </button>
        </div>
      </aside>
    </>
  );
}
