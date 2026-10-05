import React, { useState } from 'react';
import { Flame, Star, Trophy, AlertTriangle, CheckCircle2, Clock, Calendar as CalendarIcon, ArrowUpRight, Plus } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import { useTasks } from '../../context/TaskContext.jsx';
import FocusToday from './FocusToday.jsx';
import PendingSection from './PendingSection.jsx';
import TodayTasks from './TodayTasks.jsx';
import CreateTaskModal from '../modals/CreateTaskModal.jsx';
import AICoachModal from '../ai/AICoachModal.jsx';

export default function Dashboard() {
  const { user } = useAuth();
  const { dashboardData, loading } = useTasks();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isAICoachOpen, setIsAICoachOpen] = useState(false);

  const stats = dashboardData?.stats || {
    totalToday: 0,
    completedToday: 0,
    remainingToday: 0,
    pendingMissed: 0,
    completionRate: 0
  };

  const userStats = dashboardData?.userStats || {
    totalPoints: user?.totalPoints || 0,
    todayPoints: 0,
    currentStreak: user?.currentStreak || 0,
    longestStreak: user?.longestStreak || 0
  };

  // Format today's date in a human-friendly format (e.g., "Tuesday, October 3, 2026")
  const formattedDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 sm:px-6 lg:px-8 text-slate-100">
      {/* Top Header: Greeting, Date & Quick Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 text-slate-400 text-xs font-semibold uppercase tracking-wider mb-1">
            <CalendarIcon className="w-3.5 h-3.5 text-brand-400" />
            <span>{formattedDate}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Welcome back, {user?.name?.split(' ')[0] || 'Friend'}! 👋
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Stay consistent. Keep your streak alive and never let missed tasks disappear.
          </p>
        </div>

        <button
          onClick={() => setIsCreateOpen(true)}
          className="self-start sm:self-center px-5 py-3 bg-brand-600 hover:bg-brand-500 active:bg-brand-700 text-white font-bold rounded-2xl shadow-lg shadow-brand-600/30 flex items-center gap-2 transition-all"
        >
          <Plus className="w-5 h-5" />
          <span>New Daily Goal</span>
        </button>
      </div>

      {/* Metrics Row: 4 Clean Dark Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {/* 1. Today's Progress */}
        <div className="p-5 bg-slate-900 rounded-3xl border border-slate-800 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Today's Progress
            </span>
            <div className="w-8 h-8 rounded-xl bg-brand-500/15 text-brand-400 flex items-center justify-center font-bold">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-black text-white">
              {stats.completedToday}
            </span>
            <span className="text-sm font-semibold text-slate-400">
              / {stats.totalToday} Tasks
            </span>
          </div>
          {/* Progress bar */}
          <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden mt-3">
            <div
              className="bg-brand-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${stats.completionRate}%` }}
            />
          </div>
          <span className="text-[11px] font-semibold text-slate-400 mt-2 block">
            {stats.completionRate}% completed today
          </span>
        </div>

        {/* 2. Streak */}
        <div className="p-5 bg-slate-900 rounded-3xl border border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Consistency Streak
            </span>
            <div className="w-8 h-8 rounded-xl bg-amber-500/15 text-amber-400 flex items-center justify-center font-bold">
              <Flame className="w-4 h-4 fill-amber-400 text-amber-400" />
            </div>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-black text-white">
              {userStats.currentStreak}
            </span>
            <span className="text-sm font-semibold text-amber-400">
              {userStats.currentStreak === 1 ? 'Day' : 'Days'} 🔥
            </span>
          </div>
          <span className="text-[11px] font-medium text-slate-400 mt-3 block">
            Longest streak: <strong className="text-slate-200">{userStats.longestStreak} days</strong>
          </span>
        </div>

        {/* 3. Points */}
        <div className="p-5 bg-slate-900 rounded-3xl border border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Reward Points
            </span>
            <div className="w-8 h-8 rounded-xl bg-purple-500/15 text-purple-400 flex items-center justify-center font-bold">
              <Star className="w-4 h-4 fill-purple-400 text-purple-400" />
            </div>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-black text-white">
              {userStats.totalPoints}
            </span>
            <span className="text-sm font-semibold text-purple-400">
              ⭐ Total
            </span>
          </div>
          <span className="text-[11px] font-medium text-slate-400 mt-3 block">
            +{userStats.todayPoints} pts earned today
          </span>
        </div>

        {/* 4. Pending / Missed Backlog */}
        <div className="p-5 bg-slate-900 rounded-3xl border border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Pending / Missed
            </span>
            <div className="w-8 h-8 rounded-xl bg-rose-500/15 text-rose-400 flex items-center justify-center font-bold">
              <AlertTriangle className="w-4 h-4 text-rose-400" />
            </div>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-black text-white">
              {stats.pendingMissed}
            </span>
            <span className="text-sm font-semibold text-rose-400">
              To Recover ⚠️
            </span>
          </div>
          <span className="text-[11px] font-medium text-slate-400 mt-3 block">
            {stats.pendingMissed === 0 ? 'Zero overdue debt! 🚀' : 'Available for late catch-up'}
          </span>
        </div>
      </div>

      {/* Smart Daily Suggestion Assistant ("Your Focus Today") */}
      <FocusToday onOpenAICoach={() => setIsAICoachOpen(true)} />

      {/* Signature Accountability Section: Pending from Previous Days */}
      <PendingSection />

      {/* Today's Tasks Interactive Section */}
      <div className="bg-slate-900 p-6 rounded-3xl border border-slate-800 shadow-md">
        <TodayTasks onOpenCreateModal={() => setIsCreateOpen(true)} />
      </div>

      {/* Task Creation Modal */}
      <CreateTaskModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
      />

      {/* AI Accountability Coach Modal */}
      <AICoachModal
        isOpen={isAICoachOpen}
        onClose={() => setIsAICoachOpen(false)}
      />
    </div>
  );
}
