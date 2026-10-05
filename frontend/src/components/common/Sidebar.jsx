import React from 'react';
import {
  LayoutDashboard,
  Calendar,
  BarChart3,
  Trophy,
  Settings,
  Plus,
  Flame,
  Star,
  LogOut,
  Sparkles
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';

export default function Sidebar({ currentView, setCurrentView, onOpenCreate, onOpenAICoach }) {
  const { user, logout } = useAuth();

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'calendar', label: 'Calendar', icon: Calendar },
    { id: 'progress', label: 'Progress', icon: BarChart3 },
    { id: 'achievements', label: 'Achievements', icon: Trophy },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <aside className="hidden md:flex flex-col w-64 bg-slate-900 border-r border-slate-800 p-5 shrink-0 min-h-screen sticky top-0 justify-between text-slate-100">
      {/* Top Logo and Nav */}
      <div>
        {/* Brand Header */}
        <div className="flex items-center gap-3 px-2 mb-8">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-brand-600 to-indigo-500 text-white flex items-center justify-center font-black text-lg shadow-md shadow-brand-500/25">
            D
          </div>
          <div>
            <span className="font-extrabold text-xl text-white tracking-tight block leading-tight">
              DayTrack
            </span>
            <span className="text-[11px] font-bold text-brand-400 uppercase tracking-wider block">
              Accountability
            </span>
          </div>
        </div>

        {/* Quick Add Button */}
        <button
          onClick={onOpenCreate}
          className="w-full mb-6 py-3 px-4 bg-brand-600 hover:bg-brand-500 active:bg-brand-700 text-white font-bold rounded-2xl shadow-lg shadow-brand-600/30 flex items-center justify-center gap-2 text-sm transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>New Daily Goal</span>
        </button>

        {/* Navigation Items */}
        <nav className="space-y-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setCurrentView(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl font-bold text-sm transition-all ${
                  isActive
                    ? 'bg-brand-500/20 text-brand-300 border border-brand-500/30 shadow-sm'
                    : 'text-slate-400 hover:bg-slate-800/80 hover:text-slate-100'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-brand-400' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* AI Coach Action Button */}
        <div className="mt-4 pt-3 border-t border-slate-800">
          <button
            onClick={onOpenAICoach}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl font-bold text-xs bg-purple-950/40 text-purple-200 border border-purple-800/50 hover:bg-purple-900/40 transition-all shadow-sm group"
          >
            <Sparkles className="w-4 h-4 text-purple-400 group-hover:rotate-12 transition-transform" />
            <span>AI Coach Assistant</span>
          </button>
        </div>
      </div>

      {/* Bottom User Card & Accountability Stats */}
      <div className="pt-4 border-t border-slate-800">
        <div className="p-3.5 bg-slate-800/70 rounded-2xl border border-slate-700/60 mb-3">
          <div className="flex items-center justify-between text-xs font-bold mb-2">
            <span className="flex items-center gap-1 text-amber-400">
              <Flame className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              {user?.currentStreak || 0}d Streak
            </span>
            <span className="flex items-center gap-1 text-purple-300">
              <Star className="w-3.5 h-3.5 fill-purple-400 text-purple-400" />
              {user?.totalPoints || 0} pts
            </span>
          </div>
          <div className="text-[11px] text-slate-300 font-medium truncate">
            {user?.name || 'User'}
          </div>
        </div>

        <button
          onClick={logout}
          className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-slate-400 hover:text-rose-400 rounded-xl hover:bg-rose-950/40 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}
