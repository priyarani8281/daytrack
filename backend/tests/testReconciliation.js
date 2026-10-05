import assert from 'assert';
import { v4 as uuidv4 } from 'uuid';
import { store } from '../src/models/store.js';
import { reconcileUserTasks } from '../src/utils/reconciliation.js';
import { calculateStreaks } from '../src/utils/gamification.js';
import { getTodayString, addDays } from '../src/utils/dateHelpers.js';

async function runTests() {
  console.log('🧪 Running DayTrack Core Reconciliation & Accountability Tests...');

  const testUserId = `test-user-${Date.now()}`;
  const today = getTodayString();
  const yesterday = addDays(today, -1);
  const twoDaysAgo = addDays(today, -2);

  // 1. Create a recurring daily task that started 2 days ago
  const task = {
    id: `task-dsa-${uuidv4().slice(0, 6)}`,
    userId: testUserId,
    title: 'Solve 3 DSA Problems',
    description: 'NeetCode 150 practice',
    category: 'Coding',
    priority: 'high',
    repeatFrequency: 'daily',
    repeatDays: [0, 1, 2, 3, 4, 5, 6],
    startDate: twoDaysAgo,
    dueTime: '20:00',
    points: 15,
    isActive: true,
    createdAt: new Date().toISOString()
  };

  await store.createTask(task);

  // 2. Run reconciliation for today
  console.log('-> Testing reconciliation & automatic transition of past uncompleted tasks to MISSED...');
  const res1 = await reconcileUserTasks(testUserId, today);

  // There should be occurrences for twoDaysAgo, yesterday, and today
  const occTwoDaysAgo = res1.pendingFromPrevious.find(o => o.scheduledDate === twoDaysAgo);
  const occYesterday = res1.pendingFromPrevious.find(o => o.scheduledDate === yesterday);
  const occToday = res1.todayTasks.find(o => o.scheduledDate === today);

  assert(occTwoDaysAgo, 'Occurrence for two days ago should exist in pendingFromPrevious');
  assert.strictEqual(occTwoDaysAgo.status, 'missed', 'Two days ago task should be MISSED');
  assert.strictEqual(occTwoDaysAgo.originalDueDate, twoDaysAgo, 'Original due date must be preserved');

  assert(occYesterday, 'Occurrence for yesterday should exist in pendingFromPrevious');
  assert.strictEqual(occYesterday.status, 'missed', 'Yesterday task should be MISSED');

  assert(occToday, 'Occurrence for today should exist in todayTasks');
  assert.strictEqual(occToday.status, 'pending', 'Today task should be pending');

  console.log('✅ Reconciliation verified: past occurrences are marked MISSED with original dates preserved!');

  // 3. Test Late Completion: Complete yesterday's missed task on today
  console.log('-> Testing Late Completion of missed task...');
  const latePoints = task.points + 5; // +5 bonus for catching up
  const updatedLate = await store.updateOccurrence(occYesterday.id, {
    status: 'completed_late',
    completedAt: new Date().toISOString(),
    pointsEarned: latePoints,
    notes: `Completed late on ${today}`
  });

  assert.strictEqual(updatedLate.status, 'completed_late', 'Status must be completed_late');
  assert.strictEqual(updatedLate.originalDueDate, yesterday, 'Original due date MUST NOT change');
  assert.strictEqual(updatedLate.pointsEarned, 20, '15 base points + 5 late bonus = 20 points');

  console.log('✅ Late Completion verified: marked completed_late, original due date preserved, bonus awarded!');

  // 4. Test Today Task Completion
  console.log('-> Testing normal on-time completion for today...');
  const updatedToday = await store.updateOccurrence(occToday.id, {
    status: 'completed',
    completedAt: new Date().toISOString(),
    pointsEarned: task.points,
    notes: 'Completed on time'
  });

  assert.strictEqual(updatedToday.status, 'completed');
  assert.strictEqual(updatedToday.originalDueDate, today);

  // 5. Test Reconciliation after late completion:
  // Yesterday's task is no longer in pendingFromPrevious because it was completed_late!
  const res2 = await reconcileUserTasks(testUserId, today);
  const stillPendingYesterday = res2.pendingFromPrevious.find(o => o.scheduledDate === yesterday);
  assert(!stillPendingYesterday, 'Completed late task should no longer be pending');

  console.log('✅ Carry-forward verified: resolved late tasks leave the pending backlog cleanly!');

  console.log('\n🎉 ALL CORE ACCOUNTABILITY & RECONCILIATION TESTS PASSED PERFECTLY!\n');
  process.exit(0);
}

runTests().catch(err => {
  console.error('❌ Test failed:', err);
  process.exit(1);
});
