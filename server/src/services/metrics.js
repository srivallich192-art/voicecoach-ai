import { COACHING_CONFIG } from '../config/coaching.js';

/**
 * Clean transcript tokens and count total words.
 */
export function calculateWordCount(transcript = '') {
  if (!transcript || typeof transcript !== 'string') return 0;
  // Match contiguous alphanumeric sequences + apostrophes
  const words = transcript.trim().match(/[a-zA-Z0-9']+/g);
  return words ? words.length : 0;
}

/**
 * Calculate words per minute given word count and duration in seconds.
 */
export function calculateWpm(wordCount, durationSeconds) {
  if (!durationSeconds || durationSeconds <= 0 || !wordCount) return 0;
  const minutes = durationSeconds / 60;
  const wpm = Math.round((wordCount / minutes) * 10) / 10;
  return Number.isFinite(wpm) ? Math.min(Math.max(wpm, 0), 400) : 0;
}

/**
 * Detect and count filler words in the transcript using deterministic rules.
 * English filler lexicon: um, uh, er, ah, like, you know, basically, actually, literally, i mean, sort of, kind of, right, so, well
 * Rule: 'right', 'so', and 'well' count only when they start a sentence/clause or stand alone.
 */
export function detectFillers(transcript = '') {
  if (!transcript || typeof transcript !== 'string') {
    return { total: 0, breakdown: {} };
  }

  const breakdown = {};
  let total = 0;
  const lower = transcript.toLowerCase();

  // 1. Check multi-word fillers first
  const multiWordFillers = ['you know', 'i mean', 'sort of', 'kind of'];
  let workingText = lower;

  for (const phrase of multiWordFillers) {
    const regex = new RegExp(`\\b${phrase}\\b`, 'gi');
    const matches = workingText.match(regex);
    if (matches && matches.length > 0) {
      breakdown[phrase] = matches.length;
      total += matches.length;
      // replace to avoid counting individual words again
      workingText = workingText.replace(regex, ' ');
    }
  }

  // 2. Single-word unrestricted fillers
  const singleFillers = ['um', 'uh', 'er', 'ah', 'like', 'basically', 'actually', 'literally'];
  for (const word of singleFillers) {
    const regex = new RegExp(`\\b${word}\\b`, 'gi');
    const matches = workingText.match(regex);
    if (matches && matches.length > 0) {
      breakdown[word] = matches.length;
      total += matches.length;
    }
  }

  // 3. Conditional fillers ('right', 'so', 'well')
  // They only count if they start a sentence/clause (after start of text or punctuation . , ! ? ;) or stand alone
  const conditionalFillers = ['right', 'so', 'well'];
  for (const word of conditionalFillers) {
    // Regex matches beginning of text or following punctuation, optional whitespace, then the word, then punctuation/boundary
    const regex = new RegExp(`(^|[.?!,;—\\n]\\s*)\\b${word}\\b([.?!,;—\\s]|$)`, 'gi');
    let count = 0;
    let match;
    while ((match = regex.exec(lower)) !== null) {
      count++;
    }
    if (count > 0) {
      breakdown[word] = count;
      total += count;
    }
  }

  return { total, breakdown };
}

/**
 * Calculate deterministic pacing score from WPM band:
 * Ideal band: 110 - 160 WPM -> base 95
 * 100 - 109 WPM -> base 80
 * 85 - 99 WPM -> base 65
 * < 85 WPM -> base 45
 * 161 - 175 WPM -> base 82
 * 176 - 195 WPM -> base 65
 * > 195 WPM -> base 40
 *
 * Then applies the model's subjective pacing score as a clamped ±10 adjustment.
 */
export function computePacingScore(wpm, modelPacingScore = 75) {
  let baseScore = 70;

  if (wpm >= 110 && wpm <= 160) {
    baseScore = 95;
  } else if (wpm >= 100 && wpm < 110) {
    baseScore = 82;
  } else if (wpm >= 85 && wpm < 100) {
    baseScore = 65;
  } else if (wpm < 85) {
    baseScore = Math.max(30, Math.round(wpm * 0.5));
  } else if (wpm > 160 && wpm <= 175) {
    baseScore = 82;
  } else if (wpm > 175 && wpm <= 195) {
    baseScore = 65;
  } else {
    // > 195 WPM
    baseScore = Math.max(25, 65 - Math.round((wpm - 195) * 0.8));
  }

  // Model subjective adjustment (±10 points)
  const adjustment = Math.round(((modelPacingScore - 75) / 25) * 10);
  const finalScore = Math.min(100, Math.max(0, baseScore + adjustment));
  return finalScore;
}

/**
 * Compute weighted overall score according to specification:
 * - Clarity: 20%
 * - Structure: 20%
 * - Relevance: 20%
 * - Confidence & Tone: 15%
 * - Pacing: 15%
 * - Vocabulary & Grammar: 10%
 */
export function computeOverallScore(scores) {
  const {
    clarity = 70,
    structure = 70,
    relevance = 70,
    confidence_tone = 70,
    pacing = 70,
    vocabulary_grammar = 70
  } = scores;

  const weighted =
    clarity * 0.20 +
    structure * 0.20 +
    relevance * 0.20 +
    confidence_tone * 0.15 +
    pacing * 0.15 +
    vocabulary_grammar * 0.10;

  return Math.round(weighted);
}

