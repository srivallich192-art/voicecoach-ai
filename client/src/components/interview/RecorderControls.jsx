import React, { useEffect } from 'react';
import { Mic, Square, RotateCcw, FastForward, Keyboard } from 'lucide-react';
import { formatDuration } from '../../lib/utils.js';

export function RecorderControls({
  isRecording,
  duration = 0,
  onStartRecord,
  onStopRecord,
  onSkip,
  disabled = false,
  status = 'ready'
}) {
  // Keyboard shortcut: Space key triggers start/stop recording when not focused on an input
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.code === 'Space' && e.target.tagName !== 'INPUT' && e.target.tagName !== 'TEXTAREA') {
        e.preventDefault();
        if (disabled) return;
        if (isRecording) {
          onStopRecord();
        } else {
          onStartRecord();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isRecording, disabled, onStartRecord, onStopRecord]);

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Duration & Status readout */}
      <div className="flex items-center gap-3" aria-live="polite">
        {isRecording && (
          <div className="flex items-center gap-2 px-3 py-1 bg-rose-50 text-rose-600 rounded-full border border-rose-200">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-600 animate-ping" />
            <span className="text-xs font-bold uppercase tracking-wider">Recording</span>
            <span className="text-sm font-mono font-bold">{formatDuration(duration)}</span>
          </div>
        )}
      </div>

      {/* Main Control Buttons */}
      <div className="flex items-center gap-4">
        {!isRecording ? (
          <button
            type="button"
            onClick={onStartRecord}
            disabled={disabled}
            className="flex items-center justify-center gap-3 min-w-[180px] h-14 px-6 rounded-2xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-base shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:pointer-events-none active:scale-95"
            aria-label="Start recording answer"
          >
            <Mic className="w-5 h-5 text-white" />
            <span>Record Answer</span>
          </button>
        ) : (
          <button
            type="button"
            onClick={onStopRecord}
            className="flex items-center justify-center gap-3 min-w-[180px] h-14 px-6 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-base shadow-md hover:shadow-lg transition-all animate-pulse active:scale-95"
            aria-label="Stop recording answer"
          >
            <Square className="w-5 h-5 fill-current" />
            <span>Finish Answer</span>
          </button>
        )}

        {/* Skip Question Option */}
        {!isRecording && onSkip && (
          <button
            type="button"
            onClick={onSkip}
            disabled={disabled}
            title="Skip this question"
            className="h-14 px-4 rounded-2xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 font-semibold text-xs flex items-center gap-2 transition-colors disabled:opacity-40"
            aria-label="Skip question"
          >
            <FastForward className="w-4 h-4 text-slate-400" />
            <span>Skip</span>
          </button>
        )}
      </div>

      {/* Accessibility Keyboard Hint */}
      <div className="flex items-center gap-1.5 text-[11px] text-slate-400 font-medium">
        <Keyboard className="w-3.5 h-3.5" />
        <span>Tip: Press <kbd className="px-1.5 py-0.5 rounded bg-slate-200 text-slate-700 font-mono text-[10px]">Space</kbd> to record or finish</span>
      </div>
    </div>
  );
}

