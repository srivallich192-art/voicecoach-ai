import rateLimit from 'express-rate-limit';
import { env } from '../config/env.js';

// Global rate limiter for all /api endpoints
export const globalRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: env.GLOBAL_RATE_LIMIT_PER_15MIN || 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    data: null,
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'Too many requests from this client. Please slow down.'
    }
  }
});

// Per-user rate limiter for AI turn evaluations
export const aiTurnRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: env.AI_TURNS_PER_HOUR || 30,
  keyGenerator: (req) => req.user?.id || req.ip,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    data: null,
    error: {
      code: 'AI_LIMIT_EXCEEDED',
      message: 'You have reached the hourly practice turn limit. Please take a break.'
    }
  }
});

// Per-user rate limiter for Text-to-Speech requests
export const ttsRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: env.TTS_PER_HOUR || 60,
  keyGenerator: (req) => req.user?.id || req.ip,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    data: null,
    error: {
      code: 'TTS_LIMIT_EXCEEDED',
      message: 'Text-to-speech request limit reached for this hour.'
    }
  }
});

