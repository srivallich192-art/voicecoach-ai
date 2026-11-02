import React, { useState } from 'react';
import { ScoreBadge } from '../common/ScoreBadge.jsx';
import { getPaceStatus } from '../../lib/utils.js';
import {
  Volume2,
  CheckCircle,
  Lightbulb,
  ArrowRight,
  RotateCcw,
  Sparkles,
  Gauge,
  MessageSquare
} from 'lucide-react';

export function TurnFeedbackPanel({
  feedback,
  onContinue,
  onRepeat,
  isLastQuestion,
  onSpeakFeedback,
  isSpeakingFeedback = false,
  feedbackLanguage = 'English'
}) {
  const [activeTab, setActiveTab] = useState('summary'); // 'summary' | 'improvements' | 'transcript'

  if (!feedback) return null;

  const {
    transcript,
    scores,
    words_per_minute,
    filler_total,
    filler_breakdown,
    delivery_observations,
    structure_analysis,
    strengths = [],
    improvements = [],
    spoken_feedback,
    improved_answer_example,
    next_step
  } = feedback;

  const paceInfo = getPaceStatus(words_per_minute);
  const isRepeatRecommended = feedback.answer_status !== 'ok' || next_step?.action === 'repeat_question';

  return (
    <div className="w-full bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6 animate-fade-in">
      {/* Header with Spoken Feedback Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-brand-600">
            Instant Turn Analysis
          </span>
          <h3 className="text-xl font-bold text-slate-900 mt-0.5">
            Answer Evaluation & Coaching
          </h3>
        </div>

        <div className="flex items-center gap-3">
          {spoken_feedback && onSpeakFeedback && (
            <button
              type="button"
              onClick={() => onSpeakFeedback(spoken_feedback, feedbackLanguage)}
              disabled={isSpeakingFeedback}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all border ${
                isSpeakingFeedback
                  ? 'bg-brand-50 border-brand-300 text-brand-700 animate-pulse'
                  : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
              title={`Read feedback aloud in ${feedbackLanguage}`}
            >
              <Volume2 className="w-4 h-4 text-brand-600" />
              <span>{isSpeakingFeedback ? 'Coach Speaking...' : `Listen (${feedbackLanguage})`}</span>
            </button>
          )}

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-500">Overall:</span>
            <ScoreBadge score={scores?.overall || 70} size="md" />
          </div>
        </div>
      </div>

      {/* Spoken Coach Summary Quote */}
      {spoken_feedback && (
        <div className="p-4 bg-brand-50/70 border border-brand-200 rounded-2xl flex items-start gap-3">
          <Sparkles className="w-5 h-5 text-brand-600 flex-shrink-0 mt-0.5" />
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-brand-800">
              Coach Aria's Note ({feedbackLanguage}):
            </span>
            <p className="text-sm text-slate-800 font-medium mt-0.5 leading-relaxed">
              "{spoken_feedback}"
            </p>
          </div>
        </div>
      )}

      {/* Key Spoken Delivery Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {/* Pacing */}
        <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
          <div className="flex items-center justify-between text-xs font-bold text-slate-500 mb-1">
            <span className="flex items-center gap-1">
              <Gauge className="w-3.5 h-3.5" />
              Pacing
            </span>
            <span className={`px-1.5 py-0.5 rounded text-[10px] ${paceInfo.bg} ${paceInfo.color}`}>
              {paceInfo.label}
            </span>
          </div>
          <div className="text-xl font-bold font-mono text-slate-900">
            {words_per_minute || 0} <span className="text-xs font-normal text-slate-500">WPM</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Ideal: 110 - 160 WPM</p>
        </div>

        {/* Fillers */}
        <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
          <div className="text-xs font-bold text-slate-500 mb-1">Filler Words</div>
          <div className="text-xl font-bold font-mono text-slate-900">
            {filler_total || 0}
          </div>
          <div className="text-[11px] text-slate-500 truncate mt-1">
            {filler_total > 0
              ? Object.keys(filler_breakdown || {}).slice(0, 3).join(', ')
              : 'Clean delivery'}
          </div>
        </div>

        {/* Clarity */}
        <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
          <div className="text-xs font-bold text-slate-500 mb-1">Clarity Score</div>
          <div className="text-xl font-bold font-mono text-slate-900">
            {scores?.clarity || 0} / 100
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Intelligibility & voice</p>
        </div>

        {/* Structure / Framework */}
        <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
          <div className="text-xs font-bold text-slate-500 mb-1">Structure</div>
          <div className="text-sm font-bold text-slate-900 truncate">
            {structure_analysis?.framework_detected || 'Direct'}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">STAR completeness</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 gap-6">
        <button
          type="button"
          onClick={() => setActiveTab('summary')}
          className={`pb-2.5 text-xs font-bold border-b-2 transition-colors ${
            activeTab === 'summary'
              ? 'border-brand-600 text-brand-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Strengths & Fixes
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('improvements')}
          className={`pb-2.5 text-xs font-bold border-b-2 transition-colors ${
            activeTab === 'improvements'
              ? 'border-brand-600 text-brand-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Model Example Answer
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('transcript')}
          className={`pb-2.5 text-xs font-bold border-b-2 transition-colors ${
            activeTab === 'transcript'
              ? 'border-brand-600 text-brand-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Transcript Review
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'summary' && (
        <div className="space-y-4">
          {/* Strengths */}
          {strengths.length > 0 && (
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-700 mb-2 flex items-center gap-1.5">
                <CheckCircle className="w-4 h-4 text-emerald-600" />
                What Worked Well
              </h4>
              <ul className="space-y-1.5 text-xs text-slate-700 font-medium">
                {strengths.map((str, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 flex-shrink-0" />
                    <span>{str}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Actionable Improvements */}
          {improvements.length > 0 && (
            <div className="pt-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-amber-700 mb-2 flex items-center gap-1.5">
                <Lightbulb className="w-4 h-4 text-amber-600" />
                One Actionable Improvement
              </h4>
              <div className="space-y-2.5">
                {improvements.map((imp, idx) => (
                  <div key={idx} className="p-3.5 rounded-xl bg-amber-50/50 border border-amber-200/80 text-xs space-y-1.5">
                    <div className="font-bold text-amber-900">{imp.issue}</div>
                    <div className="text-slate-700">{imp.fix}</div>
                    {imp.example_phrase && (
                      <div className="mt-1.5 p-2 bg-white rounded-lg border border-amber-200 text-slate-800 font-mono text-[11px]">
                        <strong className="text-amber-800">Say this:</strong> "{imp.example_phrase}"
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'improvements' && (
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-brand-600">
            High-Impact Spoken Model Answer (60-90 words)
          </span>
          <p className="text-xs text-slate-700 leading-relaxed font-medium">
            "{improved_answer_example || 'Structure with clear Situation, Task, Action, and measurable Result.'}"
          </p>
        </div>
      )}

      {activeTab === 'transcript' && (
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span className="font-bold">Spoken Transcript (Unfiltered):</span>
            <span>{feedback.word_count || 0} words</span>
          </div>
          <p className="text-xs text-slate-800 leading-relaxed font-mono">
            {transcript || 'No speech recorded.'}
          </p>
        </div>
      )}

      {/* Action Navigation Footer */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-slate-100">
        <button
          type="button"
          onClick={onRepeat}
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-bold transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Practice This Question Again</span>
        </button>

        <button
          type="button"
          onClick={onContinue}
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-sm font-bold shadow-sm transition-colors"
        >
          <span>{isLastQuestion ? 'Proceed to Final Report' : 'Next Question'}</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

