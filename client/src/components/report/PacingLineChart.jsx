import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceArea
} from 'recharts';

export function PacingLineChart({ turns = [] }) {
  const data = turns
    .filter(t => t.words_per_minute)
    .map((turn, idx) => ({
      name: `Q${idx + 1}`,
      wpm: Number(turn.words_per_minute || 0),
      duration: turn.duration_seconds
    }));

  if (data.length === 0) return null;

  return (
    <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-bold text-slate-800">
          Pacing Cadence Across Turns (WPM)
        </h3>
        <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
          Target Band: 110 – 160 WPM
        </span>
      </div>

      <div className="w-full h-56 sm:h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 11 }} />
            <YAxis domain={[50, 220]} tick={{ fill: '#64748b', fontSize: 11 }} />
            {/* Ideal pace target band shaded area */}
            <ReferenceArea y1={110} y2={160} fill="#10b981" fillOpacity={0.08} />
            <Tooltip
              content={({ payload }) => {
                if (payload && payload.length) {
                  const entry = payload[0].payload;
                  return (
                    <div className="bg-slate-900 text-white text-xs px-3 py-2 rounded-xl shadow-lg">
                      <div className="font-bold">{entry.name}</div>
                      <div>Pace: <span className="font-mono font-bold text-emerald-400">{entry.wpm} WPM</span></div>
                      <div className="text-slate-400">Duration: {entry.duration}s</div>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Line
              type="monotone"
              dataKey="wpm"
              stroke="#4f46e5"
              strokeWidth={2.5}
              dot={{ r: 4, fill: '#4f46e5', strokeWidth: 2, stroke: '#ffffff' }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <p className="text-xs text-slate-500 mt-2">
        Speaking within 110-160 WPM ensures interviewers comfortably comprehend complex ideas without feeling rushed.
      </p>
    </div>
  );
}

