import { v4 as uuidv4 } from 'uuid';
import { store } from '../models/store.js';
import { getTodayString, addDays, getDatesBetween, isScheduledOn } from './dateHelpers.js';

export async function reconcileUserTasks(userId, targetDate = getTodayString()) {
  const tasks = await store.findTasks({ userId, isActive: true });
  const allOccurrences = await store.findOccurrences({ userId });

  // Map occurrences by key: `${taskId}_${scheduledDate}`
  const occurrenceMap = new Map();
  for (const occ of allOccurrences) {
    occurrenceMap.set(`${occ.taskId}_${occ.scheduledDate}`, occ);
  }

  const occurrencesToCreate = [];
  const occurrencesToUpdate = [];

  for (const task of tasks) {
    // Look back up to 30 days or from task.startDate, whichever is more recent
    const thirtyDaysAgo = addDays(targetDate, -30);
    const startRange = task.startDate > thirtyDaysAgo ? task.startDate : thirtyDaysAgo;

    if (startRange > targetDate) {
      // Future task, skip
      continue;
    }

    const dates = getDatesBetween(startRange, targetDate);

    for (const d of dates) {
      if (!isScheduledOn(task, d)) continue;

      const key = `${task.id}_${d}`;
      const existing = occurrenceMap.get(key);

      if (!existing) {
        // Did not exist: if past, it was missed; if today, it is pending
        const status = d < targetDate ? 'missed' : 'pending';
        const newOcc = {
          id: uuidv4(),
          taskId: task.id,
          userId,
          scheduledDate: d,
          scheduledTime: task.dueTime || '20:00',
          status,
          completedAt: null,
          originalDueDate: d,
          pointsEarned: 0,
          snoozeUntil: null,
          notes: ''
        };
        occurrencesToCreate.push(newOcc);
        occurrenceMap.set(key, newOcc);
      } else {
        // Already exists: if past and still pending, it becomes missed!
        if (d < targetDate && existing.status === 'pending') {
          existing.status = 'missed';
          occurrencesToUpdate.push({ id: existing.id, updates: { status: 'missed' } });
        }
      }
    }
  }

  // Persist newly created occurrences
  if (occurrencesToCreate.length > 0) {
    await store.createManyOccurrences(occurrencesToCreate);
  }

  // Persist transitions to missed
  for (const item of occurrencesToUpdate) {
    await store.updateOccurrence(item.id, item.updates);
  }

  // Refetch full fresh occurrences for this user
  const updatedOccurrences = await store.findOccurrences({ userId });

  // Enrich occurrences with task details (title, category, priority, points)
  const taskMap = new Map(tasks.map(t => [t.id, t]));

  const enriched = updatedOccurrences.map(occ => {
    const parentTask = taskMap.get(occ.taskId) || {};
    return {
      ...occ,
      title: parentTask.title || 'Untitled Task',
      description: parentTask.description || '',
      category: parentTask.category || 'General',
      priority: parentTask.priority || 'medium',
      taskPoints: parentTask.points || 10,
      repeatFrequency: parentTask.repeatFrequency || 'daily'
    };
  });

  // 1. Today's tasks (scheduled for targetDate)
  const todayTasks = enriched.filter(occ => occ.scheduledDate === targetDate);

  // 2. Pending from previous days (missed past tasks that have NOT been completed yet)
  const pendingFromPrevious = enriched.filter(occ => 
    occ.status === 'missed' && occ.scheduledDate < targetDate
  ).sort((a, b) => b.scheduledDate.localeCompare(a.scheduledDate)); // newest missed first

  // 3. Completed Today (either completed today's task, or completed a previous task today)
  const completedToday = enriched.filter(occ => {
    if (!occ.completedAt) return false;
    // completedAt can be YYYY-MM-DD or full ISO
    return occ.completedAt.startsWith(targetDate);
  });

  // Calculate summary metrics
  const totalTodayCount = todayTasks.length;
  const completedTodayCount = todayTasks.filter(o => o.status === 'completed' || o.status === 'completed_late').length;
  const remainingTodayCount = todayTasks.filter(o => o.status === 'pending').length;
  const pendingMissedCount = pendingFromPrevious.length;

  return {
    targetDate,
    todayTasks,
    pendingFromPrevious,
    completedToday,
    stats: {
      totalToday: totalTodayCount,
      completedToday: completedTodayCount,
      remainingToday: remainingTodayCount,
      pendingMissed: pendingMissedCount,
      completionRate: totalTodayCount > 0 ? Math.round((completedTodayCount / totalTodayCount) * 100) : 0
    }
  };
}
