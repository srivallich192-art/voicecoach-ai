import { createClient } from '@supabase/supabase-js';
import { env } from '../config/env.js';
import { UnauthorizedError } from './errors.js';

// Server-side admin client using service-role key (bypasses RLS for audit logging, system ops)
export const supabaseAdmin = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    persistSession: false,
    autoRefreshToken: false
  }
});

/**
 * Validates a Supabase JWT and returns the verified user.
 * Throws UnauthorizedError if token is invalid or expired.
 */
export async function verifyUserToken(token) {
  if (!token) {
    throw new UnauthorizedError('Missing authentication token');
  }

  const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);

  if (error || !user) {
    throw new UnauthorizedError('Invalid or expired authentication token');
  }

  return user;
}

