import React, { useState, useEffect } from 'react';
import { X, Sparkles, CheckSquare, Square, Clock, Lightbulb, Loader2 } from 'lucide-react';
import { api } from '../../services/api.js';

export default function TaskBreakdownModal({ task, onClose }) {
  const [loading, setLoading] = useState(true);
  const [breakdown, setBreakdown] = useState(null);
  const [completedSteps, setCompletedSteps] = useState(new Set());
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!task) return;
    let isMounted = true;

    async function fetchBreakdown() {
      setLoading(true);
      setError(null);
      try {
        const res = await api.breakdownTask({
          title: task.title,
          category: task.category,
          description: task.description
        });
        if (isMounted) {
          setBreakdown(res);
        }
      } catch (err) {
        if (isMounted) {
          setError(err.message || 'Failed to generate breakdown');
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    fetchBreakdown();
    return () => { isMounted = false; };
  }, [task]);

  const toggleStep = (stepNumber) => {
    setCompletedSteps(prev => {
      const next = new Set(prev);
      if (next.has(stepNumber)) next.delete(stepNumber);
      else next.add(stepNumber);
      return next;
    });
  };

  if (!task) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in text-slate-100">
      <div className="bg-slate-900 rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-800 relative max-h-[90vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-brand-600 to-indigo-600 text-white flex items-center justify-center shadow-lg shadow-brand-600/30">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-brand-400 uppercase tracking-wider block">
              AI Micro-Step Breakdown
            </span>
            <h3 className="font-extrabold text-white text-lg leading-tight">
              {task.title}
            </h3>
          </div>
        </div>

        <p className="text-xs text-slate-400 mb-6 leading-relaxed">
          Overcoming friction starts with shrinking the first step. Complete these 3 micro-steps one by one to conquer this task:
        </p>

        {/* Loading State */}
        {loading && (
          <div className="py-12 text-center">
            <Loader2 className="w-8 h-8 text-brand-400 animate-spin mx-auto mb-3" />
            <p className="text-xs font-bold text-slate-300">
              DayTrack AI is breaking down your task into bite-sized steps...
            </p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="p-4 bg-rose-950/50 text-rose-300 rounded-2xl text-xs font-medium mb-4 border border-rose-800/60">
            {error}
          </div>
        )}

        {/* Breakdown Steps */}
        {!loading && breakdown && breakdown.steps && (
          <div className="space-y-3 mb-6">
            {breakdown.steps.map((item) => {
              const isChecked = completedSteps.has(item.step);
              return (
                <div
                  key={item.step}
                  onClick={() => toggleStep(item.step)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer select-none ${
                    isChecked
                      ? 'bg-emerald-950/30 border-emerald-800/60 text-emerald-200'
                      : 'bg-slate-800/60 hover:bg-slate-800 border-slate-700/80 text-slate-100'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <button
                      type="button"
                      className="mt-0.5 text-brand-400 focus:outline-none"
                    >
                      {isChecked ? (
                        <CheckSquare className="w-5 h-5 text-emerald-400 fill-emerald-950" />
                      ) : (
                        <Square className="w-5 h-5 text-slate-500" />
                      )}
                    </button>

                    <div className="flex-1">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <span className={`text-xs font-bold ${isChecked ? 'line-through text-emerald-400' : 'text-slate-100'}`}>
                          Step {item.step}: {item.title}
                        </span>
                        <span className="text-[11px] font-semibold text-slate-300 bg-slate-800 px-2 py-0.5 rounded-full border border-slate-700 flex items-center gap-1 shrink-0">
                          <Clock className="w-3 h-3 text-slate-400" />
                          {item.duration}
                        </span>
                      </div>

                      {item.tip && (
                        <div className="flex items-start gap-1.5 mt-2 text-[11px] text-slate-400">
                          <Lightbulb className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                          <span className="leading-relaxed">{item.tip}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Footer Progress & Dismiss */}
        {!loading && breakdown && (
          <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400">
              {completedSteps.size} of {breakdown?.steps?.length || 3} steps done
            </span>
            <button
              onClick={onClose}
              className="px-5 py-2.5 bg-brand-600 hover:bg-brand-500 text-white font-bold rounded-xl text-xs transition-colors"
            >
              {completedSteps.size === (breakdown?.steps?.length || 3) ? 'Awesome, I am Done!' : 'Back to Tasks'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
