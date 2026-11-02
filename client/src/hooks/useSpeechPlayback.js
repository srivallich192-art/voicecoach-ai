import { useState, useRef, useCallback, useEffect } from 'react';
import { api } from '../lib/api.js';

export function useSpeechPlayback() {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const audioRef = useRef(null);
  const utteranceRef = useRef(null);

  const stop = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current = null;
    }
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    setIsSpeaking(false);
  }, []);

  const speakWithBrowserSynthesis = useCallback((text, language = 'English') => {
    if (typeof window === 'undefined' || !window.speechSynthesis) {
      console.warn('SpeechSynthesis is not supported in this browser.');
      setIsSpeaking(false);
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utteranceRef.current = utterance;

    // Pick appropriate voice if available
    const voices = window.speechSynthesis.getVoices();
    const langPrefix = language === 'Spanish' ? 'es' : (language === 'French' ? 'fr' : (language === 'Hindi' ? 'hi' : 'en'));
    const matchedVoice = voices.find(v => v.lang.startsWith(langPrefix)) || voices.find(v => v.lang.startsWith('en'));
    if (matchedVoice) {
      utterance.voice = matchedVoice;
    }

    utterance.rate = 0.95; // Calm, clear pacing
    utterance.pitch = 1.0;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  }, []);

  const speak = useCallback(async (text, language = 'English') => {
    if (!text || text.trim().length === 0) return;
    stop();
    setIsSpeaking(true);

    try {
      // 1. Try backend Gemini TTS
      const data = await api.synthesizeSpeech(text, language);

      if (data && data.audio_base64) {
        const audio = new Audio(`data:${data.mime_type || 'audio/wav'};base64,${data.audio_base64}`);
        audioRef.current = audio;

        audio.onended = () => {
          setIsSpeaking(false);
          audioRef.current = null;
        };

        audio.onerror = (e) => {
          console.warn('Backend audio element error, falling back to speech synthesis:', e);
          speakWithBrowserSynthesis(text, language);
        };

        await audio.play();
        return;
      }
      // If no audio returned, fallback
      speakWithBrowserSynthesis(text, language);
    } catch (err) {
      console.warn('Backend TTS failed, using browser speech synthesis fallback:', err.message);
      speakWithBrowserSynthesis(text, language);
    }
  }, [stop, speakWithBrowserSynthesis]);

  useEffect(() => {
    return () => {
      stop();
    };
  }, [stop]);

  return {
    speak,
    stop,
    isSpeaking
  };
}

