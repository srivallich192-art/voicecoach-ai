import React from 'react';
import { FEEDBACK_LANGUAGES } from '@shared/constants.js';

export function LanguageSelect({
  label = 'Feedback Language',
  value,
  onChange,
  disabled = false,
  helperText = 'Coach Aria will provide evaluations in this language',
  id = 'language-select'
}) {
  return (
    <div className="w-full">
      {label && (
        <label htmlFor={id} className="block text-sm font-semibold text-slate-700 mb-1">
          {label}
        </label>
      )}
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-800 text-sm font-medium focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-colors disabled:bg-slate-100 disabled:cursor-not-allowed"
      >
        {FEEDBACK_LANGUAGES.map((lang) => (
          <option key={lang.code} value={lang.code}>
            {lang.label} ({lang.nativeName})
          </option>
        ))}
      </select>
      {helperText && (
        <p className="text-xs text-slate-500 mt-1">{helperText}</p>
      )}
    </div>
  );
}

