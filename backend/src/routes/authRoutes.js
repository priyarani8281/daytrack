import { Router } from 'express';
import { register, login, getMe, updateSettings, seedDemo, forgotPassword, resetPassword } from '../controllers/authController.js';
import { requireAuth } from '../middleware/authMiddleware.js';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.post('/seed-demo', seedDemo);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.get('/me', requireAuth, getMe);
router.patch('/settings', requireAuth, updateSettings);

export default router;
