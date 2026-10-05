import React, { useState, useEffect } from 'react';
import { Compass, AlertTriangle, Target, Sparkles, ArrowRight, MessageSquareCode, ShieldCheck } from 'lucide-react';
import { useTasks } from '../../context/TaskContext.jsx';
import { api } from '../../services/api.js';

export default function FocusToday({ onOpenAICoach }) {
  const { dashboardData } = useTasks();
  const [aiInsight, setAiInsight] = useState(null);

  useEffect(() => {
    if (!dashboardData?.targetDate) return;
    let isMounted = true;
    api.getAICoachInsight(dashboardData.targetDate)
      .then((data) => {
        if (isMounted) setAiInsight(data);
      })
      .catch(() => {});
    return () => { isMounted = false; };
  }, [dashboardData?.targetDate]);

  if (!dashboardData || !dashboardData.focusToday) return null;

  const { greeting, items } = dashboardData.focusToday;

  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-indigo-900 via-slate-900 to-brand-950 text-white p-6 sm:p-7 rounded-3xl shadow-xl shadow-slate-900/10 mb-8 border border-slate-800">
      {/* Background glow circle */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-brand-500/15 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center text-amber-400 backdrop-blur-md">
              <Compass className="w-4 h-4" />
            </div>
            <span className="text-xs font-bold uppercase tracking-wider text-brand-300">
              Personal Accountability Assistant
            </span>
          </div>

          <div className="flex items-center gap-2">
            {onOpenAICoach && (
              <button
                onClick={onOpenAICoach}
                className="px-3 py-1.5 bg-brand-500/20 hover:bg-brand-500/30 text-brand-200 border border-brand-400/30 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Ask AI Coach</span>
              </button>
            )}
            <span className="text-xs font-semibold px-2.5 py-1 bg-white/10 rounded-full text-slate-300">
              {dashboardData.targetDate}
            </span>
          </div>
        </div>

        <h3 className="text-xl sm:text-2xl font-black text-white mb-2">
          {greeting}
        </h3>
        <p className="text-xs sm:text-sm text-slate-300 mb-5 max-w-xl leading-relaxed">
          Here is your personalized roadmap for today. Consistency isn’t about never falling behind—it’s about never letting missed tasks disappear and carrying momentum forward!
        </p>

        {/* AI Strategic Insight Box if available */}
        {aiInsight && (
          <div className="mb-4 p-4 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-100 flex items-start gap-3">
            <Sparkles className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div className="text-xs leading-relaxed">
              <span className="font-bold text-amber-300 block mb-0.5">
                AI Coach Insight: {aiInsight.headline}
              </span>
              <p className="text-slate-200">{aiInsight.advice}</p>
              {aiInsight.recommendedAction && (
                <p className="mt-1 font-semibold text-amber-200">
                  ⚡ Recommended Action: {aiInsight.recommendedAction}
                </p>
              )}
            </div>
          </div>
        )}

        <div className="space-y-2.5">
          {items.map((item, index) => {
            const isMissed = item.type === 'missed';
            return (
              <div
                key={index}
                className={`p-3.5 rounded-2xl flex items-start gap-3 transition-all ${
                  isMissed
                    ? 'bg-amber-500/15 border border-amber-500/30 text-amber-100 hover:bg-amber-500/20'
                    : 'bg-white/5 border border-white/10 text-slate-200 hover:bg-white/10'
                }`}
              >
                <div className="mt-0.5 shrink-0">
                  {isMissed ? (
                    <AlertTriangle className="w-4 h-4 text-amber-400" />
                  ) : (
                    <Target className="w-4 h-4 text-brand-400" />
                  )}
                </div>
                <div className="flex-1">
                  <p className="text-xs sm:text-sm font-semibold leading-relaxed">
                    {item.text}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
