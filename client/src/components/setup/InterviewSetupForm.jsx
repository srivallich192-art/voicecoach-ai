import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { api } from '../../lib/api.js';
import {
  INTERVIEW_TYPES,
  DIFFICULTY_LEVELS,
  FEEDBACK_LANGUAGES,
  ROLE_DOMAINS
} from '@shared/constants.js';
import { RoleDomainPicker } from './RoleDomainPicker.jsx';
import { JobDescriptionInput } from './JobDescriptionInput.jsx';
import { LanguageSelect } from '../common/LanguageSelect.jsx';
import { Play, Sliders, Shield, Volume2 } from 'lucide-react';

export function InterviewSetupForm() {
  const { profile } = useAuth();
  const navigate = useNavigate();

  const [domain, setDomain] = useState(profile?.target_role_domain || 'software_it');
  const [roleTitle, setRoleTitle] = useState(profile?.target_role_title || 'Frontend Developer');
  const [interviewType, setInterviewType] = useState('mixed');
  const [difficulty, setDifficulty] = useState('standard');
  const [questionCount, setQuestionCount] = useState(5);
  const [jobDescription, setJobDescription] = useState('');
  const [feedbackLanguage, setFeedbackLanguage] = useState(profile?.feedback_language || 'English');
  const [enableFollowUps, setEnableFollowUps] = useState(true);
  const [silenceSeconds, setSilenceSeconds] = useState(4);
  const [saveAudio, setSaveAudio] = useState(profile?.save_audio_default || false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!roleTitle.trim()) {
      setError('Please specify a role title.');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const result = await api.createSession({
        role_domain: domain,
        role_title: roleTitle.trim(),
        interview_type: interviewType,
        difficulty,
        question_count: Number(questionCount),
        job_description: jobDescription.trim() || null,
        feedback_language: feedbackLanguage,
        enable_follow_ups: enableFollowUps,
        silence_auto_stop_seconds: Number(silenceSeconds),
        save_audio: saveAudio
      });

      // Navigate to live voice interview room with created session
      navigate(`/interview/${result.session.id}`);
    } catch (err) {
      setError(err.message || 'Failed to initialize interview. Please try again.');
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm">
      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-sm font-medium">
          {error}
        </div>
      )}

      {/* Target Domain & Role Selection */}
      <RoleDomainPicker
        selectedDomain={domain}
        onSelectDomain={setDomain}
        selectedRole={roleTitle}
        onSelectRole={setRoleTitle}
      />

      {/* Interview Type Selection */}
      <div>
        <label className="block text-sm font-bold text-slate-800 mb-2">
          Interview Type
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {INTERVIEW_TYPES.map((type) => (
            <button
              key={type.value}
              type="button"
              onClick={() => setInterviewType(type.value)}
              className={`p-4 rounded-2xl border text-left transition-all ${
                interviewType === type.value
                  ? 'border-brand-600 bg-brand-50/70 ring-2 ring-brand-500 shadow-sm'
                  : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="text-sm font-bold text-slate-900">{type.label}</div>
              <div className="text-xs text-slate-500 mt-1">{type.description}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Difficulty & Length Settings */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2 border-t border-slate-100">
        <div>
          <label className="block text-sm font-bold text-slate-800 mb-2">
            Interview Difficulty
          </label>
          <div className="grid grid-cols-3 gap-2">
            {DIFFICULTY_LEVELS.map((diff) => (
              <button
                key={diff.value}
                type="button"
                onClick={() => setDifficulty(diff.value)}
                className={`p-3 rounded-xl border text-center text-xs font-bold transition-all ${
                  difficulty === diff.value
                    ? 'border-brand-600 bg-brand-600 text-white shadow-sm'
                    : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                {diff.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label htmlFor="question-count" className="block text-sm font-bold text-slate-800 mb-2">
            Number of Main Questions ({questionCount})
          </label>
          <input
            id="question-count"
            type="range"
            min={3}
            max={10}
            step={1}
            value={questionCount}
            onChange={(e) => setQuestionCount(e.target.value)}
            className="w-full accent-brand-600 cursor-pointer mt-2"
          />
          <div className="flex justify-between text-xs text-slate-400 mt-1">
            <span>3 (Quick drill)</span>
            <span>5 (Recommended)</span>
            <span>10 (Full mock)</span>
          </div>
        </div>
      </div>

      {/* Optional Job Description */}
      <JobDescriptionInput
        value={jobDescription}
        onChange={setJobDescription}
      />

      {/* Speech & Audio Settings */}
      <div className="p-5 bg-slate-50 border border-slate-200 rounded-2xl space-y-4">
        <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <Sliders className="w-4 h-4 text-brand-600" />
          Voice & Interaction Settings
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <LanguageSelect
            value={feedbackLanguage}
            onChange={setFeedbackLanguage}
          />

          <div>
            <label htmlFor="silence-stop" className="block text-sm font-semibold text-slate-700 mb-1">
              Silence Auto-Stop: {silenceSeconds} seconds
            </label>
            <input
              id="silence-stop"
              type="range"
              min={2}
              max={8}
              value={silenceSeconds}
              onChange={(e) => setSilenceSeconds(e.target.value)}
              className="w-full accent-brand-600 cursor-pointer mt-2"
            />
            <p className="text-xs text-slate-500 mt-1">
              Automatically stops recording when you pause after speaking.
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 pt-2">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={enableFollowUps}
              onChange={(e) => setEnableFollowUps(e.target.checked)}
              className="h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
            />
            <span className="text-xs font-semibold text-slate-700">
              Allow intelligent follow-up questions
            </span>
          </label>

          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={saveAudio}
              onChange={(e) => setSaveAudio(e.target.checked)}
              className="h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
            />
            <span className="text-xs font-semibold text-slate-700">
              Save audio recording for self-review
            </span>
          </label>
        </div>
      </div>

      {/* Action Button */}
      <div className="pt-2">
        <button
          type="submit"
          disabled={loading}
          className="w-full flex items-center justify-center gap-3 py-4 px-6 bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-700 hover:to-indigo-700 text-white rounded-2xl text-base font-bold shadow-md hover:shadow-lg transition-all disabled:opacity-60"
        >
          {loading ? (
            <>
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>Generating Tailored Interview Plan...</span>
            </>
          ) : (
            <>
              <Play className="w-5 h-5 fill-current" />
              <span>Start Live Voice Interview</span>
            </>
          )}
        </button>
      </div>
    </form>
  );
}

