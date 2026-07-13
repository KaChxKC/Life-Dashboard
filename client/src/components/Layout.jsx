import { NavLink, Outlet } from 'react-router-dom';
import {
  LayoutDashboard,
  ListChecks,
  Timer,
  Wallet,
  LogOut,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const nav = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/tasks', label: 'Tasks', icon: ListChecks },
  { to: '/pomodoro', label: 'Pomodoro', icon: Timer },
  { to: '/budget', label: 'Budget', icon: Wallet },
];

export default function Layout() {
  const { user, logout } = useAuth();

  return (
    <div className="flex h-screen overflow-hidden">
      <aside className="flex w-16 flex-col border-r border-ink-800 bg-ink-900 py-4 md:w-60">
        <div className="mb-6 flex items-center gap-2 px-3 md:px-5">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-indigo-500 font-bold text-white">
            L
          </div>
          <span className="hidden text-lg font-semibold text-slate-100 md:block">
            Life
          </span>
        </div>

        <nav className="flex flex-1 flex-col gap-1 px-2 md:px-3">
          {nav.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-indigo-500/15 text-indigo-300'
                    : 'text-slate-400 hover:bg-ink-800 hover:text-slate-200'
                }`
              }
            >
              <Icon size={20} className="shrink-0" />
              <span className="hidden md:block">{label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="mt-auto border-t border-ink-800 px-2 pt-3 md:px-3">
          <div className="flex items-center gap-3 rounded-lg px-2 py-2">
            {user?.picture ? (
              <img
                src={user.picture}
                alt=""
                referrerPolicy="no-referrer"
                className="h-8 w-8 shrink-0 rounded-full"
              />
            ) : (
              <div className="h-8 w-8 shrink-0 rounded-full bg-ink-700" />
            )}
            <div className="hidden min-w-0 flex-1 md:block">
              <p className="truncate text-sm font-medium text-slate-200">
                {user?.name}
              </p>
              <p className="truncate text-xs text-slate-500">{user?.email}</p>
            </div>
            <button
              onClick={logout}
              title="Log out"
              className="hidden rounded-md p-1.5 text-slate-500 hover:bg-ink-800 hover:text-red-400 md:block"
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-6xl px-5 py-6 md:px-8 md:py-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
