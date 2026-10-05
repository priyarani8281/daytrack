import { Router } from 'express';
import { getTasks, createTask, updateTask, deleteTask, getCategories, createCategory } from '../controllers/taskController.js';
import { requireAuth } from '../middleware/authMiddleware.js';

const router = Router();

router.use(requireAuth);

router.get('/', getTasks);
router.post('/', createTask);
router.put('/:id', updateTask);
router.delete('/:id', deleteTask);

router.get('/categories/list', getCategories);
router.post('/categories/create', createCategory);

export default router;
