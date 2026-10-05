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
  Sparkles
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';

export default function Navbar({ currentView, setCurrentView, onOpenCreate, onOpenAICoach }) {
  const { user } = useAuth();

  const navItems = [
    { id: 'dashboard', label: 'Home', icon: LayoutDashboard },
    { id: 'calendar', label: 'Calendar', icon: Calendar },
    { id: 'progress', label: 'Progress', icon: BarChart3 },
    { id: 'achievements', label: 'Badges', icon: Trophy },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <>
      {/* Mobile Top Header */}
      <header className="md:hidden sticky top-0 z-30 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 px-4 py-3 flex items-center justify-between text-slate-100">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-brand-600 text-white flex items-center justify-center font-black text-sm shadow-md shadow-brand-500/20">
            D
          </div>
          <span className="font-extrabold text-lg text-white tracking-tight">
            DayTrack
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onOpenAICoach}
            className="p-1.5 text-purple-300 bg-purple-950/60 rounded-xl border border-purple-800/60 flex items-center gap-1 text-xs font-bold"
            title="Ask AI Coach"
          >
            <Sparkles className="w-3.5 h-3.5 text-purple-400" />
            <span className="text-[10px]">AI</span>
          </button>

          <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-300 bg-amber-950/60 px-2 py-1 rounded-full border border-amber-800/60">
            <Flame className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
            {user?.currentStreak || 0}d
          </span>

          <span className="inline-flex items-center gap-1 text-xs font-bold text-purple-300 bg-purple-950/60 px-2 py-1 rounded-full border border-purple-800/60">
            <Star className="w-3.5 h-3.5 fill-purple-400 text-purple-400" />
            {user?.totalPoints || 0}
          </span>
        </div>
      </header>

      {/* Mobile Bottom Navigation Bar */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-slate-900/95 backdrop-blur-md border-t border-slate-800 px-2 py-2 flex items-center justify-around shadow-2xl">
        {navItems.slice(0, 2).map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setCurrentView(item.id)}
              className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition-all ${
                isActive ? 'text-brand-400 font-bold' : 'text-slate-400 hover:text-slate-200 font-medium'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-[10px]">{item.label}</span>
            </button>
          );
        })}

        {/* Center Floating Plus Action */}
        <button
          onClick={onOpenCreate}
          className="w-11 h-11 -mt-5 rounded-full bg-brand-600 hover:bg-brand-500 text-white flex items-center justify-center shadow-lg shadow-brand-600/40 active:scale-95 transition-transform"
        >
          <Plus className="w-6 h-6" />
        </button>

        {navItems.slice(2).map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setCurrentView(item.id)}
              className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition-all ${
                isActive ? 'text-brand-400 font-bold' : 'text-slate-400 hover:text-slate-200 font-medium'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-[10px]">{item.label}</span>
            </button>
          );
        })}
      </nav>
    </>
  );
}
