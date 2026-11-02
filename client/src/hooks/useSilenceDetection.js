import { useEffect, useRef } from 'react';

export function useSilenceDetection({
  isRecording,
  audioLevel,
  silenceSeconds = 4,
  onSilenceDetected,
  volumeThreshold = 8 // Below 8 is considered silent
}) {
  const speechDetectedRef = useRef(false);
  const silenceStartRef = useRef(null);
  const firedRef = useRef(false);

  useEffect(() => {
    if (!isRecording) {
      speechDetectedRef.current = false;
      silenceStartRef.current = null;
      firedRef.current = false;
      return;
    }

    // Has user started speaking?
    if (audioLevel > volumeThreshold) {
      speechDetectedRef.current = true;
      silenceStartRef.current = null; // Reset silence clock
    } else if (speechDetectedRef.current) {
      // User has spoken earlier, and current level is below threshold
      const now = Date.now();
      if (!silenceStartRef.current) {
        silenceStartRef.current = now;
      } else {
        const silentDuration = (now - silenceStartRef.current) / 1000;
        if (silentDuration >= silenceSeconds && !firedRef.current) {
          firedRef.current = true;
          if (onSilenceDetected) {
            onSilenceDetected();
          }
        }
      }
    }
  }, [isRecording, audioLevel, silenceSeconds, onSilenceDetected, volumeThreshold]);
}

