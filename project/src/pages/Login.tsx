import { useState, type FormEvent } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Mic, ArrowRight, Loader2 } from 'lucide-react';

export default function Login() {
  const { signInWithEmail, signUpWithEmail } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: string } | null)?.from ?? '/dashboard';

  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      if (mode === 'signin') {
        await signInWithEmail(email, password);
      } else {
        await signUpWithEmail(email, password);
      }
      navigate(from, { replace: true });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Something went wrong';
      setError(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-5 py-12 bg-gray-50/50">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <span className="inline-flex items-center justify-center h-12 w-12 rounded-2xl bg-indigo-600 text-white mb-4">
            <Mic className="h-6 w-6" />
          </span>
          <h1 className="text-2xl font-semibold text-gray-900">
            {mode === 'signin' ? 'Welcome back' : 'Create your account'}
          </h1>
          <p className="mt-2 text-sm text-gray-500">
            {mode === 'signin'
              ? 'Sign in to continue building your CV.'
              : 'Start your AI-powered CV in minutes.'}
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sm:p-8">
          <div className="flex p-1 mb-6 rounded-xl bg-gray-50">
            <button
              type="button"
              onClick={() => setMode('signin')}
              className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors ${
                mode === 'signin'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Sign in
            </button>
            <button
              type="button"
              onClick={() => setMode('signup')}
              className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors ${
                mode === 'signup'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Sign up
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Email
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-shadow"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Password
              </label>
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-shadow"
              />
            </div>

            {error && (
              <div className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-indigo-600 text-white text-sm font-medium rounded-xl hover:bg-indigo-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed shadow-sm"
            >
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Please wait…
                </>
              ) : (
                <>
                  {mode === 'signin' ? 'Sign in' : 'Create account'}
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-500">
            <Link to="/" className="text-indigo-600 hover:text-indigo-700 font-medium">
              Back to home
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
