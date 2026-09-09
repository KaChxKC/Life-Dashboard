import { X } from 'lucide-react';

export function Card({ className = '', children }) {
  return (
    <div
      className={`rounded-2xl border border-ink-800 bg-ink-900 p-5 ${className}`}
    >
      {children}
    </div>
  );
}

export function Badge({ className = '', children }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${className}`}
    >
      {children}
    </span>
  );
}

export function Button({
  variant = 'primary',
  className = '',
  children,
  ...props
}) {
  const variants = {
    primary:
      'bg-grad text-[var(--accent-contrast)] font-semibold shadow-lg hover:brightness-105',
    ghost: 'bg-ink-800 text-fg-200 hover:bg-ink-700',
    danger: 'bg-red-500/90 text-white hover:bg-red-500 hover:brightness-110',
  };
  return (
    <button
      className={`inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all duration-200 active:scale-95 disabled:opacity-50 ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

export function Field({ label, children }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-fg-300">
        {label}
      </span>
      {children}
    </label>
  );
}

export const inputClass =
  'w-full rounded-lg border border-ink-700 bg-ink-850 px-3 py-2 text-sm text-fg-100 placeholder-fg-500 outline-none focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)]';

export function Modal({ title, onClose, children }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-2xl border border-ink-800 bg-ink-900 p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-fg-100">{title}</h2>
          <button
            onClick={onClose}
            className="rounded-md p-1 text-fg-500 hover:bg-ink-800 hover:text-fg-200"
          >
            <X size={20} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

export function EmptyState({ icon: Icon, title, hint }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-ink-700 py-12 text-center">
      {Icon && <Icon size={32} className="mb-3 text-fg-600" />}
      <p className="text-sm font-medium text-fg-300">{title}</p>
      {hint && <p className="mt-1 text-sm text-fg-500">{hint}</p>}
    </div>
  );
}
