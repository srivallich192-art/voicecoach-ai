import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAudioRecorder } from '../hooks/useAudioRecorder.js';
import { useSpeechPlayback } from '../hooks/useSpeechPlayback.js';
import { AudioLevelMeter } from '../components/interview/AudioLevelMeter.jsx';
import {
  Mic,
  Square,
  Play,
  Volume2,
  CheckCircle2,
  Headphones,
  ArrowRight,
  AlertCircle
} from 'lucide-react';

export function MicCheckPage() {
  const {
    isRecording,
    duration,
    audioLevel,
    startRecording,
    stopRecording,
    error: micError
  } = useAudioRecorder();

  const { speak, isSpeaking, stop: stopAudio } = useSpeechPlayback();

  const [recordedAudioUrl, setRecordedAudioUrl] = useState(null);
  const [micTestPassed, setMicTestPassed] = useState(false);
  const [speakerTestPassed, setSpeakerTestPassed] = useState(false);

  const handleStartMicTest = async () => {
    try {
      setRecordedAudioUrl(null);
      await startRecording();
    } catch (err) {
      console.warn('Mic check start failed:', err);
    }
  };

  const handleStopMicTest = async () => {
    try {
      const result = await stopRecording();
      if (result && result.blob) {
        const url = URL.createObjectURL(result.blob);
        setRecordedAudioUrl(url);
        setMicTestPassed(true);
      }
    } catch (err) {
      console.warn('Mic check stop failed:', err);
    }
  };

  const handleSpeakerTest = () => {
    speak("Hello! This is Coach Aria. If you can hear this clearly, your speakers and earphones are working properly.");
    setSpeakerTestPassed(true);
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-8">
      <div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-50 text-brand-700 text-xs font-bold mb-2">
          <Headphones className="w-3.5 h-3.5" />
          <span>Hardware Verification</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Microphone & Audio Check
        </h1>
        <p className="text-xs sm:text-sm text-slate-500">
          Verify your microphone input and audio output before entering the live interview room.
        </p>
      </div>

      {micError && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 text-xs sm:text-sm font-medium rounded-2xl flex items-center gap-2">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{micError}</span>
        </div>
      )}

      {/* Step 1: Microphone Test */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
              micTestPassed ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-700'
            }`}>
              {micTestPassed ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : '1'}
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Microphone Input & Level Check</h3>
              <p className="text-xs text-slate-500">Say a test sentence to check audio volume and clarity.</p>
            </div>
          </div>
        </div>

        <div className="flex flex-col items-center justify-center py-4 space-y-4">
          <AudioLevelMeter audioLevel={audioLevel} isRecording={isRecording} />

          <div className="flex items-center gap-3">
            {!isRecording ? (
              <button
                type="button"
                onClick={handleStartMicTest}
                className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs shadow-sm transition-all"
              >
                <Mic className="w-4 h-4" />
                <span>Record Test Sample</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={handleStopMicTest}
                className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-sm transition-all animate-pulse"
              >
                <Square className="w-4 h-4 fill-current" />
                <span>Stop Test ({duration}s)</span>
              </button>
            )}
          </div>

          {/* Recorded Audio Playback */}
          {recordedAudioUrl && (
            <div className="w-full max-w-md p-4 bg-slate-50 border border-slate-200 rounded-2xl flex flex-col items-center gap-2">
              <span className="text-xs font-bold text-slate-700">Listen to your recorded sample:</span>
              <audio controls className="w-full h-8" src={recordedAudioUrl}>
                Your browser does not support audio playback.
              </audio>
            </div>
          )}
        </div>
      </div>

      {/* Step 2: Speaker / Earphone Output Test */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
              speakerTestPassed ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-700'
            }`}>
              {speakerTestPassed ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : '2'}
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Speaker / Earphone Output Check</h3>
              <p className="text-xs text-slate-500">Ensure you can hear Coach Aria speaking questions clearly.</p>
            </div>
          </div>
        </div>

        <div className="flex flex-col items-center justify-center py-4 space-y-3">
          <button
            type="button"
            onClick={handleSpeakerTest}
            disabled={isSpeaking}
            className={`flex items-center gap-2 px-5 py-3 rounded-2xl border text-xs font-bold transition-all ${
              isSpeaking
                ? 'bg-brand-50 border-brand-300 text-brand-700 animate-pulse'
                : 'bg-white border-slate-300 hover:bg-slate-50 text-slate-800'
            }`}
          >
            <Volume2 className="w-4 h-4 text-brand-600" />
            <span>{isSpeaking ? 'Playing Voice Sample...' : 'Play Coach Aria Voice Sample'}</span>
          </button>
        </div>
      </div>

      {/* Ready to Interview CTA */}
      <div className="flex justify-end pt-4">
        <Link
          to="/interview/new"
          className="inline-flex items-center gap-2 px-6 py-3.5 bg-brand-600 hover:bg-brand-700 text-white rounded-2xl text-sm font-bold shadow-md hover:shadow-lg transition-all"
        >
          <span>Everything Looks Good • Start Interview</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}

