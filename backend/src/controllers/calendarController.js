import crypto from 'crypto';
import { store } from '../models/store.js';
import { generateICS, buildGoogleCalendarUrl } from '../utils/icalGenerator.js';
import { getTodayString } from '../utils/dateHelpers.js';
import { reconcileUserTasks } from '../utils/reconciliation.js';

export async function exportICS(req, res) {
  try {
    const userId = req.user.id;
    const user = await store.findUserById(userId);
    const tasks = await store.findTasks({ userId, isActive: true });
    
    // Ensure occurrences are reconciled up to today
    await reconcileUserTasks(userId, getTodayString());
    const occurrences = await store.findOccurrences({ userId });

    const icsContent = generateICS({ user, tasks, occurrences });

    res.setHeader('Content-Type', 'text/calendar; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="daytrack-schedule.ics"');
    return res.send(icsContent);
  } catch (err) {
    console.error('exportICS error:', err);
    return res.status(500).json({ message: 'Failed to export calendar: ' + err.message });
  }
}

export async function getPublicCalendarFeed(req, res) {
  try {
    const { token } = req.params;
    if (!token) {
      return res.status(400).send('Missing calendar token');
    }

    // Find user with matching calendarFeedToken
    const allUsers = await store.findUsers();
    const user = allUsers.find(u => u.calendarFeedToken === token);

    if (!user) {
      return res.status(404).send('Invalid or expired calendar feed token');
    }

    const tasks = await store.findTasks({ userId: user.id, isActive: true });
    await reconcileUserTasks(user.id, getTodayString());
    const occurrences = await store.findOccurrences({ userId: user.id });

    const icsContent = generateICS({ user, tasks, occurrences });

    res.setHeader('Content-Type', 'text/calendar; charset=utf-8');
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    return res.send(icsContent);
  } catch (err) {
    console.error('getPublicCalendarFeed error:', err);
    return res.status(500).send('Calendar generation error');
  }
}

export async function getCalendarSyncInfo(req, res) {
  try {
    const userId = req.user.id;
    const user = await store.findUserById(userId);

    // If user has no feed token yet, generate a secure random one
    let token = user.calendarFeedToken;
    if (!token) {
      token = crypto.randomBytes(16).toString('hex');
      await store.updateUser(userId, { calendarFeedToken: token });
    }

    const host = req.get('host') || 'localhost:5000';
    const protocol = req.protocol || 'http';
    const feedUrl = `${protocol}://${host}/api/calendar/feed/${token}.ics`;
    const webcalUrl = feedUrl.replace(/^https?:/, 'webcal:');

    return res.json({
      feedUrl,
      webcalUrl,
      token,
      instructions: {
        googleCalendar: "In Google Calendar, click '+' next to 'Other calendars' -> 'From URL' -> Paste this feed link.",
        appleCalendar: "In Apple Calendar, click File -> New Calendar Subscription -> Paste the webcal URL."
      }
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
}

export async function getGoogleCalendarLinkForTask(req, res) {
  try {
    const { taskId, occurrenceId, date, time } = req.query;
    let title = 'DayTrack Task';
    let description = '';

    if (taskId) {
      const task = await store.findTaskById(taskId);
      if (task) {
        title = task.title;
        description = task.description || '';
      }
    } else if (occurrenceId) {
      const occ = await store.findOccurrenceById(occurrenceId);
      if (occ) {
        const task = await store.findTaskById(occ.taskId);
        if (task) {
          title = task.title;
          description = task.description || '';
        }
      }
    }

    const url = buildGoogleCalendarUrl({
      title,
      description,
      date: date || getTodayString(),
      time: time || '09:00'
    });

    return res.json({ googleCalendarUrl: url });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
}
