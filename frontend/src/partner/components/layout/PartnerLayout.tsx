import { BarChart3, Building2, CalendarCheck, Home, LayoutDashboard, LogOut, Menu } from 'lucide-react';
import { useState } from 'react';
import { Link, NavLink, Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../../shared/contexts/AuthContext';

const navItems = [
  { to: '/partner', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/partner/analytics', label: 'Analytics', icon: BarChart3 },
  { to: '/partner/hotels', label: 'Hotels', icon: Building2 },
  { to: '/partner/bookings', label: 'Bookings', icon: CalendarCheck },
];

export default function PartnerLayout() {
  const { user, isAuthenticated, loading, logout } = useAuth();
  const [open, setOpen] = useState(false);

  if (loading) {
    return <div className="flex min-h-screen items-center justify-center bg-slate-100 text-slate-600">Loading partner portal...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  const sidebar = (
    <aside className="flex h-full w-72 flex-col border-r border-emerald-900/20 bg-emerald-950 text-white">
      <div className="border-b border-white/10 p-5">
        <Link to="/partner" className="flex items-center gap-3">
          <span className="flex size-10 items-center justify-center rounded-lg bg-emerald-400 text-white">
            <Home className="size-5" />
          </span>
          <span>
            <span className="block text-lg font-bold">GoStay Partner</span>
            <span className="block text-xs font-medium uppercase tracking-wide text-emerald-300">Portal</span>
          </span>
        </Link>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-4">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              onClick={() => setOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition ${
                  isActive ? 'bg-white text-emerald-950' : 'text-emerald-100 hover:bg-white/10 hover:text-white'
                }`
              }
            >
              <Icon className="size-4" />
              {item.label}
            </NavLink>
          );
        })}
      </nav>

      <div className="border-t border-white/10 p-4">
        <div className="mb-3 min-w-0">
          <div className="truncate text-sm font-semibold">{user?.name}</div>
          <div className="truncate text-xs text-emerald-300">{user?.email}</div>
        </div>
        <button
          type="button"
          onClick={() => void logout()}
          className="flex w-full items-center justify-center gap-2 rounded-md border border-white/15 px-3 py-2 text-sm font-semibold text-emerald-100 hover:bg-white/10"
        >
          <LogOut className="size-4" />
          Sign out
        </button>
      </div>
    </aside>
  );

  return (
    <div className="min-h-screen bg-slate-100 text-slate-950">
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex">{sidebar}</div>

      {open && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <button type="button" className="absolute inset-0 bg-emerald-950/50" onClick={() => setOpen(false)} aria-label="Close menu" />
          <div className="relative h-full">{sidebar}</div>
        </div>
      )}

      <div className="lg:pl-72">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-200 bg-white/95 px-4 backdrop-blur lg:px-8">
          <button type="button" onClick={() => setOpen(true)} className="rounded-md p-2 text-slate-600 hover:bg-slate-100 lg:hidden" aria-label="Open menu">
            <Menu className="size-5" />
          </button>
          <div>
            <div className="text-sm font-semibold text-slate-950">Partner Portal</div>
            <div className="text-xs text-slate-500">Manage your hotels, rooms, and bookings</div>
          </div>
          <Link to="/" className="rounded-md border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">
            View site
          </Link>
        </header>

        <main className="px-4 py-6 lg:px-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
