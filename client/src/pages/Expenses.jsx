import { useEffect, useMemo, useState } from 'react';
import { format } from 'date-fns';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';
import { Plus, Trash2, Pencil, Wallet } from 'lucide-react';
import api from '../api/client';
import {
  EXPENSE_CATEGORIES,
  CATEGORY_COLORS,
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
  category: 'Food',
  note: '',
  date: todayStr(),
};

export default function Expenses() {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [catFilter, setCatFilter] = useState('all');

  const load = async () => {
    try {
      const { data } = await api.get('/expenses');
      setExpenses(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const now = new Date();
  const monthKey = `${now.getFullYear()}-${now.getMonth()}`;

  const monthTotal = useMemo(
    () =>
      expenses
        .filter((e) => {
          const d = new Date(e.date);
          return `${d.getFullYear()}-${d.getMonth()}` === monthKey;
        })
        .reduce((sum, e) => sum + e.amount, 0),
    [expenses, monthKey]
  );

  const todayTotal = useMemo(
    () =>
      expenses
        .filter((e) => todayStr(e.date) === todayStr())
        .reduce((sum, e) => sum + e.amount, 0),
    [expenses]
  );

  const byCategory = useMemo(() => {
    const map = {};
    expenses
      .filter((e) => {
        const d = new Date(e.date);
        return `${d.getFullYear()}-${d.getMonth()}` === monthKey;
      })
      .forEach((e) => {
        map[e.category] = (map[e.category] || 0) + e.amount;
      });
    return Object.entries(map)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [expenses, monthKey]);

  const visible = useMemo(
    () =>
      catFilter === 'all'
        ? expenses
        : expenses.filter((e) => e.category === catFilter),
    [expenses, catFilter]
  );

  const openNew = () => {
    setEditing(null);
    setForm(emptyForm);
    setModalOpen(true);
  };

  const openEdit = (ex) => {
    setEditing(ex);
    setForm({
      amount: String(ex.amount),
      category: ex.category,
      note: ex.note || '',
      date: todayStr(ex.date),
    });
    setModalOpen(true);
  };

  const submit = async (e) => {
    e.preventDefault();
    const amount = Number(form.amount);
    if (!Number.isFinite(amount) || amount < 0) return;
    setSaving(true);
    try {
      const payload = { ...form, amount };
      if (editing) {
        const { data } = await api.put(`/expenses/${editing._id}`, payload);
        setExpenses((xs) => xs.map((x) => (x._id === data._id ? data : x)));
      } else {
        const { data } = await api.post('/expenses', payload);
        setExpenses((xs) =>
          [data, ...xs].sort((a, b) => new Date(b.date) - new Date(a.date))
        );
      }
      setModalOpen(false);
    } finally {
      setSaving(false);
    }
  };

  const remove = async (ex) => {
    if (!confirm('Delete this expense?')) return;
    await api.delete(`/expenses/${ex._id}`);
    setExpenses((xs) => xs.filter((x) => x._id !== ex._id));
  };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-100">Expenses</h1>
          <p className="text-sm text-slate-500">Track where your money goes.</p>
        </div>
        <Button onClick={openNew}>
          <Plus size={18} /> Add expense
        </Button>
      </div>

      <div className="mb-6 grid gap-4 md:grid-cols-3">
        <Card>
          <p className="text-sm text-slate-500">Spent today</p>
          <p className="mt-1 text-2xl font-semibold text-slate-100">
            {formatMoney(todayTotal)}
          </p>
        </Card>
        <Card>
          <p className="text-sm text-slate-500">This month</p>
          <p className="mt-1 text-2xl font-semibold text-slate-100">
            {formatMoney(monthTotal)}
          </p>
        </Card>
        <Card className="row-span-2 md:col-start-3 md:row-start-1">
          <p className="mb-2 text-sm text-slate-500">This month by category</p>
          {byCategory.length === 0 ? (
            <p className="py-8 text-center text-sm text-slate-600">No data yet</p>
          ) : (
            <>
              <div className="h-40">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={byCategory}
                      dataKey="value"
                      nameKey="name"
                      innerRadius={40}
                      outerRadius={65}
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
                        background: '#151b2e',
                        border: '1px solid #263049',
                        borderRadius: 8,
                        color: '#e5e9f0',
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <ul className="mt-2 space-y-1">
                {byCategory.slice(0, 5).map((c) => (
                  <li
                    key={c.name}
                    className="flex items-center justify-between text-sm"
                  >
                    <span className="flex items-center gap-2 text-slate-400">
                      <span
                        className="h-2.5 w-2.5 rounded-full"
                        style={{
                          background: CATEGORY_COLORS[c.name] || '#94a3b8',
                        }}
                      />
                      {c.name}
                    </span>
                    <span className="text-slate-300">{formatMoney(c.value)}</span>
                  </li>
                ))}
              </ul>
            </>
          )}
        </Card>
      </div>

      <div className="mb-4 flex flex-wrap gap-2">
        <button
          onClick={() => setCatFilter('all')}
          className={`rounded-full px-3.5 py-1.5 text-sm font-medium ${
            catFilter === 'all'
              ? 'bg-indigo-500 text-white'
              : 'bg-ink-800 text-slate-400 hover:text-slate-200'
          }`}
        >
          All
        </button>
        {EXPENSE_CATEGORIES.map((c) => (
          <button
            key={c}
            onClick={() => setCatFilter(c)}
            className={`rounded-full px-3.5 py-1.5 text-sm font-medium ${
              catFilter === c
                ? 'bg-indigo-500 text-white'
                : 'bg-ink-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="text-sm text-slate-500">Loading…</p>
      ) : visible.length === 0 ? (
        <EmptyState
          icon={Wallet}
          title="No expenses yet"
          hint="Add your first expense to see the breakdown."
        />
      ) : (
        <ul className="divide-y divide-ink-800 overflow-hidden rounded-2xl border border-ink-800 bg-ink-900">
          {visible.map((ex) => (
            <li
              key={ex._id}
              className="group flex items-center gap-3 px-4 py-3"
            >
              <span
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-xs font-semibold"
                style={{
                  background: (CATEGORY_COLORS[ex.category] || '#94a3b8') + '22',
                  color: CATEGORY_COLORS[ex.category] || '#94a3b8',
                }}
              >
                {ex.category.slice(0, 2)}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-slate-200">
                  {ex.note || ex.category}
                </p>
                <p className="text-xs text-slate-500">
                  {ex.category} · {format(new Date(ex.date), 'MMM d, yyyy')}
                </p>
              </div>
              <span className="font-semibold text-slate-100">
                {formatMoney(ex.amount)}
              </span>
              <div className="flex shrink-0 gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                <button
                  onClick={() => openEdit(ex)}
                  className="rounded-md p-1.5 text-slate-500 hover:bg-ink-800 hover:text-slate-200"
                >
                  <Pencil size={16} />
                </button>
                <button
                  onClick={() => remove(ex)}
                  className="rounded-md p-1.5 text-slate-500 hover:bg-ink-800 hover:text-red-400"
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
          title={editing ? 'Edit expense' : 'Add expense'}
          onClose={() => setModalOpen(false)}
        >
          <form onSubmit={submit} className="space-y-4">
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
                  {EXPENSE_CATEGORIES.map((c) => (
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
                placeholder="e.g. Lunch with friends"
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
                {saving ? 'Saving…' : editing ? 'Save changes' : 'Add expense'}
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
