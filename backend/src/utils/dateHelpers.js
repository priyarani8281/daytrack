export function getTodayString(offsetDays = 0) {
  const d = new Date();
  if (offsetDays !== 0) {
    d.setDate(d.getDate() + offsetDays);
  }
  return formatDateString(d);
}

export function formatDateString(d) {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function addDays(dateStr, days) {
  const [y, m, d] = dateStr.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  date.setDate(date.getDate() + days);
  return formatDateString(date);
}

export function getDayOfWeek(dateStr) {
  const [y, m, d] = dateStr.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  return date.getDay(); // 0 is Sunday, 1 is Monday... 6 is Saturday
}

export function isScheduledOn(task, dateStr) {
  if (!task.isActive) return false;
  if (dateStr < task.startDate) return false;

  const freq = task.repeatFrequency || 'daily';

  if (freq === 'once') {
    return dateStr === task.startDate;
  }

  if (freq === 'daily') {
    return true;
  }

  if (freq === 'weekly') {
    return getDayOfWeek(dateStr) === getDayOfWeek(task.startDate);
  }

  if (freq === 'selected_days' || freq === 'custom') {
    const days = task.repeatDays || [];
    return days.includes(getDayOfWeek(dateStr));
  }

  return false;
}

export function getDatesBetween(startDateStr, endDateStr) {
  const dates = [];
  let curr = startDateStr;
  while (curr <= endDateStr) {
    dates.push(curr);
    curr = addDays(curr, 1);
  }
  return dates;
}
