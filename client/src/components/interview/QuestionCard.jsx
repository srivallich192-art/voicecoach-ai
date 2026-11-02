import React from 'react';
import { Volume2, HelpCircle, CornerDownRight, MessageSquareQuote } from 'lucide-react';

export function QuestionCard({
  questionText,
  topic,
  kind = 'main',
  onReplay,
  isSpeaking = false,
  showCaptions = true,
  onToggleCaptions
}) {
  const isFollowUp = kind === 'follow_up';

  return (
    <div className={`w-full rounded-3xl border p-6 sm:p-8 transition-all shadow-sm ${
      isFollowUp
        ? 'bg-amber-50/60 border-amber-200'
        : 'bg-white border-slate-200'
    }`}>
      {/* Category & Kind Pill */}
      <div className="flex items-center justify-between gap-2 mb-4">
        <div className="flex items-center gap-2">
          {isFollowUp ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-300">
              <CornerDownRight className="w-3.5 h-3.5" />
              Follow-Up Question
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-brand-50 text-brand-700 border border-brand-200">
              <HelpCircle className="w-3.5 h-3.5" />
              Main Interview Question
            </span>
          )}

          {topic && (
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              • {topic}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onToggleCaptions}
            className={`text-xs px-2.5 py-1 rounded-lg border font-semibold transition-colors ${
              showCaptions
                ? 'bg-slate-100 border-slate-300 text-slate-700'
                : 'bg-white border-slate-200 text-slate-400 hover:text-slate-600'
            }`}
            title="Toggle question captions on/off"
          >
            {showCaptions ? 'Captions ON' : 'Captions OFF'}
          </button>

          <button
            type="button"
            onClick={onReplay}
            disabled={isSpeaking}
            title="Replay spoken question"
            className="flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 disabled:opacity-50 transition-colors"
            aria-label="Replay question audio"
          >
            <Volume2 className="w-3.5 h-3.5 text-brand-600" />
            <span>Replay</span>
          </button>
        </div>
      </div>

      {/* Spoken Question Text */}
      {showCaptions ? (
        <div className="relative">
          <MessageSquareQuote className="w-6 h-6 text-brand-400/40 absolute -left-2 -top-2 -z-0" />
          <h2 className="relative z-10 text-xl sm:text-2xl font-bold text-slate-900 leading-snug tracking-tight">
            "{questionText}"
          </h2>
        </div>
      ) : (
        <div className="py-4 text-center text-sm font-medium text-slate-400 italic">
          [ Captions hidden for realistic listening practice. Click "Captions ON" above if needed. ]
        </div>
      )}
    </div>
  );
}

