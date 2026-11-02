import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export function formatDuration(seconds) {
  if (!seconds || isNaN(seconds)) return '0:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
}

export function formatDate(isoString) {
  if (!isoString) return '';
  const date = new Date(isoString);
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit'
  }).format(date);
}

export function getPaceStatus(wpm) {
  if (!wpm || wpm <= 0) return { label: 'Not calculated', color: 'text-slate-500', bg: 'bg-slate-100' };
  if (wpm < 100) return { label: 'Too Slow', color: 'text-amber-700', bg: 'bg-amber-100' };
  if (wpm <= 160) return { label: 'Ideal Pace', color: 'text-emerald-700', bg: 'bg-emerald-100' };
  if (wpm <= 175) return { label: 'Brisk', color: 'text-blue-700', bg: 'bg-blue-100' };
  return { label: 'Too Fast', color: 'text-rose-700', bg: 'bg-rose-100' };
}

export function getScoreColor(score) {
  if (score >= 80) return 'text-emerald-600 bg-emerald-50 border-emerald-200';
  if (score >= 65) return 'text-brand-600 bg-brand-50 border-brand-200';
  if (score >= 50) return 'text-amber-600 bg-amber-50 border-amber-200';
  return 'text-rose-600 bg-rose-50 border-rose-200';
}

export function getScoreBadge(score) {
  if (score >= 85) return { label: 'Interview Ready', variant: 'success' };
  if (score >= 70) return { label: 'Strong Foundation', variant: 'primary' };
  if (score >= 55) return { label: 'Developing', variant: 'warning' };
  return { label: 'Needs Practice', variant: 'danger' };
}

