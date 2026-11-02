import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { OAuthButton } from './OAuthButton.jsx';
import { User, Mail, Lock, ArrowRight, Sparkles, CheckCircle2 } from 'lucide-react';

export function SignupForm() {
  const { signUp, loginAsGuest } = useAuth();
  const navigate = useNavigate();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [consentAccepted, setConsentAccepted] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [emailConfirmationRequired, setEmailConfirmationRequired] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!consentAccepted) {
      setError('Please accept the audio processing consent notice to continue.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setEmailConfirmationRequired(false);

      const data = await signUp(email, password, fullName);

      // If Supabase has email confirmation enabled, data.session is null until email is confirmed
      if (data?.user && !data?.session) {
        setEmailConfirmationRequired(true);
        return;
      }

      // Route new user to onboarding wizard
      navigate('/onboarding');
    } catch (err) {
      setError(err.message || 'Signup failed. Please try a different email.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoAccess = () => {
    loginAsGuest();
    navigate('/dashboard');
  };

  return (
    <div className="w-full max-w-md bg-white rounded-2xl border border-slate-200 p-8 shadow-sm">
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Create Free Account</h1>
        <p className="text-sm text-slate-500 mt-1">
          Master your job interview voice & communication
        </p>
      </div>

      {/* Quick 1-Click Access */}
      <button
        type="button"
        onClick={handleDemoAccess}
        className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-700 hover:to-indigo-700 text-white rounded-xl text-sm font-bold shadow-md hover:shadow-lg transition-all mb-4"
      >
        <Sparkles className="w-4 h-4 text-amber-300" />
        <span>⚡ Quick Instant Access (Skip Signup)</span>
      </button>

      <div className="relative my-4 text-center">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-slate-200" />
        </div>
        <span className="relative bg-white px-3 text-xs uppercase tracking-wider text-slate-400 font-semibold">
          Or register new account
        </span>
      </div>

      <OAuthButton />

      <div className="relative my-6 text-center">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-slate-200" />
        </div>
        <span className="relative bg-white px-3 text-xs uppercase tracking-wider text-slate-400 font-semibold">
          Register with email
        </span>
      </div>

      {emailConfirmationRequired && (
        <div className="mb-4 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium space-y-2">
          <div className="flex items-center gap-2 font-bold text-sm">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Confirmation Email Sent</span>
          </div>
          <p>
            Please check your inbox at <strong>{email}</strong> and click the verification link to activate your account.
          </p>
          <p className="text-slate-600">
            Want to test immediately? Click <strong>Quick Instant Access</strong> above!
          </p>
        </div>
      )}

      {error && (
        <div className="mb-4 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm font-medium">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5" htmlFor="signup-name">
            Full Name
          </label>
          <div className="relative">
            <User className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              id="signup-name"
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Alex Morgan"
              className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5" htmlFor="signup-email">
            Email Address
          </label>
          <div className="relative">
            <Mail className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              id="signup-email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@domain.com"
              className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5" htmlFor="signup-password">
            Password (Min 6 characters)
          </label>
          <div className="relative">
            <Lock className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              id="signup-password"
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
            />
          </div>
        </div>

        {/* Audio Privacy Consent Notice */}
        <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-start gap-3">
          <input
            type="checkbox"
            id="audio-consent"
            checked={consentAccepted}
            onChange={(e) => setConsentAccepted(e.target.checked)}
            className="mt-1 h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
          />
          <label htmlFor="audio-consent" className="text-xs text-slate-600 leading-relaxed cursor-pointer">
            <strong className="text-slate-800">Voice Privacy Notice:</strong> I understand that interview audio is processed to generate transcriptions and metrics, and is deleted immediately after analysis by default unless I opt in.
          </label>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-sm font-semibold shadow-sm transition-colors disabled:opacity-60 mt-2"
        >
          {loading ? 'Creating Account...' : 'Continue to Onboarding'}
          <ArrowRight className="w-4 h-4" />
        </button>
      </form>

      <p className="text-center text-xs text-slate-500 mt-6">
        Already have an account?{' '}
        <Link to="/login" className="text-brand-600 hover:underline font-bold">
          Sign In
        </Link>
      </p>
    </div>
  );
}
