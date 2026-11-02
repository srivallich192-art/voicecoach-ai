import React from 'react';
import { Volume2, VolumeX, Sparkles } from 'lucide-react';

export function InterviewerAvatar({ isSpeaking = false, interviewerName = 'Coach Aria', statusText = '' }) {
  return (
    <div className="flex flex-col items-center justify-center text-center">
      <div className="relative mb-3">
        {/* Outer Animated Sound Wave Rings */}
        {isSpeaking && (
          <>
            <div className="absolute -inset-3 rounded-full bg-brand-400/20 animate-ping opacity-75" />
            <div className="absolute -inset-6 rounded-full bg-indigo-500/10 animate-pulse" />
          </>
        )}

        {/* Coach Avatar Circle */}
        <div
          className={`relative w-20 h-20 sm:w-24 sm:h-24 rounded-full flex items-center justify-center transition-all duration-300 shadow-md ${
            isSpeaking
              ? 'bg-gradient-to-tr from-brand-600 to-indigo-500 ring-4 ring-brand-300 ring-offset-2 scale-105'
              : 'bg-gradient-to-tr from-slate-700 to-slate-800 text-white'
          }`}
        >
          <Sparkles className={`w-9 h-9 ${isSpeaking ? 'text-amber-300 animate-spin-subtle' : 'text-slate-300'}`} />

          {/* Active Speaking Badge */}
          <div className={`absolute bottom-0 right-0 p-1.5 rounded-full border-2 border-white shadow-sm ${isSpeaking ? 'bg-emerald-500 text-white' : 'bg-slate-400 text-slate-100'}`}>
            {isSpeaking ? <Volume2 className="w-3.5 h-3.5 animate-pulse" /> : <VolumeX className="w-3.5 h-3.5" />}
          </div>
        </div>
      </div>

      <div className="flex flex-col items-center">
        <h3 className="text-base font-bold text-slate-900 flex items-center gap-1.5">
          {interviewerName}
          <span className="text-xs px-2 py-0.5 rounded-full bg-brand-100 text-brand-700 font-semibold">AI Partner</span>
        </h3>
        <p className="text-xs font-medium text-slate-500 mt-0.5" aria-live="polite">
          {statusText || (isSpeaking ? 'Speaking question...' : 'Listening attentively')}
        </p>
      </div>
    </div>
  );
}

