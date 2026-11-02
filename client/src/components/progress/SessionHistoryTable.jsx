import React from 'react';
import { Link } from 'react-router-dom';
import { ScoreBadge } from '../common/ScoreBadge.jsx';
import { formatDate } from '../../lib/utils.js';
import { Play, ArrowRight, Trash2, Eye } from 'lucide-react';

export function SessionHistoryTable({ sessions = [], onDeleteSession }) {
  if (!sessions || sessions.length === 0) {
    return (
      <div className="bg-white rounded-3xl border border-slate-200 p-8 text-center text-slate-500 text-sm">
        No completed interviews found yet. Start your first session!
      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-bold">
            <tr>
              <th className="py-3.5 px-6">Role & Domain</th>
              <th className="py-3.5 px-4">Type & Difficulty</th>
              <th className="py-3.5 px-4">Date</th>
              <th className="py-3.5 px-4 text-center">Score</th>
              <th className="py-3.5 px-4 text-center">Metrics</th>
              <th className="py-3.5 px-6 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-medium">
            {sessions.map((session) => {
              const report = Array.isArray(session.session_reports)
                ? session.session_reports[0]
                : session.session_reports;

              const isCompleted = session.status === 'completed';

              return (
                <tr key={session.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-4 px-6">
                    <div className="font-bold text-slate-900 text-sm">{session.role_title}</div>
                    <div className="text-slate-500 capitalize">{session.role_domain?.replace('_', ' ')}</div>
                  </td>

                  <td className="py-4 px-4">
                    <div className="capitalize text-slate-700">{session.interview_type}</div>
                    <div className="text-slate-400 capitalize">{session.difficulty} level</div>
                  </td>

                  <td className="py-4 px-4 text-slate-500">
                    {formatDate(session.created_at)}
                  </td>

                  <td className="py-4 px-4 text-center">
                    {report?.overall_score ? (
                      <ScoreBadge score={report.overall_score} size="sm" />
                    ) : (
                      <span className="px-2 py-0.5 rounded text-[11px] bg-slate-100 text-slate-500 font-bold uppercase">
                        {session.status}
                      </span>
                    )}
                  </td>

                  <td className="py-4 px-4 text-center font-mono text-slate-600">
                    {report ? (
                      <div>
                        <span>{report.avg_wpm ? `${Math.round(report.avg_wpm)} WPM` : '–'}</span>
                        <span className="text-slate-300 mx-1">|</span>
                        <span>{report.total_fillers ?? 0} fillers</span>
                      </div>
                    ) : (
                      <span className="text-slate-300">–</span>
                    )}
                  </td>

                  <td className="py-4 px-6 text-right space-x-2">
                    {isCompleted ? (
                      <Link
                        to={`/interview/${session.id}/report`}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-brand-600 font-bold transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Report</span>
                      </Link>
                    ) : (
                      <Link
                        to={`/interview/${session.id}`}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-brand-600 hover:bg-brand-700 text-white font-bold transition-colors"
                      >
                        <Play className="w-3.5 h-3.5 fill-current" />
                        <span>Resume</span>
                      </Link>
                    )}

                    {onDeleteSession && (
                      <button
                        type="button"
                        onClick={() => onDeleteSession(session.id)}
                        title="Delete interview session"
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                        aria-label="Delete session"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

