import { store } from '../models/store.js';
import { getTodayString, addDays, getDatesBetween } from './dateHelpers.js';

export const ALL_BADGES = [
  {
    id: 'first_task',
    name: 'First Step',
    icon: '🏆',
    description: 'Completed your very first task',
    bonusPoints: 25,
    check: (user, occurrences) => occurrences.some(o => o.status === 'completed' || o.status === 'completed_late')
  },
  {
    id: 'streak_3',
    name: 'Consistency Kickstart',
    icon: '🔥',
    description: 'Maintained a 3-day consistency streak',
    bonusPoints: 50,
    check: (user) => (user.currentStreak >= 3 || user.longestStreak >= 3)
  },
  {
    id: 'streak_7',
    name: 'Momentum Master',
    icon: '⚡',
    description: 'Maintained a 7-day consistency streak',
    bonusPoints: 100,
    check: (user) => (user.currentStreak >= 7 || user.longestStreak >= 7)
  },
  {
    id: 'streak_30',
    name: 'Iron Will',
    icon: '👑',
    description: 'Achieved an epic 30-day streak',
    bonusPoints: 250,
    check: (user) => (user.currentStreak >= 30 || user.longestStreak >= 30)
  },
  {
    id: 'comeback_hero',
    name: 'Comeback Hero',
    icon: '🛡️',
    description: 'Recovered and completed 3 missed tasks',
    bonusPoints: 50,
    check: (user, occurrences) => {
      const lateCompletions = occurrences.filter(o => o.status === 'completed_late').length;
      return lateCompletions >= 3;
    }
  },
  {
    id: 'tasks_100',
    name: 'Century Club',
    icon: '💯',
    description: 'Completed 100 total tasks',
    bonusPoints: 200,
    check: (user, occurrences) => {
      const total = occurrences.filter(o => o.status === 'completed' || o.status === 'completed_late').length;
      return total >= 100;
    }
  },
  {
    id: 'points_500',
    name: 'High Roller',
    icon: '🚀',
    description: 'Earned 500 total points',
    bonusPoints: 150,
    check: (user) => user.totalPoints >= 500
  }
];

/**
 * Calculates current streak and longest streak from actual calendar occurrence history.
 * A day is considered "consistent" if all tasks scheduled on that day were completed on that day,
 * or if there were no scheduled tasks, it does not break the streak.
 */
export async function calculateStreaks(userId, targetDate = getTodayString()) {
  const occurrences = await store.findOccurrences({ userId });

  // Group occurrences by scheduledDate
  const dateMap = new Map();
  for (const occ of occurrences) {
    if (!dateMap.has(occ.scheduledDate)) {
      dateMap.set(occ.scheduledDate, []);
    }
    dateMap.get(occ.scheduledDate).push(occ);
  }

  // Find earliest recorded date
  let earliestDate = targetDate;
  for (const occ of occurrences) {
    if (occ.scheduledDate < earliestDate) {
      earliestDate = occ.scheduledDate;
    }
  }

  // Evaluate each day from earliest to targetDate
  const dates = getDatesBetween(earliestDate, targetDate);

  let longest = 0;
  let running = 0;

  for (const d of dates) {
    const dayOccs = dateMap.get(d) || [];
    if (dayOccs.length === 0) {
      // Rest day / no tasks scheduled - keep streak alive without incrementing
      continue;
    }

    // Check if all scheduled tasks on date 'd' were completed on-time (completed)
    // Note: completed_late completed on date 'd' was a past task, whereas tasks scheduled on 'd' that became missed mean 'd' was missed.
    const allCompletedOnTime = dayOccs.every(o => o.status === 'completed');
    const hasPendingOrMissed = dayOccs.some(o => o.status === 'pending' || o.status === 'missed');

    if (d === targetDate) {
      // If it's today and still partially pending, the streak from yesterday is still valid!
      if (allCompletedOnTime) {
        running += 1;
      }
    } else {
      if (allCompletedOnTime) {
        running += 1;
      } else {
        // Day was missed -> streak resets
        running = 0;
      }
    }

    if (running > longest) {
      longest = running;
    }
  }

  return {
    currentStreak: running,
    longestStreak: longest
  };
}

/**
 * Check and award newly unlocked badges.
 */
export async function evaluateBadges(user) {
  const occurrences = await store.findOccurrences({ userId: user.id });
  const unlocked = user.unlockedBadges || [];
  const existingIds = new Set(unlocked.map(b => b.id));

  const newlyUnlocked = [];
  let pointsBonus = 0;

  for (const badge of ALL_BADGES) {
    if (!existingIds.has(badge.id)) {
      if (badge.check(user, occurrences)) {
        const record = {
          id: badge.id,
          name: badge.name,
          icon: badge.icon,
          description: badge.description,
          unlockedAt: new Date().toISOString()
        };
        newlyUnlocked.push(record);
        pointsBonus += badge.bonusPoints;
      }
    }
  }

  if (newlyUnlocked.length > 0) {
    const updatedBadges = [...unlocked, ...newlyUnlocked];
    const newTotalPoints = (user.totalPoints || 0) + pointsBonus;
    await store.updateUser(user.id, {
      unlockedBadges: updatedBadges,
      totalPoints: newTotalPoints
    });
    return { newlyUnlocked, pointsBonus, totalPoints: newTotalPoints };
  }

  return { newlyUnlocked: [], pointsBonus: 0, totalPoints: user.totalPoints };
}
