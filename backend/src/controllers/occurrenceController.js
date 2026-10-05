import { store } from '../models/store.js';
import { getTodayString, addDays } from '../utils/dateHelpers.js';
import { reconcileUserTasks } from '../utils/reconciliation.js';
import { calculateStreaks, evaluateBadges } from '../utils/gamification.js';

export async function getDashboard(req, res) {
  try {
    const today = req.query.date || getTodayString();
    const userId = req.user.id;

    // 1. Reconcile occurrences & carry forward missed tasks
    const reconciled = await reconcileUserTasks(userId, today);

    // 2. Refresh streaks & badges
    const streaks = await calculateStreaks(userId, today);
    const user = await store.findUserById(userId);

    if (user.currentStreak !== streaks.currentStreak || user.longestStreak < streaks.longestStreak) {
      await store.updateUser(userId, {
        currentStreak: streaks.currentStreak,
        longestStreak: Math.max(user.longestStreak || 0, streaks.longestStreak)
      });
      user.currentStreak = streaks.currentStreak;
      user.longestStreak = Math.max(user.longestStreak || 0, streaks.longestStreak);
    }

    const { newlyUnlocked, totalPoints } = await evaluateBadges(user);
    user.totalPoints = totalPoints;

    // 3. Generate Smart Daily Suggestion ("Your Focus Today")
    const focusItems = [];

    // Pending missed items come first with supportive framing
    if (reconciled.pendingFromPrevious.length > 0) {
      const topMissed = reconciled.pendingFromPrevious[0];
      focusItems.push({
        type: 'missed',
        priority: 'high',
        text: `First, tackle: "${topMissed.title}" (Missed on ${topMissed.originalDueDate}). Complete it today to regain momentum!`,
        taskId: topMissed.id
      });
    }

    // High priority today's tasks
    const highPriorityToday = reconciled.todayTasks.filter(t => t.priority === 'high' && t.status === 'pending');
    for (const t of highPriorityToday) {
      focusItems.push({
        type: 'high_priority',
        priority: 'high',
        text: `High priority today: "${t.title}" (${t.taskPoints} pts)`,
        taskId: t.id
      });
    }

    // Remaining today's tasks
    const remainingToday = reconciled.todayTasks.filter(t => t.priority !== 'high' && t.status === 'pending');
    for (const t of remainingToday.slice(0, 3)) {
      focusItems.push({
        type: 'today_goal',
        priority: 'normal',
        text: `Today's goal: "${t.title}"`,
        taskId: t.id
      });
    }

    // Calculate today's points earned
    let todayPoints = 0;
    for (const occ of reconciled.completedToday) {
      todayPoints += (occ.pointsEarned || 0);
    }

    return res.json({
      targetDate: today,
      todayTasks: reconciled.todayTasks,
      pendingFromPrevious: reconciled.pendingFromPrevious,
      completedToday: reconciled.completedToday,
      stats: reconciled.stats,
      userStats: {
        totalPoints: user.totalPoints,
        todayPoints,
        currentStreak: user.currentStreak,
        longestStreak: user.longestStreak,
        unlockedBadgesCount: (user.unlockedBadges || []).length
      },
      focusToday: {
        greeting: getGreeting(user.name),
        items: focusItems
      },
      newlyUnlockedBadges: newlyUnlocked
    });
  } catch (err) {
    console.error('getDashboard error:', err);
    return res.status(500).json({ message: 'Dashboard retrieval failed: ' + err.message });
  }
}

export async function completeOccurrence(req, res) {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const today = req.body.date || getTodayString();

    const occ = await store.findOccurrenceById(id);
    if (!occ || occ.userId !== userId) {
      return res.status(404).json({ message: 'Task occurrence not found' });
    }

    if (occ.status === 'completed' || occ.status === 'completed_late') {
      return res.status(400).json({ message: 'Task is already completed' });
    }

    const task = await store.findTaskById(occ.taskId);
    const basePoints = task ? task.points : 10;

    let finalStatus = 'completed';
    let pointsAwarded = basePoints;
    let lateBonus = 0;
    let encouragementMessage = 'Task Completed! You are building great consistency.';

    // Check if this was a missed task from a past date
    const isLate = occ.scheduledDate < today || occ.status === 'missed';

    if (isLate) {
      finalStatus = 'completed_late';
      lateBonus = 5; // +5 bonus for catching up on a missed task
      pointsAwarded = basePoints + lateBonus;
      encouragementMessage = `Awesome comeback! You caught up on a missed task from ${occ.originalDueDate}.`;
    }

    // Update occurrence while strictly PRESERVING originalDueDate
    const updatedOcc = await store.updateOccurrence(id, {
      status: finalStatus,
      completedAt: new Date().toISOString(),
      pointsEarned: pointsAwarded,
      notes: isLate ? `Completed late on ${today}` : 'Completed on time'
    });

    // Check if user finished all daily tasks for today for +20 bonus
    let perfectDayBonus = 0;
    const allTodayOccs = await store.findOccurrences({ userId, scheduledDate: today });
    const allDone = allTodayOccs.length > 0 && allTodayOccs.every(o => o.status === 'completed' || o.id === id);
    if (allDone && !isLate) {
      perfectDayBonus = 20;
    }

    // Award points to user
    const user = await store.findUserById(userId);
    const newTotalPoints = (user.totalPoints || 0) + pointsAwarded + perfectDayBonus;

    // Recalculate streaks
    const streaks = await calculateStreaks(userId, today);

    await store.updateUser(userId, {
      totalPoints: newTotalPoints,
      currentStreak: streaks.currentStreak,
      longestStreak: Math.max(user.longestStreak || 0, streaks.longestStreak)
    });

    const refreshedUser = await store.findUserById(userId);
    const { newlyUnlocked } = await evaluateBadges(refreshedUser);

    return res.json({
      occurrence: {
        ...updatedOcc,
        title: task ? task.title : 'Task',
        category: task ? task.category : 'General'
      },
      pointsAwarded,
      lateBonus,
      perfectDayBonus,
      totalBonusPoints: pointsAwarded + perfectDayBonus,
      encouragementMessage,
      user: {
        totalPoints: refreshedUser.totalPoints,
        currentStreak: refreshedUser.currentStreak,
        longestStreak: refreshedUser.longestStreak
      },
      newlyUnlockedBadges: newlyUnlocked
    });
  } catch (err) {
    console.error('Complete occurrence error:', err);
    return res.status(500).json({ message: 'Failed to complete task: ' + err.message });
  }
}

export async function uncompleteOccurrence(req, res) {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const today = getTodayString();

    const occ = await store.findOccurrenceById(id);
    if (!occ || occ.userId !== userId) {
      return res.status(404).json({ message: 'Task occurrence not found' });
    }

    const deductedPoints = occ.pointsEarned || 0;
    const resetStatus = occ.scheduledDate < today ? 'missed' : 'pending';

    const updatedOcc = await store.updateOccurrence(id, {
      status: resetStatus,
      completedAt: null,
      pointsEarned: 0,
      notes: ''
    });

    const user = await store.findUserById(userId);
    const newTotalPoints = Math.max(0, (user.totalPoints || 0) - deductedPoints);

    const streaks = await calculateStreaks(userId, today);
    await store.updateUser(userId, {
      totalPoints: newTotalPoints,
      currentStreak: streaks.currentStreak,
      longestStreak: Math.max(user.longestStreak || 0, streaks.longestStreak)
    });

    return res.json({
      occurrence: updatedOcc,
      deductedPoints,
      user: {
        totalPoints: newTotalPoints,
        currentStreak: streaks.currentStreak,
        longestStreak: streaks.longestStreak
      }
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
}

export async function snoozeOccurrence(req, res) {
  try {
    const { id } = req.params;
    const { duration = '30m' } = req.body; // '10m', '30m', '1h', 'tomorrow'
    const occ = await store.findOccurrenceById(id);
    if (!occ || occ.userId !== req.user.id) {
      return res.status(404).json({ message: 'Task occurrence not found' });
    }

    let snoozeTime = new Date();
    if (duration === '10m') snoozeTime.setMinutes(snoozeTime.getMinutes() + 10);
    else if (duration === '30m') snoozeTime.setMinutes(snoozeTime.getMinutes() + 30);
    else if (duration === '1h') snoozeTime.setHours(snoozeTime.getHours() + 1);
    else if (duration === 'tomorrow') {
      const tomorrow = addDays(getTodayString(), 1);
      const updated = await store.updateOccurrence(id, {
        snoozeUntil: `${tomorrow}T09:00:00Z`
      });
      return res.json({ message: 'Snoozed until tomorrow', occurrence: updated });
    }

    const updated = await store.updateOccurrence(id, {
      snoozeUntil: snoozeTime.toISOString()
    });

    return res.json({
      message: `Snoozed for ${duration}`,
      occurrence: updated
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
}

export async function getCalendarData(req, res) {
  try {
    const userId = req.user.id;
    const { year, month } = req.query; // e.g. 2026, 10
    const occurrences = await store.findOccurrences({ userId });
    const tasks = await store.findTasks({ userId });
    const taskMap = new Map(tasks.map(t => [t.id, t]));

    // Group by scheduledDate
    const dateMap = {};

    for (const occ of occurrences) {
      const d = occ.scheduledDate;
      if (!dateMap[d]) {
        dateMap[d] = {
          date: d,
          total: 0,
          completed: 0,
          completedLate: 0,
          missed: 0,
          pending: 0,
          pointsEarned: 0,
          tasks: []
        };
      }

      const pTask = taskMap.get(occ.taskId) || {};
      const enriched = {
        ...occ,
        title: pTask.title || 'Task',
        category: pTask.category || 'General',
        priority: pTask.priority || 'medium'
      };

      dateMap[d].total += 1;
      dateMap[d].pointsEarned += (occ.pointsEarned || 0);
      dateMap[d].tasks.push(enriched);

      if (occ.status === 'completed') dateMap[d].completed += 1;
      else if (occ.status === 'completed_late') dateMap[d].completedLate += 1;
      else if (occ.status === 'missed') dateMap[d].missed += 1;
      else if (occ.status === 'pending') dateMap[d].pending += 1;
    }

    // Determine status rating for each date:
    // 🟢 'completed' = all tasks completed or completed_late
    // 🟡 'partial' = some completed, some missed/pending
    // 🔴 'missed' = tasks exist, none completed
    // ⚪ 'none' = no tasks scheduled
    const calendarDays = {};
    for (const [dateStr, info] of Object.entries(dateMap)) {
      let statusRating = 'none';
      const finished = info.completed + info.completedLate;
      if (info.total > 0) {
        if (finished === info.total) {
          statusRating = 'completed'; // 🟢
        } else if (finished > 0) {
          statusRating = 'partial'; // 🟡
        } else {
          statusRating = 'missed'; // 🔴
        }
      }
      calendarDays[dateStr] = {
        ...info,
        statusRating
      };
    }

    return res.json({ calendarDays });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
}

function getGreeting(name = 'there') {
  const hour = new Date().getHours();
  const firstName = name.split(' ')[0] || 'Friend';
  if (hour < 12) return `Good Morning, ${firstName}!`;
  if (hour < 18) return `Good Afternoon, ${firstName}!`;
  return `Good Evening, ${firstName}!`;
}
