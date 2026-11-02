import React from 'react';

export function AudioLevelMeter({ audioLevel = 0, isRecording = false }) {
  // Generate a multi-bar visualizer layout
  const bars = [0.4, 0.7, 1.0, 1.3, 1.6, 1.3, 1.0, 0.7, 0.4];

  return (
    <div className="flex flex-col items-center gap-2">
      <div
        className="flex items-center justify-center gap-1.5 h-10 px-4 py-1.5 rounded-full bg-slate-100 border border-slate-200"
        role="meter"
        aria-valuenow={audioLevel}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="Microphone input level"
      >
        {bars.map((multiplier, idx) => {
          // Dynamic height calculated from audio level & multiplier
          const heightPercent = isRecording
            ? Math.min(100, Math.max(15, Math.round(audioLevel * multiplier)))
            : 15;

          const barColor = audioLevel > 70
            ? 'bg-rose-500'
            : (audioLevel > 20 ? 'bg-emerald-500' : 'bg-slate-300');

          return (
            <div
              key={idx}
              className={`w-1 rounded-full transition-all duration-75 ${isRecording ? barColor : 'bg-slate-300'}`}
              style={{ height: `${heightPercent}%` }}
            />
          );
        })}
      </div>
      <span className="text-[11px] font-semibold text-slate-400">
        {isRecording
          ? (audioLevel > 15 ? 'Receiving voice input...' : 'Listening...')
          : 'Microphone Standby'}
      </span>
    </div>
  );
}

