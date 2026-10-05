import React, { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, Flame, Star, CheckCircle, AlertTriangle, Calendar, Award } from 'lucide-react';
import { api } from '../../services/api.js';

export default function ProgressView() {
  const [stats, setStats] = useState(null);
  const [heatmapData, setHeatmapData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      try {
        setLoading(true);
        const [overviewRes, heatmapRes] = await Promise.all([
          api.getStatsOverview(),
          api.getContributionHeatmap()
        ]);
        setStats(overviewRes);
        setHeatmapData(heatmapRes.heatmap || []);
      } catch (err) {
        console.error('Failed to load stats:', err);
      } finally {
        setLoading(false);
      }
    }
    loadStats();
  }, []);

  if (loading || !stats) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-16 text-center text-slate-400">
        Loading analytics...
      </div>
    );
  }

  const { summary, weeklyData = [], categoryDistribution = [] } = stats;

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 sm:px-6 text-slate-100">
      {/* Title */}
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center border border-indigo-500/30">
            <BarChart3 className="w-5 h-5" />
          </div>
          Consistency Analytics & Progress
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Detailed metrics tracking your habits, weekly completion, and long-term consistency graph.
        </p>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="p-5 bg-slate-900 rounded-3xl border border-slate-800 shadow-md">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">
            Completion Rate
          </span>
          <span className="text-3xl font-black text-white">
            {summary.overallRate}%
          </span>
          <span className="text-xs text-emerald-400 font-semibold mt-1 block">
            Overall efficiency
          </span>
        </div>

        <div className="p-5 bg-slate-900 rounded-3xl border border-slate-800 shadow-md">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">
            Tasks Completed
          </span>
          <span className="text-3xl font-black text-emerald-400">
            {summary.totalCompleted}
          </span>
          <span className="text-xs text-slate-400 mt-1 block">
            Across all time
          </span>
        </div>

        <div className="p-5 bg-slate-900 rounded-3xl border border-slate-800 shadow-md">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">
            Current / Best Streak
          </span>
          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-black text-amber-400">
              {summary.currentStreak}
            </span>
            <span className="text-sm text-slate-400 font-bold">
              / {summary.longestStreak} d
            </span>
          </div>
          <span className="text-xs text-amber-400 font-semibold mt-1 block">
            🔥 Consistency record
          </span>
        </div>

        <div className="p-5 bg-slate-900 rounded-3xl border border-slate-800 shadow-md">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">
            Total Points
          </span>
          <span className="text-3xl font-black text-purple-400">
            {summary.totalPoints}
          </span>
          <span className="text-xs text-purple-300 font-semibold mt-1 block">
            ⭐ Earned rewards
          </span>
        </div>
      </div>

      {/* Weekly Completion Bar Chart */}
      <div className="bg-slate-900 rounded-3xl border border-slate-800 shadow-md p-6 sm:p-8 mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-bold text-white">Weekly Completion Rate</h3>
            <p className="text-xs text-slate-400">Performance across the last 7 days</p>
          </div>
          <span className="text-xs font-bold px-3 py-1 bg-slate-800 text-slate-300 border border-slate-700 rounded-full">
            Past 7 Days
          </span>
        </div>

        <div className="space-y-3.5">
          {weeklyData.map((d) => (
            <div key={d.date} className="flex items-center gap-3">
              <span className="w-10 text-xs font-bold text-slate-300 shrink-0">
                {d.dayName}
              </span>
              <div className="flex-1 bg-slate-800 h-6 rounded-xl overflow-hidden relative flex border border-slate-750">
                <div
                  className="bg-emerald-500 h-full rounded-xl transition-all duration-500 flex items-center justify-end px-2"
                  style={{ width: `${Math.max(d.rate, 0)}%` }}
                >
                  {d.rate > 15 && (
                    <span className="text-[10px] font-bold text-white leading-none">
                      {d.rate}%
                    </span>
                  )}
                </div>
              </div>
              <span className="text-xs font-semibold text-slate-400 w-16 text-right shrink-0">
                {d.completed}/{d.total} done
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* GitHub-style Contribution Heatmap */}
      <div className="bg-slate-900 rounded-3xl border border-slate-800 shadow-md p-6 sm:p-8 mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-bold text-white">Consistency Heatmap</h3>
            <p className="text-xs text-slate-400">Every completed task fuels your consistency grid (Past 12 Weeks)</p>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <span>Less</span>
            <span className="w-3 h-3 rounded-md bg-slate-800 border border-slate-700" />
            <span className="w-3 h-3 rounded-md bg-emerald-900" />
            <span className="w-3 h-3 rounded-md bg-emerald-700" />
            <span className="w-3 h-3 rounded-md bg-emerald-500" />
            <span>More</span>
          </div>
        </div>

        {/* Heatmap Grid */}
        <div className="overflow-x-auto pb-2">
          <div className="inline-grid grid-rows-7 grid-flow-col gap-1.5">
            {heatmapData.map((cell) => {
              let bg = 'bg-slate-800 border border-slate-750';
              if (cell.level === 1) bg = 'bg-emerald-900/80';
              else if (cell.level === 2) bg = 'bg-emerald-700';
              else if (cell.level === 3) bg = 'bg-emerald-500';
              else if (cell.level >= 4) bg = 'bg-emerald-400';

              return (
                <div
                  key={cell.date}
                  className={`w-3.5 h-3.5 rounded-md ${bg} transition-transform hover:scale-125 cursor-pointer`}
                  title={`${cell.date}: ${cell.count} tasks completed`}
                />
              );
            })}
          </div>
        </div>
      </div>

      {/* Category Breakdown */}
      {categoryDistribution.length > 0 && (
        <div className="bg-slate-900 rounded-3xl border border-slate-800 shadow-md p-6 sm:p-8">
          <h3 className="text-lg font-bold text-white mb-1">Category Distribution</h3>
          <p className="text-xs text-slate-400 mb-6">Where your focused energy went</p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {categoryDistribution.map((cat) => (
              <div
                key={cat.name}
                className="p-4 bg-slate-800/60 rounded-2xl border border-slate-700/60 flex flex-col justify-between"
              >
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  {cat.name}
                </span>
                <div className="flex items-baseline gap-1 mt-2">
                  <span className="text-2xl font-black text-white">
                    {cat.count}
                  </span>
                  <span className="text-xs text-slate-400">completed</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
