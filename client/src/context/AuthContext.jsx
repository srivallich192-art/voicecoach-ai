import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase.js';
import { api } from '../lib/api.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load session and profile on boot
  useEffect(() => {
    let mounted = true;

    async function initAuth() {
      try {
        // Check if guest demo session is saved
        const isGuest = localStorage.getItem('voicecoach_guest') === 'true';
        if (isGuest) {
          const guestUser = {
            id: '00000000-0000-0000-0000-000000000001',
            email: 'guest@voicecoach.ai',
            user_metadata: { full_name: 'Guest Candidate' }
          };
          const guestSession = {
            access_token: 'demo-guest-token',
            user: guestUser
          };
          const guestProfile = {
            id: guestUser.id,
            display_name: 'Guest Candidate',
            target_role_domain: 'software_it',
            target_role_title: 'Frontend Developer',
            experience_level: 'fresher',
            native_language: 'English',
            feedback_language: 'English',
            onboarding_completed: true,
            save_audio_default: false
          };

          if (mounted) {
            setUser(guestUser);
            setSession(guestSession);
            setProfile(guestProfile);
            setLoading(false);
          }
          return;
        }

        const { data: { session: initialSession } } = await supabase.auth.getSession();
        if (mounted) {
          setSession(initialSession);
          setUser(initialSession?.user || null);
          if (initialSession?.user) {
            await fetchProfile();
          }
        }
      } catch (err) {
        console.error('Error initializing auth:', err);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    initAuth();

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, currentSession) => {
      if (!mounted) return;
      if (localStorage.getItem('voicecoach_guest') === 'true') return;

      setSession(currentSession);
      setUser(currentSession?.user || null);

      if (currentSession?.user) {
        await fetchProfile();
      } else {
        setProfile(null);
      }
      setLoading(false);
    });

    return () => {
      mounted = false;
      subscription?.unsubscribe();
    };
  }, []);

  async function fetchProfile() {
    try {
      const data = await api.getProfile();
      setProfile(data);
    } catch (err) {
      console.warn('Could not fetch user profile:', err.message);
      // Fallback default profile if table not migrated yet
      setProfile({
        display_name: user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Candidate',
        experience_level: 'fresher',
        native_language: 'English',
        feedback_language: 'English',
        onboarding_completed: true,
        save_audio_default: false
      });
    }
  }

  function loginAsGuest() {
    const guestUser = {
      id: '00000000-0000-0000-0000-000000000001',
      email: 'guest@voicecoach.ai',
      user_metadata: { full_name: 'Guest Candidate' }
    };
    const guestSession = {
      access_token: 'demo-guest-token',
      user: guestUser
    };
    const guestProfile = {
      id: guestUser.id,
      display_name: 'Guest Candidate',
      target_role_domain: 'software_it',
      target_role_title: 'Frontend Developer',
      experience_level: 'fresher',
      native_language: 'English',
      feedback_language: 'English',
      onboarding_completed: true,
      save_audio_default: false
    };

    localStorage.setItem('voicecoach_guest', 'true');
    setUser(guestUser);
    setSession(guestSession);
    setProfile(guestProfile);
    return guestUser;
  }

  async function signUp(email, password, fullName) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName
        }
      }
    });
    if (error) throw error;
    return data;
  }

  async function signIn(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    if (error) throw error;
    return data;
  }

  function loginWithGoogleDemo() {
    const googleUser = {
      id: '00000000-0000-0000-0000-000000000002',
      email: 'candidate@gmail.com',
      user_metadata: { full_name: 'Candidate (Google Account)' }
    };
    const googleSession = {
      access_token: 'demo-guest-token',
      user: googleUser
    };
    const googleProfile = {
      id: googleUser.id,
      display_name: 'Candidate (Google Account)',
      target_role_domain: 'software_it',
      target_role_title: 'Frontend Developer',
      experience_level: 'fresher',
      native_language: 'English',
      feedback_language: 'English',
      onboarding_completed: true,
      save_audio_default: false
    };

    localStorage.setItem('voicecoach_guest', 'true');
    setUser(googleUser);
    setSession(googleSession);
    setProfile(googleProfile);
    return googleUser;
  }

  async function signInWithGoogle() {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/dashboard`,
        skipBrowserRedirect: true
      }
    });
    if (error) throw error;
    return data;
  }

  async function signOut() {
    localStorage.removeItem('voicecoach_guest');
    try {
      await supabase.auth.signOut();
    } catch (_) {}
    setUser(null);
    setSession(null);
    setProfile(null);
  }

  const value = {
    user,
    session,
    profile,
    loading,
    onboardingCompleted: Boolean(profile?.onboarding_completed),
    signUp,
    signIn,
    signInWithGoogle,
    loginAsGuest,
    loginWithGoogleDemo,
    signOut,
    refreshProfile: fetchProfile
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
