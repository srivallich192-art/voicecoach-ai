import React from 'react';
import { ScoreBadge } from '../common/ScoreBadge.jsx';
import { getScoreBadge } from '../../lib/utils.js';
import { Award, Volume2, Calendar, Briefcase, Zap } from 'lucide-react';

export function ReportHeader({
  session,
  report,
  onSpeakSummary,
  isSpeakingSummary = false
}) {
  const overallScore = report?.overall_score || 0;
  const badge = getScoreBadge(overallScore);
  const readiness = report?.report?.readiness_level?.replace('_', ' ') || 'In Progress';

  return (
    <div className="bg-gradient-to-br from-white to-slate-50 rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-6 border-b border-slate-200">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-brand-100 text-brand-700 text-xs font-bold uppercase tracking-wider">
              Interview Evaluation
            </span>
            <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold uppercase tracking-wider capitalize">
              {readiness}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            {session?.role_title || 'Mock Interview'}
          </h1>
          <div className="flex flex-wrap items-center gap-4 text-xs font-medium text-slate-500 pt-1">
            <span className="flex items-center gap-1.5">
              <Briefcase className="w-3.5 h-3.5" />
              {session?.role_domain?.replace('_', ' ')}
            </span>
            <span>•</span>
            <span className="flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-amber-500" />
              {session?.difficulty} level
            </span>
            <span>•</span>
            <span className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" />
              {new Date(session?.created_at || Date.now()).toLocaleDateString()}
            </span>
          </div>
        </div>

        {/* Overall Score Badge */}
        <div className="flex items-center gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex flex-col text-right">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Overall Rating</span>
            <span className="text-xs font-semibold text-brand-600">{badge.label}</span>
          </div>
          <div className="w-16 h-16 rounded-2xl bg-brand-50 border-2 border-brand-200 flex flex-col items-center justify-center">
            <span className="text-2xl font-black font-mono text-brand-700 leading-none">{overallScore}</span>
            <span className="text-[10px] font-bold text-slate-400">/ 100</span>
          </div>
        </div>
      </div>

      {/* Summary Narrative & Spoken Button */}
      <div className="mt-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <p className="text-sm text-slate-700 leading-relaxed font-medium">
          {report?.report?.summary || 'Session coaching summary prepared by Coach Aria.'}
        </p>

        {report?.report?.spoken_summary && onSpeakSummary && (
          <button
            type="button"
            onClick={() => onSpeakSummary(report.report.spoken_summary, session?.feedback_language || 'English')}
            disabled={isSpeakingSummary}
            className={`flex-shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-xl border text-xs font-bold transition-all shadow-sm ${
              isSpeakingSummary
                ? 'bg-brand-50 border-brand-300 text-brand-700 animate-pulse'
                : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50'
            }`}
          >
            <Volume2 className="w-4 h-4 text-brand-600" />
            <span>{isSpeakingSummary ? 'Coach Speaking...' : 'Listen to Summary'}</span>
          </button>
        )}
      </div>
    </div>
  );
}

