import { BarChart3, BedDouble, Building2, CarFront, CreditCard, Home, LogOut, MapPinned, Menu, MessageSquare, RotateCcw, ScrollText, Users } from 'lucide-react';
import { useState } from 'react';
import { Link, NavLink, Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../../shared/contexts/AuthContext';

const navItems = [
  { to: '/admin/dashboard', label: 'Dashboard', icon: BarChart3 },
  { to: '/admin/locations', label: 'Locations', icon: MapPinned },
  { to: '/admin/hotels', label: 'Hotels', icon: Building2 },
  { to: '/admin/bookings', label: 'Bookings', icon: BedDouble },
  { to: '/admin/transfers', label: 'Transfers', icon: CarFront },
  { to: '/admin/payments', label: 'Payments', icon: CreditCard },
  { to: '/admin/refunds', label: 'Refunds', icon: RotateCcw },
  { to: '/admin/reviews', label: 'Reviews', icon: MessageSquare },
  { to: '/admin/policies', label: 'Policies', icon: ScrollText },
  { to: '/admin/users', label: 'Users', icon: Users },
];

export default function AdminLayout() {
  const { user, isAuthenticated, loading, logout } = useAuth();
  const [open, setOpen] = useState(false);

  if (loading) {
    return <div className="flex min-h-screen items-center justify-center bg-slate-950 text-white">Loading admin…</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (user?.role !== 'admin') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-100 p-6">
        <div className="max-w-md rounded-lg border border-slate-200 bg-white p-6 text-center shadow-sm">
          <h1 className="text-xl font-semibold text-slate-950">Admin access required</h1>
          <p className="mt-2 text-sm text-slate-600">Your account does not have permission to open this area.</p>
          <Link to="/" className="mt-4 inline-flex rounded-md bg-slate-950 px-4 py-2 text-sm font-semibold text-white">
            Back to site
          </Link>
        </div>
      </div>
    );
  }

  const sidebar = (
    <aside className="flex h-full w-72 flex-col border-r border-slate-200 bg-slate-950 text-white">
      <div className="border-b border-white/10 p-5">
        <Link to="/admin/dashboard" className="flex items-center gap-3">
          <span className="flex size-10 items-center justify-center rounded-lg bg-amber-400 text-white">
            <Home className="size-5" />
          </span>
          <span>
            <span className="block text-lg font-bold">GoStay Admin</span>
            <span className="block text-xs font-medium uppercase tracking-wide text-slate-400">Console</span>
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
              onClick={() => setOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition ${
                  isActive ? 'bg-white text-slate-950' : 'text-slate-300 hover:bg-white/10 hover:text-white'
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
          <div className="truncate text-sm font-semibold">{user.name}</div>
          <div className="truncate text-xs text-slate-400">{user.email}</div>
        </div>
        <button
          type="button"
          onClick={() => void logout()}
          className="flex w-full items-center justify-center gap-2 rounded-md border border-white/15 px-3 py-2 text-sm font-semibold text-slate-200 hover:bg-white/10"
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
          <button type="button" className="absolute inset-0 bg-slate-950/50" onClick={() => setOpen(false)} aria-label="Close menu" />
          <div className="relative h-full">{sidebar}</div>
        </div>
      )}

      <div className="lg:pl-72">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-200 bg-white/95 px-4 backdrop-blur lg:px-8">
          <button type="button" onClick={() => setOpen(true)} className="rounded-md p-2 text-slate-600 hover:bg-slate-100 lg:hidden" aria-label="Open menu">
            <Menu className="size-5" />
          </button>
          <div>
            <div className="text-sm font-semibold text-slate-950">Admin Console</div>
            <div className="text-xs text-slate-500">Manage inventory, bookings, payments, and users</div>
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
