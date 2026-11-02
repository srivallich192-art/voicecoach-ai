import React from 'react';
import { MicOff, Settings, RefreshCw } from 'lucide-react';

export function MicPermissionGuide({ onRetry }) {
  return (
    <div className="bg-amber-50 border border-amber-200 rounded-3xl p-6 sm:p-8 text-center max-w-lg mx-auto">
      <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center mx-auto mb-4">
        <MicOff className="w-6 h-6" />
      </div>
      <h3 className="text-lg font-bold text-slate-900 mb-2">Microphone Permission Needed</h3>
      <p className="text-xs text-slate-600 mb-6 leading-relaxed">
        VoiceCoach AI listens to your spoken answers in real-time. Please enable microphone permissions in your browser:
      </p>

      <ol className="text-left text-xs text-slate-700 space-y-2.5 max-w-sm mx-auto mb-6 bg-white p-4 rounded-xl border border-amber-100">
        <li className="flex items-start gap-2">
          <span className="font-bold text-amber-800">1.</span>
          <span>Click the <strong>camera/lock icon</strong> on the left of your address bar.</span>
        </li>
        <li className="flex items-start gap-2">
          <span className="font-bold text-amber-800">2.</span>
          <span>Toggle <strong>Microphone</strong> permission to <strong>Allow</strong>.</span>
        </li>
        <li className="flex items-start gap-2">
          <span className="font-bold text-amber-800">3.</span>
          <span>Click the button below to recheck microphone access.</span>
        </li>
      </ol>

      <button
        type="button"
        onClick={onRetry}
        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow-sm transition-colors"
      >
        <RefreshCw className="w-4 h-4" />
        <span>Recheck Microphone</span>
      </button>
    </div>
  );
}

