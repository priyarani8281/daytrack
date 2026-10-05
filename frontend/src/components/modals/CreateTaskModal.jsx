import React, { useState } from 'react';
import { X, Plus, Sparkles, Calendar, Clock, Tag, Flag } from 'lucide-react';
import { useTasks } from '../../context/TaskContext.jsx';

export default function CreateTaskModal({ isOpen, onClose }) {
  const { createTask, categories, createCategory } = useTasks();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Coding');
  const [priority, setPriority] = useState('medium');
  const [repeatFrequency, setRepeatFrequency] = useState('daily');
  const [repeatDays, setRepeatDays] = useState([0, 1, 2, 3, 4, 5, 6]);
  const [startDate, setStartDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [dueTime, setDueTime] = useState('20:00');
  const [points, setPoints] = useState(10);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // New category creation inline
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [newCatName, setNewCatName] = useState('');

  if (!isOpen) return null;

  const handlePriorityChange = (p) => {
    setPriority(p);
    if (p === 'high' && points < 15) {
      setPoints(15);
    }
  };

  const toggleDay = (dayIndex) => {
    if (repeatDays.includes(dayIndex)) {
      if (repeatDays.length > 1) {
        setRepeatDays(repeatDays.filter(d => d !== dayIndex));
      }
    } else {
      setRepeatDays([...repeatDays, dayIndex].sort());
    }
  };

  const handleCreateNewCategory = async (e) => {
    e.preventDefault();
    if (!newCatName.trim()) return;
    try {
      const res = await createCategory({
        name: newCatName.trim(),
        icon: '🎯',
        color: 'indigo'
      });
      setCategory(res.category.name);
      setNewCatName('');
      setIsAddingCategory(false);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    setIsSubmitting(true);
    try {
      await createTask({
        title: title.trim(),
        description: description.trim(),
        category,
        priority,
        repeatFrequency,
        repeatDays: repeatFrequency === 'selected_days' || repeatFrequency === 'daily' ? repeatDays : [],
        startDate,
        dueTime,
        points: Number(points)
      });
      onClose();
      // Reset form
      setTitle('');
      setDescription('');
    } catch (err) {
      console.error('Failed to create task:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const dayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-pop text-slate-100">
      <div className="bg-slate-900 rounded-3xl max-w-lg w-full shadow-2xl border border-slate-800 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-6 pb-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-brand-500/20 text-brand-400 border border-brand-500/30 flex items-center justify-center font-bold">
              <Plus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Create New Goal / Task</h3>
              <p className="text-xs text-slate-400">Built for accountability & daily streaks</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-full hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1">
          {/* Smart Habit Templates */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-[11px] font-bold text-brand-300 uppercase tracking-wider flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" /> Smart Habit Templates
              </label>
              <span className="text-[10px] text-slate-400">1-click prefill</span>
            </div>
            <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              {[
                { title: 'Solve 3 DSA Problems', cat: 'Coding', prio: 'high', pts: 15, time: '20:00', desc: 'NeetCode 150 practice' },
                { title: 'Deep Work Focus Block (45 min)', cat: 'Study', prio: 'high', pts: 15, time: '10:00', desc: 'Single-tasking study block' },
                { title: '30-Minute Fitness / Walk', cat: 'Health', prio: 'medium', pts: 10, time: '07:30', desc: 'Cardio & mental reset' },
                { title: 'Read 10 Pages of Non-Fiction', cat: 'Reading', prio: 'medium', pts: 10, time: '21:30', desc: 'Daily reading compound habit' },
                { title: 'Practice Python (30 min)', cat: 'Coding', prio: 'medium', pts: 10, time: '18:00', desc: 'Build micro-features' }
              ].map((template, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setTitle(template.title);
                    setCategory(template.cat);
                    setPriority(template.prio);
                    setPoints(template.pts);
                    setDueTime(template.time);
                    setDescription(template.desc);
                    setRepeatFrequency('daily');
                  }}
                  className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 hover:text-white border border-slate-700 rounded-lg text-xs font-semibold text-slate-300 whitespace-nowrap transition-colors"
                >
                  {template.title}
                </button>
              ))}
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
              Task Title *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Solve 3 DSA Problems"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 text-sm font-medium text-slate-100 placeholder:text-slate-500 caret-brand-400"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
              Description / Notes
            </label>
            <textarea
              rows={2}
              placeholder="e.g. NeetCode 150 - Arrays and Dynamic Programming"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 text-sm text-slate-100 placeholder:text-slate-500 resize-none caret-brand-400"
            />
          </div>

          {/* Category & Priority Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Category */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1">
                  <Tag className="w-3.5 h-3.5 text-slate-400" /> Category
                </label>
                <button
                  type="button"
                  onClick={() => setIsAddingCategory(!isAddingCategory)}
                  className="text-xs font-semibold text-brand-400 hover:text-brand-300"
                >
                  {isAddingCategory ? 'Cancel' : '+ New'}
                </button>
              </div>

              {isAddingCategory ? (
                <div className="flex gap-1.5">
                  <input
                    type="text"
                    placeholder="New category"
                    value={newCatName}
                    onChange={(e) => setNewCatName(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs rounded-xl bg-slate-800 border border-slate-700 text-slate-100"
                  />
                  <button
                    type="button"
                    onClick={handleCreateNewCategory}
                    className="px-3 py-1.5 bg-brand-600 hover:bg-brand-500 text-white rounded-xl text-xs font-bold"
                  >
                    Add
                  </button>
                </div>
              ) : (
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm font-medium text-slate-100"
                >
                  {categories.map((c) => (
                    <option key={c.id || c.name} value={c.name}>
                      {c.icon || '📌'} {c.name}
                    </option>
                  ))}
                  {categories.length === 0 && (
                    <>
                      <option value="Coding">💻 Coding</option>
                      <option value="Study">📚 Study</option>
                      <option value="Health">🏃 Health</option>
                      <option value="Reading">📖 Reading</option>
                      <option value="Work">💼 Work</option>
                      <option value="Personal">🎯 Personal</option>
                      <option value="Learning">🧠 Learning</option>
                    </>
                  )}
                </select>
              )}
            </div>

            {/* Priority */}
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                <Flag className="w-3.5 h-3.5 text-slate-400" /> Priority
              </label>
              <div className="grid grid-cols-3 gap-1.5">
                {['low', 'medium', 'high'].map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => handlePriorityChange(p)}
                    className={`py-2 px-1 text-xs font-bold rounded-xl capitalize transition-all border ${
                      priority === p
                        ? p === 'high'
                          ? 'bg-rose-950/60 text-rose-300 border-rose-800/80 shadow-sm'
                          : p === 'medium'
                          ? 'bg-amber-950/60 text-amber-300 border-amber-800/80 shadow-sm'
                          : 'bg-emerald-950/60 text-emerald-300 border-emerald-800/80 shadow-sm'
                        : 'bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-750 hover:text-slate-200'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Repeat Cadence */}
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
              Repeat Frequency
            </label>
            <div className="grid grid-cols-4 gap-2 mb-2">
              {[
                { id: 'daily', label: 'Daily' },
                { id: 'selected_days', label: 'Selected' },
                { id: 'weekly', label: 'Weekly' },
                { id: 'once', label: 'Once' }
              ].map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setRepeatFrequency(opt.id)}
                  className={`py-2 text-xs font-bold rounded-xl transition-all border ${
                    repeatFrequency === opt.id
                      ? 'bg-brand-600 text-white border-brand-500 shadow-md shadow-brand-600/30'
                      : 'bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-750 hover:text-slate-200'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>

            {/* Selected days checkboxes */}
            {(repeatFrequency === 'selected_days' || repeatFrequency === 'daily') && (
              <div className="p-3 bg-slate-800/50 rounded-2xl border border-slate-750 mt-2">
                <span className="text-[11px] font-semibold text-slate-400 block mb-2">
                  Active Days:
                </span>
                <div className="flex justify-between gap-1">
                  {dayLabels.map((lbl, idx) => {
                    const isSelected = repeatDays.includes(idx);
                    return (
                      <button
                        key={lbl}
                        type="button"
                        onClick={() => toggleDay(idx)}
                        className={`w-9 h-9 rounded-xl text-xs font-bold transition-all ${
                          isSelected
                            ? 'bg-brand-600 text-white shadow-sm'
                            : 'bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-700'
                        }`}
                      >
                        {lbl[0]}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Time & Points */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-slate-400" /> Reminder Time
              </label>
              <input
                type="time"
                value={dueTime}
                onChange={(e) => setDueTime(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm font-semibold text-slate-100"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" /> Points Reward
              </label>
              <input
                type="number"
                min="5"
                max="100"
                step="5"
                value={points}
                onChange={(e) => setPoints(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm font-semibold text-slate-100"
              />
            </div>
          </div>
        </form>

        {/* Footer */}
        <div className="p-4 bg-slate-800/80 border-t border-slate-700/80 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 text-sm font-semibold text-slate-400 hover:text-slate-200 rounded-xl hover:bg-slate-800 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={isSubmitting || !title.trim()}
            onClick={handleSubmit}
            className="px-6 py-2.5 text-sm font-bold text-white bg-brand-600 hover:bg-brand-500 disabled:opacity-50 rounded-xl shadow-lg shadow-brand-600/30 transition-all flex items-center gap-2"
          >
            {isSubmitting ? 'Creating...' : 'Create Task'}
          </button>
        </div>
      </div>
    </div>
  );
}
