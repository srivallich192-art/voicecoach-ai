import React from 'react';
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip
} from 'recharts';

export function CategoryRadarChart({ categoryScores }) {
  if (!categoryScores) return null;

  const data = [
    { subject: 'Clarity', score: categoryScores.clarity || 0, fullMark: 100 },
    { subject: 'Structure', score: categoryScores.structure || 0, fullMark: 100 },
    { subject: 'Relevance', score: categoryScores.relevance || 0, fullMark: 100 },
    { subject: 'Confidence', score: categoryScores.confidence_tone || 0, fullMark: 100 },
    { subject: 'Pacing', score: categoryScores.pacing || 0, fullMark: 100 },
    { subject: 'Vocabulary', score: categoryScores.vocabulary_grammar || 0, fullMark: 100 }
  ];

  return (
    <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm flex flex-col items-center">
      <h3 className="text-sm font-bold text-slate-800 self-start mb-2">
        Competency Breakdown (Radar)
      </h3>
      <div className="w-full h-64 sm:h-72">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart cx="50%" cy="50%" outerRadius="75%" data={data}>
            <PolarGrid stroke="#e2e8f0" />
            <PolarAngleAxis dataKey="subject" tick={{ fill: '#475569', fontSize: 11, fontWeight: 600 }} />
            <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#cbd5e1" />
            <Tooltip
              content={({ payload }) => {
                if (payload && payload.length) {
                  const entry = payload[0].payload;
                  return (
                    <div className="bg-slate-900 text-white text-xs px-2.5 py-1.5 rounded-lg shadow-md">
                      <span className="font-semibold">{entry.subject}: </span>
                      <span className="font-mono">{entry.score}/100</span>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Radar
              name="Score"
              dataKey="score"
              stroke="#6366f1"
              fill="#818cf8"
              fillOpacity={0.45}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>
      <div className="grid grid-cols-3 gap-2 w-full pt-3 border-t border-slate-100 text-center text-xs">
        <div>
          <span className="text-slate-400 block text-[10px]">Clarity</span>
          <span className="font-bold text-slate-800 font-mono">{categoryScores.clarity || 0}</span>
        </div>
        <div>
          <span className="text-slate-400 block text-[10px]">Structure</span>
          <span className="font-bold text-slate-800 font-mono">{categoryScores.structure || 0}</span>
        </div>
        <div>
          <span className="text-slate-400 block text-[10px]">Relevance</span>
          <span className="font-bold text-slate-800 font-mono">{categoryScores.relevance || 0}</span>
        </div>
      </div>
    </div>
  );
}

