import React, { useState } from 'react';
import { Send, Keyboard, MessageSquare } from 'lucide-react';

export function TextAnswerFallback({ onSubmit, disabled = false, questionText }) {
  const [text, setText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!text.trim() || text.trim().length < 5) {
      setError('Answer must be at least 5 characters.');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);
      await onSubmit(text.trim());
      setText('');
    } catch (err) {
      setError(err.message || 'Failed to submit answer.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-slate-50 border border-slate-200 rounded-3xl p-6">
      <div className="flex items-center gap-2 mb-3">
        <Keyboard className="w-4 h-4 text-brand-600" />
        <h3 className="text-sm font-bold text-slate-800">
          Text Answer Fallback
        </h3>
        <span className="text-xs text-slate-400 font-medium">
          (Use if microphone is unavailable)
        </span>
      </div>

      {error && (
        <div className="mb-3 p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl font-medium">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-3">
        <textarea
          rows={4}
          value={text}
          onChange={(e) => setText(e.target.value)}
          disabled={disabled || isSubmitting}
          placeholder="Type your spoken answer here as if speaking in the interview..."
          className="w-full px-4 py-3 rounded-2xl border border-slate-300 text-sm focus:ring-2 focus:ring-brand-500 bg-white"
        />

        <div className="flex items-center justify-between">
          <span className="text-xs text-slate-400">
            {text.length} characters (min 5)
          </span>

          <button
            type="submit"
            disabled={disabled || isSubmitting || text.trim().length < 5}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold transition-colors disabled:opacity-50"
          >
            {isSubmitting ? 'Evaluating...' : 'Submit Text Answer'}
            <Send className="w-3.5 h-3.5" />
          </button>
        </div>
      </form>
    </div>
  );
}

