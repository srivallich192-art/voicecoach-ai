import { AppError } from '../lib/errors.js';
import { logger } from '../lib/logger.js';
import { env } from '../config/env.js';

export function errorHandler(err, req, res, next) {
  // Determine status code and message
  let statusCode = 500;
  let code = 'INTERNAL_SERVER_ERROR';
  let message = 'An unexpected internal error occurred';
  let details = null;

  if (err instanceof AppError) {
    statusCode = err.statusCode;
    code = err.name.replace(/Error$/, '').toUpperCase();
    message = err.message;
    details = err.details || null;
  } else if (err.name === 'MulterError') {
    if (err.code === 'LIMIT_FILE_SIZE') {
      statusCode = 413;
      code = 'PAYLOAD_TOO_LARGE';
      message = `Audio file size exceeds the ${env.MAX_AUDIO_MB}MB limit`;
    } else {
      statusCode = 400;
      code = 'UPLOAD_ERROR';
      message = err.message;
    }
  } else if (err.status && typeof err.status === 'number') {
    statusCode = err.status;
    message = err.message || message;
  }

  // Safe logging
  if (statusCode >= 500) {
    logger.error({
      err: {
        message: err.message,
        stack: env.NODE_ENV === 'production' ? undefined : err.stack,
        code: err.code
      },
      url: req.originalUrl,
      method: req.method,
      userId: req.user?.id
    }, 'Internal Server Error encountered');
  } else {
    logger.warn({
      statusCode,
      code,
      message,
      url: req.originalUrl,
      method: req.method,
      userId: req.user?.id
    }, 'Client error response sent');
  }

  return res.status(statusCode).json({
    data: null,
    error: {
      code,
      message,
      ...(details ? { details } : {})
    }
  });
}

