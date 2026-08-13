import { useEffect, useState, useRef, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Download, Loader as Loader2, Check, Plus, X, Sparkles, Eye, Pencil } from 'lucide-react';
import { pdf } from '@react-pdf/renderer';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import CVPreview, { type CVPreviewData } from '@/components/CVPreview';
import { CvPdfDocument } from '@/components/CvPdfDocument';
import CollapsibleSection from '@/components/CollapsibleSection';
import TagInput from '@/components/TagInput';

interface CvRow {
  id: string;
  title: string | null;
  cv_data: CVPreviewData | null;
  name: string | null;
  target_role: string | null;
  recent_role: string | null;
  recent_company: string | null;
  recent_duties: string | null;
  recent_achievement: string | null;
  previous_role: string | null;
  skills: string[] | null;
  education: string | null;
  extras: string | null;
  target_next: string | null;
}

function buildInitialData(row: CvRow): CVPreviewData {
  if (row.cv_data) {
    return {
      personal: row.cv_data.personal ?? { name: '', role: '', email: '', phone: '', location: '', linkedin: '' },
      summary: row.cv_data.summary ?? '',
      experience: row.cv_data.experience ?? [],
      education: row.cv_data.education ?? [],
      skills: row.cv_data.skills ?? { technical: [], soft: [] },
      extras: row.cv_data.extras ?? [],
    };
  }

  // Fallback: build from flat interview-answer columns
  const skillsArr = row.skills ?? [];
  const experience = [];
  if (row.recent_role || row.recent_company) {
    const bullets: string[] = [];
    if (row.recent_duties) bullets.push(row.recent_duties);
    if (row.recent_achievement) bullets.push(row.recent_achievement);
    experience.push({
      company: row.recent_company ?? '',
      role: row.recent_role ?? '',
      start: '',
      end: '',
      bullets,
    });
  }
  if (row.previous_role && row.previous_role.toLowerCase() !== 'none') {
    experience.push({
      company: '',
      role: row.previous_role ?? '',
      start: '',
      end: '',
      bullets: [],
    });
  }

  const education = [];
  if (row.education) {
    education.push({
      school: row.education,
      degree: '',
      start: '',
      end: '',
    });
  }

  const extras = [];
  if (row.extras && row.extras.toLowerCase() !== 'none') {
    extras.push({
      type: 'Additional',
      title: '',
      description: row.extras,
    });
  }
  if (row.target_next) {
    extras.push({
      type: 'Objective',
      title: '',
      description: row.target_next,
    });
  }

  return {
    personal: {
      name: row.name ?? '',
      role: row.target_role ?? '',
      email: '',
      phone: '',
      location: '',
      linkedin: '',
    },
    summary: '',
    experience,
    education,
    skills: { technical: skillsArr, soft: [] },
    extras,
  };
}

type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

export default function CVEditorPage() {
  const { id } = useParams();
  const { session } = useAuth();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cvData, setCvData] = useState<CVPreviewData | null>(null);
  const [title, setTitle] = useState('');
  const [editingTitle, setEditingTitle] = useState(false);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');
  const [mobileTab, setMobileTab] = useState<'preview' | 'edit'>('edit');
  const [rewritingSummary, setRewritingSummary] = useState(false);
  const [rewritingBullets, setRewritingBullets] = useState<number | null>(null);
  const [downloadingPdf, setDownloadingPdf] = useState(false);

  const dataRef = useRef<CVPreviewData | null>(null);
  const titleRef = useRef('');
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const loaded = useRef(false);

  const save = useCallback(
    async (data: CVPreviewData, cvTitle: string) => {
      if (!id) return;
      setSaveStatus('saving');
      try {
        const { error: err } = await supabase
          .from('cvs')
          .update({ cv_data: data, title: cvTitle })
          .eq('id', id);
        if (err) throw err;
        setSaveStatus('saved');
        setTimeout(() => setSaveStatus('idle'), 2000);
      } catch {
        setSaveStatus('error');
      }
    },
    [id],
  );

  const scheduleAutoSave = useCallback(
    (data: CVPreviewData, cvTitle: string) => {
      if (!loaded.current) return;
      if (saveTimer.current) clearTimeout(saveTimer.current);
      saveTimer.current = setTimeout(() => save(data, cvTitle), 2000);
    },
    [save],
  );

  const update = useCallback(
    (updater: (prev: CVPreviewData) => CVPreviewData) => {
      setCvData((prev) => {
        if (!prev) return prev;
        const next = updater(prev);
        dataRef.current = next;
        scheduleAutoSave(next, titleRef.current);
        return next;
      });
    },
    [scheduleAutoSave],
  );

  // Load
  useEffect(() => {
    if (!id) return;
    (async () => {
      const { data, error: err } = await supabase
        .from('cvs')
        .select('*')
        .eq('id', id)
        .maybeSingle();
      if (err) {
        setError(err.message);
        setLoading(false);
        return;
      }
      if (!data) {
        setError('CV not found');
        setLoading(false);
        return;
      }
      const row = data as CvRow;
      const initial = buildInitialData(row);
      setCvData(initial);
      dataRef.current = initial;
      const initialTitle = row.title ?? `${initial.personal.name || 'Untitled'} — ${initial.personal.name ? (row.target_role ?? 'CV') : 'CV'}`;
      setTitle(initialTitle);
      titleRef.current = initialTitle;
      setLoading(false);
      loaded.current = true;
    })();
  }, [id]);

  // Keep titleRef in sync
  useEffect(() => {
    titleRef.current = title;
  }, [title]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
    };
  }, []);

  // --- Rewrite helpers ---

  const callRewrite = async (payload: { section: string; content: string; context?: string }) => {
    const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/rewrite-section`;
    const res = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${session?.access_token ?? import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        apikey: import.meta.env.VITE_SUPABASE_ANON_KEY,
      },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error ?? `Request failed (${res.status})`);
    }
    return res.json();
  };

  const handleRewriteSummary = async () => {
    if (!cvData) return;
    setRewritingSummary(true);
    try {
      const result = await callRewrite({ section: 'summary', content: cvData.summary ?? '' });
      update((prev) => ({ ...prev, summary: result.content }));
    } catch {
      // ignore for now
    } finally {
      setRewritingSummary(false);
    }
  };

  const handleRewriteBullets = async (expIndex: number) => {
    if (!cvData) return;
    setRewritingBullets(expIndex);
    try {
      const exp = cvData.experience[expIndex];
      const result = await callRewrite({
        section: 'bullets',
        content: exp.bullets.join('\n'),
        context: `${exp.role} at ${exp.company}`,
      });
      update((prev) => {
        const nextExp = [...prev.experience];
        nextExp[expIndex] = { ...nextExp[expIndex], bullets: result.bullets };
        return { ...prev, experience: nextExp };
      });
    } catch {
      // ignore
    } finally {
      setRewritingBullets(null);
    }
  };

  // --- Manual save ---

  const handleManualSave = () => {
    if (dataRef.current) save(dataRef.current, titleRef.current);
  };

  const handleDownloadPdf = async () => {
    if (!cvData) return;
    setDownloadingPdf(true);
    try {
      const blob = await pdf(<CvPdfDocument cvData={cvData} />).toBlob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${(cvData.personal.name || 'CV').replace(/\s+/g, '_')}_CV.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch {
      // ignore for now
    } finally {
      setDownloadingPdf(false);
    }
  };

  // --- Loading / error states ---

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="h-8 w-8 text-indigo-600 animate-spin" />
      </div>
    );
  }

  if (error || !cvData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-5">
        <div className="text-center max-w-sm">
          <p className="text-lg font-semibold text-gray-900 mb-2">{error ?? 'Something went wrong'}</p>
          <Link to="/dashboard" className="inline-flex items-center gap-1.5 text-sm font-medium text-indigo-600 hover:text-indigo-700">
            <ArrowLeft className="h-4 w-4" /> Back to dashboard
          </Link>
        </div>
      </div>
    );
  }

  // --- Field input components ---

  const inputClass =
    'w-full px-3 py-2 text-sm rounded-lg border border-gray-200 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-shadow';

  const labelClass = 'block text-xs font-medium text-gray-500 mb-1';

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top bar */}
      <div className="sticky top-0 z-20 bg-white border-b border-gray-100">
        <div className="px-4 sm:px-6 h-14 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <Link
              to="/dashboard"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-indigo-600 transition-colors shrink-0"
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="hidden sm:inline">Dashboard</span>
            </Link>
            <div className="h-5 w-px bg-gray-200 hidden sm:block" />
            {editingTitle ? (
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                onBlur={() => {
                  setEditingTitle(false);
                  scheduleAutoSave(dataRef.current!, title);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    setEditingTitle(false);
                    scheduleAutoSave(dataRef.current!, title);
                  }
                }}
                autoFocus
                className="text-sm font-semibold text-gray-900 bg-transparent border-b border-indigo-400 outline-none min-w-0 flex-1"
              />
            ) : (
              <button
                onClick={() => setEditingTitle(true)}
                className="text-sm font-semibold text-gray-900 hover:text-indigo-600 transition-colors truncate flex items-center gap-1.5"
              >
                {title}
                <Pencil className="h-3 w-3 text-gray-300" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <SaveIndicator status={saveStatus} />
            <button
              onClick={handleManualSave}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Check className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Save</span>
            </button>
            <button
              onClick={handleDownloadPdf}
              disabled={downloadingPdf}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors shadow-sm disabled:opacity-50"
            >
              {downloadingPdf ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Download className="h-3.5 w-3.5" />}
              <span className="hidden sm:inline">PDF</span>
            </button>
          </div>
        </div>

        {/* Mobile tabs */}
        <div className="flex sm:hidden border-t border-gray-100">
          <button
            onClick={() => setMobileTab('edit')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-sm font-medium transition-colors ${
              mobileTab === 'edit' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-400'
            }`}
          >
            <Pencil className="h-3.5 w-3.5" /> Edit
          </button>
          <button
            onClick={() => setMobileTab('preview')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-sm font-medium transition-colors ${
              mobileTab === 'preview' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-400'
            }`}
          >
            <Eye className="h-3.5 w-3.5" /> Preview
          </button>
        </div>
      </div>

      {/* Two-panel layout */}
      <div className="flex">
        {/* Left: Preview (45%) */}
        <div
          className={`w-full sm:w-[45%] sm:border-r sm:border-gray-100 bg-gray-100/50 overflow-y-auto ${
            mobileTab === 'preview' ? 'block' : 'hidden'
          } sm:block`}
          style={{ height: 'calc(100vh - 3.5rem)' }}
        >
          <div className="p-5 sm:p-8">
            <CVPreview cvData={cvData} />
          </div>
        </div>

        {/* Right: Editor (55%) */}
        <div
          className={`w-full sm:w-[55%] overflow-y-auto bg-white ${
            mobileTab === 'edit' ? 'block' : 'hidden'
          } sm:block`}
          style={{ height: 'calc(100vh - 3.5rem)' }}
        >
          <div className="max-w-xl mx-auto py-4">
            {/* 1. Personal Info */}
            <CollapsibleSection title="Personal Info" defaultOpen>
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className={labelClass}>Full Name</label>
                  <input
                    className={inputClass}
                    value={cvData.personal.name ?? ''}
                    onChange={(e) => update((p) => ({ ...p, personal: { ...p.personal, name: e.target.value } }))}
                  />
                </div>
                <div className="col-span-2">
                  <label className={labelClass}>Role / Title</label>
                  <input
                    className={inputClass}
                    placeholder="e.g. Frontend Developer"
                    value={cvData.personal.role ?? ''}
                    onChange={(e) => update((p) => ({ ...p, personal: { ...p.personal, role: e.target.value } }))}
                  />
                </div>
                <div>
                  <label className={labelClass}>Email</label>
                  <input
                    type="email"
                    className={inputClass}
                    value={cvData.personal.email ?? ''}
                    onChange={(e) => update((p) => ({ ...p, personal: { ...p.personal, email: e.target.value } }))}
                  />
                </div>
                <div>
                  <label className={labelClass}>Phone</label>
                  <input
                    className={inputClass}
                    value={cvData.personal.phone ?? ''}
                    onChange={(e) => update((p) => ({ ...p, personal: { ...p.personal, phone: e.target.value } }))}
                  />
                </div>
                <div>
                  <label className={labelClass}>Location</label>
                  <input
                    className={inputClass}
                    value={cvData.personal.location ?? ''}
                    onChange={(e) => update((p) => ({ ...p, personal: { ...p.personal, location: e.target.value } }))}
                  />
                </div>
                <div>
                  <label className={labelClass}>LinkedIn</label>
                  <input
                    className={inputClass}
                    value={cvData.personal.linkedin ?? ''}
                    onChange={(e) => update((p) => ({ ...p, personal: { ...p.personal, linkedin: e.target.value } }))}
                  />
                </div>
              </div>
            </CollapsibleSection>

            {/* 2. Professional Summary */}
            <CollapsibleSection title="Professional Summary" defaultOpen>
              <textarea
                className={`${inputClass} resize-none`}
                rows={4}
                placeholder="Write a short professional summary…"
                value={cvData.summary ?? ''}
                onChange={(e) => update((p) => ({ ...p, summary: e.target.value }))}
              />
              <button
                onClick={handleRewriteSummary}
                disabled={rewritingSummary}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-indigo-600 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-colors disabled:opacity-50"
              >
                {rewritingSummary ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}
                Rewrite
              </button>
            </CollapsibleSection>

            {/* 3. Experience */}
            <CollapsibleSection title="Experience" defaultOpen>
              <div className="space-y-4">
                {cvData.experience.map((exp, i) => (
                  <div key={i} className="p-3 rounded-xl border border-gray-100 bg-gray-50/50 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-gray-400">Job {i + 1}</span>
                      <button
                        onClick={() => update((p) => ({ ...p, experience: p.experience.filter((_, j) => j !== i) }))}
                        className="text-gray-300 hover:text-red-500 transition-colors"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className={labelClass}>Company</label>
                        <input
                          className={inputClass}
                          value={exp.company}
                          onChange={(e) => update((p) => {
                            const next = [...p.experience];
                            next[i] = { ...next[i], company: e.target.value };
                            return { ...p, experience: next };
                          })}
                        />
                      </div>
                      <div>
                        <label className={labelClass}>Role</label>
                        <input
                          className={inputClass}
                          value={exp.role}
                          onChange={(e) => update((p) => {
                            const next = [...p.experience];
                            next[i] = { ...next[i], role: e.target.value };
                            return { ...p, experience: next };
                          })}
                        />
                      </div>
                      <div>
                        <label className={labelClass}>Start</label>
                        <input
                          className={inputClass}
                          placeholder="2021"
                          value={exp.start}
                          onChange={(e) => update((p) => {
                            const next = [...p.experience];
                            next[i] = { ...next[i], start: e.target.value };
                            return { ...p, experience: next };
                          })}
                        />
                      </div>
                      <div>
                        <label className={labelClass}>End</label>
                        <input
                          className={inputClass}
                          placeholder="Present"
                          value={exp.end}
                          onChange={(e) => update((p) => {
                            const next = [...p.experience];
                            next[i] = { ...next[i], end: e.target.value };
                            return { ...p, experience: next };
                          })}
                        />
                      </div>
                    </div>

                    {/* Bullets */}
                    <div>
                      <label className={labelClass}>Bullet Points</label>
                      <div className="space-y-1.5">
                        {exp.bullets.map((b, j) => (
                          <div key={j} className="flex items-start gap-1.5">
                            <span className="text-gray-400 text-sm mt-2 shrink-0">•</span>
                            <input
                              className={`${inputClass} flex-1`}
                              value={b}
                              onChange={(e) => update((p) => {
                                const next = [...p.experience];
                                const bullets = [...next[i].bullets];
                                bullets[j] = e.target.value;
                                next[i] = { ...next[i], bullets };
                                return { ...p, experience: next };
                              })}
                            />
                            <button
                              onClick={() => update((p) => {
                                const next = [...p.experience];
                                next[i] = { ...next[i], bullets: next[i].bullets.filter((_, k) => k !== j) };
                                return { ...p, experience: next };
                              })}
                              className="text-gray-300 hover:text-red-500 transition-colors mt-2 shrink-0"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                      <div className="flex items-center gap-2 mt-2">
                        <button
                          onClick={() => update((p) => {
                            const next = [...p.experience];
                            next[i] = { ...next[i], bullets: [...next[i].bullets, ''] };
                            return { ...p, experience: next };
                          })}
                          className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
                        >
                          <Plus className="h-3 w-3" /> Add bullet
                        </button>
                        <button
                          onClick={() => handleRewriteBullets(i)}
                          disabled={rewritingBullets === i}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-indigo-600 bg-indigo-50 rounded-md hover:bg-indigo-100 transition-colors disabled:opacity-50"
                        >
                          {rewritingBullets === i ? <Loader2 className="h-3 w-3 animate-spin" /> : <Sparkles className="h-3 w-3" />}
                          Rewrite bullets
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
                <button
                  onClick={() => update((p) => ({
                    ...p,
                    experience: [...p.experience, { company: '', role: '', start: '', end: '', bullets: [] }],
                  }))}
                  className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 text-sm font-medium text-gray-600 border border-dashed border-gray-200 rounded-lg hover:border-indigo-300 hover:text-indigo-600 transition-colors"
                >
                  <Plus className="h-4 w-4" /> Add job
                </button>
              </div>
            </CollapsibleSection>

            {/* 4. Education */}
            <CollapsibleSection title="Education">
              <div className="space-y-3">
                {cvData.education.map((edu, i) => (
                  <div key={i} className="p-3 rounded-xl border border-gray-100 bg-gray-50/50 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-gray-400">Entry {i + 1}</span>
                      <button
                        onClick={() => update((p) => ({ ...p, education: p.education.filter((_, j) => j !== i) }))}
                        className="text-gray-300 hover:text-red-500 transition-colors"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className={labelClass}>School</label>
                        <input
                          className={inputClass}
                          value={edu.school}
                          onChange={(e) => update((p) => {
                            const next = [...p.education];
                            next[i] = { ...next[i], school: e.target.value };
                            return { ...p, education: next };
                          })}
                        />
                      </div>
                      <div>
                        <label className={labelClass}>Degree</label>
                        <input
                          className={inputClass}
                          value={edu.degree}
                          onChange={(e) => update((p) => {
                            const next = [...p.education];
                            next[i] = { ...next[i], degree: e.target.value };
                            return { ...p, education: next };
                          })}
                        />
                      </div>
                      <div>
                        <label className={labelClass}>Start</label>
                        <input
                          className={inputClass}
                          placeholder="2018"
                          value={edu.start}
                          onChange={(e) => update((p) => {
                            const next = [...p.education];
                            next[i] = { ...next[i], start: e.target.value };
                            return { ...p, education: next };
                          })}
                        />
                      </div>
                      <div>
                        <label className={labelClass}>End</label>
                        <input
                          className={inputClass}
                          placeholder="2022"
                          value={edu.end}
                          onChange={(e) => update((p) => {
                            const next = [...p.education];
                            next[i] = { ...next[i], end: e.target.value };
                            return { ...p, education: next };
                          })}
                        />
                      </div>
                    </div>
                  </div>
                ))}
                <button
                  onClick={() => update((p) => ({
                    ...p,
                    education: [...p.education, { school: '', degree: '', start: '', end: '' }],
                  }))}
                  className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 text-sm font-medium text-gray-600 border border-dashed border-gray-200 rounded-lg hover:border-indigo-300 hover:text-indigo-600 transition-colors"
                >
                  <Plus className="h-4 w-4" /> Add education
                </button>
              </div>
            </CollapsibleSection>

            {/* 5. Skills */}
            <CollapsibleSection title="Skills">
              <div className="space-y-3">
                <TagInput
                  label="Technical Skills"
                  tags={cvData.skills.technical}
                  onChange={(tags) => update((p) => ({ ...p, skills: { ...p.skills, technical: tags } }))}
                  placeholder="e.g. React, Python, AWS"
                />
                <TagInput
                  label="Soft Skills"
                  tags={cvData.skills.soft}
                  onChange={(tags) => update((p) => ({ ...p, skills: { ...p.skills, soft: tags } }))}
                  placeholder="e.g. Leadership, Communication"
                />
              </div>
            </CollapsibleSection>

            {/* 6. Additional */}
            <CollapsibleSection title="Additional">
              <div className="space-y-3">
                {cvData.extras.map((extra, i) => (
                  <div key={i} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-gray-400">Item {i + 1}</span>
                      <button
                        onClick={() => update((p) => ({ ...p, extras: p.extras.filter((_, j) => j !== i) }))}
                        className="text-gray-300 hover:text-red-500 transition-colors"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className={labelClass}>Type</label>
                        <input
                          className={inputClass}
                          placeholder="Certification"
                          value={extra.type}
                          onChange={(e) => update((p) => {
                            const next = [...p.extras];
                            next[i] = { ...next[i], type: e.target.value };
                            return { ...p, extras: next };
                          })}
                        />
                      </div>
                      <div>
                        <label className={labelClass}>Title</label>
                        <input
                          className={inputClass}
                          value={extra.title}
                          onChange={(e) => update((p) => {
                            const next = [...p.extras];
                            next[i] = { ...next[i], title: e.target.value };
                            return { ...p, extras: next };
                          })}
                        />
                      </div>
                    </div>
                    <div>
                      <label className={labelClass}>Description</label>
                      <textarea
                        className={`${inputClass} resize-none`}
                        rows={2}
                        value={extra.description}
                        onChange={(e) => update((p) => {
                          const next = [...p.extras];
                          next[i] = { ...next[i], description: e.target.value };
                          return { ...p, extras: next };
                        })}
                      />
                    </div>
                  </div>
                ))}
                <button
                  onClick={() => update((p) => ({
                    ...p,
                    extras: [...p.extras, { type: '', title: '', description: '' }],
                  }))}
                  className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 text-sm font-medium text-gray-600 border border-dashed border-gray-200 rounded-lg hover:border-indigo-300 hover:text-indigo-600 transition-colors"
                >
                  <Plus className="h-4 w-4" /> Add item
                </button>
              </div>
            </CollapsibleSection>

            <div className="h-8" />
          </div>
        </div>
      </div>
    </div>
  );
}

function SaveIndicator({ status }: { status: SaveStatus }) {
  if (status === 'saving') {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs text-gray-400">
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
        <span className="hidden sm:inline">Saving…</span>
      </span>
    );
  }
  if (status === 'saved') {
    return (
      <span className="inline-flex items-center gap-1 text-xs text-green-600">
        <Check className="h-3.5 w-3.5" />
        <span className="hidden sm:inline">Saved</span>
      </span>
    );
  }
  if (status === 'error') {
    return <span className="text-xs text-red-500 hidden sm:inline">Save failed</span>;
  }
  return null;
}
