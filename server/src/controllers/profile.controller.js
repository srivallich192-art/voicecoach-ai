import { supabaseAdmin } from '../lib/supabase.js';
import { NotFoundError, AppError } from '../lib/errors.js';

export async function getProfile(req, res, next) {
  try {
    const userId = req.user.id;

    const { data: profile, error } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error && error.code === 'PGRST205') {
      const fallbackName = req.user.user_metadata?.full_name || req.user.email?.split('@')[0] || 'Candidate';
      return res.status(200).json({
        data: {
          id: userId,
          display_name: fallbackName,
          target_role_domain: 'software_it',
          target_role_title: 'Frontend Developer',
          experience_level: 'fresher',
          native_language: 'English',
          feedback_language: 'English',
          onboarding_completed: true,
          save_audio_default: false
        },
        error: null
      });
    }

    if (error && error.code !== 'PGRST116') {
      throw new AppError(`Failed to fetch profile: ${error.message}`, 500);
    }

    if (!profile) {
      // If profile record was not created by trigger yet, create default entry
      const fallbackName = req.user.user_metadata?.full_name || req.user.email?.split('@')[0] || 'User';
      const { data: newProfile, error: insertError } = await supabaseAdmin
        .from('profiles')
        .insert({
          id: userId,
          display_name: fallbackName,
          experience_level: 'fresher',
          native_language: 'English',
          feedback_language: 'English',
          onboarding_completed: false
        })
        .select()
        .single();

      if (insertError) {
        throw new AppError(`Failed to initialize profile: ${insertError.message}`, 500);
      }

      return res.status(200).json({ data: newProfile, error: null });
    }

    res.status(200).json({ data: profile, error: null });
  } catch (err) {
    next(err);
  }
}

export async function updateProfile(req, res, next) {
  try {
    const userId = req.user.id;
    const updates = req.body;

    const { data: updated, error } = await supabaseAdmin
      .from('profiles')
      .update(updates)
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST205') {
        return res.status(200).json({ data: { id: userId, ...updates }, error: null });
      }
      throw new AppError(`Failed to update profile: ${error.message}`, 500);
    }

    if (!updated) {
      throw new NotFoundError('Profile not found');
    }

    res.status(200).json({ data: updated, error: null });
  } catch (err) {
    next(err);
  }
}

