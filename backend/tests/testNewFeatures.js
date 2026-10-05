import assert from 'assert';
import { generateICS, buildGoogleCalendarUrl } from '../src/utils/icalGenerator.js';
import { store } from '../src/models/store.js';

async function testNewFeatures() {
  console.log('🧪 Testing DayTrack Google Calendar & AI Assistant Features...\n');

  // 1. Test iCalendar Generator
  console.log('-> 1. Testing iCalendar (.ics) generation...');
  const mockUser = { id: 'u1', name: 'Priya Sharma' };
  const mockTasks = [
    {
      id: 't1',
      userId: 'u1',
      title: 'Solve 3 DSA Problems',
      description: 'Practice arrays and two pointers',
      category: 'Coding',
      priority: 'high',
      points: 15,
      dueTime: '20:00'
    }
  ];
  const mockOccurrences = [
    {
      id: 'o1',
      taskId: 't1',
      userId: 'u1',
      scheduledDate: '2026-10-04',
      scheduledTime: '20:00',
      status: 'pending',
      originalDueDate: '2026-10-04'
    }
  ];

  const ics = generateICS({ user: mockUser, tasks: mockTasks, occurrences: mockOccurrences });
  assert(ics.includes('BEGIN:VCALENDAR'), 'ICS must have VCALENDAR header');
  assert(ics.includes('SUMMARY:○ Solve 3 DSA Problems'), 'ICS must contain task summary');
  assert(ics.includes('END:VCALENDAR'), 'ICS must have VCALENDAR footer');
  console.log('   ✅ iCalendar RFC 5545 string generated successfully!');

  // 2. Test Google Calendar URL Builder
  console.log('-> 2. Testing Google Calendar one-click URL builder...');
  const gcalUrl = buildGoogleCalendarUrl({
    title: 'Solve 3 DSA Problems',
    description: 'NeetCode 150',
    date: '2026-10-04',
    time: '20:00',
    durationMinutes: 45
  });

  assert(gcalUrl.startsWith('https://calendar.google.com/calendar/render?'), 'Should generate valid calendar link');
  assert(gcalUrl.includes('action=TEMPLATE'), 'Should have action=TEMPLATE');
  assert(gcalUrl.includes('Solve+3+DSA+Problems') || gcalUrl.includes('Solve%203%20DSA%20Problems'), 'Should contain encoded title');
  console.log('   ✅ Google Calendar template link verified:', gcalUrl.slice(0, 70) + '...');

  console.log('\n🎉 ALL NEW CALENDAR & UTILITY TESTS PASSED!\n');
  process.exit(0);
}

testNewFeatures().catch(err => {
  console.error('❌ Test failed:', err);
  process.exit(1);
});
