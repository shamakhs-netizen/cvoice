import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FileText, Plus, ArrowRight, Mic, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { type CVRecord } from '@/components/CvDocument';

export default function Dashboard() {
  const { user } = useAuth();
  const [cvs, setCvs] = useState<CVRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data, error } = await supabase
        .from('cvs')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (!error && data) {
        setCvs(data as CVRecord[]);
      }
      setLoading(false);
    })();
  }, [user]);

  const formatDate = (iso: string) => {
    const date = new Date(iso);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gray-50/50">
      <div className="max-w-5xl mx-auto px-5 sm:px-8 py-10">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-semibold text-gray-900">
              Your CVs
            </h1>
            <p className="mt-1.5 text-sm text-gray-500">
              Manage and share your AI-generated CVs.
            </p>
          </div>
          <Link
            to="/interview"
            className="inline-flex items-center gap-2 px-5 py-3 bg-indigo-600 text-white text-sm font-medium rounded-xl hover:bg-indigo-700 transition-colors shadow-sm"
          >
            <Plus className="h-4 w-4" />
            New CV
          </Link>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 text-indigo-600 animate-spin" />
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {/* New CV card */}
            <Link
              to="/interview"
              className="group flex flex-col items-center justify-center gap-3 p-8 rounded-2xl border-2 border-dashed border-gray-200 hover:border-indigo-300 hover:bg-indigo-50/30 transition-colors min-h-[160px]"
            >
              <span className="flex items-center justify-center h-12 w-12 rounded-2xl bg-indigo-50 text-indigo-600 group-hover:bg-indigo-100 transition-colors">
                <Mic className="h-6 w-6" />
              </span>
              <span className="text-sm font-medium text-gray-700 group-hover:text-indigo-700 transition-colors">
                Start a new interview
              </span>
            </Link>

            {cvs.map((cv) => (
              <Link
                key={cv.id}
                to={`/cv/${cv.id}`}
                className="group p-6 rounded-2xl border border-gray-100 bg-white shadow-sm hover:shadow-md hover:border-indigo-100 transition-all"
              >
                <div className="flex items-start justify-between mb-4">
                  <span className="flex items-center justify-center h-11 w-11 rounded-xl bg-gray-50 text-gray-700 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
                    <FileText className="h-5 w-5" />
                  </span>
                  <span className="px-2.5 py-1 text-xs font-medium rounded-full bg-green-50 text-green-700">
                    Ready
                  </span>
                </div>
                <h3 className="text-base font-semibold text-gray-900 group-hover:text-indigo-700 transition-colors truncate">
                  {cv.name || 'Untitled'} — {cv.target_role || 'Professional'}
                </h3>
                <div className="flex items-center justify-between mt-4">
                  <span className="text-xs text-gray-400">
                    {cv.created_at ? `Updated ${formatDate(cv.created_at)}` : ''}
                  </span>
                  <ArrowRight className="h-4 w-4 text-gray-300 group-hover:text-indigo-600 group-hover:translate-x-0.5 transition-all" />
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
