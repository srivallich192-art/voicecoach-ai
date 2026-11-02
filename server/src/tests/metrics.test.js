import { describe, it, expect } from 'vitest';
import {
  calculateWordCount,
  calculateWpm,
  detectFillers,
  computePacingScore,
  computeOverallScore
} from '../services/metrics.js';

describe('Metrics Service', () => {
  describe('calculateWordCount', () => {
    it('accurately counts standard words and handles multiple spaces', () => {
      expect(calculateWordCount('Hello world, this is a test.')).toBe(6);
      expect(calculateWordCount('   Multiple   spaces   between  words  ')).toBe(4);
      expect(calculateWordCount('')).toBe(0);
      expect(calculateWordCount(null)).toBe(0);
    });

    it('preserves contractions as single words', () => {
      expect(calculateWordCount("I'm thrilled and can't wait")).toBe(5);
    });
  });

  describe('calculateWpm', () => {
    it('computes correct words per minute from word count and duration', () => {
      // 120 words in 60 seconds = 120 WPM
      expect(calculateWpm(120, 60)).toBe(120);
      // 60 words in 30 seconds = 120 WPM
      expect(calculateWpm(60, 30)).toBe(120);
      // 150 words in 60 seconds = 150 WPM
      expect(calculateWpm(150, 60)).toBe(150);
    });

    it('safely handles zero or negative duration', () => {
      expect(calculateWpm(50, 0)).toBe(0);
      expect(calculateWpm(0, 45)).toBe(0);
    });
  });

  describe('detectFillers', () => {
    it('detects common single-word fillers', () => {
      const text = 'Um, I was uh thinking like basically that we should build it.';
      const result = detectFillers(text);
      expect(result.breakdown.um).toBe(1);
      expect(result.breakdown.uh).toBe(1);
      expect(result.breakdown.like).toBe(1);
      expect(result.breakdown.basically).toBe(1);
      expect(result.total).toBe(4);
    });

    it('detects multi-word fillers properly without double-counting', () => {
      const text = 'You know, I mean, it was sort of a big deal.';
      const result = detectFillers(text);
      expect(result.breakdown['you know']).toBe(1);
      expect(result.breakdown['i mean']).toBe(1);
      expect(result.breakdown['sort of']).toBe(1);
      expect(result.total).toBe(3);
    });

    it('only counts conditional fillers (so, well, right) when starting sentences or standalone', () => {
      // "so" at start of sentence counts, but "also" or mid-clause "I did this so that..." does not count
      const text = 'So, I started the project. It was not so bad, right? Well, that worked.';
      const result = detectFillers(text);
      expect(result.breakdown.so).toBe(1);
      expect(result.breakdown.well).toBe(1);
      expect(result.breakdown.right).toBe(1);
      expect(result.total).toBe(3);
    });
  });

  describe('computePacingScore', () => {
    it('gives top scores for target band 110-160 WPM', () => {
      const score = computePacingScore(135, 80);
      expect(score).toBeGreaterThanOrEqual(90);
    });

    it('penalizes speeds that are too slow (< 100 WPM)', () => {
      const slowScore = computePacingScore(70, 75);
      expect(slowScore).toBeLessThan(65);
    });

    it('penalizes speeds that are too fast (> 175 WPM)', () => {
      const fastScore = computePacingScore(200, 75);
      expect(fastScore).toBeLessThan(65);
    });
  });

  describe('computeOverallScore', () => {
    it('calculates weighted composite score accurately', () => {
      const scores = {
        clarity: 80,
        structure: 80,
        relevance: 80,
        confidence_tone: 80,
        pacing: 80,
        vocabulary_grammar: 80
      };
      expect(computeOverallScore(scores)).toBe(80);
    });

    it('respects exact category weighting', () => {
      const scores = {
        clarity: 100, // 20
        structure: 100, // 20
        relevance: 100, // 20
        confidence_tone: 0, // 0
        pacing: 0, // 0
        vocabulary_grammar: 0 // 0
      };
      expect(computeOverallScore(scores)).toBe(60);
    });
  });
});

