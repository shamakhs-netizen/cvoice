import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Loader2, Mic } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import CvDocument, { type CVRecord } from '@/components/CvDocument';

export default function ShareCv() {
  const { token } = useParams();
  const [cv, setCv] = useState<CVRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;
    (async () => {
      const { data, error } = await supabase
        .from('cvs')
        .select('*')
        .eq('share_token', token)
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
  }, [token]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50/50 flex items-center justify-center">
        <Loader2 className="h-8 w-8 text-indigo-600 animate-spin" />
      </div>
    );
  }

  if (error || !cv) {
    return (
      <div className="min-h-screen bg-gray-50/50 flex items-center justify-center px-5">
        <div className="text-center max-w-sm">
          <p className="text-lg font-semibold text-gray-900 mb-2">
            {error ?? 'Something went wrong'}
          </p>
          <p className="text-sm text-gray-500">
            This CV may have been removed or the link is invalid.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/50">
      <div className="max-w-3xl mx-auto px-5 sm:px-8 py-12">
        <div className="flex items-center justify-center gap-2 mb-8">
          <span className="flex items-center justify-center h-8 w-8 rounded-lg bg-indigo-600 text-white">
            <Mic className="h-4 w-4" />
          </span>
          <span className="text-lg font-semibold text-gray-900">CVoice</span>
        </div>

        <CvDocument cv={cv} />

        <p className="mt-6 text-center text-sm text-gray-400">
          Shared via CVoice
        </p>
      </div>
    </div>
  );
}
