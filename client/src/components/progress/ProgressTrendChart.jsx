import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';

export function ProgressTrendChart({ timeline = [] }) {
  if (!timeline || timeline.length === 0) return null;

  const chartData = timeline.map((session, index) => ({
    name: `Session ${index + 1}`,
    date: new Date(session.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
    score: session.overallScore || 0,
    wpm: Math.round(session.wpm || 0),
    fillers: session.fillers || 0,
    role: session.roleTitle
  }));

  return (
    <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-100">
        <div>
          <h3 className="text-lg font-bold text-slate-900">
            Progress Trends Over Time
          </h3>
          <p className="text-xs text-slate-500">
            Evolution of your overall interview score, speaking pace, and filler words.
          </p>
        </div>
      </div>

      <div className="w-full h-72 sm:h-80">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 20, right: 20, left: -20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 11 }} />
            <YAxis tick={{ fill: '#64748b', fontSize: 11 }} />
            <Tooltip
              content={({ payload }) => {
                if (payload && payload.length) {
                  const data = payload[0].payload;
                  return (
                    <div className="bg-slate-900 text-white text-xs p-3 rounded-xl shadow-xl space-y-1">
                      <div className="font-bold text-slate-300">{data.name} ({data.date})</div>
                      <div className="text-slate-400 text-[11px] truncate">{data.role}</div>
                      <div className="pt-1 flex items-center justify-between gap-4 font-mono">
                        <span className="text-brand-400">Score: {data.score}/100</span>
                        <span className="text-emerald-400">Pace: {data.wpm} WPM</span>
                        <span className="text-amber-400">Fillers: {data.fillers}</span>
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Legend wrapperStyle={{ fontSize: 12, paddingTop: 12 }} />
            <Line
              type="monotone"
              name="Overall Score (/100)"
              dataKey="score"
              stroke="#6366f1"
              strokeWidth={3}
              dot={{ r: 4 }}
            />
            <Line
              type="monotone"
              name="Speaking Pace (WPM)"
              dataKey="wpm"
              stroke="#10b981"
              strokeWidth={2}
              strokeDasharray="4 4"
              dot={{ r: 3 }}
            />
            <Line
              type="monotone"
              name="Total Fillers"
              dataKey="fillers"
              stroke="#f59e0b"
              strokeWidth={2}
              dot={{ r: 3 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

