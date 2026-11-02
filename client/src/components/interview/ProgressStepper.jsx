import React from 'react';

export function ProgressStepper({ current = 1, total = 5, isFollowUp = false }) {
  const percent = Math.min(100, Math.round(((current - 1) / total) * 100));

  return (
    <div className="w-full space-y-2">
      <div className="flex items-center justify-between text-xs font-bold text-slate-600">
        <span className="flex items-center gap-1.5">
          <span>Question {current} of {total}</span>
          {isFollowUp && (
            <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] uppercase font-bold">
              Follow-up
            </span>
          )}
        </span>
        <span className="text-slate-400 font-mono">{percent}% completed</span>
      </div>

      <div className="w-full h-2 rounded-full bg-slate-200 overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-brand-600 to-indigo-500 rounded-full transition-all duration-500"
          style={{ width: `${Math.max(5, percent)}%` }}
        />
      </div>
    </div>
  );
}

