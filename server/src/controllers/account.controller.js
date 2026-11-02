import { supabaseAdmin } from '../lib/supabase.js';
import { deleteAllUserAudio } from '../services/audioStorage.js';
import { AppError } from '../lib/errors.js';

export async function deleteAccountData(req, res, next) {
  try {
    const userId = req.user.id;

    // 1. Purge all audio storage files for user
    await deleteAllUserAudio(userId);

    // 2. Delete all interview sessions (cascades to turns and session_reports)
    const { error: sessionDeleteError } = await supabaseAdmin
      .from('interview_sessions')
      .delete()
      .eq('user_id', userId);

    if (sessionDeleteError) {
      throw new AppError(`Failed to delete interview sessions: ${sessionDeleteError.message}`, 500);
    }

    // 3. Delete AI usage logs
    await supabaseAdmin
      .from('ai_usage_log')
      .delete()
      .eq('user_id', userId);

    // 4. Reset profile fields
    await supabaseAdmin
      .from('profiles')
      .update({
        target_role_domain: null,
        target_role_title: null,
        onboarding_completed: false,
        save_audio_default: false
      })
      .eq('id', userId);

    res.status(200).json({
      data: {
        message: 'All interview data, recordings, reports, and logs have been permanently deleted.'
      },
      error: null
    });
  } catch (err) {
    next(err);
  }
}

