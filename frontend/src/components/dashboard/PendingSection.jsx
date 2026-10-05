import React, { useState } from 'react';
import { AlertCircle, Check, Clock, Sparkles, ChevronRight, HelpCircle, Calendar as CalendarIcon, Wand2 } from 'lucide-react';
import { useTasks } from '../../context/TaskContext.jsx';
import SnoozeModal from '../modals/SnoozeModal.jsx';
import TaskBreakdownModal from '../ai/TaskBreakdownModal.jsx';
import { api } from '../../services/api.js';

export default function PendingSection() {
  const { dashboardData, completeTask } = useTasks();
  const [snoozeTaskItem, setSnoozeTaskItem] = useState(null);
  const [breakdownTaskItem, setBreakdownTaskItem] = useState(null);
  const [processingId, setProcessingId] = useState(null);

  if (!dashboardData) return null;

  const { pendingFromPrevious = [], completedToday = [] } = dashboardData;

  // Filter completedToday tasks that were originally missed from an earlier date (completed late)
  const completedLateToday = completedToday.filter(
    (occ) => occ.status === 'completed_late'
  );

  const handleCompletePending = async (occ) => {
    setProcessingId(occ.id);
    try {
      await completeTask(occ.id);
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="mb-10 text-slate-100">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold border border-amber-500/30">
            <AlertCircle className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-white text-base">
                Pending From Previous Days
              </h3>
              {pendingFromPrevious.length > 0 && (
                <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  {pendingFromPrevious.length} to catch up
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400">
              Don’t let missed tasks disappear. Complete them today for bonus catch-up points!
            </p>
          </div>
        </div>
      </div>

      {/* When no pending tasks */}
      {pendingFromPrevious.length === 0 && completedLateToday.length === 0 && (
        <div className="p-6 bg-slate-900 rounded-3xl border border-dashed border-slate-800 text-center">
          <div className="w-10 h-10 rounded-full bg-emerald-950/60 text-emerald-400 border border-emerald-800/40 flex items-center justify-center mx-auto mb-2">
            <Check className="w-5 h-5" />
          </div>
          <p className="text-sm font-semibold text-slate-200">No overdue tasks from previous days!</p>
          <p className="text-xs text-slate-400 mt-0.5">
            Your backlog is completely clean. Outstanding consistency!
          </p>
        </div>
      )}

      {/* Active Pending Missed Tasks List */}
      <div className="space-y-3">
        {pendingFromPrevious.map((occ) => (
          <div
            key={occ.id}
            className="p-4 sm:p-5 bg-amber-950/20 rounded-3xl border border-amber-500/30 shadow-md hover:border-amber-500/50 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
          >
            <div className="flex items-start gap-3.5">
              <div className="w-9 h-9 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center shrink-0 shadow-sm mt-0.5">
                <AlertCircle className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h4 className="font-bold text-white text-sm sm:text-base">
                    {occ.title}
                  </h4>
                  <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    Missed on {occ.originalDueDate}
                  </span>
                  <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                    {occ.category || 'General'}
                  </span>
                </div>

                {occ.description && (
                  <p className="text-xs text-slate-300 mt-1 line-clamp-1">
                    {occ.description}
                  </p>
                )}

                <p className="text-xs text-amber-300 font-medium mt-1.5 flex items-center gap-1">
                  <span>💡</span>
                  <span>
                    You missed this on {occ.originalDueDate}. No problem — you can still complete it today for <strong>+{occ.taskPoints + 5} points</strong>!
                  </span>
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
              {/* AI Micro-Step Breakdown */}
              <button
                onClick={() => setBreakdownTaskItem(occ)}
                className="p-2.5 text-brand-300 bg-brand-500/15 hover:bg-brand-500/25 rounded-xl border border-brand-500/30 text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm"
                title="AI Micro-Step Breakdown"
              >
                <Wand2 className="w-3.5 h-3.5" />
                <span>AI Steps</span>
              </button>

              {/* Add to Google Calendar */}
              <button
                onClick={async () => {
                  try {
                    const res = await api.getGoogleCalendarUrl({
                      occurrenceId: occ.id,
                      date: occ.scheduledDate,
                      time: occ.scheduledTime
                    });
                    if (res.googleCalendarUrl) {
                      window.open(res.googleCalendarUrl, '_blank');
                    }
                  } catch (e) {
                    console.error('Google calendar error', e);
                  }
                }}
                className="p-2.5 text-slate-300 hover:text-blue-400 bg-slate-800 hover:bg-slate-700 rounded-xl border border-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                title="Add to Google Calendar"
              >
                <CalendarIcon className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={() => setSnoozeTaskItem(occ)}
                className="p-2.5 text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl border border-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                title="Snooze reminder"
              >
                <Clock className="w-3.5 h-3.5" />
                Snooze
              </button>
              <button
                disabled={processingId === occ.id}
                onClick={() => handleCompletePending(occ)}
                className="px-4 py-2.5 bg-brand-600 hover:bg-brand-500 active:bg-brand-700 text-white text-xs font-bold rounded-xl shadow-lg shadow-brand-600/30 flex items-center gap-1.5 transition-all disabled:opacity-50"
              >
                <Check className="w-4 h-4" />
                {processingId === occ.id ? 'Completing...' : 'Complete Today'}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Tasks Completed Late Today (Audit Trail) */}
      {completedLateToday.length > 0 && (
        <div className="mt-4 pt-3 border-t border-slate-800">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">
            Recovered Today
          </span>
          <div className="space-y-2">
            {completedLateToday.map((occ) => (
              <div
                key={occ.id}
                className="p-3 bg-slate-800/50 rounded-2xl border border-slate-700/60 flex items-center justify-between text-xs text-slate-300"
              >
                <div className="flex items-center gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center font-bold">
                    ✓
                  </span>
                  <div>
                    <span className="font-semibold text-slate-300 line-through">
                      {occ.title}
                    </span>
                    <span className="text-[11px] text-slate-400 ml-2">
                      (Originally due: {occ.originalDueDate} • Completed today)
                    </span>
                  </div>
                </div>
                <span className="font-bold text-amber-300 bg-amber-950/60 border border-amber-800/60 px-2 py-0.5 rounded-full">
                  +{occ.pointsEarned || 15} pts
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Snooze Modal Trigger */}
      {snoozeTaskItem && (
        <SnoozeModal
          task={snoozeTaskItem}
          onClose={() => setSnoozeTaskItem(null)}
        />
      )}

      {/* AI Breakdown Modal Trigger */}
      {breakdownTaskItem && (
        <TaskBreakdownModal
          task={breakdownTaskItem}
          onClose={() => setBreakdownTaskItem(null)}
        />
      )}
    </div>
  );
}
