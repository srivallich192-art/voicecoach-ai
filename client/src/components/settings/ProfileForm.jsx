import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext.jsx';
import { api } from '../../lib/api.js';
import { EXPERIENCE_LEVELS, ROLE_DOMAINS } from '@shared/constants.js';
import { LanguageSelect } from '../common/LanguageSelect.jsx';
import { Check } from 'lucide-react';

export function ProfileForm({ onSaved }) {
  const { profile, refreshProfile } = useAuth();

  const [displayName, setDisplayName] = useState(profile?.display_name || '');
  const [targetDomain, setTargetDomain] = useState(profile?.target_role_domain || 'software_it');
  const [targetRole, setTargetRole] = useState(profile?.target_role_title || 'Frontend Developer');
  const [experienceLevel, setExperienceLevel] = useState(profile?.experience_level || 'fresher');
  const [nativeLanguage, setNativeLanguage] = useState(profile?.native_language || 'English');
  const [feedbackLanguage, setFeedbackLanguage] = useState(profile?.feedback_language || 'English');

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);
      setSuccess(false);

      await api.updateProfile({
        display_name: displayName.trim(),
        target_role_domain: targetDomain,
        target_role_title: targetRole.trim(),
        experience_level: experienceLevel,
        native_language: nativeLanguage.trim(),
        feedback_language: feedbackLanguage
      });

      await refreshProfile();
      setSuccess(true);
      if (onSaved) onSaved();
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err.message || 'Failed to update profile settings.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
      <div className="pb-2 border-b border-slate-100">
        <h3 className="text-lg font-bold text-slate-900">Career & Interview Persona</h3>
        <p className="text-xs text-slate-500">Configure your target roles and coach interaction preferences.</p>
      </div>

      {error && (
        <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
          {error}
        </div>
      )}

      {success && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-600" />
          <span>Profile changes saved successfully!</span>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1" htmlFor="settings-name">
            Display Name
          </label>
          <input
            id="settings-name"
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-brand-500"
          />
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1" htmlFor="settings-domain">
            Target Domain
          </label>
          <select
            id="settings-domain"
            value={targetDomain}
            onChange={(e) => setTargetDomain(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-brand-500 bg-white"
          >
            {ROLE_DOMAINS.map(d => (
              <option key={d.id} value={d.id}>{d.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1" htmlFor="settings-role">
            Target Role Title
          </label>
          <input
            id="settings-role"
            type="text"
            value={targetRole}
            onChange={(e) => setTargetRole(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-brand-500"
          />
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1" htmlFor="settings-exp">
            Experience Level
          </label>
          <select
            id="settings-exp"
            value={experienceLevel}
            onChange={(e) => setExperienceLevel(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-brand-500 bg-white"
          >
            {EXPERIENCE_LEVELS.map(exp => (
              <option key={exp.value} value={exp.value}>{exp.label}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1" htmlFor="settings-native-lang">
            Native / Primary Language
          </label>
          <input
            id="settings-native-lang"
            type="text"
            value={nativeLanguage}
            onChange={(e) => setNativeLanguage(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-brand-500"
          />
        </div>

        <div>
          <LanguageSelect
            value={feedbackLanguage}
            onChange={setFeedbackLanguage}
          />
        </div>
      </div>

      <div className="flex justify-end pt-2">
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-2.5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-bold shadow-sm transition-colors disabled:opacity-60"
        >
          {loading ? 'Saving...' : 'Save Profile Changes'}
        </button>
      </div>
    </form>
  );
}

