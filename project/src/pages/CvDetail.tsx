import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Share2, Download, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import CvDocument, { type CVRecord } from '@/components/CvDocument';

export default function CvDetail() {
  const { id } = useParams();
  const [cv, setCv] = useState<CVRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    (async () => {
      const { data, error } = await supabase
        .from('cvs')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (error) {
        setError(error.message);
        setLoading(false);
        return;
      }
      if (!data) {
        setError('CV not found');
        setLoading(false);
        return;
      }
      setCv(data as CVRecord);
      setLoading(false);
    })();
  }, [id]);

  const handleShare = () => {
    if (cv?.share_token) {
      const url = `${window.location.origin}/cv/share/${cv.share_token}`;
      navigator.clipboard.writeText(url);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] bg-gray-50/50 flex items-center justify-center">
        <Loader2 className="h-8 w-8 text-indigo-600 animate-spin" />
      </div>
    );
  }

  if (error || !cv) {
    return (
      <div className="min-h-[calc(100vh-4rem)] bg-gray-50/50 flex items-center justify-center px-5">
        <div className="text-center max-w-sm">
          <p className="text-lg font-semibold text-gray-900 mb-2">
            {error ?? 'Something went wrong'}
          </p>
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-indigo-600 hover:text-indigo-700"
          >
            <ArrowLeft className="h-4 w-4" /> Back to dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gray-50/50">
      <div className="max-w-3xl mx-auto px-5 sm:px-8 py-8">
        <div className="flex items-center justify-between mb-6">
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-indigo-600 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to dashboard
          </Link>
          <div className="flex items-center gap-2">
            <button className="inline-flex items-center gap-1.5 px-3.5 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              <Download className="h-4 w-4" />
              Download
            </button>
            <button
              onClick={handleShare}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors shadow-sm"
            >
              <Share2 className="h-4 w-4" />
              Share
            </button>
          </div>
        </div>

        <CvDocument cv={cv} />
      </div>
    </div>
  );
}
