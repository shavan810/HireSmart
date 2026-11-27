import { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { FiMenu, FiX } from 'react-icons/fi';
import Logo from './Logo';
import UserMenu from './UserMenu';
import NotificationDropdown from './NotificationDropdown';
import { useAuth } from '../hooks/useAuth';
import { dashboardPath } from '../utils/constants';

const LINKS = [
  { to: '/', label: 'Home', end: true },
  { to: '/jobs', label: 'Find jobs' },
  { to: '/about', label: 'About' },
  { to: '/contact', label: 'Contact' },
];

export default function Navbar() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const link = ({ isActive }) => `rounded-lg px-3 py-2 text-sm font-semibold transition-colors ${isActive ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:bg-slate-100 hover:text-navy-800'}`;

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="page-container flex h-16 items-center justify-between gap-4">
        <Logo />
        <nav className="hidden items-center gap-1 md:flex" aria-label="Main">
          {LINKS.map((l) => (
            <NavLink key={l.to} to={l.to} end={l.end} className={link}>{l.label}</NavLink>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          {user ? (
            <>
              <Link to={dashboardPath(user.role)} className="btn btn-outline btn-sm hidden sm:inline-flex">Dashboard</Link>
              <NotificationDropdown />
              <UserMenu />
            </>
          ) : (
            <div className="hidden items-center gap-2 md:flex">
              <Link to="/login" className="btn btn-ghost">Log in</Link>
              <Link to="/register" className="btn btn-primary">Create account</Link>
            </div>
          )}
          <button className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 md:hidden" onClick={() => setOpen((o) => !o)} aria-label="Toggle menu" aria-expanded={open}>
            {open ? <FiX className="h-6 w-6" /> : <FiMenu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {open && (
        <div className="border-t border-slate-100 bg-white md:hidden">
          <nav className="page-container flex flex-col gap-1 py-3" aria-label="Mobile">
            {LINKS.map((l) => (
              <NavLink key={l.to} to={l.to} end={l.end} className={link} onClick={() => setOpen(false)}>{l.label}</NavLink>
            ))}
            {user ? (
              <Link to={dashboardPath(user.role)} onClick={() => setOpen(false)} className="btn btn-primary mt-2">Go to dashboard</Link>
            ) : (
              <div className="mt-2 grid grid-cols-2 gap-2">
                <Link to="/login" onClick={() => setOpen(false)} className="btn btn-outline">Log in</Link>
                <Link to="/register" onClick={() => setOpen(false)} className="btn btn-primary">Sign up</Link>
              </div>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
