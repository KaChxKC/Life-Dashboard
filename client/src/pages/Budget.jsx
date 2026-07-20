import { useEffect, useMemo, useState } from 'react';
import { format } from 'date-fns';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';
import {
  Plus,
  Trash2,
  Pencil,
  Wallet,
  ArrowDownRight,
  ArrowUpRight,
} from 'lucide-react';
import api from '../api/client';
import {
  EXPENSE_CATEGORIES,
  INCOME_CATEGORIES,
  CATEGORY_COLORS,
  INCOME_COLOR,
  formatMoney,
  todayStr,
} from '../lib/constants';
import {
  Button,
  Card,
  EmptyState,
  Field,
  Modal,
  inputClass,
} from '../components/ui';

const emptyForm = {
  amount: '',
  type: 'expense',
  category: 'Food',
  note: '',
  date: todayStr(),
};

const isIncome = (t) => t.type === 'income';
const catsFor = (type) =>
  type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;
const colorFor = (t) =>
  isIncome(t) ? INCOME_COLOR : CATEGORY_COLORS[t.category] || '#94a3b8';

export default function Budget() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [filter, setFilter] = useState('all');

  const load = async () => {
    try {
      const { data } = await api.get('/expenses');
      setItems(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const now = new Date();
  const monthKey = `${now.getFullYear()}-${now.getMonth()}`;
  const inThisMonth = (d) => {
    const dt = new Date(d);
    return `${dt.getFullYear()}-${dt.getMonth()}` === monthKey;
  };

  const monthItems = useMemo(
    () => items.filter((t) => inThisMonth(t.date)),
    [items, monthKey]
  );

  const income = useMemo(
    () =>
      monthItems
        .filter(isIncome)
        .reduce((sum, t) => sum + t.amount, 0),
    [monthItems]
  );

  const expenses = useMemo(
    () =>
      monthItems
        .filter((t) => !isIncome(t))
        .reduce((sum, t) => sum + t.amount, 0),
    [monthItems]
  );

  const balance = income - expenses;

  const byCategory = useMemo(() => {
    const map = {};
    monthItems
      .filter((t) => !isIncome(t))
      .forEach((t) => {
        map[t.category] = (map[t.category] || 0) + t.amount;
      });
    return Object.entries(map)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [monthItems]);

  const visible = useMemo(() => {
    if (filter === 'income') return items.filter(isIncome);
    if (filter === 'expense') return items.filter((t) => !isIncome(t));
    return items;
  }, [items, filter]);

  const openNew = () => {
    setEditing(null);
    setForm(emptyForm);
    setModalOpen(true);
  };

  const openEdit = (t) => {
    setEditing(t);
    setForm({
      amount: String(t.amount),
      type: isIncome(t) ? 'income' : 'expense',
      category: t.category,
      note: t.note || '',
      date: todayStr(t.date),
    });
    setModalOpen(true);
  };

  const changeType = (type) =>
    setForm((f) => ({ ...f, type, category: catsFor(type)[0] }));

  const submit = async (e) => {
    e.preventDefault();
    const amount = Number(form.amount);
    if (!Number.isFinite(amount) || amount < 0) return;
    setSaving(true);
    try {
      const payload = { ...form, amount };
      if (editing) {
        const { data } = await api.put(`/expenses/${editing._id}`, payload);
        setItems((xs) => xs.map((x) => (x._id === data._id ? data : x)));
      } else {
        const { data } = await api.post('/expenses', payload);
        setItems((xs) =>
          [data, ...xs].sort((a, b) => new Date(b.date) - new Date(a.date))
        );
      }
      setModalOpen(false);
    } finally {
      setSaving(false);
    }
  };

  const remove = async (t) => {
    if (!confirm('Delete this entry?')) return;
    await api.delete(`/expenses/${t._id}`);
    setItems((xs) => xs.filter((x) => x._id !== t._id));
  };

  const filters = [
    { value: 'all', label: 'All' },
    { value: 'income', label: 'Income' },
    { value: 'expense', label: 'Expenses' },
  ];

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-fg-100">Budget</h1>
          <p className="text-sm text-fg-500">
            Track income and expenses to see where you stand.
          </p>
        </div>
        <Button onClick={openNew}>
          <Plus size={18} /> Add entry
        </Button>
      </div>

      <div className="mb-6 grid gap-4 md:grid-cols-3">
        <Card>
          <div className="flex items-center gap-2 text-sm text-fg-500">
            <ArrowUpRight size={16} className="text-emerald-600 dark:text-emerald-400" /> Income this
            month
          </div>
          <p className="mt-1 text-2xl font-semibold text-emerald-600 dark:text-emerald-400">
            {formatMoney(income)}
          </p>
        </Card>
        <Card>
          <div className="flex items-center gap-2 text-sm text-fg-500">
            <ArrowDownRight size={16} className="text-rose-600 dark:text-rose-400" /> Expenses this
            month
          </div>
          <p className="mt-1 text-2xl font-semibold text-rose-600 dark:text-rose-400">
            {formatMoney(expenses)}
          </p>
        </Card>
        <Card>
          <p className="text-sm text-fg-500">Balance this month</p>
          <p
            className={`mt-1 text-2xl font-semibold ${
              balance >= 0 ? 'text-fg-100' : 'text-rose-600 dark:text-rose-400'
            }`}
          >
            {formatMoney(balance)}
          </p>
          <p className="mt-0.5 text-xs text-fg-500">
            {balance >= 0 ? 'Saved so far' : 'Over budget'}
          </p>
        </Card>
      </div>

      {byCategory.length > 0 && (
        <Card className="mb-6">
          <p className="mb-2 text-sm text-fg-500">
            Expenses by category (this month)
          </p>
          <div className="flex flex-col items-center gap-4 sm:flex-row">
            <div className="h-44 w-44 shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={byCategory}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={45}
                    outerRadius={70}
                    paddingAngle={2}
                  >
                    {byCategory.map((entry) => (
                      <Cell
                        key={entry.name}
                        fill={CATEGORY_COLORS[entry.name] || '#94a3b8'}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(v) => formatMoney(v)}
                    contentStyle={{
                      background: 'var(--color-ink-850)',
                      border: '1px solid var(--color-ink-700)',
                      borderRadius: 8,
                      color: 'var(--color-fg-100)',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <ul className="grid flex-1 gap-x-6 gap-y-1 sm:grid-cols-2">
              {byCategory.map((c) => (
                <li
                  key={c.name}
                  className="flex items-center justify-between text-sm"
                >
                  <span className="flex items-center gap-2 text-fg-400">
                    <span
                      className="h-2.5 w-2.5 rounded-full"
                      style={{
                        background: CATEGORY_COLORS[c.name] || '#94a3b8',
                      }}
                    />
                    {c.name}
                  </span>
                  <span className="text-fg-300">{formatMoney(c.value)}</span>
                </li>
              ))}
            </ul>
          </div>
        </Card>
      )}

      <div className="mb-4 flex flex-wrap gap-2">
        {filters.map((f) => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            className={`rounded-full px-3.5 py-1.5 text-sm font-medium ${
              filter === f.value
                ? 'bg-indigo-500 text-white'
                : 'bg-ink-800 text-fg-400 hover:text-fg-200'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="text-sm text-fg-500">Loading…</p>
      ) : visible.length === 0 ? (
        <EmptyState
          icon={Wallet}
          title="Nothing here yet"
          hint="Add an income or expense entry to get started."
        />
      ) : (
        <ul className="divide-y divide-ink-800 overflow-hidden rounded-2xl border border-ink-800 bg-ink-900">
          {visible.map((t) => (
            <li key={t._id} className="group flex items-center gap-3 px-4 py-3">
              <span
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-xs font-semibold"
                style={{
                  background: colorFor(t) + '22',
                  color: colorFor(t),
                }}
              >
                {isIncome(t) ? (
                  <ArrowUpRight size={16} />
                ) : (
                  t.category.slice(0, 2)
                )}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-fg-200">
                  {t.note || t.category}
                </p>
                <p className="text-xs text-fg-500">
                  {t.category} · {format(new Date(t.date), 'MMM d, yyyy')}
                </p>
              </div>
              <span
                className={`font-semibold ${
                  isIncome(t) ? 'text-emerald-600 dark:text-emerald-400' : 'text-fg-100'
                }`}
              >
                {isIncome(t) ? '+' : '−'}
                {formatMoney(t.amount)}
              </span>
              <div className="flex shrink-0 gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                <button
                  onClick={() => openEdit(t)}
                  className="rounded-md p-1.5 text-fg-500 hover:bg-ink-800 hover:text-fg-200"
                >
                  <Pencil size={16} />
                </button>
                <button
                  onClick={() => remove(t)}
                  className="rounded-md p-1.5 text-fg-500 hover:bg-ink-800 hover:text-red-600 dark:hover:text-red-400"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {modalOpen && (
        <Modal
          title={editing ? 'Edit entry' : 'Add entry'}
          onClose={() => setModalOpen(false)}
        >
          <form onSubmit={submit} className="space-y-4">
            <div className="flex gap-1 rounded-lg bg-ink-850 p-1">
              {['expense', 'income'].map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => changeType(type)}
                  className={`flex-1 rounded-md px-3 py-1.5 text-sm font-medium capitalize transition-colors ${
                    form.type === type
                      ? type === 'income'
                        ? 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300'
                        : 'bg-rose-500/20 text-rose-700 dark:text-rose-300'
                      : 'text-fg-500 hover:text-fg-300'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>

            <Field label="Amount">
              <input
                autoFocus
                type="number"
                min="0"
                step="0.01"
                className={inputClass}
                placeholder="0.00"
                value={form.amount}
                onChange={(e) => setForm({ ...form, amount: e.target.value })}
              />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Category">
                <select
                  className={inputClass}
                  value={form.category}
                  onChange={(e) =>
                    setForm({ ...form, category: e.target.value })
                  }
                >
                  {catsFor(form.type).map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Date">
                <input
                  type="date"
                  className={inputClass}
                  value={form.date}
                  onChange={(e) => setForm({ ...form, date: e.target.value })}
                />
              </Field>
            </div>
            <Field label="Note (optional)">
              <input
                className={inputClass}
                placeholder={
                  form.type === 'income'
                    ? 'e.g. Monthly allowance'
                    : 'e.g. Lunch with friends'
                }
                value={form.note}
                onChange={(e) => setForm({ ...form, note: e.target.value })}
              />
            </Field>
            <div className="flex justify-end gap-2 pt-1">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setModalOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={saving}>
                {saving ? 'Saving…' : editing ? 'Save changes' : 'Add entry'}
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
