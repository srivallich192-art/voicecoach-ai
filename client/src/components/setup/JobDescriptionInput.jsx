import React from 'react';
import { FileText } from 'lucide-react';

export function JobDescriptionInput({ value, onChange }) {
  const maxLength = 4000;
  const currentLength = value?.length || 0;

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <label htmlFor="job-desc" className="flex items-center gap-2 text-sm font-bold text-slate-800">
          <FileText className="w-4 h-4 text-slate-500" />
          Job Description / Role Requirements <span className="text-xs font-normal text-slate-400">(Optional)</span>
        </label>
        <span className={`text-xs ${currentLength > maxLength ? 'text-rose-600 font-bold' : 'text-slate-400'}`}>
          {currentLength} / {maxLength}
        </span>
      </div>
      <textarea
        id="job-desc"
        rows={4}
        value={value || ''}
        maxLength={maxLength}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Paste a job posting, responsibilities, or target technologies here. Coach Aria will tailor technical & behavioral questions directly to this description."
        className="w-full px-4 py-3 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500 resize-y"
      />
      <p className="text-xs text-slate-500">
        Leave blank to practice standard role questions.
      </p>
    </div>
  );
}

