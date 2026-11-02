import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { api } from '../lib/api.js';
import { useSpeechPlayback } from '../hooks/useSpeechPlayback.js';

import { ReportHeader } from '../components/report/ReportHeader.jsx';
import { CategoryRadarChart } from '../components/report/CategoryRadarChart.jsx';
import { PacingLineChart } from '../components/report/PacingLineChart.jsx';
import { FillerWordBarChart } from '../components/report/FillerWordBarChart.jsx';
import { ImprovementCard } from '../components/report/ImprovementCard.jsx';
import { RewrittenAnswerCard } from '../components/report/RewrittenAnswerCard.jsx';
import { SevenDayPlan } from '../components/report/SevenDayPlan.jsx';
import { TranscriptReview } from '../components/report/TranscriptReview.jsx';
import { LoadingSpinner } from '../components/common/LoadingSpinner.jsx';
import { Play, RotateCcw, ArrowLeft, LayoutDashboard, Share2 } from 'lucide-react';

export function ReportPage() {
  const { sessionId } = useParams();
  const navigate = useNavigate();

  const [session, setSession] = useState(null);
  const [report, setReport] = useState(null);
  const [turns, setTurns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSpeakingSummary, setIsSpeakingSummary] = useState(false);

  const { speak, stop: stopAudio } = useSpeechPlayback();

  useEffect(() => {
    let active = true;

    async function loadReportData() {
      try {
        setLoading(true);
        setError(null);

        // Fetch session with turns
        const sessionData = await api.getSession(sessionId);
        if (!active) return;
        setSession(sessionData.session);
        setTurns(sessionData.turns || []);

        // Fetch or complete report
        if (sessionData.report) {
          setReport(sessionData.report);
        } else {
          // If not completed yet, complete it now
          const completedReport = await api.completeSession(sessionId);
          setReport(completedReport);
        }
      } catch (err) {
        if (active) setError(err.message || 'Failed to load coaching report.');
      } finally {
        if (active) setLoading(false);
      }
    }

    loadReportData();

    return () => {
      active = false;
      stopAudio();
    };
  }, [sessionId]);

  const handleSpeakSummary = async (text, language) => {
    setIsSpeakingSummary(true);
    await speak(text, language);
    setIsSpeakingSummary(false);
  };

  const handleRetryQuestion = async (turnId) => {
    try {
      const res = await api.retryQuestion(sessionId, turnId);
      navigate(`/interview/${res.session.id}`);
    } catch (err) {
      alert(`Could not start practice retry: ${err.message}`);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[60vh]">
        <LoadingSpinner size="lg" message="Loading your comprehensive coaching report..." />
      </div>
    );
  }

  if (error || !report) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <h2 className="text-xl font-bold text-slate-900 mb-2">Could Not Load Report</h2>
        <p className="text-sm text-slate-500 mb-6">{error || 'Report is not available yet.'}</p>
        <Link
          to={`/interview/${sessionId}`}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-600 text-white font-bold text-sm"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Resume Interview</span>
        </Link>
      </div>
    );
  }

  const reportDetails = report.report || {};

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-8 pb-20">
      {/* Back to dashboard shortcut */}
      <div className="flex items-center justify-between">
        <Link
          to="/dashboard"
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-slate-900"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Dashboard</span>
        </Link>

        <div className="flex items-center gap-2">
          <Link
            to="/interview/new"
            className="inline-flex items-center gap-2 px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-bold shadow-sm transition-colors"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>Start Another Interview</span>
          </Link>
        </div>
      </div>

      {/* Main Report Header */}
      <ReportHeader
        session={session}
        report={report}
        onSpeakSummary={handleSpeakSummary}
        isSpeakingSummary={isSpeakingSummary}
      />

      {/* Visual Analytics Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <CategoryRadarChart categoryScores={report.category_scores} />
        </div>
        <div className="lg:col-span-1">
          <PacingLineChart turns={turns} />
        </div>
        <div className="lg:col-span-1">
          <FillerWordBarChart turns={turns} />
        </div>
      </div>

      {/* Strengths & Priority Improvements */}
      <ImprovementCard priorityImprovements={reportDetails.priority_improvements} />

      {/* Model Rewritten Answers */}
      <RewrittenAnswerCard rewrittenAnswers={reportDetails.rewritten_answers} />

      {/* 7-Day Actionable Micro-Drill Practice Plan */}
      <SevenDayPlan plan={reportDetails.seven_day_plan} />

      {/* Full Transcript Review with Highlighted Fillers & Audio Player */}
      <TranscriptReview
        turns={turns}
        onRetryQuestion={handleRetryQuestion}
      />

      {/* Encouragement Footer */}
      {reportDetails.encouragement && (
        <div className="bg-brand-50/60 border border-brand-200 rounded-3xl p-6 sm:p-8 text-center max-w-3xl mx-auto">
          <h4 className="text-xs font-bold uppercase tracking-wider text-brand-700 mb-1">
            Coach Aria's Parting Words
          </h4>
          <p className="text-sm text-slate-800 leading-relaxed font-medium italic">
            "{reportDetails.encouragement}"
          </p>
        </div>
      )}
    </div>
  );
}

