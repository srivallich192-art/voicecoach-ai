import React, { useState } from 'react';
import { ScoreBadge } from '../common/ScoreBadge.jsx';
import { ChevronDown, ChevronUp, Play, RotateCcw } from 'lucide-react';
import { COACHING_CONFIG } from '@shared/constants.js';

export function TranscriptReview({ turns = [], onRetryQuestion }) {
  const [expandedTurns, setExpandedTurns] = useState({ 0: true });

  const toggleTurn = (index) => {
    setExpandedTurns(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  /**
   * Highlights filler words in the raw transcript with subtle amber pills
   */
  const renderHighlightedTranscript = (transcript = '') => {
    if (!transcript) return <em>No transcript recorded.</em>;

    const fillerTerms = COACHING_CONFIG.fillerLexicon;
    // Build regex to match any filler word or phrase boundary
    const pattern = new RegExp(`\\b(${fillerTerms.join('|')})\\b`, 'gi');

    const parts = [];
    let lastIndex = 0;
    let match;

    while ((match = pattern.exec(transcript)) !== null) {
      if (match.index > lastIndex) {
        parts.push(transcript.substring(lastIndex, match.index));
      }
      parts.push(
        <span
          key={match.index}
          className="bg-amber-100 text-amber-900 px-1 py-0.5 rounded font-bold underline decoration-amber-400"
          title="Detected filler word"
        >
          {match[0]}
        </span>
      );
      lastIndex = pattern.lastIndex;
    }

    if (lastIndex < transcript.length) {
      parts.push(transcript.substring(lastIndex));
    }

    return parts;
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-4">
      <div className="flex items-center justify-between pb-2 border-b border-slate-100">
        <div>
          <h3 className="text-lg font-bold text-slate-900">
            Per-Turn Transcript & Metric Review
          </h3>
          <p className="text-xs text-slate-500">
            Expand questions to inspect transcript, audio replay, and highlighted filler words.
          </p>
        </div>
      </div>

      <div className="space-y-3">
        {turns.map((turn, idx) => {
          const isExpanded = expandedTurns[idx];
          const isFollowUp = turn.kind === 'follow_up';

          return (
            <div
              key={turn.id || idx}
              className="border border-slate-200 rounded-2xl overflow-hidden transition-all"
            >
              <button
                type="button"
                onClick={() => toggleTurn(idx)}
                className="w-full flex items-center justify-between p-4 bg-slate-50/70 hover:bg-slate-100/70 text-left transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className={`px-2.5 py-0.5 rounded-lg text-xs font-bold ${
                    isFollowUp ? 'bg-amber-100 text-amber-800' : 'bg-brand-100 text-brand-800'
                  }`}>
                    {isFollowUp ? 'Follow-Up' : `Q${idx + 1}`}
                  </span>
                  <span className="text-sm font-bold text-slate-800 line-clamp-1">
                    {turn.question_text}
                  </span>
                </div>

                <div className="flex items-center gap-4 flex-shrink-0">
                  <div className="hidden sm:flex items-center gap-2 text-xs font-mono text-slate-500">
                    <span>{turn.words_per_minute || 0} WPM</span>
                    <span>•</span>
                    <span className="text-amber-700 font-bold">{turn.filler_total || 0} fillers</span>
                  </div>
                  <ScoreBadge score={turn.scores?.overall || 70} size="sm" />
                  {isExpanded ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                </div>
              </button>

              {isExpanded && (
                <div className="p-5 border-t border-slate-200 bg-white space-y-4">
                  {/* Audio Player if available */}
                  {turn.signed_audio_url && (
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center gap-3">
                      <span className="text-xs font-semibold text-slate-600 flex items-center gap-1.5">
                        <Play className="w-3.5 h-3.5 text-brand-600" />
                        Recording:
                      </span>
                      <audio controls className="h-8 flex-1" src={turn.signed_audio_url}>
                        Your browser does not support audio playback.
                      </audio>
                    </div>
                  )}

                  {/* Transcript with highlighted fillers */}
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                      Spoken Transcript (Fillers Highlighted in Yellow)
                    </h4>
                    <p className="text-sm text-slate-800 leading-relaxed font-sans bg-slate-50/50 p-4 rounded-xl border border-slate-100">
                      {renderHighlightedTranscript(turn.transcript)}
                    </p>
                  </div>

                  {/* Action row */}
                  {onRetryQuestion && (
                    <div className="flex justify-end pt-2">
                      <button
                        type="button"
                        onClick={() => onRetryQuestion(turn.id)}
                        className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg border border-brand-200 bg-brand-50 text-brand-700 hover:bg-brand-100 transition-colors"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>Practice This Specific Question Again</span>
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

