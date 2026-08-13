import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { ArrowRight, ArrowLeft, Loader as Loader2, Sparkles, MessageSquare } from 'lucide-react';

interface Question {
  key: string;
  prompt: string;
  hint?: string;
}

const QUESTIONS: Question[] = [
  {
    key: 'name_role',
    prompt: "What's your name, and what kind of job are you looking for?",
    hint: 'e.g. "Sarah Chen, Frontend Developer"',
  },
  {
    key: 'current_role',
    prompt: "What's your most recent job title and company? (If you're a fresh graduate, say 'Fresh Graduate' and your degree)",
    hint: 'e.g. "Software Engineer at Google" or "Fresh Graduate, B.S. Computer Science"',
  },
  {
    key: 'current_duties',
    prompt: "Describe what you actually did day-to-day in that role. Don't worry about making it sound professional — just talk naturally.",
    hint: 'Just write like you\'re telling a friend what your workday looks like',
  },
  {
    key: 'current_achievement',
    prompt: "What's one thing you achieved or improved in that role? Numbers help if you have them.",
    hint: 'e.g. "Reduced page load time by 40% by optimizing images"',
  },
  {
    key: 'previous_role',
    prompt: "Did you have any job or internship before that? Describe it briefly. (Type 'None' if not applicable)",
    hint: 'Keep it short — one or two sentences is fine',
  },
  {
    key: 'skills',
    prompt: 'What are you best at? List your technical skills, tools, software, or languages you know.',
    hint: 'e.g. "React, TypeScript, Python, Figma, AWS"',
  },
  {
    key: 'education',
    prompt: 'Where did you study, what did you study, and when did you graduate?',
    hint: 'e.g. "B.S. Computer Science, UC Berkeley, 2022"',
  },
  {
    key: 'extras',
    prompt: "Anything else worth including? Courses, certifications, freelance projects, volunteer work? (Type 'None' if not applicable)",
    hint: 'This is optional — feel free to type "None"',
  },
  {
    key: 'target_next',
    prompt: 'Last one — in one sentence, describe the kind of role and company you\'re looking for next.',
    hint: 'e.g. "A senior frontend role at a fast-growing startup"',
  },
];

const MIN_WORDS = 3;

function wordCount(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

export default function Interview() {
  const navigate = useNavigate();
  const { session } = useAuth();
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [currentText, setCurrentText] = useState('');
  const [building, setBuilding] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const current = QUESTIONS[step];
  const isLast = step === QUESTIONS.length - 1;
  const progress = ((step + 1) / QUESTIONS.length) * 100;
  const words = wordCount(currentText);
  const canProceed = words >= MIN_WORDS;

  useEffect(() => {
    setCurrentText(answers[current.key] ?? '');
    setError(null);
  }, [step]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (textareaRef.current && !building) {
      textareaRef.current.focus();
    }
  }, [step, building]);

  const handleNext = () => {
    if (!canProceed) return;

    setAnswers((prev) => ({ ...prev, [current.key]: currentText }));

    if (!isLast) {
      setStep((s) => s + 1);
    } else {
      buildCv();
    }
  };

  const buildCv = async () => {
    const finalAnswers = { ...answers, [current.key]: currentText };
    setBuilding(true);
    setError(null);

    try {
      const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-cv`;
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session?.access_token ?? import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          apikey: import.meta.env.VITE_SUPABASE_ANON_KEY,
        },
        body: JSON.stringify({
          answers: finalAnswers,
          user_id: session?.user?.id ?? null,
        }),
      });

      if (!response.ok) {
        const errBody = await response.json().catch(() => ({}));
        throw new Error(errBody.error ?? `Request failed (${response.status})`);
      }

      const data = await response.json();
      if (!data.id) {
        throw new Error('Invalid response from server');
      }

      navigate(`/cv/${data.id}`);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Something went wrong';
      setError(message);
      setBuilding(false);
    }
  };

  const handleBack = () => {
    if (step > 0) {
      setAnswers((prev) => ({ ...prev, [current.key]: currentText }));
      setStep((s) => s - 1);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      if (canProceed) handleNext();
    }
  };

  if (building) {
    return (
      <div className="min-h-[calc(100vh-4rem)] bg-gray-50/50 flex items-center justify-center px-5">
        <div className="text-center max-w-sm">
          <div className="relative inline-flex items-center justify-center mb-6">
            <span className="absolute h-20 w-20 rounded-full bg-indigo-100 animate-ping opacity-60" />
            <span className="relative flex items-center justify-center h-20 w-20 rounded-full bg-indigo-600 text-white shadow-lg shadow-indigo-600/30">
              <Loader2 className="h-9 w-9 animate-spin" />
            </span>
          </div>
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">
            Building your CV…
          </h2>
          <p className="text-sm text-gray-500 leading-relaxed">
            Our AI is crafting a polished, recruiter-ready CV from your answers.
            This usually takes a few seconds.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gray-50/50">
      <div className="max-w-2xl mx-auto px-5 sm:px-8 py-10 sm:py-12">
        {/* Progress */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-gray-500">
              Question {step + 1} of {QUESTIONS.length}
            </span>
            <span className="text-sm font-medium text-indigo-600">
              {Math.round(progress)}%
            </span>
          </div>
          <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
            <div
              className="h-full bg-indigo-600 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Question card */}
        <div key={step} className="animate-fade-in-up">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sm:p-8">
            <div className="flex items-start gap-3 mb-6">
              <span className="flex items-center justify-center h-10 w-10 rounded-xl bg-indigo-50 text-indigo-600 shrink-0">
                <MessageSquare className="h-5 w-5" />
              </span>
              <div>
                <span className="block text-xs font-semibold uppercase tracking-wide text-indigo-500 mb-1">
                  Question {step + 1}
                </span>
                <h2 className="text-lg sm:text-xl font-semibold text-gray-900 leading-snug">
                  {current.prompt}
                </h2>
              </div>
            </div>

            {current.hint && (
              <p className="text-sm text-gray-400 mb-4 pl-13 ml-13">
                {current.hint}
              </p>
            )}

            <textarea
              ref={textareaRef}
              value={currentText}
              onChange={(e) => setCurrentText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type your answer here…"
              rows={5}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-shadow resize-none"
            />

            <div className="flex items-center justify-between mt-3">
              <span className={`text-xs ${words >= MIN_WORDS ? 'text-green-600' : 'text-gray-400'}`}>
                {words === 0
                  ? `${MIN_WORDS} words minimum`
                  : words >= MIN_WORDS
                    ? 'Looks good!'
                    : `${MIN_WORDS - words} more word${MIN_WORDS - words === 1 ? '' : 's'} needed`}
              </span>
              <span className="text-xs text-gray-400 hidden sm:inline">
                ⌘ + Enter to submit
              </span>
            </div>

            {error && (
              <div className="mt-4 text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3.5 py-2.5">
                {error}
              </div>
            )}

            <div className="flex items-center justify-between mt-6 pt-6 border-t border-gray-50">
              <button
                onClick={handleBack}
                disabled={step === 0}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium text-gray-500 hover:text-gray-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                Back
              </button>

              {isLast ? (
                <button
                  onClick={handleNext}
                  disabled={!canProceed}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white text-sm font-medium rounded-xl hover:bg-indigo-700 transition-colors shadow-sm shadow-indigo-600/20 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Sparkles className="h-4 w-4" />
                  Build My CV
                  <ArrowRight className="h-4 w-4" />
                </button>
              ) : (
                <button
                  onClick={handleNext}
                  disabled={!canProceed}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white text-sm font-medium rounded-xl hover:bg-indigo-700 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                  <ArrowRight className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Chat-style answer history */}
        {step > 0 && (
          <div className="mt-6 space-y-2">
            {QUESTIONS.slice(0, step).map((q, i) => {
              const ans = answers[q.key];
              if (!ans) return null;
              return (
                <div key={q.key} className="flex gap-3 items-start opacity-60">
                  <span className="flex items-center justify-center h-7 w-7 rounded-lg bg-gray-100 text-gray-400 text-xs font-medium shrink-0 mt-0.5">
                    {i + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-gray-400 truncate">{q.prompt}</p>
                    <p className="text-sm text-gray-600 mt-0.5 line-clamp-2">{ans}</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
