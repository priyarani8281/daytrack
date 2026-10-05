import { Router } from 'express';
import { getStatsOverview, getContributionHeatmap, getBadges } from '../controllers/statsController.js';
import { requireAuth } from '../middleware/authMiddleware.js';

const router = Router();

router.use(requireAuth);

router.get('/overview', getStatsOverview);
router.get('/heatmap', getContributionHeatmap);
router.get('/badges', getBadges);

export default router;
