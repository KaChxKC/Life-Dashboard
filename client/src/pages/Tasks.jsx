import { useEffect, useMemo, useState } from 'react';
import { format } from 'date-fns';
import {
  Plus,
  Pencil,
  Trash2,
  Check,
  Flame,
  ListChecks,
  CalendarDays,
} from 'lucide-react';
import api from '../api/client';
import {
  TASK_TYPES,
  TYPE_STYLES,
  PRIORITIES,
  PRIORITY_STYLES,
  todayStr,
} from '../lib/constants';
import {
  Badge,
  Button,
  EmptyState,
  Field,
  Modal,
  inputClass,
} from '../components/ui';

const emptyForm = {
  title: '',
  description: '',
  type: 'goal',
  priority: 'medium',
  dueDate: '',
};

const isDoneToday = (t) =>
  t.type === 'daily'
    ? t.lastCompletedDate === todayStr()
    : t.completed;

export default function Tasks() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    try {
      const { data } = await api.get('/tasks');
      setTasks(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(() => {
    let list = filter === 'all' ? tasks : tasks.filter((t) => t.type === filter);
    const rank = { high: 0, medium: 1, low: 2 };
    return [...list].sort((a, b) => {
      const da = isDoneToday(a) ? 1 : 0;
      const db = isDoneToday(b) ? 1 : 0;
      if (da !== db) return da - db;
      return rank[a.priority] - rank[b.priority];
    });
  }, [tasks, filter]);

  const openNew = () => {
    setEditing(null);
    setForm(emptyForm);
    setModalOpen(true);
  };

  const openEdit = (t) => {
    setEditing(t);
    setForm({
      title: t.title,
      description: t.description || '',
      type: t.type,
      priority: t.priority,
      dueDate: t.dueDate ? t.dueDate.slice(0, 10) : '',
    });
    setModalOpen(true);
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) return;
    setSaving(true);
    try {
      const payload = { ...form, dueDate: form.dueDate || null };
      if (editing) {
        const { data } = await api.put(`/tasks/${editing._id}`, payload);
        setTasks((ts) => ts.map((t) => (t._id === data._id ? data : t)));
      } else {
        const { data } = await api.post('/tasks', payload);
        setTasks((ts) => [data, ...ts]);
      }
      setModalOpen(false);
    } finally {
      setSaving(false);
    }
  };

  const toggle = async (t) => {
    const { data } = await api.patch(`/tasks/${t._id}/toggle`);
    setTasks((ts) => ts.map((x) => (x._id === data._id ? data : x)));
  };

  const remove = async (t) => {
    if (!confirm(`Delete "${t.title}"?`)) return;
    await api.delete(`/tasks/${t._id}`);
    setTasks((ts) => ts.filter((x) => x._id !== t._id));
  };

  const filters = [{ value: 'all', label: 'All' }, ...TASK_TYPES];

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-100">Tasks</h1>
          <p className="text-sm text-slate-500">
            Goals, assignments, roadmap steps and daily habits.
          </p>
        </div>
        <Button onClick={openNew}>
          <Plus size={18} /> New task
        </Button>
      </div>

      <div className="mb-5 flex flex-wrap gap-2">
        {filters.map((f) => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            className={`rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors ${
              filter === f.value
                ? 'bg-indigo-500 text-white'
                : 'bg-ink-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="text-sm text-slate-500">Loading…</p>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={ListChecks}
          title="No tasks here yet"
          hint="Create your first task to get started."
        />
      ) : (
        <ul className="space-y-2.5">
          {filtered.map((t) => {
            const done = isDoneToday(t);
            return (
              <li
                key={t._id}
                className="group flex items-start gap-3 rounded-xl border border-ink-800 bg-ink-900 p-4"
              >
                <button
                  onClick={() => toggle(t)}
                  className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition-colors ${
                    done
                      ? 'border-emerald-500 bg-emerald-500 text-white'
                      : 'border-ink-600 hover:border-indigo-400'
                  }`}
                >
                  {done && <Check size={14} strokeWidth={3} />}
                </button>

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`font-medium ${
                        done ? 'text-slate-500 line-through' : 'text-slate-100'
                      }`}
                    >
                      {t.title}
                    </span>
                    <Badge className={TYPE_STYLES[t.type]}>
                      {TASK_TYPES.find((x) => x.value === t.type)?.label}
                    </Badge>
                    <Badge className={PRIORITY_STYLES[t.priority]}>
                      {t.priority}
                    </Badge>
                    {t.type === 'daily' && t.streak > 0 && (
                      <Badge className="bg-orange-500/15 text-orange-300">
                        <Flame size={12} className="mr-0.5" /> {t.streak}
                      </Badge>
                    )}
                  </div>
                  {t.description && (
                    <p className="mt-1 text-sm text-slate-400">{t.description}</p>
                  )}
                  {t.dueDate && (
                    <p className="mt-1 flex items-center gap-1 text-xs text-slate-500">
                      <CalendarDays size={13} />
                      Due {format(new Date(t.dueDate), 'MMM d, yyyy')}
                    </p>
                  )}
                </div>

                <div className="flex shrink-0 gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                  <button
                    onClick={() => openEdit(t)}
                    className="rounded-md p-1.5 text-slate-500 hover:bg-ink-800 hover:text-slate-200"
                  >
                    <Pencil size={16} />
                  </button>
                  <button
                    onClick={() => remove(t)}
                    className="rounded-md p-1.5 text-slate-500 hover:bg-ink-800 hover:text-red-400"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {modalOpen && (
        <Modal
          title={editing ? 'Edit task' : 'New task'}
          onClose={() => setModalOpen(false)}
        >
          <form onSubmit={submit} className="space-y-4">
            <Field label="Title">
              <input
                autoFocus
                className={inputClass}
                placeholder="e.g. Solve 5 DSA problems"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
              />
            </Field>

            <Field label="Description (optional)">
              <textarea
                rows={2}
                className={inputClass}
                placeholder="Any details…"
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
              />
            </Field>

            <div className="grid grid-cols-2 gap-3">
              <Field label="Type">
                <select
                  className={inputClass}
                  value={form.type}
                  onChange={(e) => setForm({ ...form, type: e.target.value })}
                >
                  {TASK_TYPES.map((t) => (
                    <option key={t.value} value={t.value}>
                      {t.label}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Priority">
                <select
                  className={inputClass}
                  value={form.priority}
                  onChange={(e) =>
                    setForm({ ...form, priority: e.target.value })
                  }
                >
                  {PRIORITIES.map((p) => (
                    <option key={p.value} value={p.value}>
                      {p.label}
                    </option>
                  ))}
                </select>
              </Field>
            </div>

            {form.type !== 'daily' && (
              <Field label="Due date (optional)">
                <input
                  type="date"
                  className={inputClass}
                  value={form.dueDate}
                  onChange={(e) =>
                    setForm({ ...form, dueDate: e.target.value })
                  }
                />
              </Field>
            )}

            <div className="flex justify-end gap-2 pt-1">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setModalOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={saving}>
                {saving ? 'Saving…' : editing ? 'Save changes' : 'Add task'}
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
