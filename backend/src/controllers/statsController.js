import { store } from '../models/store.js';
import { getTodayString, addDays, getDatesBetween } from '../utils/dateHelpers.js';
import { ALL_BADGES } from '../utils/gamification.js';

export async function getStatsOverview(req, res) {
  try {
    const userId = req.user.id;
    const today = getTodayString();
    const user = await store.findUserById(userId);
    const occurrences = await store.findOccurrences({ userId });
    const tasks = await store.findTasks({ userId });
    const taskMap = new Map(tasks.map(t => [t.id, t]));

    // 1. Weekly Completion (last 7 days ending today)
    const weeklyData = [];
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    for (let i = 6; i >= 0; i--) {
      const d = addDays(today, -i);
      const [year, month, day] = d.split('-').map(Number);
      const dayOfWeekIndex = new Date(year, month - 1, day).getDay();

      const dayOccs = occurrences.filter(o => o.scheduledDate === d);
      const completed = dayOccs.filter(o => o.status === 'completed' || o.status === 'completed_late').length;
      const missed = dayOccs.filter(o => o.status === 'missed').length;
      const pending = dayOccs.filter(o => o.status === 'pending').length;

      weeklyData.push({
        date: d,
        dayName: dayNames[dayOfWeekIndex],
        total: dayOccs.length,
        completed,
        missed,
        pending,
        rate: dayOccs.length > 0 ? Math.round((completed / dayOccs.length) * 100) : 0
      });
    }

    // 2. Category Breakdown
    const categoryStats = {};
    for (const occ of occurrences) {
      if (occ.status === 'completed' || occ.status === 'completed_late') {
        const pTask = taskMap.get(occ.taskId);
        const cat = pTask ? pTask.category : 'General';
        categoryStats[cat] = (categoryStats[cat] || 0) + 1;
      }
    }

    const categoryList = Object.entries(categoryStats).map(([name, count]) => ({
      name,
      count
    })).sort((a, b) => b.count - a.count);

    // 3. Overall numbers
    const totalCompleted = occurrences.filter(o => o.status === 'completed' || o.status === 'completed_late').length;
    const totalMissed = occurrences.filter(o => o.status === 'missed').length;
    const totalTasksTracked = occurrences.length;
    const overallRate = totalTasksTracked > 0 ? Math.round((totalCompleted / totalTasksTracked) * 100) : 0;

    return res.json({
      summary: {
        totalCompleted,
        totalMissed,
        totalPoints: user.totalPoints || 0,
        currentStreak: user.currentStreak || 0,
        longestStreak: user.longestStreak || 0,
        overallRate
      },
      weeklyData,
      categoryDistribution: categoryList
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
}

export async function getContributionHeatmap(req, res) {
  try {
    const userId = req.user.id;
    const today = getTodayString();
    const startDate = addDays(today, -84); // 12 weeks of heatmap
    const dates = getDatesBetween(startDate, today);

    const occurrences = await store.findOccurrences({ userId });
    const countMap = {};

    for (const occ of occurrences) {
      if (occ.status === 'completed' || occ.status === 'completed_late') {
        const d = occ.completedAt ? occ.completedAt.split('T')[0] : occ.scheduledDate;
        countMap[d] = (countMap[d] || 0) + 1;
      }
    }

    const heatmap = dates.map(d => {
      const count = countMap[d] || 0;
      let level = 0;
      if (count === 1) level = 1;
      else if (count === 2) level = 2;
      else if (count === 3) level = 3;
      else if (count >= 4) level = 4;

      return {
        date: d,
        count,
        level // 0: None, 1: 1 task, 2: 2 tasks, 3: 3 tasks, 4: 4+ tasks
      };
    });

    return res.json({ heatmap });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
}

export async function getBadges(req, res) {
  try {
    const userId = req.user.id;
    const user = await store.findUserById(userId);
    const occurrences = await store.findOccurrences({ userId });

    const unlockedMap = new Map((user.unlockedBadges || []).map(b => [b.id, b]));

    const badges = ALL_BADGES.map(badge => {
      const isUnlocked = unlockedMap.has(badge.id);
      const unlockedInfo = unlockedMap.get(badge.id);

      return {
        id: badge.id,
        name: badge.name,
        icon: badge.icon,
        description: badge.description,
        bonusPoints: badge.bonusPoints,
        isUnlocked,
        unlockedAt: isUnlocked ? unlockedInfo.unlockedAt : null
      };
    });

    return res.json({ badges, totalPoints: user.totalPoints || 0 });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
}
