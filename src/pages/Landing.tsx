import { Link } from 'react-router-dom';
import { Mic, ArrowRight, CircleCheck as CheckCircle2 } from 'lucide-react';

const features = [
  'AI-guided voice interview to capture your experience',
  'Professionally formatted CV generated automatically',
  'Shareable link to send to recruiters in one click',
];

export default function Landing() {
  return (
    <div className="bg-white">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 h-[480px] w-[680px] rounded-full bg-indigo-50 blur-3xl opacity-70" />
        </div>

        <div className="max-w-4xl mx-auto px-5 sm:px-8 pt-20 pb-24 sm:pt-28 sm:pb-32 text-center">
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-medium mb-6">
            <span className="h-1.5 w-1.5 rounded-full bg-indigo-600" />
            AI-powered CV builder
          </span>

          <h1 className="text-4xl sm:text-6xl font-semibold tracking-tight text-gray-900 leading-[1.1]">
            Your CV, Written by AI in{' '}
            <span className="text-indigo-600">5 Minutes</span>
          </h1>

          <p className="mt-6 text-lg sm:text-xl text-gray-500 max-w-2xl mx-auto leading-relaxed">
            Answer a few quick questions in a guided voice interview. CVoice turns
            your story into a polished, recruiter-ready CV.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              to="/login"
              className="group inline-flex items-center gap-2 px-6 py-3.5 bg-indigo-600 text-white text-base font-medium rounded-xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-600/20 hover:shadow-indigo-600/30"
            >
              Start for Free
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
            <Link
              to="/interview"
              className="inline-flex items-center gap-2 px-6 py-3.5 text-gray-700 text-base font-medium rounded-xl hover:bg-gray-50 transition-colors border border-gray-200"
            >
              See how it works
            </Link>
          </div>

          <p className="mt-5 text-sm text-gray-400">
            No credit card required. Free to get started.
          </p>
        </div>
      </section>

      {/* Features */}
      <section className="border-t border-gray-100">
        <div className="max-w-5xl mx-auto px-5 sm:px-8 py-16 sm:py-20">
          <div className="grid gap-6 sm:grid-cols-3">
            {features.map((f) => (
              <div
                key={f}
                className="flex items-start gap-3 p-5 rounded-2xl border border-gray-100 hover:border-indigo-100 hover:bg-indigo-50/30 transition-colors"
              >
                <CheckCircle2 className="h-5 w-5 text-indigo-600 mt-0.5 shrink-0" />
                <p className="text-sm text-gray-600 leading-relaxed">{f}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA band */}
      <section className="border-t border-gray-100 bg-gray-50/50">
        <div className="max-w-4xl mx-auto px-5 sm:px-8 py-16 sm:py-20 text-center">
          <div className="flex items-center justify-center mb-5">
            <span className="flex items-center justify-center h-12 w-12 rounded-2xl bg-indigo-600 text-white">
              <Mic className="h-6 w-6" />
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-semibold text-gray-900">
            Ready to build your CV?
          </h2>
          <p className="mt-3 text-gray-500 max-w-md mx-auto">
            Join thousands of professionals who let AI do the heavy lifting.
          </p>
          <Link
            to="/login"
            className="mt-8 inline-flex items-center gap-2 px-6 py-3.5 bg-indigo-600 text-white text-base font-medium rounded-xl hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-600/20"
          >
            Start for Free
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}
