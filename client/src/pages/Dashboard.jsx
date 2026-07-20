import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import {
  ListChecks,
  Timer,
  Wallet,
  Flame,
  Check,
  ArrowRight,
} from 'lucide-react';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import {
  TYPE_STYLES,
  TASK_TYPES,
  PRIORITY_STYLES,
  formatMoney,
  todayStr,
} from '../lib/constants';
import { Card, Badge } from '../components/ui';

const isDoneToday = (t) =>
  t.type === 'daily' ? t.lastCompletedDate === todayStr() : t.completed;

function StatCard({ icon: Icon, label, value, sub, accent }) {
  return (
    <Card className="flex items-center gap-4">
      <div
        className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${accent}`}
      >
        <Icon size={22} />
      </div>
      <div>
        <p className="text-sm text-fg-500">{label}</p>
        <p className="text-xl font-semibold text-fg-100">{value}</p>
        {sub && <p className="text-xs text-fg-500">{sub}</p>}
      </div>
    </Card>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [stats, setStats] = useState({ focusToday: 0, sessionsToday: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/tasks'),
      api.get('/expenses'),
      api.get('/pomodoro/stats'),
    ])
      .then(([t, e, s]) => {
        setTasks(t.data);
        setExpenses(e.data);
        setStats(s.data);
      })
      .finally(() => setLoading(false));
  }, []);

  const dailyHabits = useMemo(
    () => tasks.filter((t) => t.type === 'daily'),
    [tasks]
  );

  const todoTasks = useMemo(
    () =>
      tasks
        .filter((t) => t.type !== 'daily' && !t.completed)
        .sort((a, b) => {
          const rank = { high: 0, medium: 1, low: 2 };
          return rank[a.priority] - rank[b.priority];
        })
        .slice(0, 6),
    [tasks]
  );

  const habitsDone = dailyHabits.filter(isDoneToday).length;

  const monthKey = (() => {
    const n = new Date();
    return `${n.getFullYear()}-${n.getMonth()}`;
  })();

  const { monthIncome, monthExpense } = useMemo(() => {
    let inc = 0;
    let exp = 0;
    for (const e of expenses) {
      const d = new Date(e.date);
      if (`${d.getFullYear()}-${d.getMonth()}` !== monthKey) continue;
      if (e.type === 'income') inc += e.amount;
      else exp += e.amount;
    }
    return { monthIncome: inc, monthExpense: exp };
  }, [expenses, monthKey]);

  const monthBalance = monthIncome - monthExpense;

  const openTaskCount = tasks.filter(
    (t) => t.type !== 'daily' && !t.completed
  ).length;

  const toggleHabit = async (t) => {
    const { data } = await api.patch(`/tasks/${t._id}/toggle`);
    setTasks((ts) => ts.map((x) => (x._id === data._id ? data : x)));
  };

  const focusHrs = Math.floor(stats.focusToday / 60);
  const focusMins = stats.focusToday % 60;
  const focusLabel =
    focusHrs > 0 ? `${focusHrs}h ${focusMins}m` : `${focusMins}m`;

  const greeting = (() => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 18) return 'Good afternoon';
    return 'Good evening';
  })();

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-fg-100">
          {greeting}, {user?.name?.split(' ')[0] || 'there'} 👋
        </h1>
        <p className="text-sm text-fg-500">
          {format(new Date(), 'EEEE, MMMM d')}
        </p>
      </div>

      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={ListChecks}
          label="Open tasks"
          value={openTaskCount}
          accent="bg-indigo-500/15 text-indigo-600 dark:text-indigo-400"
        />
        <StatCard
          icon={Flame}
          label="Habits today"
          value={`${habitsDone}/${dailyHabits.length}`}
          sub="checked in"
          accent="bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
        />
        <StatCard
          icon={Timer}
          label="Focus today"
          value={focusLabel}
          sub={`${stats.sessionsToday} session${stats.sessionsToday === 1 ? '' : 's'}`}
          accent="bg-sky-500/15 text-sky-600 dark:text-sky-400"
        />
        <StatCard
          icon={Wallet}
          label="Balance this month"
          value={formatMoney(monthBalance)}
          sub={`${formatMoney(monthIncome)} in · ${formatMoney(monthExpense)} out`}
          accent={
            monthBalance >= 0
              ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400'
              : 'bg-rose-500/15 text-rose-600 dark:text-rose-400'
          }
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-semibold text-fg-100">Up next</h2>
            <Link
              to="/tasks"
              className="flex items-center gap-1 text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300"
            >
              All tasks <ArrowRight size={14} />
            </Link>
          </div>
          {loading ? (
            <p className="text-sm text-fg-500">Loading…</p>
          ) : todoTasks.length === 0 ? (
            <p className="py-6 text-center text-sm text-fg-500">
              Nothing pending. Nice work! 🎉
            </p>
          ) : (
            <ul className="space-y-2">
              {todoTasks.map((t) => (
                <li
                  key={t._id}
                  className="flex items-center gap-3 rounded-lg bg-ink-850 px-3 py-2.5"
                >
                  <span className="min-w-0 flex-1 truncate text-sm text-fg-200">
                    {t.title}
                  </span>
                  <Badge className={TYPE_STYLES[t.type]}>
                    {TASK_TYPES.find((x) => x.value === t.type)?.label}
                  </Badge>
                  <Badge className={PRIORITY_STYLES[t.priority]}>
                    {t.priority}
                  </Badge>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-semibold text-fg-100">Daily habits</h2>
            <Link
              to="/tasks"
              className="flex items-center gap-1 text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300"
            >
              Manage <ArrowRight size={14} />
            </Link>
          </div>
          {loading ? (
            <p className="text-sm text-fg-500">Loading…</p>
          ) : dailyHabits.length === 0 ? (
            <p className="py-6 text-center text-sm text-fg-500">
              No daily habits yet. Add one from the Tasks page.
            </p>
          ) : (
            <ul className="space-y-2">
              {dailyHabits.map((t) => {
                const done = isDoneToday(t);
                return (
                  <li
                    key={t._id}
                    className="flex items-center gap-3 rounded-lg bg-ink-850 px-3 py-2.5"
                  >
                    <button
                      onClick={() => toggleHabit(t)}
                      className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition-colors ${
                        done
                          ? 'border-emerald-500 bg-emerald-500 text-white'
                          : 'border-ink-600 hover:border-emerald-400'
                      }`}
                    >
                      {done && <Check size={14} strokeWidth={3} />}
                    </button>
                    <span
                      className={`min-w-0 flex-1 truncate text-sm ${
                        done ? 'text-fg-500 line-through' : 'text-fg-200'
                      }`}
                    >
                      {t.title}
                    </span>
                    {t.streak > 0 && (
                      <Badge className="bg-orange-500/15 text-orange-700 dark:text-orange-300">
                        <Flame size={12} className="mr-0.5" /> {t.streak}
                      </Badge>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </Card>
      </div>
    </div>
  );
}
