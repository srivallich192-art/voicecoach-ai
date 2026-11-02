import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../lib/api.js';
import { useInterviewMachine, INTERVIEW_STATES } from '../hooks/useInterviewMachine.js';
import { useAudioRecorder } from '../hooks/useAudioRecorder.js';
import { useSpeechPlayback } from '../hooks/useSpeechPlayback.js';
import { useSilenceDetection } from '../hooks/useSilenceDetection.js';

import { InterviewerAvatar } from '../components/interview/InterviewerAvatar.jsx';
import { QuestionCard } from '../components/interview/QuestionCard.jsx';
import { RecorderControls } from '../components/interview/RecorderControls.jsx';
import { AudioLevelMeter } from '../components/interview/AudioLevelMeter.jsx';
import { TextAnswerFallback } from '../components/interview/TextAnswerFallback.jsx';
import { TurnFeedbackPanel } from '../components/interview/TurnFeedbackPanel.jsx';
import { ProgressStepper } from '../components/interview/ProgressStepper.jsx';
import { MicPermissionGuide } from '../components/interview/MicPermissionGuide.jsx';
import { LoadingSpinner } from '../components/common/LoadingSpinner.jsx';
import { AlertCircle, RotateCcw } from 'lucide-react';

export function InterviewRoomPage() {
  const { sessionId } = useParams();
  const navigate = useNavigate();

  // Machine state
  const {
    state,
    initSession,
    startSpeaking,
    finishSpeaking,
    startRecording: machineStartRecording,
    startUploading,
    startAnalyzing,
    setFeedback,
    repeatTurn,
    advanceTurn,
    finishInterview,
    setError,
    resetError
  } = useInterviewMachine();

  // Audio Recorder & Speech Playback hooks
  const {
    isRecording,
    duration,
    audioLevel,
    hasPermission,
    error: micError,
    startRecording: startAudioCapture,
    stopRecording: stopAudioCapture
  } = useAudioRecorder();

  const { speak, stop: stopAudioPlayback, isSpeaking } = useSpeechPlayback();

  const [showCaptions, setShowCaptions] = useState(true);
  const [initialLoading, setInitialLoading] = useState(true);
  const [isFinishing, setIsFinishing] = useState(false);
  const [speakingFeedback, setSpeakingFeedback] = useState(false);

  // Load session data on mount
  useEffect(() => {
    let active = true;

    async function loadSession() {
      try {
        setInitialLoading(true);
        const data = await api.getSession(sessionId);

        if (!active) return;

        // Auto-start session if status is created
        let session = data.session;
        if (session.status === 'created') {
          const started = await api.startSession(sessionId);
          session = started.session;
        }

        // Get current active or latest turn
        const turns = data.turns || [];
        const currentTurn = turns[turns.length - 1];

        initSession(session, currentTurn);

        // Speak opening/current question
        if (currentTurn?.question_text) {
          speakQuestion(currentTurn.question_text);
        }
      } catch (err) {
        if (active) setError(err.message || 'Failed to load interview session.');
      } finally {
        if (active) setInitialLoading(false);
      }
    }

    loadSession();

    return () => {
      active = false;
      stopAudioPlayback();
    };
  }, [sessionId]);

  // Speak question helper
  const speakQuestion = useCallback((text) => {
    startSpeaking();
    speak(text, state.session?.feedback_language || 'English');
  }, [speak, startSpeaking, state.session?.feedback_language]);

  // When speech ends, switch machine to READY state
  useEffect(() => {
    if (state.status === INTERVIEW_STATES.SPEAKING_QUESTION && !isSpeaking) {
      finishSpeaking();
    }
  }, [state.status, isSpeaking, finishSpeaking]);

  // Handlers for Audio Recording
  const handleStartRecording = async () => {
    try {
      stopAudioPlayback();
      await startAudioCapture();
      machineStartRecording();
    } catch (err) {
      console.warn('Could not start recording:', err);
    }
  };

  const handleStopRecordingAndSubmit = useCallback(async () => {
    if (!isRecording) return;

    try {
      startUploading();
      const audioResult = await stopAudioCapture();

      if (!audioResult || !audioResult.blob) {
        setError('No audio captured. Please try recording your answer again.');
        return;
      }

      startAnalyzing();

      // Submit audio turn
      const formData = new FormData();
      formData.append('audio', audioResult.blob, `turn_${Date.now()}.webm`);
      formData.append('turn_id', state.currentTurn.id);
      formData.append('duration_seconds', audioResult.durationSeconds.toString());

      const evaluation = await api.submitAudioTurn(sessionId, formData);

      setFeedback(evaluation.analysis, evaluation.isLast);

      // If next turn was generated, keep reference
      if (evaluation.nextTurn) {
        state.nextTurnRef = evaluation.nextTurn;
      }
    } catch (err) {
      setError(err.message || 'Failed to evaluate your spoken answer. You can retry or type your answer.');
    }
  }, [isRecording, stopAudioCapture, startUploading, startAnalyzing, sessionId, state, setFeedback, setError]);

  // Silence auto-stop detection
  useSilenceDetection({
    isRecording,
    audioLevel,
    silenceSeconds: state.session?.silence_auto_stop_seconds || 4,
    onSilenceDetected: () => {
      if (isRecording) {
        handleStopRecordingAndSubmit();
      }
    }
  });

  // Text answer fallback submit
  const handleTextAnswerSubmit = async (textAnswer) => {
    try {
      startAnalyzing();
      const evaluation = await api.submitTextTurn(sessionId, {
        turn_id: state.currentTurn.id,
        text: textAnswer,
        estimated_duration_seconds: 45
      });

      setFeedback(evaluation.analysis, evaluation.isLast);
      if (evaluation.nextTurn) {
        state.nextTurnRef = evaluation.nextTurn;
      }
    } catch (err) {
      setError(err.message || 'Failed to analyze text response.');
    }
  };

  // Continue to next question or complete interview
  const handleContinue = async () => {
    stopAudioPlayback();

    if (state.isLastQuestion) {
      // Complete interview and generate final report
      try {
        setIsFinishing(true);
        await api.completeSession(sessionId);
        finishInterview();
        navigate(`/interview/${sessionId}/report`);
      } catch (err) {
        setIsFinishing(false);
        setError(err.message || 'Failed to compile final report.');
      }
      return;
    }

    // Move to next turn
    if (state.nextTurnRef) {
      const next = state.nextTurnRef;
      advanceTurn(next);
      speakQuestion(next.question_text);
    } else {
      // Re-fetch latest turn if reference missing
      const freshData = await api.getSession(sessionId);
      const turns = freshData.turns || [];
      const latest = turns[turns.length - 1];
      advanceTurn(latest);
      speakQuestion(latest.question_text);
    }
  };

  // Practice same question again
  const handleRepeatQuestion = () => {
    stopAudioPlayback();
    repeatTurn();
    speakQuestion(state.currentTurn.question_text);
  };

  // Skip question
  const handleSkipQuestion = async () => {
    handleTextAnswerSubmit("I am not sure about this topic, let's move to the next question.");
  };

  // Read feedback aloud in chosen language
  const handleSpeakFeedback = async (text, language) => {
    setSpeakingFeedback(true);
    await speak(text, language);
    setSpeakingFeedback(false);
  };

  if (initialLoading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[60vh]">
        <LoadingSpinner size="lg" message="Entering Interview Room with Coach Aria..." />
      </div>
    );
  }

  if (hasPermission === false && !state.currentTurn) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16">
        <MicPermissionGuide onRetry={handleStartRecording} />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 w-full space-y-6">
      {/* Top Progress & Role Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="w-full sm:w-1/2">
          <ProgressStepper
            current={state.questionNumber}
            total={state.totalQuestions}
            isFollowUp={state.currentTurn?.kind === 'follow_up'}
          />
        </div>

        <div className="text-right flex items-center gap-2 text-xs font-semibold text-slate-500">
          <span className="capitalize">{state.session?.role_title}</span>
          <span>•</span>
          <span className="capitalize text-slate-400">{state.session?.difficulty}</span>
        </div>
      </div>

      {/* Error Banner with retry */}
      {state.errorMessage && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs sm:text-sm font-medium flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 flex-shrink-0 text-rose-600" />
            <span>{state.errorMessage}</span>
          </div>
          <button
            type="button"
            onClick={resetError}
            className="px-3 py-1 bg-white border border-rose-200 rounded-lg text-xs font-bold text-rose-700 hover:bg-rose-100"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Coach Interviewer Avatar Header */}
      <InterviewerAvatar
        isSpeaking={isSpeaking}
        interviewerName="Coach Aria"
        statusText={
          state.status === INTERVIEW_STATES.SPEAKING_QUESTION
            ? 'Speaking interview question...'
            : (state.status === INTERVIEW_STATES.RECORDING
              ? 'Listening to your spoken answer...'
              : (state.status === INTERVIEW_STATES.ANALYZING
                ? 'Evaluating articulation, pacing & structure...'
                : 'Ready for your answer'))
        }
      />

      {/* Spoken Question Card */}
      {state.currentTurn && (
        <QuestionCard
          questionText={state.currentTurn.question_text}
          topic={state.currentTurn.question_topic}
          kind={state.currentTurn.kind}
          isSpeaking={isSpeaking}
          onReplay={() => speakQuestion(state.currentTurn.question_text)}
          showCaptions={showCaptions}
          onToggleCaptions={() => setShowCaptions(!showCaptions)}
        />
      )}

      {/* Mid-Turn Controls & Live Visualizer (when not showing turn feedback) */}
      {state.status !== INTERVIEW_STATES.SHOWING_FEEDBACK && (
        <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm flex flex-col items-center justify-center space-y-6">
          {/* Level visualizer meter */}
          <AudioLevelMeter
            audioLevel={audioLevel}
            isRecording={isRecording}
          />

          {/* Record / Stop Action Controls */}
          {state.status === INTERVIEW_STATES.ANALYZING || state.status === INTERVIEW_STATES.UPLOADING ? (
            <div className="flex flex-col items-center justify-center py-4">
              <LoadingSpinner size="md" message="Coach Aria is evaluating your speech metrics..." />
            </div>
          ) : (
            <RecorderControls
              isRecording={isRecording}
              duration={duration}
              onStartRecord={handleStartRecording}
              onStopRecord={handleStopRecordingAndSubmit}
              onSkip={handleSkipQuestion}
              disabled={state.status === INTERVIEW_STATES.SPEAKING_QUESTION}
            />
          )}

          {/* Text Input Fallback if microphone issue */}
          <div className="w-full pt-4 border-t border-slate-100">
            <TextAnswerFallback
              questionText={state.currentTurn?.question_text}
              disabled={isRecording || state.status === INTERVIEW_STATES.ANALYZING}
              onSubmit={handleTextAnswerSubmit}
            />
          </div>
        </div>
      )}

      {/* Post-Answer Feedback Panel (displayed right after each turn) */}
      {state.status === INTERVIEW_STATES.SHOWING_FEEDBACK && state.currentFeedback && (
        <TurnFeedbackPanel
          feedback={state.currentFeedback}
          isLastQuestion={state.isLastQuestion}
          onContinue={handleContinue}
          onRepeat={handleRepeatQuestion}
          onSpeakFeedback={handleSpeakFeedback}
          isSpeakingFeedback={speakingFeedback}
          feedbackLanguage={state.session?.feedback_language || 'English'}
        />
      )}

      {/* Finishing Spinner Modal */}
      {isFinishing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl">
            <LoadingSpinner size="lg" message="Compiling your Comprehensive Coaching Report..." />
            <p className="text-xs text-slate-500 mt-4">
              Aggregating filler frequencies, pacing analytics, and 7-day practice plan.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

