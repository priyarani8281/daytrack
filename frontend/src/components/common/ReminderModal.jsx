import React, { useState } from 'react';
import { Bell, Clock, Check, ChevronDown, X } from 'lucide-react';
import { useTasks } from '../../context/TaskContext.jsx';

export default function ReminderModal() {
  const { activeReminder, setActiveReminder, completeTask, snoozeTask } = useTasks();
  const [showSnoozeOptions, setShowSnoozeOptions] = useState(false);
  const [loading, setLoading] = useState(false);

  if (!activeReminder) return null;

  const handleComplete = async () => {
    setLoading(true);
    try {
      await completeTask(activeReminder.id);
      setActiveReminder(null);
    } finally {
      setLoading(false);
    }
  };

  const handleSnooze = async (duration) => {
    setLoading(true);
    try {
      await snoozeTask(activeReminder.id, duration);
      setActiveReminder(null);
      setShowSnoozeOptions(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-pop text-slate-100">
      <div className="bg-slate-900 rounded-3xl max-w-md w-full shadow-2xl border border-slate-800 overflow-hidden">
        {/* Header */}
        <div className="bg-slate-800/90 p-6 border-b border-slate-700/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-brand-600 text-white flex items-center justify-center shadow-lg shadow-brand-600/30">
              <Bell className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <span className="text-xs font-bold text-brand-300 uppercase tracking-wider">
                {activeReminder.scheduledTime || 'Scheduled Reminder'}
              </span>
              <h3 className="text-lg font-bold text-white">Task Reminder</h3>
            </div>
          </div>
          <button
            onClick={() => setActiveReminder(null)}
            className="p-1.5 text-slate-400 hover:text-white rounded-full hover:bg-slate-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <p className="text-sm text-slate-400 mb-1">You planned to complete:</p>
          <h4 className="text-xl font-bold text-white leading-snug">
            {activeReminder.title}
          </h4>
          {activeReminder.description && (
            <p className="text-sm text-slate-300 mt-2 bg-slate-800/80 p-3 rounded-xl border border-slate-700">
              {activeReminder.description}
            </p>
          )}

          <div className="mt-4 flex items-center gap-2 text-xs font-semibold text-slate-400">
            <span className="px-2.5 py-1 bg-slate-800 text-slate-300 rounded-lg border border-slate-700">
              {activeReminder.category || 'General'}
            </span>
            <span className="px-2.5 py-1 bg-amber-950/60 text-amber-300 rounded-lg border border-amber-800/60">
              +{activeReminder.taskPoints || 10} points
            </span>
          </div>

          {/* Snooze choices dropdown */}
          {showSnoozeOptions && (
            <div className="mt-5 p-3 bg-slate-800/80 rounded-2xl border border-slate-700 grid grid-cols-2 gap-2 animate-pop">
              <button
                onClick={() => handleSnooze('10m')}
                disabled={loading}
                className="py-2 px-3 text-xs font-semibold text-slate-200 bg-slate-900 hover:bg-brand-500/20 hover:text-brand-300 hover:border-brand-500/40 rounded-xl border border-slate-700 transition-all text-center"
              >
                ⏱️ 10 Minutes
              </button>
              <button
                onClick={() => handleSnooze('30m')}
                disabled={loading}
                className="py-2 px-3 text-xs font-semibold text-slate-200 bg-slate-900 hover:bg-brand-500/20 hover:text-brand-300 hover:border-brand-500/40 rounded-xl border border-slate-700 transition-all text-center"
              >
                ⏱️ 30 Minutes
              </button>
              <button
                onClick={() => handleSnooze('1h')}
                disabled={loading}
                className="py-2 px-3 text-xs font-semibold text-slate-200 bg-slate-900 hover:bg-brand-500/20 hover:text-brand-300 hover:border-brand-500/40 rounded-xl border border-slate-700 transition-all text-center"
              >
                ⏱️ 1 Hour
              </button>
              <button
                onClick={() => handleSnooze('tomorrow')}
                disabled={loading}
                className="py-2 px-3 text-xs font-semibold text-slate-200 bg-slate-900 hover:bg-brand-500/20 hover:text-brand-300 hover:border-brand-500/40 rounded-xl border border-slate-700 transition-all text-center"
              >
                🌅 Tomorrow
              </button>
            </div>
          )}

          {/* Action buttons */}
          <div className="mt-6 flex items-center gap-3">
            <button
              onClick={handleComplete}
              disabled={loading}
              className="flex-1 py-3 px-4 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white font-bold rounded-2xl shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
            >
              <Check className="w-5 h-5" />
              Mark Complete
            </button>
            <button
              onClick={() => setShowSnoozeOptions(!showSnoozeOptions)}
              className="py-3 px-4 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-2xl border border-slate-700 flex items-center gap-1.5 transition-all"
            >
              <Clock className="w-4 h-4" />
              Snooze
              <ChevronDown className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
