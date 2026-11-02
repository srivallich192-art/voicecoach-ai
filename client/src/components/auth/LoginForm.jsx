import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { OAuthButton } from './OAuthButton.jsx';
import { Mail, Lock, ArrowRight, Sparkles } from 'lucide-react';

export function LoginForm() {
  const { signIn, loginAsGuest } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/dashboard';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please fill in both email and password.');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      await signIn(email, password);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.message || 'Failed to sign in. Please verify your credentials or register an account.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoAccess = () => {
    loginAsGuest();
    navigate(from, { replace: true });
  };

  return (
    <div className="w-full max-w-md bg-white rounded-2xl border border-slate-200 p-8 shadow-sm">
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Welcome to VoiceCoach</h1>
        <p className="text-sm text-slate-500 mt-1">
          Continue your spoken interview coaching journey
        </p>
      </div>

      {/* Instant Demo/Guest Button for 1-Click Evaluation */}
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
          Or sign in with account
        </span>
      </div>

      <OAuthButton />

      <div className="relative my-6 text-center">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-slate-200" />
        </div>
        <span className="relative bg-white px-3 text-xs uppercase tracking-wider text-slate-400 font-semibold">
          Email login
        </span>
      </div>

      {error && (
        <div className="mb-4 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium space-y-1">
          <div className="font-bold">{error}</div>
          {error.toLowerCase().includes('invalid') && (
            <div className="text-slate-600">
              Haven't created an account yet? Please click <Link to="/signup" className="underline font-bold text-brand-600">Sign Up</Link> first, or use <strong>Quick Instant Access</strong> above.
            </div>
          )}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5" htmlFor="login-email">
            Email Address
          </label>
          <div className="relative">
            <Mail className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              id="login-email"
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
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5" htmlFor="login-password">
            Password
          </label>
          <div className="relative">
            <Lock className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              id="login-password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-sm font-semibold shadow-sm transition-colors disabled:opacity-60 mt-2"
        >
          {loading ? 'Signing in...' : 'Sign In'}
          <ArrowRight className="w-4 h-4" />
        </button>
      </form>

      <p className="text-center text-xs text-slate-500 mt-6">
        Don’t have an account?{' '}
        <Link to="/signup" className="text-brand-600 hover:underline font-bold">
          Create free account
        </Link>
      </p>
    </div>
  );
}
