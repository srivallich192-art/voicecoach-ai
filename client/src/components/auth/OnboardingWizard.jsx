import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { api } from '../../lib/api.js';
import {
  ROLE_DOMAINS,
  FEEDBACK_LANGUAGES,
  EXPERIENCE_LEVELS
} from '@shared/constants.js';
import { LanguageSelect } from '../common/LanguageSelect.jsx';
import { Sparkles, ArrowRight, CheckCircle2 } from 'lucide-react';

export function OnboardingWizard() {
  const { profile, refreshProfile } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    display_name: profile?.display_name || '',
    target_role_domain: profile?.target_role_domain || 'software_it',
    target_role_title: profile?.target_role_title || 'Frontend Developer',
    experience_level: profile?.experience_level || 'fresher',
    native_language: profile?.native_language || 'English',
    feedback_language: profile?.feedback_language || 'English',
    save_audio_default: profile?.save_audio_default || false
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const selectedDomainObj = ROLE_DOMAINS.find(d => d.id === formData.target_role_domain) || ROLE_DOMAINS[0];

  const handleDomainChange = (domainId) => {
    const domainObj = ROLE_DOMAINS.find(d => d.id === domainId);
    setFormData(prev => ({
      ...prev,
      target_role_domain: domainId,
      target_role_title: domainObj?.roles[0] || 'Associate'
    }));
  };

  const handleComplete = async () => {
    if (!formData.display_name.trim()) {
      setError('Please provide your name.');
      return;
    }
    if (!formData.target_role_title.trim()) {
      setError('Please specify your target role.');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      await api.updateProfile({
        ...formData,
        onboarding_completed: true
      });
      await refreshProfile();
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Failed to save profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-2xl bg-white rounded-3xl border border-slate-200 p-8 shadow-sm">
      {/* Stepper Header */}
      <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center font-bold">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900">Personalize Your Voice Coach</h2>
            <p className="text-xs text-slate-500">Step {step} of 2: {step === 1 ? 'Target Career & Level' : 'Language & Audio Preferences'}</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <div className={`w-3 h-3 rounded-full ${step >= 1 ? 'bg-brand-600' : 'bg-slate-200'}`} />
          <div className={`w-3 h-3 rounded-full ${step >= 2 ? 'bg-brand-600' : 'bg-slate-200'}`} />
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm font-medium">
          {error}
        </div>
      )}

      {/* Step 1: Target Career & Experience */}
      {step === 1 && (
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-slate-800 mb-1.5" htmlFor="onboard-name">
              Your Preferred Name / Nickname
            </label>
            <input
              id="onboard-name"
              type="text"
              value={formData.display_name}
              onChange={(e) => setFormData({ ...formData, display_name: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-brand-500"
              placeholder="e.g. Alex Morgan"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-800 mb-2">
              Select Your Target Career Domain
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {ROLE_DOMAINS.map((domain) => (
                <button
                  key={domain.id}
                  type="button"
                  onClick={() => handleDomainChange(domain.id)}
                  className={`p-3.5 rounded-xl text-left border text-sm font-medium transition-all ${
                    formData.target_role_domain === domain.id
                      ? 'border-brand-600 bg-brand-50 text-brand-900 ring-2 ring-brand-500'
                      : 'border-slate-200 hover:border-slate-300 text-slate-700'
                  }`}
                >
                  {domain.name}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-800 mb-1.5">
              Specific Target Role Title
            </label>
            <div className="space-y-2">
              <select
                value={formData.target_role_title}
                onChange={(e) => setFormData({ ...formData, target_role_title: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-sm"
              >
                {selectedDomainObj.roles.map((role) => (
                  <option key={role} value={role}>{role}</option>
                ))}
              </select>
              <input
                type="text"
                placeholder="Or type a custom role title..."
                value={formData.target_role_title}
                onChange={(e) => setFormData({ ...formData, target_role_title: e.target.value })}
                className="w-full px-4 py-2 rounded-xl border border-slate-200 text-xs text-slate-600 focus:ring-2 focus:ring-brand-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-800 mb-2">
              Experience Level
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {EXPERIENCE_LEVELS.map((exp) => (
                <button
                  key={exp.value}
                  type="button"
                  onClick={() => setFormData({ ...formData, experience_level: exp.value })}
                  className={`p-3 rounded-xl border text-center text-xs font-semibold transition-all ${
                    formData.experience_level === exp.value
                      ? 'border-brand-600 bg-brand-50 text-brand-900 ring-2 ring-brand-500'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {exp.label}
                </button>
              ))}
            </div>
          </div>

          <div className="pt-4 flex justify-end">
            <button
              type="button"
              onClick={() => {
                if (!formData.display_name.trim()) {
                  setError('Please enter your name.');
                  return;
                }
                setError(null);
                setStep(2);
              }}
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-sm font-semibold shadow-sm transition-colors"
            >
              Continue to Preferences
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Step 2: Language & Audio Privacy */}
      {step === 2 && (
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-slate-800 mb-1.5" htmlFor="native-lang">
              Your Primary / Native Language
            </label>
            <input
              id="native-lang"
              type="text"
              value={formData.native_language}
              onChange={(e) => setFormData({ ...formData, native_language: e.target.value })}
              placeholder="e.g. Hindi, Telugu, Spanish, French, English..."
              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-brand-500"
            />
            <p className="text-xs text-slate-500 mt-1">
              Coach Aria uses this background context to tailor pronunciation guidance without penalizing natural accents.
            </p>
          </div>

          <LanguageSelect
            label="Feedback Language"
            value={formData.feedback_language}
            onChange={(val) => setFormData({ ...formData, feedback_language: val })}
            helperText="The spoken interview is conducted in English, but Coach Aria can explain critiques and tips in this language."
          />

          <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold text-slate-800">Save Audio Recordings</h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  Allows you to replay your answers in session reports. When disabled, audio is deleted immediately after AI evaluation.
                </p>
              </div>
              <input
                type="checkbox"
                id="save-audio-toggle"
                checked={formData.save_audio_default}
                onChange={(e) => setFormData({ ...formData, save_audio_default: e.target.checked })}
                className="h-5 w-5 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
              />
            </div>
          </div>

          <div className="pt-4 flex items-center justify-between">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="px-5 py-2.5 border border-slate-300 text-slate-700 rounded-xl text-sm font-semibold hover:bg-slate-50"
            >
              Back
            </button>
            <button
              type="button"
              onClick={handleComplete}
              disabled={loading}
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-sm font-semibold shadow-sm transition-colors disabled:opacity-60"
            >
              {loading ? 'Saving Profile...' : 'Complete & Start Interviewing'}
              <CheckCircle2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

