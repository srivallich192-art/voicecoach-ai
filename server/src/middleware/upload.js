import multer from 'multer';
import { env } from '../config/env.js';
import { UnsupportedMediaTypeError, ValidationError } from '../lib/errors.js';

const ALLOWED_MIME_TYPES = new Set([
  'audio/webm',
  'audio/webm;codecs=opus',
  'audio/ogg',
  'audio/ogg;codecs=opus',
  'audio/mp4',
  'audio/m4a',
  'audio/x-m4a',
  'audio/mpeg',
  'audio/mp3',
  'audio/wav',
  'audio/x-wav'
]);

const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: {
    fileSize: (env.MAX_AUDIO_MB || 8) * 1024 * 1024
  },
  fileFilter: (req, file, cb) => {
    // Strip codec parameters if present e.g. "audio/webm; codecs=opus"
    const baseMime = file.mimetype.split(';')[0].trim().toLowerCase();

    if (ALLOWED_MIME_TYPES.has(file.mimetype) || ALLOWED_MIME_TYPES.has(baseMime)) {
      cb(null, true);
    } else {
      cb(new UnsupportedMediaTypeError(
        `Invalid audio type '${file.mimetype}'. Allowed formats: webm, ogg, mp4, wav, mpeg.`
      ));
    }
  }
});

export const audioUploadMiddleware = (req, res, next) => {
  upload.single('audio')(req, res, (err) => {
    if (err) {
      return next(err);
    }

    if (req.file) {
      // Validate magic bytes for added security
      const buf = req.file.buffer;
      if (buf.length < 4) {
        return next(new ValidationError('Uploaded audio file is corrupt or empty'));
      }

      const isWebm = buf[0] === 0x1A && buf[1] === 0x45 && buf[2] === 0xDF && buf[3] === 0xA3;
      const isOgg = buf.toString('ascii', 0, 4) === 'OggS';
      const isWav = buf.toString('ascii', 0, 4) === 'RIFF';
      const isMp3 = (buf[0] === 0xFF && (buf[1] & 0xE0) === 0xE0) || buf.toString('ascii', 0, 3) === 'ID3';
      const isMp4 = buf.length >= 8 && buf.toString('ascii', 4, 8) === 'ftyp';

      // Accept if known audio magic bytes or standard client container
      const recognized = isWebm || isOgg || isWav || isMp3 || isMp4;
      if (!recognized && process.env.NODE_ENV === 'production') {
        return next(new UnsupportedMediaTypeError('File content does not match recognized audio headers'));
      }
    }

    next();
  });
};

