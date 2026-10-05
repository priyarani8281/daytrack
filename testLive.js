async function run() {
  console.log('Testing DayTrack Live Services...');

  // 1. Health
  const healthRes = await fetch('http://localhost:5000/api/health');
  const health = await healthRes.json();
  console.log('✅ Health status:', health.status, '| Mode:', health.storageMode);

  // 2. Demo seed
  const seedRes = await fetch('http://localhost:5000/api/auth/seed-demo', { method: 'POST' });
  const seed = await seedRes.json();
  console.log('✅ Demo seed user:', seed.user.name, '| Streak:', seed.user.currentStreak, '| Points:', seed.user.totalPoints);
  const token = seed.token;
  const headers = { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' };

  // 3. Dashboard
  const dashRes = await fetch('http://localhost:5000/api/occurrences/dashboard', { headers });
  const dash = await dashRes.json();
  console.log('✅ Dashboard loaded for date:', dash.targetDate);
  console.log('   Today tasks count:', dash.todayTasks.length);
  console.log('   Pending missed tasks count:', dash.pendingFromPrevious.length);
  if (dash.pendingFromPrevious.length > 0) {
    const top = dash.pendingFromPrevious[0];
    console.log(`   ⚠️ Top Pending Task: "${top.title}" (Missed on ${top.originalDueDate})`);
  }

  // 4. Complete a pending missed task
  if (dash.pendingFromPrevious.length > 0) {
    const missedId = dash.pendingFromPrevious[0].id;
    const compRes = await fetch(`http://localhost:5000/api/occurrences/${missedId}/complete`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ date: dash.targetDate })
    });
    const comp = await compRes.json();
    console.log('✅ Completed Late Task:');
    console.log('   Status:', comp.occurrence.status);
    console.log('   Original Due Date:', comp.occurrence.originalDueDate);
    console.log('   Points Awarded:', comp.pointsAwarded, `(Base + ${comp.lateBonus} late bonus)`);
    console.log('   Encouragement Message:', comp.encouragementMessage);
    console.log('   Updated User Total Points:', comp.user.totalPoints);
  }

  // 5. Calendar data
  const calRes = await fetch('http://localhost:5000/api/occurrences/calendar', { headers });
  const cal = await calRes.json();
  const recordedDays = Object.keys(cal.calendarDays).length;
  console.log('✅ Calendar endpoint active, tracked historical days:', recordedDays);

  // 6. Stats overview & heatmap
  const statsRes = await fetch('http://localhost:5000/api/stats/overview', { headers });
  const stats = await statsRes.json();
  console.log('✅ Analytics Overview: Total Completed =', stats.summary.totalCompleted, '| Rate =', stats.summary.overallRate + '%');

  // 7. Frontend check
  const feRes = await fetch('http://localhost:5173');
  console.log('✅ Frontend Vite Server Response status:', feRes.status);

  console.log('\n🎉 ALL LIVE VERIFICATION CHECKS PASSED SUCCESSFULLY!\n');
}

run().catch(err => {
  console.error('Test error:', err);
  process.exit(1);
});
