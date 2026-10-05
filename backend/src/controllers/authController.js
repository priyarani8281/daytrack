import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { store } from '../models/store.js';
import { getTodayString, addDays } from '../utils/dateHelpers.js';
import { calculateStreaks } from '../utils/gamification.js';
import { JWT_SECRET } from '../config/jwt.js';

function generateToken(user) {
  return jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '30d' });
}

export async function register(req, res) {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email, and password are required' });
    }

    const existing = await store.findUserByEmail(email);
    if (existing) {
      return res.status(400).json({ message: 'Account with this email already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = {
      id: uuidv4(),
      name,
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      totalPoints: 0,
      currentStreak: 0,
      longestStreak: 0,
      lastActiveDate: getTodayString(),
      unlockedBadges: [],
      settings: {
        notificationsEnabled: false,
        soundEnabled: true,
        dailyReminderTime: '20:00'
      }
    };

    const saved = await store.createUser(newUser);
    const token = generateToken(saved);
    const { password: _, ...userSafe } = saved;

    return res.status(201).json({ token, user: userSafe });
  } catch (err) {
    console.error('Register error:', err);
    return res.status(500).json({ message: 'Registration failed: ' + err.message });
  }
}

export async function login(req, res) {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const user = await store.findUserByEmail(email);
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Refresh streak
    const streaks = await calculateStreaks(user.id);
    await store.updateUser(user.id, {
      currentStreak: streaks.currentStreak,
      longestStreak: Math.max(user.longestStreak || 0, streaks.longestStreak),
      lastActiveDate: getTodayString()
    });

    const updatedUser = await store.findUserById(user.id);
    const token = generateToken(updatedUser);
    const { password: _, ...userSafe } = updatedUser;

    return res.json({ token, user: userSafe });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ message: 'Login failed: ' + err.message });
  }
}

export async function getMe(req, res) {
  try {
    const user = await store.findUserById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    const { password, ...safeUser } = user;
    return res.json({ user: safeUser });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
}

export async function updateSettings(req, res) {
  try {
    const { notificationsEnabled, soundEnabled, dailyReminderTime } = req.body;
    const current = await store.findUserById(req.user.id);
    if (!current) return res.status(404).json({ message: 'User not found' });

    const updatedSettings = {
      ...current.settings,
      ...(notificationsEnabled !== undefined && { notificationsEnabled }),
      ...(soundEnabled !== undefined && { soundEnabled }),
      ...(dailyReminderTime !== undefined && { dailyReminderTime })
    };

    const updated = await store.updateUser(req.user.id, { settings: updatedSettings });
    const { password, ...safeUser } = updated;
    return res.json({ user: safeUser });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
}

/**
 * Seeds the exact demo scenario requested by the user:
 * - User: Priya (priya@example.com)
 * - 7 Days streak, 340 points
 * - Recurring task: "Solve 3 DSA Problems"
 * - Yesterday's task was missed (marked as Missed)
 * - Today's tasks include Today's DSA Problem + others
 * - Yesterday's task is ready to be completed late!
 */
export async function seedDemo(req, res) {
  try {
    const today = getTodayString();
    const yesterday = addDays(today, -1);
    const twoDaysAgo = addDays(today, -2);
    const sevenDaysAgo = addDays(today, -7);

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('password123', salt);

    const demoUserId = 'user-priya-demo';
    const demoUser = {
      id: demoUserId,
      name: 'Priya Sharma',
      email: 'priya@example.com',
      password: hashedPassword,
      totalPoints: 340,
      currentStreak: 7,
      longestStreak: 14,
      lastActiveDate: today,
      unlockedBadges: [
        { id: 'first_task', name: 'First Step', icon: '🏆', description: 'Completed your very first task', unlockedAt: addDays(today, -10) },
        { id: 'streak_3', name: 'Consistency Kickstart', icon: '🔥', description: 'Maintained a 3-day consistency streak', unlockedAt: addDays(today, -5) },
        { id: 'streak_7', name: 'Momentum Master', icon: '⚡', description: 'Maintained a 7-day consistency streak', unlockedAt: addDays(today, -1) }
      ],
      settings: {
        notificationsEnabled: true,
        soundEnabled: true,
        dailyReminderTime: '20:00'
      }
    };

    // Pre-defined tasks for Priya
    const taskDsa = {
      id: 'task-dsa',
      userId: demoUserId,
      title: 'Solve 3 DSA Problems',
      description: 'LeetCode / NeetCode top interview questions (Arrays, Trees, DP)',
      category: 'Coding',
      priority: 'high',
      repeatFrequency: 'daily',
      repeatDays: [0, 1, 2, 3, 4, 5, 6],
      startDate: sevenDaysAgo,
      dueTime: '20:00',
      points: 15,
      isActive: true
    };

    const taskPages = {
      id: 'task-reading',
      userId: demoUserId,
      title: 'Read 10 pages',
      description: 'Atomic Habits by James Clear',
      category: 'Reading',
      priority: 'medium',
      repeatFrequency: 'daily',
      repeatDays: [0, 1, 2, 3, 4, 5, 6],
      startDate: sevenDaysAgo,
      dueTime: '21:30',
      points: 10,
      isActive: true
    };

    const taskPython = {
      id: 'task-python',
      userId: demoUserId,
      title: 'Practice Python for 30 minutes',
      description: 'FastAPI and async coding drills',
      category: 'Coding',
      priority: 'medium',
      repeatFrequency: 'daily',
      repeatDays: [0, 1, 2, 3, 4, 5, 6],
      startDate: sevenDaysAgo,
      dueTime: '17:00',
      points: 10,
      isActive: true
    };

    const taskExercise = {
      id: 'task-exercise',
      userId: demoUserId,
      title: 'Exercise for 30 minutes',
      description: 'Cardio & core workout session',
      category: 'Health',
      priority: 'medium',
      repeatFrequency: 'daily',
      repeatDays: [0, 1, 2, 3, 4, 5, 6],
      startDate: sevenDaysAgo,
      dueTime: '07:30',
      points: 10,
      isActive: true
    };

    const tasks = [taskDsa, taskPages, taskPython, taskExercise];

    // Build occurrence history
    const occurrences = [];

    // Historical days (7 days ago up to 2 days ago: all completed!)
    for (let i = 7; i >= 2; i--) {
      const d = addDays(today, -i);
      for (const t of tasks) {
        occurrences.push({
          id: `occ-${t.id}-${d}`,
          taskId: t.id,
          userId: demoUserId,
          scheduledDate: d,
          scheduledTime: t.dueTime,
          status: 'completed',
          completedAt: `${d}T20:30:00Z`,
          originalDueDate: d,
          pointsEarned: t.points,
          snoozeUntil: null,
          notes: 'Completed on time'
        });
      }
    }

    // Yesterday: User missed "Solve 3 DSA Problems"! Completed the others.
    occurrences.push({
      id: `occ-task-dsa-${yesterday}`,
      taskId: taskDsa.id,
      userId: demoUserId,
      scheduledDate: yesterday,
      scheduledTime: taskDsa.dueTime,
      status: 'missed', // <--- MISSED!
      completedAt: null,
      originalDueDate: yesterday,
      pointsEarned: 0,
      snoozeUntil: null,
      notes: 'Missed yesterday'
    });

    for (const t of [taskPages, taskPython, taskExercise]) {
      occurrences.push({
        id: `occ-${t.id}-${yesterday}`,
        taskId: t.id,
        userId: demoUserId,
        scheduledDate: yesterday,
        scheduledTime: t.dueTime,
        status: 'completed',
        completedAt: `${yesterday}T21:00:00Z`,
        originalDueDate: yesterday,
        pointsEarned: t.points,
        snoozeUntil: null,
        notes: ''
      });
    }

    // Today's tasks:
    // 2 Completed, 2 Pending (as in the prompt example: "2 / 4 Tasks Completed")
    occurrences.push({
      id: `occ-task-dsa-${today}`,
      taskId: taskDsa.id,
      userId: demoUserId,
      scheduledDate: today,
      scheduledTime: taskDsa.dueTime,
      status: 'completed', // ☑ Solve 3 DSA Problems
      completedAt: `${today}T10:15:00Z`,
      originalDueDate: today,
      pointsEarned: 15,
      snoozeUntil: null,
      notes: ''
    });

    occurrences.push({
      id: `occ-task-exercise-${today}`,
      taskId: taskExercise.id,
      userId: demoUserId,
      scheduledDate: today,
      scheduledTime: taskExercise.dueTime,
      status: 'completed', // ☑ Exercise for 30 minutes
      completedAt: `${today}T08:00:00Z`,
      originalDueDate: today,
      pointsEarned: 10,
      snoozeUntil: null,
      notes: ''
    });

    occurrences.push({
      id: `occ-task-reading-${today}`,
      taskId: taskPages.id,
      userId: demoUserId,
      scheduledDate: today,
      scheduledTime: taskPages.dueTime,
      status: 'pending', // ○ Read 10 pages
      completedAt: null,
      originalDueDate: today,
      pointsEarned: 0,
      snoozeUntil: null,
      notes: ''
    });

    occurrences.push({
      id: `occ-task-python-${today}`,
      taskId: taskPython.id,
      userId: demoUserId,
      scheduledDate: today,
      scheduledTime: taskPython.dueTime,
      status: 'pending', // ○ Practice Python for 30 minutes
      completedAt: null,
      originalDueDate: today,
      pointsEarned: 0,
      snoozeUntil: null,
      notes: ''
    });

    await store.seedDemo({
      user: demoUser,
      tasks,
      occurrences
    });

    const token = generateToken(demoUser);
    const { password: _, ...userSafe } = demoUser;

    return res.json({
      message: 'Demo seed successfully created!',
      token,
      user: userSafe
    });
  } catch (err) {
    console.error('Seed demo error:', err);
    return res.status(500).json({ message: 'Seed failed: ' + err.message });
  }
}

export async function forgotPassword(req, res) {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: 'Email address is required' });
    }

    const user = await store.findUserByEmail(email);
    if (!user) {
      return res.status(404).json({
        message: 'No account found with this email address. Please check your spelling or create an account.'
      });
    }

    // Generate secure 6-digit numeric reset verification code
    const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString(); // 15 mins

    await store.updateUser(user.id, {
      resetPasswordCode: resetCode,
      resetPasswordExpires: expiresAt
    });

    console.log(`[DayTrack Auth] Password reset requested for ${user.email}. Verification code: ${resetCode}`);

    return res.json({
      success: true,
      message: `Password reset verification code generated! Use code ${resetCode} to set your new password.`,
      resetCode,
      expiresInMinutes: 15
    });
  } catch (err) {
    console.error('Forgot password error:', err);
    return res.status(500).json({ message: 'Failed to process forgot password request: ' + err.message });
  }
}

export async function resetPassword(req, res) {
  try {
    const { email, resetCode, newPassword } = req.body;
    if (!email || !resetCode || !newPassword) {
      return res.status(400).json({ message: 'Email, verification code, and new password are required' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters long' });
    }

    const user = await store.findUserByEmail(email);
    if (!user) {
      return res.status(404).json({ message: 'No account found with this email address' });
    }

    if (!user.resetPasswordCode || user.resetPasswordCode.trim() !== resetCode.trim()) {
      return res.status(400).json({ message: 'Invalid or incorrect verification code. Please check and try again.' });
    }

    if (user.resetPasswordExpires && new Date(user.resetPasswordExpires) < new Date()) {
      return res.status(400).json({ message: 'This verification code has expired. Please request a new one.' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    await store.updateUser(user.id, {
      password: hashedPassword,
      resetPasswordCode: null,
      resetPasswordExpires: null
    });

    return res.json({
      success: true,
      message: 'Your password has been successfully reset! You can now log in with your new password.'
    });
  } catch (err) {
    console.error('Reset password error:', err);
    return res.status(500).json({ message: 'Failed to reset password: ' + err.message });
  }
}

