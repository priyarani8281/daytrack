import React, { useState, useEffect } from 'react';
import { Award, Trophy, Lock, CheckCircle2, Star, Sparkles } from 'lucide-react';
import { api } from '../../services/api.js';

export default function AchievementsView() {
  const [badges, setBadges] = useState([]);
  const [totalPoints, setTotalPoints] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadBadges() {
      try {
        setLoading(true);
        const res = await api.getBadges();
        setBadges(res.badges || []);
        setTotalPoints(res.totalPoints || 0);
      } catch (err) {
        console.error('Failed to load badges:', err);
      } finally {
        setLoading(false);
      }
    }
    loadBadges();
  }, []);

  const unlockedCount = badges.filter(b => b.isUnlocked).length;

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 sm:px-6 text-slate-100">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
              <Trophy className="w-5 h-5" />
            </div>
            Consistency Badges & Milestones
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Celebrate meaningful milestones that reinforce your accountability habits.
          </p>
        </div>

        {/* Points & Badge Counter */}
        <div className="flex items-center gap-3 self-start sm:self-center">
          <div className="bg-slate-900 px-4 py-2 rounded-2xl border border-slate-800 shadow-md flex items-center gap-2">
            <Award className="w-5 h-5 text-brand-400" />
            <span className="text-sm font-bold text-slate-200">
              {unlockedCount} / {badges.length} Unlocked
            </span>
          </div>

          <div className="bg-amber-950/60 px-4 py-2 rounded-2xl border border-amber-800/60 text-amber-300 shadow-md flex items-center gap-2 font-bold text-sm">
            <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
            <span>{totalPoints} Points</span>
          </div>
        </div>
      </div>

      {/* Badges Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {badges.map((badge) => {
          const isUnlocked = badge.isUnlocked;
          return (
            <div
              key={badge.id}
              className={`p-6 rounded-3xl border transition-all flex flex-col justify-between ${
                isUnlocked
                  ? 'bg-slate-900 border-amber-500/40 shadow-md hover:border-amber-500/70 text-slate-100'
                  : 'bg-slate-900/40 border-slate-800/60 opacity-60 text-slate-400'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-3xl">{badge.icon}</span>
                  {isUnlocked ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-950/60 text-emerald-300 border border-emerald-800/60">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Unlocked
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-800 text-slate-400 border border-slate-700">
                      <Lock className="w-3 h-3" /> Locked
                    </span>
                  )}
                </div>

                <h3 className={`text-base font-bold mb-1 ${isUnlocked ? 'text-white' : 'text-slate-400'}`}>
                  {badge.name}
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  {badge.description}
                </p>
              </div>

              <div className="mt-5 pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
                <span className={`font-semibold px-2 py-0.5 rounded-lg border ${
                  isUnlocked
                    ? 'text-amber-300 bg-amber-950/60 border-amber-800/60'
                    : 'text-slate-500 bg-slate-800/60 border-slate-700/60'
                }`}>
                  +{badge.bonusPoints} bonus pts
                </span>
                {isUnlocked && badge.unlockedAt && (
                  <span className="text-[11px] text-slate-400">
                    {badge.unlockedAt.split('T')[0]}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
