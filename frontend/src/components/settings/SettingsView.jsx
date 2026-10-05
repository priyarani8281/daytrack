import React, { useState, useEffect } from 'react';
import {
  Settings,
  Bell,
  Volume2,
  Sparkles,
  RefreshCw,
  User,
  Calendar,
  Download,
  Copy,
  ExternalLink,
  Bot,
  Key,
  Check,
  ShieldCheck,
  Moon
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import { useTasks } from '../../context/TaskContext.jsx';
import { notificationService } from '../../services/notificationService.js';
import { api } from '../../services/api.js';

export default function SettingsView() {
  const { user, updateSettings, seedDemoLogin } = useAuth();
  const { loadDashboard } = useTasks();
  const [loadingSeed, setLoadingSeed] = useState(false);
  const [seedSuccess, setSeedSuccess] = useState(false);

  // Calendar sync state
  const [syncInfo, setSyncInfo] = useState(null);
  const [copiedFeed, setCopiedFeed] = useState(false);

  // Gemini API key state
  const [geminiApiKey, setGeminiApiKey] = useState(user?.settings?.geminiApiKey || '');
  const [savingKey, setSavingKey] = useState(false);
  const [keySaved, setKeySaved] = useState(false);

  const notificationsEnabled = user?.settings?.notificationsEnabled ?? false;
  const soundEnabled = user?.settings?.soundEnabled ?? true;

  useEffect(() => {
    api.getCalendarSyncInfo()
      .then(setSyncInfo)
      .catch(err => console.error('Failed to load calendar sync info:', err));
  }, []);

  const handleToggleNotifications = async () => {
    if (!notificationsEnabled) {
      const permission = await notificationService.requestPermission();
      if (permission === 'granted') {
        await updateSettings({ notificationsEnabled: true });
        notificationService.sendBrowserNotification('🔔 Notifications Enabled!', {
          body: 'DayTrack will now notify you at your scheduled goal times.'
        });
      } else {
        alert('Browser notification permission was denied. You can enable it in your browser site settings.');
      }
    } else {
      await updateSettings({ notificationsEnabled: false });
    }
  };

  const handleToggleSound = async () => {
    const nextSound = !soundEnabled;
    await updateSettings({ soundEnabled: nextSound });
    if (nextSound) {
      notificationService.playCelebrationSound();
    }
  };

  const handleSaveGeminiKey = async (e) => {
    e.preventDefault();
    setSavingKey(true);
    try {
      await updateSettings({ geminiApiKey: geminiApiKey.trim() });
      setKeySaved(true);
      setTimeout(() => setKeySaved(false), 3000);
    } catch (err) {
      alert('Failed to save API key');
    } finally {
      setSavingKey(false);
    }
  };

  const handleCopyFeedUrl = () => {
    if (!syncInfo?.feedUrl) return;
    navigator.clipboard.writeText(syncInfo.feedUrl);
    setCopiedFeed(true);
    setTimeout(() => setCopiedFeed(false), 3000);
  };

  const handleLoadDemo = async () => {
    setLoadingSeed(true);
    try {
      await seedDemoLogin();
      await loadDashboard();
      setSeedSuccess(true);
      setTimeout(() => setSeedSuccess(false), 4000);
    } catch (err) {
      console.error('Failed to load demo:', err);
    } finally {
      setLoadingSeed(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 sm:px-6 text-slate-100">
      {/* Title */}
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-slate-800 text-slate-300 border border-slate-700 flex items-center justify-center">
            <Settings className="w-5 h-5" />
          </div>
          Settings & Integrations
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Customize theme, notifications, Google Calendar sync, AI Coach preferences, and sound alerts.
        </p>
      </div>

      <div className="space-y-6">
        {/* Profile Card */}
        <div className="p-6 bg-slate-900 rounded-3xl border border-slate-800 shadow-md flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-brand-600 text-white flex items-center justify-center font-bold text-xl shadow-lg shadow-brand-600/30">
            {user?.name?.[0]?.toUpperCase() || 'U'}
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">{user?.name || 'Account'}</h3>
            <p className="text-xs text-slate-400">{user?.email}</p>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-xs font-bold text-brand-300 bg-brand-500/15 px-2.5 py-0.5 rounded-full border border-brand-500/30">
                {user?.totalPoints || 0} Total Points
              </span>
              <span className="text-xs font-bold text-amber-300 bg-amber-500/15 px-2.5 py-0.5 rounded-full border border-amber-500/30">
                🔥 {user?.currentStreak || 0} Day Streak
              </span>
            </div>
          </div>
        </div>

        {/* Theme Settings Card */}
        <div className="p-6 bg-slate-900 rounded-3xl border border-slate-800 shadow-md space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center shrink-0">
                <Moon className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Appearance & Theme</h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  DayTrack is configured for modern Dark Mode by default.
                </p>
              </div>
            </div>
            <span className="px-3 py-1 bg-brand-500/20 text-brand-300 border border-brand-500/30 text-xs font-bold rounded-full">
              Dark Mode Active
            </span>
          </div>
          <p className="text-xs text-slate-400">
            High-contrast dark slate theme reduces eye strain during deep productivity sessions and helps maintain task focus.
          </p>
        </div>

        {/* Google Calendar & iCal Integration Card */}
        <div className="p-6 bg-slate-900 rounded-3xl border border-slate-800 shadow-md space-y-5">
          <div className="flex items-start justify-between gap-4 border-b border-slate-800 pb-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-blue-500/20 text-blue-400 border border-blue-500/30 flex items-center justify-center shrink-0">
                <Calendar className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">
                  Google Calendar & iCal Sync
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Sync all DayTrack recurring tasks and scheduled occurrences to your personal calendars.
                </p>
              </div>
            </div>

            <button
              onClick={() => window.open('https://calendar.google.com', '_blank')}
              className="text-xs font-bold text-blue-400 hover:text-blue-300 flex items-center gap-1 shrink-0"
            >
              Open Google Calendar <ExternalLink className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Download .ics */}
            <div className="p-4 bg-slate-800/60 rounded-2xl border border-slate-700/60">
              <span className="text-xs font-bold text-white block mb-1">
                One-Time Export (.ics)
              </span>
              <p className="text-[11px] text-slate-400 mb-3 leading-relaxed">
                Export all scheduled tasks to a standard iCalendar file that you can drag-and-drop into Google Calendar, Outlook, or Apple Calendar.
              </p>
              <a
                href="/api/calendar/export.ics"
                download="daytrack-schedule.ics"
                className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl text-xs font-bold text-slate-200 transition-colors shadow-sm"
              >
                <Download className="w-3.5 h-3.5 text-brand-400" />
                Download .ics File
              </a>
            </div>

            {/* Live Webcal Subscription Feed */}
            <div className="p-4 bg-slate-800/60 rounded-2xl border border-slate-700/60">
              <span className="text-xs font-bold text-white block mb-1">
                Live Calendar Feed (Subscription)
              </span>
              <p className="text-[11px] text-slate-400 mb-3 leading-relaxed">
                Subscribe in Google Calendar (<em>Other calendars &gt; From URL</em>) to have tasks automatically stay up-to-date!
              </p>
              <button
                onClick={handleCopyFeedUrl}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-brand-600 hover:bg-brand-500 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-brand-600/30"
              >
                {copiedFeed ? (
                  <>
                    <Check className="w-3.5 h-3.5" /> Copied Feed URL!
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" /> Copy Live Feed URL
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* AI Accountability Coach & Intelligence Settings */}
        <div className="p-6 bg-slate-900 rounded-3xl border border-slate-800 shadow-md space-y-5">
          <div className="flex items-center gap-3 border-b border-slate-800 pb-3">
            <div className="w-9 h-9 rounded-xl bg-purple-500/20 text-purple-400 border border-purple-500/30 flex items-center justify-center shrink-0">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                AI Accountability Coach Configuration
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Powered by DayTrack's Built-in Heuristic Coach and optional Google Gemini API.
              </p>
            </div>
          </div>

          <div className="p-4 bg-purple-950/40 rounded-2xl border border-purple-800/50 text-xs">
            <div className="flex items-center gap-2 text-purple-200 font-bold mb-1">
              <Sparkles className="w-4 h-4 text-purple-400" />
              <span>Current Engine: Zero-Dependency Local AI Coach (Active)</span>
            </div>
            <p className="text-purple-300 leading-relaxed">
              DayTrack provides empathetic, context-aware coaching, task breakdown, and smart habit recommendations out-of-the-box. To optionally connect directly to Google's live Gemini Flash model, paste your Gemini API key below:
            </p>
          </div>

          <form onSubmit={handleSaveGeminiKey} className="flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <Key className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                placeholder="Optional: Google Gemini API Key (e.g. AIzaSy...)"
                value={geminiApiKey}
                onChange={(e) => setGeminiApiKey(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500 caret-purple-400"
              />
            </div>
            <button
              type="submit"
              disabled={savingKey}
              className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 rounded-xl text-xs font-bold transition-colors shrink-0"
            >
              {savingKey ? 'Saving...' : keySaved ? 'Saved! ✓' : 'Save Key'}
            </button>
          </form>
        </div>

        {/* Notifications & Sound Card */}
        <div className="p-6 bg-slate-900 rounded-3xl border border-slate-800 shadow-md space-y-6">
          <h3 className="text-base font-bold text-white border-b border-slate-800 pb-3">
            Accountability Notifications & Audio
          </h3>

          {/* Browser Notifications */}
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-brand-500/20 text-brand-400 border border-brand-500/30 flex items-center justify-center shrink-0 mt-0.5">
                <Bell className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-white">Browser Notifications</h4>
                <p className="text-xs text-slate-400 mt-0.5 max-w-md">
                  Receive timely reminders directly in your browser when your tasks are due. Notifications are only triggered at your configured times.
                </p>
              </div>
            </div>

            <button
              onClick={handleToggleNotifications}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                notificationsEnabled ? 'bg-brand-600' : 'bg-slate-700'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                  notificationsEnabled ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Sound Chimes */}
          <div className="flex items-start justify-between gap-4 pt-4 border-t border-slate-800">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-purple-500/20 text-purple-400 border border-purple-500/30 flex items-center justify-center shrink-0 mt-0.5">
                <Volume2 className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-white">Reward Sound Effects</h4>
                <p className="text-xs text-slate-400 mt-0.5 max-w-md">
                  Play an encouraging celebratory chime when completing tasks or earning consistency bonuses.
                </p>
              </div>
            </div>

            <button
              onClick={handleToggleSound}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                soundEnabled ? 'bg-brand-600' : 'bg-slate-700'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                  soundEnabled ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>

        {/* Demo Data Showcase Card */}
        <div className="p-6 bg-slate-900 rounded-3xl border border-brand-500/30 shadow-md">
          <div className="flex items-start justify-between gap-4">
            <div>
              <span className="text-[11px] font-bold text-brand-400 uppercase tracking-wider block mb-1">
                Demo Showcase
              </span>
              <h3 className="text-base font-bold text-white">
                Load Priya's Accountability Showcase
              </h3>
              <p className="text-xs text-slate-400 mt-1 max-w-lg leading-relaxed">
                Loads the complete scenario: <strong>Priya Sharma</strong> with a 7-day streak (340 points), Monday's missed "Solve 3 DSA Problems" task ready for Tuesday carry-forward catch-up, and 4 daily goals.
              </p>
            </div>

            <button
              disabled={loadingSeed}
              onClick={handleLoadDemo}
              className="px-4 py-2.5 bg-brand-600 hover:bg-brand-500 active:bg-brand-700 text-white rounded-xl text-xs font-bold shadow-lg shadow-brand-600/30 flex items-center gap-2 transition-all shrink-0"
            >
              <RefreshCw className={`w-4 h-4 ${loadingSeed ? 'animate-spin' : ''}`} />
              {loadingSeed ? 'Loading...' : 'Load Showcase'}
            </button>
          </div>

          {seedSuccess && (
            <p className="text-xs font-semibold text-emerald-300 bg-emerald-950/60 p-2.5 rounded-xl border border-emerald-800/60 mt-3 animate-pop">
              ✅ Priya's demo scenario successfully loaded! Switch to Dashboard to inspect.
            </p>
          )}
        </div>

        {/* Accountability Points Guide */}
        <div className="p-6 bg-slate-900 rounded-3xl border border-slate-800 shadow-md">
          <h3 className="text-base font-bold text-white mb-3 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400" /> Points & Accountability Rules
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-3 bg-slate-800/60 rounded-xl border border-slate-700/60">
              <span className="font-bold text-slate-200 block">Normal Task</span>
              <span className="text-slate-400">+10 Points on completion</span>
            </div>
            <div className="p-3 bg-rose-950/30 rounded-xl border border-rose-800/50">
              <span className="font-bold text-rose-300 block">High Priority Task</span>
              <span className="text-rose-400">+15 Points on completion</span>
            </div>
            <div className="p-3 bg-amber-950/30 rounded-xl border border-amber-800/50">
              <span className="font-bold text-amber-300 block">Missed Task Late Catch-Up</span>
              <span className="text-amber-400">+5 Bonus Points (Never too late to catch up!)</span>
            </div>
            <div className="p-3 bg-purple-950/30 rounded-xl border border-purple-800/50">
              <span className="font-bold text-purple-300 block">All Daily Tasks Complete</span>
              <span className="text-purple-400">+20 Bonus Points for a perfect day</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
