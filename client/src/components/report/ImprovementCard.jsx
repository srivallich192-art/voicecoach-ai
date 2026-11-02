import React from 'react';
import { Target, ArrowRightCircle } from 'lucide-react';

export function ImprovementCard({ priorityImprovements = [] }) {
  if (!priorityImprovements || priorityImprovements.length === 0) return null;

  return (
    <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-4">
      <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
        <Target className="w-5 h-5 text-brand-600" />
        <h3 className="text-lg font-bold text-slate-900">
          Priority Improvements & Drills
        </h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {priorityImprovements.map((item, idx) => (
          <div
            key={idx}
            className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 flex flex-col justify-between"
          >
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-brand-700">
                Area: {item.area}
              </div>
              <p className="text-xs text-slate-600 mt-1 font-medium">
                <strong className="text-slate-800">Why it matters:</strong> {item.why_it_matters}
              </p>
              <p className="text-xs text-slate-700 mt-1">
                <strong className="text-slate-800">How to fix:</strong> {item.how_to_fix}
              </p>
            </div>

            <div className="pt-2 border-t border-slate-200/80 mt-2">
              <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-800">
                <ArrowRightCircle className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                <span>Drill: {item.drill}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

