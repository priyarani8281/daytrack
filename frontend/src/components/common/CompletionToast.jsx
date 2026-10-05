import React from 'react';
import { Sparkles, Trophy, CheckCircle2 } from 'lucide-react';
import { useTasks } from '../../context/TaskContext.jsx';

export default function CompletionToast() {
  const { completionToast } = useTasks();

  if (!completionToast) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 max-w-sm w-full animate-pop pointer-events-none">
      <div className="bg-slate-900 text-white rounded-2xl p-4 shadow-2xl border border-slate-700/80 flex items-start gap-3.5 backdrop-blur-md">
        <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/30">
          <CheckCircle2 className="w-5 h-5" />
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <h4 className="font-semibold text-sm text-white">Task Completed!</h4>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold bg-amber-400/20 text-amber-300 border border-amber-400/30">
              <Sparkles className="w-3 h-3 text-amber-400" />
              +{completionToast.points} pts
            </span>
          </div>
          <p className="text-xs text-slate-300 font-medium mt-0.5 line-clamp-1">
            {completionToast.title}
          </p>
          {completionToast.isLate && (
            <p className="text-xs text-emerald-300 mt-1 font-medium bg-emerald-950/60 px-2 py-1 rounded-lg border border-emerald-800/40">
              🌟 Late Catch-Up: +5 Bonus points added!
            </p>
          )}
          {completionToast.perfectDayBonus && (
            <p className="text-xs text-purple-300 mt-1 font-medium bg-purple-950/60 px-2 py-1 rounded-lg border border-purple-800/40 flex items-center gap-1">
              <Trophy className="w-3 h-3" /> All tasks completed today! +20 Bonus!
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
