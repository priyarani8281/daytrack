import React from 'react';
import { X, CheckCircle2, AlertCircle, Sparkles, Clock, Calendar } from 'lucide-react';

export default function DayDetailModal({ dayData, dateStr, onClose }) {
  if (!dayData || !dateStr) return null;

  const [year, month, day] = dateStr.split('-').map(Number);
  const formattedDate = new Date(year, month - 1, day).toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });

  const completedTasks = (dayData.tasks || []).filter(
    (t) => t.status === 'completed' || t.status === 'completed_late'
  );
  const missedTasks = (dayData.tasks || []).filter((t) => t.status === 'missed');
  const pendingTasks = (dayData.tasks || []).filter((t) => t.status === 'pending');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-pop text-slate-100">
      <div className="bg-slate-900 rounded-3xl max-w-md w-full shadow-2xl border border-slate-800 overflow-hidden">
        {/* Header */}
        <div className="p-6 bg-slate-800/80 border-b border-slate-700/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-brand-500/20 text-brand-400 shadow-sm border border-brand-500/30 flex items-center justify-center font-bold">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-white">{formattedDate}</h3>
              <p className="text-xs text-slate-400">
                {dayData.total} {dayData.total === 1 ? 'task' : 'tasks'} recorded
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-full hover:bg-slate-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
          {/* Summary pill */}
          <div className="flex items-center justify-between p-3.5 bg-brand-950/50 rounded-2xl border border-brand-800/60">
            <span className="text-xs font-bold text-brand-300">
              Points Earned
            </span>
            <span className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 bg-slate-800 text-brand-300 rounded-xl shadow-sm border border-brand-700/50">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              {dayData.pointsEarned || 0} pts
            </span>
          </div>

          {/* Completed Section */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5 mb-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              Completed ({completedTasks.length})
            </h4>
            {completedTasks.length === 0 ? (
              <p className="text-xs text-slate-500 italic">No tasks completed on this day.</p>
            ) : (
              <div className="space-y-2">
                {completedTasks.map((t) => (
                  <div
                    key={t.id}
                    className="p-3 bg-emerald-950/30 rounded-2xl border border-emerald-800/50 flex items-center justify-between text-xs"
                  >
                    <div>
                      <span className="font-bold text-slate-100">{t.title}</span>
                      {t.status === 'completed_late' && (
                        <span className="block text-[11px] text-emerald-400 font-semibold mt-0.5">
                          ✓ Completed Late
                        </span>
                      )}
                    </div>
                    <span className="font-bold text-emerald-300 px-2 py-0.5 bg-emerald-900/60 border border-emerald-800/60 rounded-lg">
                      +{t.pointsEarned || 10} pts
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Missed Section */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-rose-400 flex items-center gap-1.5 mb-2.5">
              <AlertCircle className="w-4 h-4 text-rose-400" />
              Missed ({missedTasks.length})
            </h4>
            {missedTasks.length === 0 ? (
              <p className="text-xs text-slate-500 italic">No missed tasks on this day.</p>
            ) : (
              <div className="space-y-2">
                {missedTasks.map((t) => (
                  <div
                    key={t.id}
                    className="p-3 bg-rose-950/30 rounded-2xl border border-rose-800/50 flex items-center justify-between text-xs"
                  >
                    <div>
                      <span className="font-bold text-slate-100">{t.title}</span>
                      <span className="block text-[11px] text-rose-400 mt-0.5">
                        Carried forward to next day backlog
                      </span>
                    </div>
                    <span className="font-semibold text-rose-300 px-2 py-0.5 bg-rose-900/60 border border-rose-800/60 rounded-lg">
                      Missed
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Pending Section if today */}
          {pendingTasks.length > 0 && (
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5 mb-2.5">
                <Clock className="w-4 h-4 text-amber-400" />
                Pending ({pendingTasks.length})
              </h4>
              <div className="space-y-2">
                {pendingTasks.map((t) => (
                  <div
                    key={t.id}
                    className="p-3 bg-slate-800/60 rounded-2xl border border-slate-700 flex items-center justify-between text-xs"
                  >
                    <span className="font-bold text-slate-100">{t.title}</span>
                    <span className="font-semibold text-slate-400">In Progress</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-800/80 border-t border-slate-700/80 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-brand-600 hover:bg-brand-500 text-white rounded-xl text-xs font-bold transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
