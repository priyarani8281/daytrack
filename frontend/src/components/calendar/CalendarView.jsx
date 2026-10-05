import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Info } from 'lucide-react';
import { api } from '../../services/api.js';
import DayDetailModal from './DayDetailModal.jsx';

export default function CalendarView() {
  const [currentDate, setCurrentDate] = useState(() => new Date());
  const [calendarDays, setCalendarDays] = useState({});
  const [selectedDay, setSelectedDay] = useState(null);
  const [selectedDateStr, setSelectedDateStr] = useState(null);
  const [loading, setLoading] = useState(true);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth(); // 0-indexed

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const res = await api.getCalendar(year, month + 1);
        setCalendarDays(res.calendarDays || {});
      } catch (err) {
        console.error('Failed to load calendar data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [year, month]);

  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const monthName = currentDate.toLocaleString('default', { month: 'long' });

  // Grid calculation
  const firstDayIndex = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const days = [];
  // Blank padding for days before the 1st
  for (let i = 0; i < firstDayIndex; i++) {
    days.push(null);
  }
  // Days of the month
  for (let d = 1; d <= daysInMonth; d++) {
    days.push(d);
  }

  const handleDateClick = (dayNum) => {
    if (!dayNum) return;
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
    const info = calendarDays[dateStr] || {
      date: dateStr,
      total: 0,
      completed: 0,
      completedLate: 0,
      missed: 0,
      pending: 0,
      pointsEarned: 0,
      tasks: [],
      statusRating: 'none'
    };
    setSelectedDay(info);
    setSelectedDateStr(dateStr);
  };

  const todayStr = new Date().toISOString().split('T')[0];

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 sm:px-6 text-slate-100">
      {/* Title & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-brand-500/20 text-brand-400 flex items-center justify-center border border-brand-500/30">
              <CalendarIcon className="w-5 h-5" />
            </div>
            Consistency Calendar & History
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Audit your daily performance. Click any date to see exact tasks and accountability records.
          </p>
        </div>

        {/* Month Selector */}
        <div className="flex items-center gap-2 bg-slate-900 px-3 py-1.5 rounded-2xl border border-slate-800 shadow-md self-start sm:self-center">
          <button
            onClick={prevMonth}
            className="p-1.5 hover:bg-slate-800 rounded-xl text-slate-300 transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <span className="font-bold text-sm text-slate-100 px-3 min-w-[130px] text-center">
            {monthName} {year}
          </span>
          <button
            onClick={nextMonth}
            className="p-1.5 hover:bg-slate-800 rounded-xl text-slate-300 transition-colors"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Main Calendar Card */}
      <div className="bg-slate-900 rounded-3xl border border-slate-800 shadow-md p-6 sm:p-8">
        {/* Days of week header */}
        <div className="grid grid-cols-7 gap-2 mb-3 text-center">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
            <span key={d} className="text-xs font-bold text-slate-400 uppercase tracking-wider py-1">
              {d}
            </span>
          ))}
        </div>

        {/* Days Grid */}
        <div className="grid grid-cols-7 gap-2 sm:gap-3">
          {days.map((dayNum, idx) => {
            if (!dayNum) {
              return (
                <div
                  key={`blank-${idx}`}
                  className="aspect-square rounded-2xl bg-slate-800/20 opacity-30"
                />
              );
            }

            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
            const info = calendarDays[dateStr];
            const isToday = dateStr === todayStr;

            let badgeColor = 'bg-slate-700';
            let statusText = 'No tasks';
            let dot = '⚪';

            if (info && info.total > 0) {
              if (info.statusRating === 'completed') {
                badgeColor = 'bg-emerald-500';
                statusText = 'Completed';
                dot = '🟢';
              } else if (info.statusRating === 'partial') {
                badgeColor = 'bg-amber-500';
                statusText = 'Partially completed';
                dot = '🟡';
              } else if (info.statusRating === 'missed') {
                badgeColor = 'bg-rose-500';
                statusText = 'Missed';
                dot = '🔴';
              }
            }

            return (
              <button
                key={dateStr}
                onClick={() => handleDateClick(dayNum)}
                className={`group aspect-square rounded-2xl p-2 sm:p-2.5 border transition-all flex flex-col items-center justify-between text-left hover:scale-[1.03] active:scale-[0.98] ${
                  isToday
                    ? 'border-brand-500 ring-2 ring-brand-500/30 bg-brand-950/30'
                    : 'border-slate-800 hover:border-slate-700 bg-slate-800/40 hover:bg-slate-800/80 hover:shadow-lg'
                }`}
              >
                <div className="w-full flex items-center justify-between">
                  <span
                    className={`text-xs sm:text-sm font-bold ${
                      isToday
                        ? 'w-6 h-6 rounded-full bg-brand-600 text-white flex items-center justify-center text-xs'
                        : 'text-slate-300'
                    }`}
                  >
                    {dayNum}
                  </span>
                  {info && info.pointsEarned > 0 && (
                    <span className="hidden sm:inline-block text-[10px] font-bold text-amber-300 bg-amber-950/60 px-1 rounded border border-amber-800/50">
                      +{info.pointsEarned}
                    </span>
                  )}
                </div>

                {/* Status Dot */}
                <div className="flex items-center gap-1 my-auto">
                  <span className={`w-2.5 h-2.5 rounded-full ${badgeColor} shadow-sm`} />
                </div>

                {/* Footer preview */}
                <span className="text-[10px] font-semibold text-slate-400 truncate max-w-full">
                  {info && info.total > 0
                    ? `${info.completed + info.completedLate}/${info.total}`
                    : '—'}
                </span>
              </button>
            );
          })}
        </div>

        {/* Legend */}
        <div className="mt-8 pt-6 border-t border-slate-800 flex items-center justify-center gap-4 sm:gap-8 flex-wrap text-xs font-semibold text-slate-300">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-emerald-500" />
            <span>🟢 Completed</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-amber-500" />
            <span>🟡 Partially Completed</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-rose-500" />
            <span>🔴 Missed</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-slate-700" />
            <span>⚪ No Task</span>
          </div>
        </div>
      </div>

      {/* Date Inspection Modal */}
      {selectedDay && (
        <DayDetailModal
          dayData={selectedDay}
          dateStr={selectedDateStr}
          onClose={() => setSelectedDay(null)}
        />
      )}
    </div>
  );
}
