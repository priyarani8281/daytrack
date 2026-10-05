import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext.jsx';
import { TaskProvider, useTasks } from './context/TaskContext.jsx';
import Sidebar from './components/common/Sidebar.jsx';
import Navbar from './components/common/Navbar.jsx';
import Dashboard from './components/dashboard/Dashboard.jsx';
import CalendarView from './components/calendar/CalendarView.jsx';
import ProgressView from './components/progress/ProgressView.jsx';
import AchievementsView from './components/achievements/AchievementsView.jsx';
import SettingsView from './components/settings/SettingsView.jsx';
import CompletionToast from './components/common/CompletionToast.jsx';
import ReminderModal from './components/common/ReminderModal.jsx';
import CreateTaskModal from './components/modals/CreateTaskModal.jsx';
import AuthModal from './components/auth/AuthModal.jsx';
import AICoachModal from './components/ai/AICoachModal.jsx';
import { Sparkles, ShieldCheck, Flame, ArrowRight } from 'lucide-react';

function AppContent() {
  const { isAuthenticated, loading, seedDemoLogin } = useAuth();
  const [currentView, setCurrentView] = useState('dashboard');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isAICoachOpen, setIsAICoachOpen] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 rounded-2xl bg-brand-600 text-white font-black text-xl flex items-center justify-center mx-auto mb-3 animate-bounce">
            D
          </div>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Loading DayTrack...
          </p>
        </div>
      </div>
    );
  }

  // If not authenticated, render welcoming hero with instant demo entry point
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-900 via-indigo-950 to-slate-900 text-white flex flex-col justify-between">
        {/* Navigation */}
        <header className="max-w-6xl w-full mx-auto px-6 py-6 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-brand-600 text-white flex items-center justify-center font-black text-xl shadow-lg shadow-brand-500/30">
              D
            </div>
            <span className="font-extrabold text-2xl tracking-tight">DayTrack</span>
          </div>

          <button
            onClick={() => setIsAuthOpen(true)}
            className="px-5 py-2.5 bg-white/10 hover:bg-white/20 text-white font-bold rounded-xl text-sm backdrop-blur-sm transition-all border border-white/10"
          >
            Sign In
          </button>
        </header>

        {/* Hero */}
        <main className="max-w-4xl mx-auto px-6 py-12 text-center my-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-500/20 text-brand-300 border border-brand-500/30 text-xs font-bold uppercase tracking-wider mb-6">
            <Sparkles className="w-3.5 h-3.5" />
            Accountability & Habit Consistency Engine
          </div>

          <h1 className="text-4xl sm:text-6xl font-black tracking-tight leading-tight mb-6">
            Don't let missed tasks <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-brand-400 via-purple-300 to-amber-300 bg-clip-text text-transparent">
              disappear into oblivion.
            </span>
          </h1>

          <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto mb-10 leading-relaxed">
            Most to-do lists let missed days vanish. DayTrack holds you kindly accountable: missed tasks are remembered, carried forward, and rewarded when you catch up.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 max-w-md mx-auto">
            <button
              onClick={() => seedDemoLogin()}
              className="w-full sm:w-auto px-8 py-4 bg-brand-600 hover:bg-brand-500 text-white font-extrabold rounded-2xl text-base shadow-xl shadow-brand-600/30 transition-all flex items-center justify-center gap-2 group"
            >
              <span>Explore Priya's 7-Day Streak Demo</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>

            <button
              onClick={() => setIsAuthOpen(true)}
              className="w-full sm:w-auto px-6 py-4 bg-white/10 hover:bg-white/15 text-white font-bold rounded-2xl text-base border border-white/10 transition-all"
            >
              Create Account
            </button>
          </div>

          {/* Value Props */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-16 text-left">
            <div className="p-5 rounded-2xl bg-white/5 border border-white/10">
              <span className="text-2xl mb-2 block">⚠️</span>
              <h3 className="font-bold text-sm text-white mb-1">Carry-Forward Backlog</h3>
              <p className="text-xs text-slate-400">
                Missed Monday's DSA task? Tuesday reminds you to catch up without deleting history.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-white/5 border border-white/10">
              <span className="text-2xl mb-2 block">🔥</span>
              <h3 className="font-bold text-sm text-white mb-1">Authentic Streaks</h3>
              <p className="text-xs text-slate-400">
                Tracks true daily consistency while awarding bonus points for late catch-up tasks.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-white/5 border border-white/10">
              <span className="text-2xl mb-2 block">📅</span>
              <h3 className="font-bold text-sm text-white mb-1">Full History Audit</h3>
              <p className="text-xs text-slate-400">
                Interactive monthly calendar & GitHub-style heatmap of every task ever completed.
              </p>
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="py-6 text-center text-xs text-slate-500 border-t border-white/5">
          DayTrack — Built for students and working professionals to build relentless consistency.
        </footer>

        <AuthModal
          isOpen={isAuthOpen}
          onClose={() => setIsAuthOpen(false)}
        />
      </div>
    );
  }

  // Main Authenticated Layout
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col md:flex-row pb-20 md:pb-0">
      {/* Desktop Sidebar */}
      <Sidebar
        currentView={currentView}
        setCurrentView={setCurrentView}
        onOpenCreate={() => setIsCreateOpen(true)}
        onOpenAICoach={() => setIsAICoachOpen(true)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <Navbar
          currentView={currentView}
          setCurrentView={setCurrentView}
          onOpenCreate={() => setIsCreateOpen(true)}
          onOpenAICoach={() => setIsAICoachOpen(true)}
        />

        <main className="flex-1">
          {currentView === 'dashboard' && <Dashboard />}
          {currentView === 'calendar' && <CalendarView />}
          {currentView === 'progress' && <ProgressView />}
          {currentView === 'achievements' && <AchievementsView />}
          {currentView === 'settings' && <SettingsView />}
        </main>
      </div>

      {/* Modals & Overlays */}
      <CreateTaskModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
      />

      <AICoachModal
        isOpen={isAICoachOpen}
        onClose={() => setIsAICoachOpen(false)}
      />

      <ReminderModal />
      <CompletionToast />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <TaskProvider>
        <AppContent />
      </TaskProvider>
    </AuthProvider>
  );
}
