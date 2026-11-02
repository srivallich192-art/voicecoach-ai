import React from 'react';
import { Sparkles, CheckCheck } from 'lucide-react';

export function RewrittenAnswerCard({ rewrittenAnswers = [] }) {
  if (!rewrittenAnswers || rewrittenAnswers.length === 0) return null;

  return (
    <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-4">
      <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
        <Sparkles className="w-5 h-5 text-amber-500" />
        <div>
          <h3 className="text-lg font-bold text-slate-900">
            Model Rewritten Answers (Your Content, Polished)
          </h3>
          <p className="text-xs text-slate-500">
            Compare your core ideas with a structured, executive-level delivery.
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {rewrittenAnswers.map((item, idx) => (
          <div key={idx} className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-600">
                Question {item.turn_index + 1} Rewrite
              </span>
            </div>

            <div className="text-xs text-slate-600 italic bg-white p-3 rounded-xl border border-slate-200">
              <strong className="not-italic text-slate-700">Original Gist:</strong> "{item.original_gist}"
            </div>

            <div className="p-4 bg-brand-50/60 border border-brand-200 rounded-xl space-y-1">
              <div className="flex items-center gap-1.5 text-xs font-bold text-brand-800">
                <CheckCheck className="w-4 h-4 text-brand-600" />
                <span>Coach Aria's Spoken Model Delivery:</span>
              </div>
              <p className="text-xs text-slate-800 leading-relaxed font-sans">
                "{item.improved_version}"
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

