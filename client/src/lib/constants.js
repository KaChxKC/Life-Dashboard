export const TASK_TYPES = [
  { value: 'daily', label: 'Daily habit' },
  { value: 'assignment', label: 'Assignment' },
  { value: 'roadmap', label: 'Roadmap' },
  { value: 'goal', label: 'Goal' },
];

export const TYPE_STYLES = {
  daily: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300',
  assignment: 'bg-amber-500/15 text-amber-700 dark:text-amber-300',
  roadmap: 'bg-sky-500/15 text-sky-700 dark:text-sky-300',
  goal: 'bg-violet-500/15 text-violet-700 dark:text-violet-300',
};

export const PRIORITIES = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
];

export const PRIORITY_STYLES = {
  low: 'bg-slate-500/15 text-fg-300',
  medium: 'bg-blue-500/15 text-blue-700 dark:text-blue-300',
  high: 'bg-red-500/15 text-red-700 dark:text-red-300',
};

export const EXPENSE_CATEGORIES = [
  'Food',
  'Transport',
  'Books',
  'Rent',
  'Subscriptions',
  'Entertainment',
  'Health',
  'Other',
];

export const INCOME_CATEGORIES = [
  'Salary',
  'Allowance',
  'Freelance',
  'Scholarship',
  'Gift',
  'Other',
];

export const INCOME_COLOR = '#34d399';

export const CATEGORY_COLORS = {
  Food: '#f59e0b',
  Transport: '#38bdf8',
  Books: '#a78bfa',
  Rent: '#f472b6',
  Subscriptions: '#34d399',
  Entertainment: '#fb7185',
  Health: '#4ade80',
  Other: '#94a3b8',
};

const currency = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 2,
});

export const formatMoney = (n) => currency.format(Number(n) || 0);

export const todayStr = (d = new Date()) => {
  const dt = new Date(d);
  const off = dt.getTimezoneOffset();
  return new Date(dt.getTime() - off * 60000).toISOString().slice(0, 10);
};
