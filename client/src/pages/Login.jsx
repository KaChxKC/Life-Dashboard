import { useState } from 'react';
import { GoogleLogin } from '@react-oauth/google';
import { LayoutDashboard, ListChecks, Timer, Wallet } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

const features = [
  { icon: ListChecks, text: 'Track tasks, assignments & daily habits' },
  { icon: Timer, text: 'Stay focused with a Pomodoro timer' },
  { icon: Wallet, text: 'Keep an eye on your spending' },
];

export default function Login() {
  const { loginWithGoogle } = useAuth();
  const [error, setError] = useState('');

  const handleSuccess = async (cred) => {
    setError('');
    try {
      await loginWithGoogle(cred.credential);
    } catch {
      setError('Could not sign you in. Please try again.');
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-5">
      <div className="w-full max-w-md rounded-2xl border border-ink-800 bg-ink-900 p-8 shadow-xl">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-500 text-white">
            <LayoutDashboard size={22} />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-slate-100">
              Life Dashboard
            </h1>
            <p className="text-sm text-slate-500">Your day, in one place</p>
          </div>
        </div>

        <ul className="mb-8 space-y-3">
          {features.map(({ icon: Icon, text }) => (
            <li key={text} className="flex items-center gap-3 text-sm text-slate-300">
              <Icon size={18} className="shrink-0 text-indigo-400" />
              {text}
            </li>
          ))}
        </ul>

        {clientId ? (
          <div className="flex justify-center">
            <GoogleLogin
              onSuccess={handleSuccess}
              onError={() => setError('Google sign-in failed. Please try again.')}
              theme="filled_black"
              shape="pill"
              text="continue_with"
            />
          </div>
        ) : (
          <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-4 text-sm text-amber-300">
            Google sign-in isn't configured yet. Add{' '}
            <code className="rounded bg-black/30 px-1">VITE_GOOGLE_CLIENT_ID</code>{' '}
            to <code className="rounded bg-black/30 px-1">client/.env</code> and
            restart the dev server. See the README for setup steps.
          </div>
        )}

        {error && (
          <p className="mt-4 text-center text-sm text-red-400">{error}</p>
        )}
      </div>
    </div>
  );
}
