/**
 * iCalendar (RFC 5545) generator for DayTrack tasks and occurrences.
 * Allows importing and live syncing with Google Calendar, Apple Calendar, and Outlook.
 */

export function generateICS({ user, tasks = [], occurrences = [] }) {
  const taskMap = new Map(tasks.map(t => [t.id, t]));
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//DayTrack//Accountability & Consistency Engine//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    `X-WR-CALNAME:DayTrack - ${user?.name || 'My Tasks'}`,
    'X-WR-TIMEZONE:UTC',
    'X-WR-CALDESC:Daily accountability schedule and habit tracker powered by DayTrack.'
  ];

  // Helper to format Date to UTC format: YYYYMMDDTHHmmssZ or YYYYMMDD
  const formatDateTime = (dateStr, timeStr = '09:00') => {
    // dateStr: YYYY-MM-DD, timeStr: HH:mm
    const cleanDate = dateStr.replace(/-/g, '');
    const cleanTime = (timeStr || '09:00').replace(/:/g, '') + '00';
    return `${cleanDate}T${cleanTime}`;
  };

  const nowUTC = new Date().toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';

  for (const occ of occurrences) {
    const parent = taskMap.get(occ.taskId) || {};
    const title = parent.title || 'DayTrack Task';
    const description = `${parent.description || ''}\n\nStatus: ${occ.status.toUpperCase()}\nPriority: ${parent.priority || 'medium'}\nPoints: ${parent.points || 10} pts\nOriginal Due Date: ${occ.originalDueDate || occ.scheduledDate}\n\n-- Tracked via DayTrack Accountability Engine --`.trim();
    const uid = `daytrack-${occ.id}@daytrack.app`;
    const dtStart = formatDateTime(occ.scheduledDate, occ.scheduledTime || parent.dueTime || '09:00');
    // Default 30 min duration
    const [hours, minutes] = (occ.scheduledTime || parent.dueTime || '09:00').split(':').map(Number);
    const endMinutes = (minutes + 30) % 60;
    const endHours = hours + Math.floor((minutes + 30) / 60);
    const pad = (n) => String(n).padStart(2, '0');
    const dtEnd = formatDateTime(occ.scheduledDate, `${pad(endHours)}:${pad(endMinutes)}`);

    let statusPrefix = '';
    if (occ.status === 'completed' || occ.status === 'completed_late') statusPrefix = '✅ ';
    else if (occ.status === 'missed') statusPrefix = '⚠️ [MISSED] ';
    else statusPrefix = '○ ';

    lines.push(
      'BEGIN:VEVENT',
      `UID:${uid}`,
      `DTSTAMP:${nowUTC}`,
      `DTSTART:${dtStart}`,
      `DTEND:${dtEnd}`,
      `SUMMARY:${escapeICS(statusPrefix + title)}`,
      `DESCRIPTION:${escapeICS(description)}`,
      `CATEGORIES:${escapeICS(parent.category || 'General')}`,
      `STATUS:${occ.status === 'completed' || occ.status === 'completed_late' ? 'CONFIRMED' : 'TENTATIVE'}`,
      'BEGIN:VALARM',
      'TRIGGER:-PT15M',
      'ACTION:DISPLAY',
      `DESCRIPTION:${escapeICS(`DayTrack Reminder: ${title}`)}`,
      'END:VALARM',
      'END:VEVENT'
    );
  }

  lines.push('END:VCALENDAR');
  return lines.join('\r\n');
}

function escapeICS(str) {
  if (!str) return '';
  return str
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\n/g, '\\n');
}

/**
 * Generate a One-Click "Add to Google Calendar" URL
 */
export function buildGoogleCalendarUrl({ title, description, date, time = '09:00', durationMinutes = 30 }) {
  const pad = (n) => String(n).padStart(2, '0');
  const [h, m] = (time || '09:00').split(':').map(Number);
  const endTotalMin = h * 60 + m + durationMinutes;
  const endH = Math.floor(endTotalMin / 60) % 24;
  const endM = endTotalMin % 60;

  const cleanDate = (date || new Date().toISOString().slice(0, 10)).replace(/-/g, '');
  const startStr = `${cleanDate}T${pad(h)}${pad(m)}00`;
  const endStr = `${cleanDate}T${pad(endH)}${pad(endM)}00`;

  const details = `${description || ''}\n\nTracked in DayTrack: Don't let missed tasks disappear!`;

  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: title,
    details: details,
    dates: `${startStr}/${endStr}`
  });

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}
