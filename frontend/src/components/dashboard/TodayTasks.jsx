import React, { useState } from 'react';
import { Check, Clock, Trash2, Plus, Filter, Tag, Flag, Sparkles, Calendar as CalendarIcon, Wand2 } from 'lucide-react';
import { useTasks } from '../../context/TaskContext.jsx';
import SnoozeModal from '../modals/SnoozeModal.jsx';
import TaskBreakdownModal from '../ai/TaskBreakdownModal.jsx';
import { api } from '../../services/api.js';

export default function TodayTasks({ onOpenCreateModal }) {
  const { dashboardData, completeTask, uncompleteTask, deleteTask } = useTasks();
  const [filter, setFilter] = useState('all'); // 'all', 'pending', 'completed'
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [snoozeTaskItem, setSnoozeTaskItem] = useState(null);
  const [breakdownTaskItem, setBreakdownTaskItem] = useState(null);
  const [togglingId, setTogglingId] = useState(null);

  if (!dashboardData) return null;

  const { todayTasks = [] } = dashboardData;

  // Extract unique categories from today's tasks
  const availableCategories = Array.from(new Set(todayTasks.map(t => t.category).filter(Boolean)));

  const filteredTasks = todayTasks.filter((task) => {
    if (filter === 'pending' && task.status !== 'pending') return false;
    if (filter === 'completed' && task.status !== 'completed' && task.status !== 'completed_late') return false;
    if (selectedCategory !== 'all' && task.category !== selectedCategory) return false;
    return true;
  });

  const handleToggle = async (task) => {
    setTogglingId(task.id);
    try {
      if (task.status === 'completed' || task.status === 'completed_late') {
        await uncompleteTask(task.id);
      } else {
        await completeTask(task.id);
      }
    } finally {
      setTogglingId(null);
    }
  };

  const handleDelete = async (taskId) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      await deleteTask(taskId);
    }
  };

  return (
    <div className="text-slate-100">
      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
        <div>
          <h3 className="font-bold text-white text-lg">Today's Tasks</h3>
          <p className="text-xs text-slate-400">
            {todayTasks.filter(t => t.status === 'completed' || t.status === 'completed_late').length} of {todayTasks.length} tasks completed
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Status filters */}
          <div className="bg-slate-800 p-1 rounded-xl flex text-xs font-semibold border border-slate-700">
            {['all', 'pending', 'completed'].map((tab) => (
              <button
                key={tab}
                onClick={() => setFilter(tab)}
                className={`px-3 py-1 rounded-lg capitalize transition-all ${
                  filter === tab
                    ? 'bg-slate-700 text-white shadow-sm font-bold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Category filter */}
          {availableCategories.length > 0 && (
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="text-xs font-semibold bg-slate-800 border border-slate-700 px-3 py-1.5 rounded-xl text-slate-200 focus:outline-none focus:ring-1 focus:ring-brand-500"
            >
              <option value="all">All Categories</option>
              {availableCategories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          )}

          <button
            onClick={onOpenCreateModal}
            className="px-3.5 py-1.5 bg-brand-600 hover:bg-brand-500 active:bg-brand-700 text-white rounded-xl text-xs font-bold shadow-lg shadow-brand-600/30 flex items-center gap-1.5 transition-all"
          >
            <Plus className="w-4 h-4" /> Add Task
          </button>
        </div>
      </div>

      {/* Empty State */}
      {filteredTasks.length === 0 && (
        <div className="p-10 bg-slate-900/50 rounded-3xl border border-dashed border-slate-800 text-center">
          <p className="text-sm font-semibold text-slate-300 mb-1">
            {filter === 'completed' ? 'No completed tasks yet' : 'No tasks scheduled for today'}
          </p>
          <p className="text-xs text-slate-500 mb-4">
            Build consistency by adding daily goals that hold you accountable.
          </p>
          <button
            onClick={onOpenCreateModal}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-semibold transition-colors inline-flex items-center gap-1.5 border border-slate-700"
          >
            <Plus className="w-3.5 h-3.5" /> Create Task
          </button>
        </div>
      )}

      {/* Tasks List */}
      <div className="space-y-2.5">
        {filteredTasks.map((task) => {
          const isDone = task.status === 'completed' || task.status === 'completed_late';
          return (
            <div
              key={task.id}
              className={`p-4 rounded-2xl border transition-all flex items-center justify-between gap-3 group ${
                isDone
                  ? 'border-slate-800/80 bg-slate-800/30 opacity-75'
                  : 'border-slate-800 hover:border-slate-700 bg-slate-800/60 hover:bg-slate-800/90 shadow-sm'
              }`}
            >
              {/* Left: Checkbox + Info */}
              <div className="flex items-center gap-3.5 min-w-0">
                {/* Custom Checkbox */}
                <button
                  type="button"
                  disabled={togglingId === task.id}
                  onClick={() => handleToggle(task)}
                  className={`w-6 h-6 rounded-lg flex items-center justify-center border transition-all ${
                    isDone
                      ? 'bg-emerald-500 border-emerald-500 text-white shadow-sm'
                      : 'border-slate-600 hover:border-brand-400 bg-slate-900'
                  }`}
                >
                  {isDone && <Check className="w-4 h-4 stroke-[3]" />}
                </button>

                {/* Text & Meta */}
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span
                      className={`text-sm font-bold truncate ${
                        isDone ? 'line-through text-slate-500' : 'text-slate-100'
                      }`}
                    >
                      {task.title}
                    </span>

                    {/* Category pill */}
                    <span className="px-2 py-0.5 text-[11px] font-semibold rounded-md bg-slate-800 text-slate-300 border border-slate-700">
                      {task.category || 'General'}
                    </span>

                    {/* Priority badge */}
                    {task.priority === 'high' && (
                      <span className="px-2 py-0.5 text-[11px] font-bold rounded-md bg-rose-950/60 text-rose-300 border border-rose-800/60">
                        High Priority
                      </span>
                    )}
                  </div>

                  {task.description && (
                    <p className="text-xs text-slate-400 truncate mt-0.5">
                      {task.description}
                    </p>
                  )}
                </div>
              </div>

              {/* Right: Time, Points & Actions */}
              <div className="flex items-center gap-2 shrink-0">
                {/* Time */}
                {task.scheduledTime && (
                  <span className="hidden sm:flex items-center gap-1 text-xs text-slate-400 font-medium">
                    <Clock className="w-3.5 h-3.5" />
                    {task.scheduledTime}
                  </span>
                )}

                {/* Points */}
                <span className="px-2 py-1 bg-amber-950/60 text-amber-300 border border-amber-800/60 rounded-lg text-xs font-bold flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-amber-400" />
                  +{task.taskPoints || 10}
                </span>

                {/* AI Breakdown Button */}
                {!isDone && (
                  <button
                    onClick={() => setBreakdownTaskItem(task)}
                    className="p-1.5 text-brand-300 hover:text-white bg-brand-500/20 hover:bg-brand-500/30 border border-brand-500/40 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all"
                    title="AI Micro-Step Breakdown"
                  >
                    <Wand2 className="w-3.5 h-3.5" />
                    <span className="hidden lg:inline text-[11px]">AI Steps</span>
                  </button>
                )}

                {/* Add to Google Calendar */}
                <button
                  onClick={async () => {
                    try {
                      const res = await api.getGoogleCalendarUrl({
                        taskId: task.taskId,
                        date: task.scheduledDate,
                        time: task.scheduledTime
                      });
                      if (res.googleCalendarUrl) {
                        window.open(res.googleCalendarUrl, '_blank');
                      }
                    } catch (e) {
                      console.error('Google calendar error', e);
                    }
                  }}
                  className="p-1.5 text-slate-400 hover:text-blue-400 rounded-lg hover:bg-slate-800 opacity-0 group-hover:opacity-100 transition-opacity"
                  title="Add to Google Calendar"
                >
                  <CalendarIcon className="w-3.5 h-3.5" />
                </button>

                {/* Snooze (only if pending) */}
                {!isDone && (
                  <button
                    onClick={() => setSnoozeTaskItem(task)}
                    className="p-1.5 text-slate-400 hover:text-slate-200 rounded-lg hover:bg-slate-800 opacity-0 group-hover:opacity-100 transition-opacity"
                    title="Snooze"
                  >
                    <Clock className="w-4 h-4" />
                  </button>
                )}

                {/* Delete */}
                <button
                  onClick={() => handleDelete(task.taskId)}
                  className="p-1.5 text-slate-400 hover:text-rose-400 rounded-lg hover:bg-slate-800 opacity-0 group-hover:opacity-100 transition-opacity"
                  title="Delete recurring task"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {snoozeTaskItem && (
        <SnoozeModal
          task={snoozeTaskItem}
          onClose={() => setSnoozeTaskItem(null)}
        />
      )}

      {breakdownTaskItem && (
        <TaskBreakdownModal
          task={breakdownTaskItem}
          onClose={() => setBreakdownTaskItem(null)}
        />
      )}
    </div>
  );
}
