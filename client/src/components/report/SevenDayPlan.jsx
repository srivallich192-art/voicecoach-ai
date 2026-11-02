import React from 'react';
import { CalendarCheck, Clock } from 'lucide-react';

export function SevenDayPlan({ plan = [] }) {
  if (!plan || plan.length === 0) return null;

  return (
    <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-4">
      <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
        <CalendarCheck className="w-5 h-5 text-brand-600" />
        <div>
          <h3 className="text-lg font-bold text-slate-900">
            7-Day Actionable Spoken Practice Plan
          </h3>
          <p className="text-xs text-slate-500">
            Micro-drills designed for 15–20 minutes daily practice.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {plan.map((dayItem) => (
          <div
            key={dayItem.day}
            className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col justify-between space-y-3"
          >
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-brand-100 text-brand-800">
                  Day {dayItem.day}
                </span>
                <span className="flex items-center gap-1 text-[11px] font-semibold text-slate-500">
                  <Clock className="w-3 h-3" />
                  {dayItem.minutes} mins
                </span>
              </div>
              <h4 className="text-xs font-bold text-slate-900 mt-2">
                {dayItem.focus}
              </h4>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                {dayItem.activity}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

