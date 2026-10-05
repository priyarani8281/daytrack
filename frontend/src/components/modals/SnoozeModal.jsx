import React, { useState } from 'react';
import { Clock, X } from 'lucide-react';
import { useTasks } from '../../context/TaskContext.jsx';

export default function SnoozeModal({ task, onClose }) {
  const { snoozeTask } = useTasks();
  const [loading, setLoading] = useState(false);

  if (!task) return null;

  const handleSnooze = async (duration) => {
    setLoading(true);
    try {
      await snoozeTask(task.id, duration);
      onClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-pop text-slate-100">
      <div className="bg-slate-900 rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-800">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-white">Snooze Task</h3>
              <p className="text-xs text-slate-400">Postpone reminder</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white rounded-full hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-sm font-semibold text-slate-200 mb-4 line-clamp-1">
          "{task.title}"
        </p>

        <div className="grid grid-cols-2 gap-2.5">
          <button
            disabled={loading}
            onClick={() => handleSnooze('10m')}
            className="p-3 text-xs font-semibold text-slate-200 bg-slate-800 hover:bg-brand-500/20 hover:text-brand-300 hover:border-brand-500/40 rounded-xl border border-slate-700 transition-all text-center"
          >
            ⏱️ 10 Minutes
          </button>
          <button
            disabled={loading}
            onClick={() => handleSnooze('30m')}
            className="p-3 text-xs font-semibold text-slate-200 bg-slate-800 hover:bg-brand-500/20 hover:text-brand-300 hover:border-brand-500/40 rounded-xl border border-slate-700 transition-all text-center"
          >
            ⏱️ 30 Minutes
          </button>
          <button
            disabled={loading}
            onClick={() => handleSnooze('1h')}
            className="p-3 text-xs font-semibold text-slate-200 bg-slate-800 hover:bg-brand-500/20 hover:text-brand-300 hover:border-brand-500/40 rounded-xl border border-slate-700 transition-all text-center"
          >
            ⏱️ 1 Hour
          </button>
          <button
            disabled={loading}
            onClick={() => handleSnooze('tomorrow')}
            className="p-3 text-xs font-semibold text-slate-200 bg-slate-800 hover:bg-brand-500/20 hover:text-brand-300 hover:border-brand-500/40 rounded-xl border border-slate-700 transition-all text-center"
          >
            🌅 Tomorrow
          </button>
        </div>
      </div>
    </div>
  );
}
