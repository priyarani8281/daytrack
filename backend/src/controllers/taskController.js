import { v4 as uuidv4 } from 'uuid';
import { store } from '../models/store.js';
import { getTodayString } from '../utils/dateHelpers.js';
import { reconcileUserTasks } from '../utils/reconciliation.js';

export async function getTasks(req, res) {
  try {
    const tasks = await store.findTasks({ userId: req.user.id, isActive: true });
    return res.json({ tasks });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
}

export async function createTask(req, res) {
  try {
    const {
      title,
      description = '',
      category = 'Personal',
      priority = 'medium',
      repeatFrequency = 'daily',
      repeatDays = [0, 1, 2, 3, 4, 5, 6],
      startDate = getTodayString(),
      dueTime = '20:00',
      points = 10
    } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({ message: 'Task title is required' });
    }

    const calculatedPoints = priority === 'high' ? Math.max(points, 15) : points;

    const newTask = {
      id: uuidv4(),
      userId: req.user.id,
      title: title.trim(),
      description: description.trim(),
      category,
      priority,
      repeatFrequency,
      repeatDays,
      startDate,
      dueTime,
      points: Number(calculatedPoints),
      isActive: true,
      createdAt: new Date().toISOString()
    };

    const saved = await store.createTask(newTask);

    // Immediately reconcile so if it's scheduled for today, occurrence is created
    await reconcileUserTasks(req.user.id, getTodayString());

    return res.status(201).json({ task: saved });
  } catch (err) {
    console.error('Create task error:', err);
    return res.status(500).json({ message: 'Failed to create task: ' + err.message });
  }
}

export async function updateTask(req, res) {
  try {
    const { id } = req.params;
    const task = await store.findTaskById(id);
    if (!task || task.userId !== req.user.id) {
      return res.status(404).json({ message: 'Task not found' });
    }

    const updates = { ...req.body };
    delete updates.id;
    delete updates.userId;

    const updated = await store.updateTask(id, updates);
    return res.json({ task: updated });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
}

export async function deleteTask(req, res) {
  try {
    const { id } = req.params;
    const task = await store.findTaskById(id);
    if (!task || task.userId !== req.user.id) {
      return res.status(404).json({ message: 'Task not found' });
    }

    await store.deleteTask(id);
    return res.json({ message: 'Task deleted successfully' });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
}

export async function getCategories(req, res) {
  try {
    const categories = await store.findCategories(req.user.id);
    return res.json({ categories });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
}

export async function createCategory(req, res) {
  try {
    const { name, icon = '📌', color = 'indigo' } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ message: 'Category name is required' });
    }

    const newCat = {
      id: `cat-${uuidv4().slice(0, 8)}`,
      userId: req.user.id,
      name: name.trim(),
      icon,
      color
    };

    const saved = await store.createCategory(newCat);
    return res.status(201).json({ category: saved });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
}
