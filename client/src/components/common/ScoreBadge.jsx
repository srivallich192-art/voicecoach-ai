import React from 'react';
import { getScoreColor } from '../../lib/utils.js';

export function ScoreBadge({ score, label = null, size = 'md' }) {
  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-2.5 py-1',
    lg: 'text-base font-bold px-3 py-1.5'
  }[size] || 'text-sm px-2.5 py-1';

  return (
    <span className={`inline-flex items-center gap-1.5 font-bold rounded-full border ${getScoreColor(score)} ${sizeClasses}`}>
      <span>{score}</span>
      {label && <span className="font-normal opacity-80">/ 100</span>}
    </span>
  );
}

