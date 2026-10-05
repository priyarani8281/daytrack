import { Router } from 'express';
import {
  getDashboard,
  completeOccurrence,
  uncompleteOccurrence,
  snoozeOccurrence,
  getCalendarData
} from '../controllers/occurrenceController.js';
import { requireAuth } from '../middleware/authMiddleware.js';

const router = Router();

router.use(requireAuth);

router.get('/dashboard', getDashboard);
router.post('/:id/complete', completeOccurrence);
router.post('/:id/uncomplete', uncompleteOccurrence);
router.post('/:id/snooze', snoozeOccurrence);
router.get('/calendar', getCalendarData);

export default router;
