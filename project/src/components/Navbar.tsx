import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Mic } from 'lucide-react';

export default function Navbar() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-gray-100">
      <nav className="max-w-6xl mx-auto px-5 sm:px-8 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 group">
          <span className="flex items-center justify-center h-9 w-9 rounded-xl bg-indigo-600 text-white transition-transform group-hover:scale-105">
            <Mic className="h-5 w-5" />
          </span>
          <span className="text-xl font-semibold tracking-tight text-gray-900">
            CVoice
          </span>
        </Link>

        <div className="flex items-center gap-2 sm:gap-3">
          {user ? (
            <>
              <Link
                to="/dashboard"
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-indigo-600 transition-colors rounded-lg hover:bg-gray-50"
              >
                Dashboard
              </Link>
              <button
                onClick={handleSignOut}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors rounded-lg hover:bg-gray-50"
              >
                Sign out
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-indigo-600 transition-colors rounded-lg hover:bg-gray-50"
              >
                Login
              </Link>
              <Link
                to="/login"
                className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors shadow-sm"
              >
                Get started
              </Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}
