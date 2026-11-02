import app from './app.js';
import { env } from './config/env.js';
import { logger } from './lib/logger.js';

// Server boot with updated Supabase credentials

const server = app.listen(env.PORT, () => {
  logger.info(`🚀 VoiceCoach AI Server running on port ${env.PORT} in ${env.NODE_ENV} mode`);
  logger.info(`📡 Client origin: ${env.CLIENT_ORIGIN}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    logger.info('HTTP server closed cleanly');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  logger.info('SIGINT signal received: closing HTTP server');
  server.close(() => {
    logger.info('HTTP server closed cleanly');
    process.exit(0);
  });
});

