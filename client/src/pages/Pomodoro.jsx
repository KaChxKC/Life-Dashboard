import { useCallback, useEffect, useRef, useState } from 'react';
import { Play, Pause, RotateCcw, SkipForward, Settings } from 'lucide-react';
import api from '../api/client';
import { Button, Modal, Field, inputClass } from '../components/ui';

const DEFAULTS = { focus: 25, short: 5, long: 15, longEvery: 4 };

const MODES = {
  focus: { label: 'Focus', accent: 'text-indigo-400', ring: 'stroke-indigo-500' },
  short: { label: 'Short Break', accent: 'text-emerald-400', ring: 'stroke-emerald-500' },
  long: { label: 'Long Break', accent: 'text-sky-400', ring: 'stroke-sky-500' },
};

const loadSettings = () => {
  try {
    return { ...DEFAULTS, ...JSON.parse(localStorage.getItem('pomodoro') || '{}') };
  } catch {
    return DEFAULTS;
  }
};

function beep() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.value = 880;
    gain.gain.setValueAtTime(0.001, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.3, ctx.currentTime + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6);
    osc.start();
    osc.stop(ctx.currentTime + 0.6);
  } catch {
    return;
  }
}

export default function Pomodoro() {
  const [settings, setSettings] = useState(loadSettings);
  const [mode, setMode] = useState('focus');
  const [secondsLeft, setSecondsLeft] = useState(settings.focus * 60);
  const [running, setRunning] = useState(false);
  const [completedFocus, setCompletedFocus] = useState(0);
  const [showSettings, setShowSettings] = useState(false);
  const [draft, setDraft] = useState(settings);
  const intervalRef = useRef(null);

  const total = settings[mode] * 60;

  const switchMode = useCallback(
    (next) => {
      setRunning(false);
      setMode(next);
      setSecondsLeft(settings[next] * 60);
    },
    [settings]
  );

  const handleComplete = useCallback(async () => {
    setRunning(false);
    beep();
    if (mode === 'focus') {
      api.post('/pomodoro', { minutes: settings.focus, mode: 'focus' }).catch(() => {});
      const count = completedFocus + 1;
      setCompletedFocus(count);
      const next = count % settings.longEvery === 0 ? 'long' : 'short';
      switchMode(next);
    } else {
      switchMode('focus');
    }
  }, [mode, completedFocus, settings, switchMode]);

  useEffect(() => {
    if (!running) return;
    intervalRef.current = setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) {
          clearInterval(intervalRef.current);
          handleComplete();
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(intervalRef.current);
  }, [running, handleComplete]);

  useEffect(() => {
    const mm = String(Math.floor(secondsLeft / 60)).padStart(2, '0');
    const ss = String(secondsLeft % 60).padStart(2, '0');
    document.title = running
      ? `${mm}:${ss} — ${MODES[mode].label}`
      : 'Life Dashboard';
    return () => {
      document.title = 'Life Dashboard';
    };
  }, [secondsLeft, running, mode]);

  const reset = () => {
    setRunning(false);
    setSecondsLeft(total);
  };

  const saveSettings = (e) => {
    e.preventDefault();
    const clean = {
      focus: Math.max(1, Number(draft.focus) || DEFAULTS.focus),
      short: Math.max(1, Number(draft.short) || DEFAULTS.short),
      long: Math.max(1, Number(draft.long) || DEFAULTS.long),
      longEvery: Math.max(1, Number(draft.longEvery) || DEFAULTS.longEvery),
    };
    setSettings(clean);
    localStorage.setItem('pomodoro', JSON.stringify(clean));
    setSecondsLeft(clean[mode] * 60);
    setRunning(false);
    setShowSettings(false);
  };

  const mm = String(Math.floor(secondsLeft / 60)).padStart(2, '0');
  const ss = String(secondsLeft % 60).padStart(2, '0');
  const progress = total > 0 ? (total - secondsLeft) / total : 0;
  const R = 130;
  const C = 2 * Math.PI * R;

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-100">Pomodoro</h1>
          <p className="text-sm text-slate-500">
            Work in focused sprints. Focus sessions are logged to your stats.
          </p>
        </div>
        <Button variant="ghost" onClick={() => { setDraft(settings); setShowSettings(true); }}>
          <Settings size={18} /> Settings
        </Button>
      </div>

      <div className="mx-auto flex max-w-md flex-col items-center rounded-2xl border border-ink-800 bg-ink-900 p-8">
        <div className="mb-8 flex gap-1 rounded-xl bg-ink-850 p-1">
          {Object.entries(MODES).map(([key, m]) => (
            <button
              key={key}
              onClick={() => switchMode(key)}
              className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                mode === key
                  ? 'bg-ink-700 text-slate-100'
                  : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>

        <div className="relative flex h-72 w-72 items-center justify-center">
          <svg className="absolute -rotate-90" width="288" height="288" viewBox="0 0 288 288">
            <circle cx="144" cy="144" r={R} fill="none" stroke="currentColor" strokeWidth="10" className="text-ink-800" />
            <circle
              cx="144"
              cy="144"
              r={R}
              fill="none"
              strokeWidth="10"
              strokeLinecap="round"
              className={MODES[mode].ring}
              stroke="currentColor"
              strokeDasharray={C}
              strokeDashoffset={C * (1 - progress)}
              style={{ transition: 'stroke-dashoffset 0.5s linear' }}
            />
          </svg>
          <div className="text-center">
            <div className="text-6xl font-bold tabular-nums text-slate-100">
              {mm}:{ss}
            </div>
            <div className={`mt-1 text-sm font-medium ${MODES[mode].accent}`}>
              {MODES[mode].label}
            </div>
          </div>
        </div>

        <div className="mt-8 flex items-center gap-3">
          <button
            onClick={reset}
            className="rounded-full bg-ink-800 p-3 text-slate-400 hover:bg-ink-700 hover:text-slate-200"
            title="Reset"
          >
            <RotateCcw size={20} />
          </button>
          <button
            onClick={() => setRunning((r) => !r)}
            className="flex h-16 w-16 items-center justify-center rounded-full bg-indigo-500 text-white hover:bg-indigo-400"
          >
            {running ? <Pause size={26} /> : <Play size={26} className="ml-1" />}
          </button>
          <button
            onClick={handleComplete}
            className="rounded-full bg-ink-800 p-3 text-slate-400 hover:bg-ink-700 hover:text-slate-200"
            title="Skip"
          >
            <SkipForward size={20} />
          </button>
        </div>

        <p className="mt-6 text-sm text-slate-500">
          Focus sessions completed today:{' '}
          <span className="font-semibold text-slate-300">{completedFocus}</span>
        </p>
      </div>

      {showSettings && (
        <Modal title="Timer settings" onClose={() => setShowSettings(false)}>
          <form onSubmit={saveSettings} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <Field label="Focus (min)">
                <input type="number" min="1" className={inputClass} value={draft.focus}
                  onChange={(e) => setDraft({ ...draft, focus: e.target.value })} />
              </Field>
              <Field label="Short break (min)">
                <input type="number" min="1" className={inputClass} value={draft.short}
                  onChange={(e) => setDraft({ ...draft, short: e.target.value })} />
              </Field>
              <Field label="Long break (min)">
                <input type="number" min="1" className={inputClass} value={draft.long}
                  onChange={(e) => setDraft({ ...draft, long: e.target.value })} />
              </Field>
              <Field label="Long break every">
                <input type="number" min="1" className={inputClass} value={draft.longEvery}
                  onChange={(e) => setDraft({ ...draft, longEvery: e.target.value })} />
              </Field>
            </div>
            <div className="flex justify-end gap-2 pt-1">
              <Button type="button" variant="ghost" onClick={() => setShowSettings(false)}>
                Cancel
              </Button>
              <Button type="submit">Save</Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
