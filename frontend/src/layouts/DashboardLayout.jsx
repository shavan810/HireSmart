import { useEffect, useState } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { FiExternalLink, FiMenu } from 'react-icons/fi';
import Sidebar from '../components/Sidebar';
import NotificationDropdown from '../components/NotificationDropdown';
import UserMenu from '../components/UserMenu';
import { useAuth } from '../hooks/useAuth';
import { NAV } from './navConfig';

export default function DashboardLayout() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();

  // Close the mobile drawer and reset scroll on navigation.
  useEffect(() => {
    setOpen(false);
    window.scrollTo(0, 0);
  }, [pathname]);

  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar links={NAV[user.role]} open={open} onClose={() => setOpen(false)} />
      <div className="lg:pl-64">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-200 bg-white/95 px-4 backdrop-blur sm:px-6">
          <button onClick={() => setOpen(true)} className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 lg:hidden" aria-label="Open menu">
            <FiMenu className="h-6 w-6" />
          </button>
          <Link to="/" className="hidden items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-blue-600 lg:flex">
            <FiExternalLink /> View public site
          </Link>
          <div className="flex items-center gap-1">
            <NotificationDropdown />
            <UserMenu />
          </div>
        </header>
        <main className="mx-auto w-full max-w-7xl overflow-x-hidden p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
