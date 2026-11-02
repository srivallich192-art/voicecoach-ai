import React from 'react';

export function LoadingSpinner({ size = 'md', message = null, className = '' }) {
  const sizeClasses = {
    sm: 'w-4 h-4 border-2',
    md: 'w-8 h-8 border-3',
    lg: 'w-12 h-12 border-4'
  }[size] || 'w-8 h-8 border-3';

  return (
    <div className={`flex flex-col items-center justify-center gap-3 ${className}`} role="status">
      <div
        className={`${sizeClasses} border-slate-200 border-t-brand-600 rounded-full animate-spin`}
        aria-hidden="true"
      />
      {message && (
        <span className="text-sm font-medium text-slate-600 animate-pulse">
          {message}
        </span>
      )}
      <span className="sr-only">Loading</span>
    </div>
  );
}

