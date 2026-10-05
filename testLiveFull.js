import assert from 'assert';

const API = 'http://localhost:5000/api';

async function runLiveVerification() {
  console.log('🧪 Starting DayTrack Live Full-Stack End-to-End Verification...\n');

  // 1. Health check
  console.log('-> 1. Testing Backend Health...');
  const healthRes = await fetch(`${API}/health`);
  assert.strictEqual(healthRes.status, 200, 'Health endpoint must return 200');
  const health = await healthRes.json();
  console.log(`   ✅ Status: ${health.status} | Mode: ${health.storageMode}`);

  // 2. Demo login
  console.log('-> 2. Authenticating Demo User (Priya Sharma)...');
  const authRes = await fetch(`${API}/auth/seed-demo`, { method: 'POST' });
  assert.strictEqual(authRes.status, 200);
  const auth = await authRes.json();
  const token = auth.token;
  assert(token, 'JWT token must be present');
  console.log(`   ✅ Logged in as: ${auth.user.name} | Streak: ${auth.user.currentStreak}d | Points: ${auth.user.totalPoints}`);

  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };

  // 3. Dashboard check
  console.log('-> 3. Loading Dashboard & Accountability Engine state...');
  const dashRes = await fetch(`${API}/occurrences/dashboard`, { headers });
  assert.strictEqual(dashRes.status, 200);
  const dash = await dashRes.json();
  console.log(`   ✅ Date: ${dash.targetDate}`);
  console.log(`   ✅ Today Tasks: ${dash.todayTasks.length} | Pending Missed Tasks: ${dash.pendingFromPrevious.length}`);

  // 4. AI Coach Insight
  console.log('-> 4. Testing AI Accountability Coach Insight...');
  const aiInsightRes = await fetch(`${API}/ai/insight`, { headers });
  assert.strictEqual(aiInsightRes.status, 200);
  const aiInsight = await aiInsightRes.json();
  assert(aiInsight.headline, 'AI Coach must return a headline');
  assert(aiInsight.advice, 'AI Coach must return supportive advice');
  console.log(`   ✅ AI Coach Headline: "${aiInsight.headline}"`);
  console.log(`   ✅ Advice: "${aiInsight.advice.slice(0, 80)}..."`);

  // 5. AI Coach Chat
  console.log('-> 5. Testing Interactive AI Coach Chat...');
  const chatRes = await fetch(`${API}/ai/chat`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ message: 'How do I overcome procrastination on my DSA problems?' })
  });
  assert.strictEqual(chatRes.status, 200);
  const chat = await chatRes.json();
  assert(chat.reply, 'Coach reply must be present');
  console.log(`   ✅ Coach reply received (${chat.reply.slice(0, 90)}...)`);

  // 6. AI Micro-Step Breakdown
  console.log('-> 6. Testing AI Micro-Step Task Breakdown...');
  const breakdownRes = await fetch(`${API}/ai/breakdown`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      title: 'Solve 3 DSA Problems',
      category: 'Coding',
      description: 'Practice arrays and two pointers'
    })
  });
  assert.strictEqual(breakdownRes.status, 200);
  const breakdown = await breakdownRes.json();
  assert(breakdown.steps && breakdown.steps.length >= 3, 'Must return at least 3 micro-steps');
  console.log(`   ✅ Micro-steps generated: ${breakdown.steps.length} steps`);
  breakdown.steps.forEach(s => console.log(`      • Step ${s.step}: ${s.title} (${s.duration})`));

  // 7. Smart Habit Suggestions
  console.log('-> 7. Testing Smart Habit Suggestions...');
  const suggRes = await fetch(`${API}/ai/suggestions`, { headers });
  assert.strictEqual(suggRes.status, 200);
  const sugg = await suggRes.json();
  assert(sugg.recommendations && sugg.recommendations.length > 0, 'Must return recommendations');
  console.log(`   ✅ Smart suggestions: ${sugg.recommendations.length} recommended habits`);
  console.log(`   ✅ Balance Tip: ${sugg.balanceTip}`);

  // 8. Google Calendar link generation
  console.log('-> 8. Testing Google Calendar one-click URL...');
  const gcalRes = await fetch(`${API}/calendar/google-url?taskId=${dash.todayTasks[0]?.taskId || ''}`, { headers });
  assert.strictEqual(gcalRes.status, 200);
  const gcal = await gcalRes.json();
  assert(gcal.googleCalendarUrl.includes('calendar.google.com'), 'Must be a valid Google Calendar URL');
  console.log(`   ✅ Google Calendar URL: ${gcal.googleCalendarUrl.slice(0, 60)}...`);

  // 9. Calendar ICS Export
  console.log('-> 9. Testing iCalendar (.ics) export...');
  const icsRes = await fetch(`${API}/calendar/export.ics`, { headers });
  assert.strictEqual(icsRes.status, 200);
  const icsText = await icsRes.text();
  assert(icsText.includes('BEGIN:VCALENDAR'), 'Must be valid VCALENDAR');
  console.log(`   ✅ iCalendar export successful (${icsText.length} bytes)`);

  // 10. Calendar Feed Sync Info & Live Feed
  console.log('-> 10. Testing Live Calendar Subscription Feed...');
  const syncInfoRes = await fetch(`${API}/calendar/sync-info`, { headers });
  assert.strictEqual(syncInfoRes.status, 200);
  const syncInfo = await syncInfoRes.json();
  assert(syncInfo.token, 'Must return calendar feed token');
  console.log(`    ✅ Feed Token: ${syncInfo.token}`);
  console.log(`    ✅ Feed URL: ${syncInfo.feedUrl}`);

  const publicFeedRes = await fetch(`${API}/calendar/feed/${syncInfo.token}.ics`);
  assert.strictEqual(publicFeedRes.status, 200, 'Public feed should be reachable without Bearer auth');
  const feedContent = await publicFeedRes.text();
  assert(feedContent.includes('BEGIN:VCALENDAR'), 'Live feed must return valid iCalendar text');
  console.log(`    ✅ Live feed successfully returned calendar text (${feedContent.length} bytes)`);

  console.log('\n🎉 ALL LIVE VERIFICATION CHECKS PASSED FLAWLESSLY!\n');
  process.exit(0);
}

runLiveVerification().catch(err => {
  console.error('❌ Live test failed:', err);
  process.exit(1);
});
