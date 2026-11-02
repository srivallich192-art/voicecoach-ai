import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

export function FillerWordBarChart({ turns = [] }) {
  // Aggregate fillers across all turns
  const counts = {};
  turns.forEach(turn => {
    if (turn.filler_breakdown && typeof turn.filler_breakdown === 'object') {
      Object.entries(turn.filler_breakdown).forEach(([word, count]) => {
        counts[word] = (counts[word] || 0) + Number(count);
      });
    }
  });

  const data = Object.entries(counts)
    .map(([word, count]) => ({ word, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 8); // Top 8 fillers

  if (data.length === 0) {
    return (
      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm flex flex-col items-center justify-center min-h-[220px] text-center">
        <h3 className="text-sm font-bold text-slate-800 self-start mb-2">Filler Word Analysis</h3>
        <p className="text-sm text-emerald-600 font-bold">Zero Fillers Detected! 🎉</p>
        <p className="text-xs text-slate-500 max-w-xs mt-1">
          Your spoken delivery was exceptionally clean and confident without conversational crutches.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
      <h3 className="text-sm font-bold text-slate-800 mb-2">
        Filler Words Frequency
      </h3>
      <div className="w-full h-56 sm:h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
            <XAxis dataKey="word" tick={{ fill: '#64748b', fontSize: 11 }} />
            <YAxis allowDecimals={false} tick={{ fill: '#64748b', fontSize: 11 }} />
            <Tooltip
              content={({ payload }) => {
                if (payload && payload.length) {
                  const entry = payload[0].payload;
                  return (
                    <div className="bg-slate-900 text-white text-xs px-2.5 py-1.5 rounded-lg shadow-md">
                      <span className="font-semibold">"{entry.word}": </span>
                      <span className="font-mono font-bold text-amber-400">{entry.count} times</span>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Bar dataKey="count" fill="#f59e0b" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <p className="text-xs text-slate-500 mt-2">
        Replacing filler words with deliberate 1-second silent pauses projects authority and composed presence.
      </p>
    </div>
  );
}

