import React from 'react';
import { Link } from 'react-router-dom';
import { InterviewSetupForm } from '../components/setup/InterviewSetupForm.jsx';
import { Sparkles, Headphones, Mic, Shield } from 'lucide-react';

export function InterviewSetupPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-6">
      {/* Page Header */}
      <div className="text-center sm:text-left space-y-1">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-50 text-brand-700 text-xs font-bold">
          <Sparkles className="w-3.5 h-3.5 text-brand-600" />
          <span>New Session Configuration</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Setup Your Voice Mock Interview
        </h1>
        <p className="text-xs sm:text-sm text-slate-500">
          Coach Aria will construct a tailored question plan and conduct a realistic spoken interview.
        </p>
      </div>

      {/* Preparation Quick Advice */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 bg-slate-100/70 border border-slate-200 rounded-2xl text-xs">
        <div className="flex items-center gap-2 text-slate-700">
          <Headphones className="w-4 h-4 text-brand-600 flex-shrink-0" />
          <span>Earphones or headset recommended</span>
        </div>
        <div className="flex items-center gap-2 text-slate-700">
          <Mic className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span>
            Check your audio in{' '}
            <Link to="/mic-check" className="font-bold underline text-brand-600">
              Mic Check
            </Link>
          </span>
        </div>
        <div className="flex items-center gap-2 text-slate-700">
          <Shield className="w-4 h-4 text-indigo-600 flex-shrink-0" />
          <span>Accent is never judged or penalized</span>
        </div>
      </div>

      {/* Main Setup Form */}
      <InterviewSetupForm />
    </div>
  );
}

