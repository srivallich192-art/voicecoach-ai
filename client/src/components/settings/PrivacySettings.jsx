import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext.jsx';
import { api } from '../../lib/api.js';
import { ShieldCheck, Check } from 'lucide-react';

export function PrivacySettings() {
  const { profile, refreshProfile } = useAuth();
  const [saveAudio, setSaveAudio] = useState(profile?.save_audio_default || false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleToggle = async (checked) => {
    try {
      setSaving(true);
      setSaveAudio(checked);
      await api.updateProfile({ save_audio_default: checked });
      await refreshProfile();
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err) {
      console.error('Failed to update audio privacy setting:', err);
      setSaveAudio(!checked);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-4">
      <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
        <ShieldCheck className="w-5 h-5 text-emerald-600" />
        <h3 className="text-lg font-bold text-slate-900">Audio Privacy & Storage Controls</h3>
      </div>

      <div className="flex items-start justify-between gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <h4 className="text-sm font-bold text-slate-800">
              Save Voice Recordings for Self-Review
            </h4>
            {saved && (
              <span className="text-xs text-emerald-600 font-bold flex items-center gap-1">
                <Check className="w-3.5 h-3.5" /> Updated
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 mt-1 leading-relaxed">
            When enabled, your spoken audio recordings are stored in a private encrypted bucket so you can listen back to your answers in the final report. When disabled, your audio is deleted immediately after the AI computes the transcript and metrics.
          </p>
        </div>

        <input
          type="checkbox"
          id="audio-privacy-toggle"
          checked={saveAudio}
          disabled={saving}
          onChange={(e) => handleToggle(e.target.checked)}
          className="h-5 w-5 rounded border-slate-300 text-brand-600 focus:ring-brand-500 mt-1 cursor-pointer"
        />
      </div>

      <div className="text-xs text-slate-500 leading-relaxed bg-slate-50 p-4 rounded-2xl">
        <strong className="text-slate-700">Accent & Intelligibility Commitment:</strong> VoiceCoach AI evaluates speech intelligibility, structural coherence, and pacing only. Regional accents, cultural idioms, and phonetic variations are never scored negatively.
      </div>
    </div>
  );
}

