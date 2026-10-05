import { Router } from 'express';
import {
  exportICS,
  getPublicCalendarFeed,
  getCalendarSyncInfo,
  getGoogleCalendarLinkForTask
} from '../controllers/calendarController.js';
import { requireAuth } from '../middleware/authMiddleware.js';

const router = Router();

// Public subscription endpoint for calendar apps (Google Calendar, Apple Calendar)
router.get('/feed/:token.ics', getPublicCalendarFeed);

// Authenticated endpoints
router.get('/export.ics', requireAuth, exportICS);
router.get('/sync-info', requireAuth, getCalendarSyncInfo);
router.get('/google-url', requireAuth, getGoogleCalendarLinkForTask);

export default router;
