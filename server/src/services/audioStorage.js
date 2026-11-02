import { supabaseAdmin } from '../lib/supabase.js';
import { logger } from '../lib/logger.js';

const BUCKET_NAME = 'interview-audio';

/**
 * Uploads audio buffer to Supabase private storage bucket.
 * Path format: {userId}/{sessionId}/{turnId}.webm
 */
export async function uploadTurnAudio({ userId, sessionId, turnId, buffer, mimeType = 'audio/webm' }) {
  try {
    const ext = mimeType.includes('mp4') || mimeType.includes('m4a') ? 'mp4' : 'webm';
    const filePath = `${userId}/${sessionId}/${turnId}.${ext}`;

    const { error } = await supabaseAdmin.storage
      .from(BUCKET_NAME)
      .upload(filePath, buffer, {
        contentType: mimeType,
        upsert: true
      });

    if (error) {
      logger.error({ err: error.message, filePath }, 'Failed to upload turn audio to storage bucket');
      return null;
    }

    return filePath;
  } catch (err) {
    logger.error({ err: err.message }, 'Unexpected error saving audio to storage');
    return null;
  }
}

/**
 * Creates a short-lived signed URL (default 60s) for private playback.
 */
export async function getSignedAudioUrl(filePath, expiresInSeconds = 60) {
  if (!filePath) return null;
  try {
    const { data, error } = await supabaseAdmin.storage
      .from(BUCKET_NAME)
      .createSignedUrl(filePath, expiresInSeconds);

    if (error || !data) {
      logger.warn({ err: error?.message, filePath }, 'Failed to create signed audio URL');
      return null;
    }

    return data.signedUrl;
  } catch (err) {
    logger.warn({ err: err.message, filePath }, 'Error getting signed audio URL');
    return null;
  }
}

/**
 * Deletes all audio files associated with a session.
 */
export async function deleteSessionAudio(userId, sessionId) {
  try {
    const prefix = `${userId}/${sessionId}/`;
    const { data: fileList, error: listError } = await supabaseAdmin.storage
      .from(BUCKET_NAME)
      .list(userId, { search: sessionId });

    if (listError || !fileList || fileList.length === 0) return;

    const filesToRemove = fileList.map(f => `${userId}/${sessionId}/${f.name}`);
    await supabaseAdmin.storage.from(BUCKET_NAME).remove(filesToRemove);
  } catch (err) {
    logger.warn({ err: err.message, userId, sessionId }, 'Error deleting session audio');
  }
}

/**
 * Deletes all audio files for an entire user account.
 */
export async function deleteAllUserAudio(userId) {
  try {
    const { data: fileList, error: listError } = await supabaseAdmin.storage
      .from(BUCKET_NAME)
      .list(userId);

    if (listError || !fileList || fileList.length === 0) return;

    const filesToRemove = fileList.map(f => `${userId}/${f.name}`);
    await supabaseAdmin.storage.from(BUCKET_NAME).remove(filesToRemove);
  } catch (err) {
    logger.warn({ err: err.message, userId }, 'Error deleting all user audio');
  }
}

