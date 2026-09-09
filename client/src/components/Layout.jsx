import { NavLink, Outlet } from 'react-router-dom';
import {
  LayoutDashboard,
  ListChecks,
  Timer,
  Wallet,
  LogOut,
  Sun,
  Moon,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import Footer from './Footer';

const nav = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/tasks', label: 'Tasks', icon: ListChecks },
  { to: '/pomodoro', label: 'Pomodoro', icon: Timer },
  { to: '/budget', label: 'Budget', icon: Wallet },
];

export default function Layout() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-20 border-b border-ink-800 bg-ink-950/80 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center gap-3 px-4 md:px-6">
          <NavLink
            to="/"
            className="mr-1 shrink-0 font-display text-lg font-bold tracking-tight text-fg-100"
          >
            Life <span className="text-accent">Dashboard</span>
          </NavLink>

          <nav className="flex flex-1 items-center gap-1 overflow-x-auto">
            {nav.map(({ to, label, icon: Icon, end }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                className={({ isActive }) =>
                  `flex items-center gap-2 whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-accent-soft text-accent'
                      : 'text-fg-400 hover:bg-ink-800 hover:text-fg-100'
                  }`
                }
              >
                <Icon size={17} className="shrink-0" />
                <span className="hidden sm:block">{label}</span>
              </NavLink>
            ))}
          </nav>

          <div className="flex shrink-0 items-center gap-1">
            <button
              onClick={toggleTheme}
              title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
              className="flex h-9 w-9 items-center justify-center rounded-lg text-fg-400 transition-colors hover:bg-ink-800 hover:text-fg-100"
            >
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            {user?.picture ? (
              <img
                src={user.picture}
                alt=""
                referrerPolicy="no-referrer"
                className="h-8 w-8 rounded-full ring-1 ring-ink-700"
              />
            ) : (
              <div className="h-8 w-8 rounded-full bg-ink-700" />
            )}
            <button
              onClick={logout}
              title="Log out"
              className="flex h-9 w-9 items-center justify-center rounded-lg text-fg-400 transition-colors hover:bg-ink-800 hover:text-red-500 dark:hover:text-red-400"
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <div className="mx-auto w-full max-w-6xl px-4 py-6 md:px-6 md:py-8">
          <Outlet />
        </div>
      </main>

      <Footer />
    </div>
  );
}
