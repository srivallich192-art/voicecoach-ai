import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import {
  Mic,
  Sparkles,
  ShieldCheck,
  Zap,
  TrendingUp,
  Globe2,
  CheckCircle2,
  ArrowRight,
  Headphones,
  Award,
  Layers
} from 'lucide-react';
import { ROLE_DOMAINS } from '@shared/constants.js';

export function LandingPage() {
  const { user } = useAuth();

  return (
    <div className="flex flex-col space-y-20 pb-20">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 sm:pt-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full text-center">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-50 border border-brand-200 text-brand-700 text-xs sm:text-sm font-bold mb-6">
          <Sparkles className="w-4 h-4 text-brand-600 animate-spin-subtle" />
          <span>Real-Time Voice Coaching for First-Time Job Seekers & Students</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-extrabold text-slate-900 tracking-tight max-w-4xl mx-auto leading-tight">
          Master Job Interviews by <span className="bg-clip-text text-transparent bg-gradient-to-r from-brand-600 to-indigo-600">Actually Speaking</span> Them
        </h1>

        <p className="mt-6 text-base sm:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
          Practice realistic spoken interviews with <strong>Coach Aria</strong>. Get instant analysis on filler words, speaking cadence, tone, and STAR answer structure—with zero accent penalty.
        </p>

        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            to={user ? '/dashboard' : '/signup'}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-4 bg-brand-600 hover:bg-brand-700 text-white rounded-2xl text-base font-bold shadow-lg shadow-brand-500/25 hover:shadow-xl hover:shadow-brand-500/30 transition-all active:scale-95"
          >
            <span>{user ? 'Go to Dashboard' : 'Start Mock Interview Free'}</span>
            <ArrowRight className="w-5 h-5" />
          </Link>
          <Link
            to="/mic-check"
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-4 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 rounded-2xl text-base font-semibold transition-colors"
          >
            <Headphones className="w-5 h-5 text-slate-500" />
            <span>Test Microphone & Audio</span>
          </Link>
        </div>

        {/* Trust Badges */}
        <div className="mt-12 flex flex-wrap items-center justify-center gap-6 sm:gap-10 text-xs font-semibold text-slate-500">
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            <span>Intelligibility-First (No Accent Bias)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-brand-500" />
            <span>Voice Privacy By Default</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Globe2 className="w-4 h-4 text-indigo-500" />
            <span>11 Spoken Feedback Languages</span>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="text-center mb-12">
          <h2 className="text-xs font-bold uppercase tracking-wider text-brand-600">Simple 3-Step Process</h2>
          <h3 className="text-3xl font-extrabold text-slate-900 mt-1">How VoiceCoach AI Works</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Step 1 */}
          <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center font-bold text-lg mb-6">
                1
              </div>
              <h4 className="text-lg font-bold text-slate-900 mb-2">Pick Your Role & Setup</h4>
              <p className="text-sm text-slate-600 leading-relaxed">
                Choose from presets across Software, Business, Healthcare, Sales, and Fresher campus rounds—or paste your specific target job description.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-slate-100 text-xs font-semibold text-slate-400">
              Technical, Behavioral & Situational
            </div>
          </div>

          {/* Step 2 */}
          <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-lg mb-6">
                2
              </div>
              <h4 className="text-lg font-bold text-slate-900 mb-2">Speak Your Answers Live</h4>
              <p className="text-sm text-slate-600 leading-relaxed">
                Coach Aria speaks interview questions aloud. You reply with your voice. Follow-up questions dynamically probe what you actually said.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-slate-100 text-xs font-semibold text-slate-400">
              Silence auto-stop • Level visualizer
            </div>
          </div>

          {/* Step 3 */}
          <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-lg mb-6">
                3
              </div>
              <h4 className="text-lg font-bold text-slate-900 mb-2">Get Actionable Coaching</h4>
              <p className="text-sm text-slate-600 leading-relaxed">
                Receive instant per-answer metrics (WPM, fillers, STAR structure) and a comprehensive final report with model rewritten answers and a 7-day practice plan.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-slate-100 text-xs font-semibold text-slate-400">
              Listen to tips in your native language
            </div>
          </div>
        </div>
      </section>

      {/* Target Domains Showcase */}
      <section className="bg-slate-100/70 py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500">Industry-Tailored Questions</h2>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">Ready for Any Career Track</h3>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {ROLE_DOMAINS.map((domain) => (
              <div
                key={domain.id}
                className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-sm text-center flex flex-col items-center justify-center hover:border-brand-300 transition-colors"
              >
                <div className="text-sm font-bold text-slate-800">{domain.name}</div>
                <div className="text-xs text-slate-500 mt-1">{domain.roles.length} roles</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Principles Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="bg-gradient-to-br from-brand-900 to-indigo-950 rounded-3xl p-8 sm:p-14 text-white shadow-xl">
          <div className="max-w-3xl">
            <span className="text-xs font-bold uppercase tracking-wider text-brand-300">Our Core Philosophy</span>
            <h3 className="text-3xl sm:text-4xl font-extrabold mt-2 tracking-tight">
              Honest Feedback Without Accent Discrimination
            </h3>
            <p className="text-brand-100 mt-4 leading-relaxed text-sm sm:text-base">
              Non-native English speakers frequently encounter interview anxiety not because of their competence, but because of pacing, filler words, or uncertainty with STAR response frameworks. Coach Aria strictly evaluates <strong>intelligibility</strong>, <strong>structure</strong>, and <strong>substance</strong>. Your authentic voice and accent are respected.
            </p>

            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                to={user ? '/interview/new' : '/signup'}
                className="px-6 py-3.5 bg-white text-slate-900 hover:bg-brand-50 rounded-xl text-sm font-bold shadow-md transition-all"
              >
                Start Practicing Today
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

