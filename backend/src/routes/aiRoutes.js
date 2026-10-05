import { Router } from 'express';
import {
  getAICoachInsight,
  chatWithCoach,
  breakdownTask,
  getSmartSuggestions
} from '../controllers/aiController.js';
import { requireAuth } from '../middleware/authMiddleware.js';

const router = Router();

router.use(requireAuth);

router.get('/insight', getAICoachInsight);
router.post('/chat', chatWithCoach);
router.post('/breakdown', breakdownTask);
router.get('/suggestions', getSmartSuggestions);

export default router;
