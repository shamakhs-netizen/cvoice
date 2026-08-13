import { Briefcase, GraduationCap, Sparkles, Award, FolderOpen, Target } from 'lucide-react';

export interface CVRecord {
  id: string;
  name: string;
  target_role: string;
  recent_role: string;
  recent_company: string;
  recent_duties: string;
  recent_achievement: string;
  previous_role: string;
  skills: string[];
  education: string;
  extras: string;
  target_next: string;
  share_token: string;
  created_at: string;
}

export default function CvDocument({ cv }: { cv: CVRecord }) {
  const hasPrevious = cv.previous_role && cv.previous_role.toLowerCase() !== 'none';
  const hasExtras = cv.extras && cv.extras.toLowerCase() !== 'none';

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 sm:p-12">
      <header className="pb-6 border-b border-gray-100">
        <h1 className="text-3xl font-semibold text-gray-900">{cv.name || 'Your Name'}</h1>
        <p className="mt-1 text-lg text-indigo-600 font-medium">
          {cv.target_role || 'Professional'}
        </p>
      </header>

      <section className="pt-6">
        <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-gray-400 mb-3">
          <Briefcase className="h-4 w-4" /> Experience
        </h2>
        <div className="space-y-5">
          <div>
            <div className="flex flex-wrap items-baseline justify-between gap-1">
              <h3 className="font-semibold text-gray-900">
                {cv.recent_role || 'Professional'}
                {cv.recent_company && ` — ${cv.recent_company}`}
              </h3>
            </div>
            {cv.recent_duties && (
              <p className="mt-1.5 text-sm text-gray-600 leading-relaxed whitespace-pre-line">
                {cv.recent_duties}
              </p>
            )}
            {cv.recent_achievement && (
              <div className="mt-2 flex items-start gap-2 text-sm text-gray-600">
                <Award className="h-4 w-4 text-indigo-500 mt-0.5 shrink-0" />
                <p className="leading-relaxed">{cv.recent_achievement}</p>
              </div>
            )}
          </div>

          {hasPrevious && (
            <div>
              <div className="flex flex-wrap items-baseline justify-between gap-1">
                <h3 className="font-semibold text-gray-900">{cv.previous_role}</h3>
              </div>
            </div>
          )}
        </div>
      </section>

      <section className="pt-6 mt-6 border-t border-gray-100">
        <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-gray-400 mb-3">
          <GraduationCap className="h-4 w-4" /> Education
        </h2>
        <p className="text-sm text-gray-600 leading-relaxed">{cv.education || 'Not specified'}</p>
      </section>

      {cv.skills.length > 0 && (
        <section className="pt-6 mt-6 border-t border-gray-100">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-400 mb-3">
            Skills
          </h2>
          <div className="flex flex-wrap gap-2">
            {cv.skills.map((s, i) => (
              <span
                key={i}
                className="px-3 py-1 text-sm font-medium text-gray-700 bg-gray-50 border border-gray-100 rounded-lg"
              >
                {s}
              </span>
            ))}
          </div>
        </section>
      )}

      {hasExtras && (
        <section className="pt-6 mt-6 border-t border-gray-100">
          <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-gray-400 mb-3">
            <FolderOpen className="h-4 w-4" /> Additional Info
          </h2>
          <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">{cv.extras}</p>
        </section>
      )}

      {cv.target_next && (
        <section className="pt-6 mt-6 border-t border-gray-100">
          <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-gray-400 mb-3">
            <Target className="h-4 w-4" /> What I'm Looking For
          </h2>
          <div className="flex items-start gap-2 text-sm text-gray-600">
            <Sparkles className="h-4 w-4 text-indigo-500 mt-0.5 shrink-0" />
            <p className="leading-relaxed">{cv.target_next}</p>
          </div>
        </section>
      )}
    </div>
  );
}
