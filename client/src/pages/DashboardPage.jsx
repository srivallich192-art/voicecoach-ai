import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { api } from '../lib/api.js';
import { ProgressTrendChart } from '../components/progress/ProgressTrendChart.jsx';
import { SessionHistoryTable } from '../components/progress/SessionHistoryTable.jsx';
import { LoadingSpinner } from '../components/common/LoadingSpinner.jsx';
import { EmptyState } from '../components/common/EmptyState.jsx';
import {
  Play,
  Volume2,
  TrendingUp,
  Award,
  Zap,
  Calendar,
  Layers,
  ArrowRight
} from 'lucide-react';

export function DashboardPage() {
  const { profile, user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [progressData, setProgressData] = useState(null);
  const [recentSessions, setRecentSessions] = useState([]);
  const [error, setError] = useState(null);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [progressRes, sessionsRes] = await Promise.all([
        api.getProgress().catch(() => null),
        api.listSessions({ page: 1, limit: 5 }).catch(() => null)
      ]);

      setProgressData(progressRes);
      setRecentSessions(sessionsRes?.sessions || []);
    } catch (err) {
      console.error('Dashboard load error:', err);
      setError(err.message || 'Failed to load dashboard data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleDeleteSession = async (sessionId) => {
    try {
      await api.deleteSession(sessionId);
      fetchDashboardData();
    } catch (err) {
      alert(`Could not delete session: ${err.message}`);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[60vh]">
        <LoadingSpinner size="lg" message="Loading your progress..." />
      </div>
    );
  }

  const displayName = profile?.display_name || user?.email?.split('@')[0] || 'Candidate';
  const hasHistory = progressData?.hasHistory;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-8">
      {/* Welcome Banner & Primary Actions */}
      <div className="bg-gradient-to-r from-brand-900 to-indigo-900 rounded-3xl p-6 sm:p-10 text-white shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-1.5 max-w-xl">
          <span className="text-xs font-bold uppercase tracking-wider text-brand-300">
            Voice Coach Dashboard
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Welcome back, {displayName}
          </h1>
          <p className="text-sm text-brand-100 leading-relaxed">
            Targeting <strong>{profile?.target_role_title || 'Software Specialist'}</strong> in {profile?.target_role_domain?.replace('_', ' ') || 'Tech'}. Ready for your next spoken drill?
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          <Link
            to="/mic-check"
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-3 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs font-bold transition-colors"
          >
            <Volume2 className="w-4 h-4" />
            <span>Mic Check</span>
          </Link>

          <Link
            to="/interview/new"
            className="flex-1 sm:flex-none flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-2xl bg-white hover:bg-brand-50 text-slate-900 text-sm font-bold shadow-md hover:shadow-lg transition-all"
          >
            <Play className="w-4 h-4 fill-current text-brand-600" />
            <span>Start Mock Interview</span>
          </Link>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-sm">
          {error}
        </div>
      )}

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Overall Score */}
        <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Avg Interview Score</span>
            <Award className="w-4 h-4 text-brand-600" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold font-mono text-slate-900">
            {progressData?.averageOverallScore || 0}
            <span className="text-xs text-slate-400 font-sans font-normal ml-1">/ 100</span>
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">
            Weighted articulation rating
          </span>
        </div>

        {/* Average Pacing */}
        <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Speaking Pacing</span>
            <Zap className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold font-mono text-slate-900">
            {progressData?.averageWpm ? Math.round(progressData.averageWpm) : 0}
            <span className="text-xs text-slate-400 font-sans font-normal ml-1">WPM</span>
          </div>
          <span className="text-[11px] text-emerald-600 font-semibold mt-1 block">
            Target: 110 – 160 WPM
          </span>
        </div>

        {/* Average Fillers */}
        <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Avg Fillers / Session</span>
            <Layers className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold font-mono text-slate-900">
            {progressData?.averageFillers ? Math.round(progressData.averageFillers) : 0}
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">
            Um, like, you know, etc.
          </span>
        </div>

        {/* Total Sessions */}
        <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Sessions Practiced</span>
            <Calendar className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold font-mono text-slate-900">
            {progressData?.totalSessions || 0}
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">
            Completed mock rounds
          </span>
        </div>
      </div>

      {/* Progress Trends Chart (when sessions exist) */}
      {hasHistory && progressData.timeline?.length > 1 && (
        <ProgressTrendChart timeline={progressData.timeline} />
      )}

      {/* Recent Sessions List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Recent Interview Sessions</h2>
            <p className="text-xs text-slate-500">Review your past answer recordings, scores, and coaching reports.</p>
          </div>
          {recentSessions.length > 0 && (
            <Link
              to="/history"
              className="inline-flex items-center gap-1 text-xs font-bold text-brand-600 hover:text-brand-700"
            >
              <span>View All History</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          )}
        </div>

        {recentSessions.length > 0 ? (
          <SessionHistoryTable
            sessions={recentSessions}
            onDeleteSession={handleDeleteSession}
          />
        ) : (
          <EmptyState
            icon={Play}
            title="No Interviews Yet"
            description="Start your first realistic voice interview with Coach Aria to see spoken feedback and metrics appear here."
            actionText="Start First Interview"
            actionLink="/interview/new"
          />
        )}
      </div>
    </div>
  );
}

