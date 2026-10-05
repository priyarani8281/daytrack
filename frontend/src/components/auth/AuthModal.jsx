import React, { useState } from 'react';
import { Sparkles, ArrowRight, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import { useTasks } from '../../context/TaskContext.jsx';

export default function AuthModal({ isOpen, onClose }) {
  const { login, register, seedDemoLogin } = useAuth();
  const { loadDashboard } = useTasks();

  const [mode, setMode] = useState('login'); // 'login' or 'register'
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (mode === 'login') {
        await login(email, password);
      } else {
        await register(name, email, password);
      }
      await loadDashboard();
      onClose();
    } catch (err) {
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setError('');
    setLoading(true);
    try {
      await seedDemoLogin();
      await loadDashboard();
      onClose();
    } catch (err) {
      setError(err.message || 'Demo login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-pop text-slate-100">
      <div className="bg-slate-900 text-slate-100 rounded-3xl max-w-md w-full shadow-2xl border border-slate-800 overflow-hidden relative">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-full hover:bg-white/10 transition-colors z-20"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Brand Header */}
        <div className="bg-gradient-to-br from-indigo-950 via-slate-900 to-brand-950 p-6 sm:p-8 text-white relative border-b border-slate-800">
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-xl bg-brand-600 text-white flex items-center justify-center font-black shadow-md shadow-brand-500/20">
                D
              </div>
              <span className="font-extrabold text-lg tracking-tight">DayTrack</span>
            </div>
            <h3 className="text-xl font-bold">
              {mode === 'login' ? 'Welcome Back!' : 'Start Your Streak'}
            </h3>
            <p className="text-xs text-slate-300 mt-1">
              "Don't let missed tasks disappear. Turn them into consistency."
            </p>
          </div>
        </div>

        {/* Form Body */}
        <div className="p-6 sm:p-8 bg-slate-900">
          {/* Quick Demo Button */}
          <button
            type="button"
            onClick={handleDemoLogin}
            disabled={loading}
            className="w-full mb-6 p-4 rounded-2xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 text-slate-100 flex items-center justify-between text-left transition-all group shadow-sm hover:border-brand-500/50"
          >
            <div>
              <div className="flex items-center gap-1.5 text-xs font-bold text-amber-400 uppercase tracking-wider mb-0.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                Instant One-Click Demo
              </div>
              <p className="text-sm font-bold text-slate-100">
                Explore as Priya Sharma
              </p>
              <p className="text-[11px] text-slate-400">
                Preloaded with 7-day streak & missed task ready for catch-up
              </p>
            </div>
            <ArrowRight className="w-4 h-4 text-brand-400 group-hover:translate-x-1 transition-transform shrink-0" />
          </button>

          <div className="relative flex items-center justify-center mb-6">
            <div className="border-t border-slate-800 w-full" />
            <span className="bg-slate-900 px-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Or {mode === 'login' ? 'sign in' : 'register'} with email
            </span>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-xl bg-rose-950/60 border border-rose-800/60 text-xs font-semibold text-rose-300">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'register' && (
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Priya Sharma"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 placeholder:text-slate-500 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 caret-brand-400 transition-colors"
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                Email Address
              </label>
              <input
                type="email"
                required
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 placeholder:text-slate-500 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 caret-brand-400 transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                Password
              </label>
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 placeholder:text-slate-500 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 caret-brand-400 transition-colors"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-brand-600 hover:bg-brand-500 active:bg-brand-700 text-white font-bold rounded-xl text-sm shadow-lg shadow-brand-600/30 transition-all mt-2 disabled:opacity-50"
            >
              {loading ? 'Please wait...' : mode === 'login' ? 'Sign In' : 'Create Account'}
            </button>
          </form>

          {/* Toggle Login / Register */}
          <div className="mt-6 text-center">
            <button
              type="button"
              onClick={() => {
                setMode(mode === 'login' ? 'register' : 'login');
                setError('');
              }}
              className="text-xs font-bold text-brand-400 hover:text-brand-300 transition-colors"
            >
              {mode === 'login'
                ? "Don't have an account? Sign up"
                : 'Already have an account? Sign in'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
