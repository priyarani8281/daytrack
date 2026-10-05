import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import confetti from 'canvas-confetti';
import { api } from '../services/api.js';
import { notificationService } from '../services/notificationService.js';
import { useAuth } from './AuthContext.jsx';

const TaskContext = createContext(null);

export function TaskProvider({ children }) {
  const { user, setUser, isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(false);
  const [dashboardData, setDashboardData] = useState(null);
  const [categories, setCategories] = useState([]);
  const [completionToast, setCompletionToast] = useState(null);
  const [activeReminder, setActiveReminder] = useState(null);

  const loadDashboard = useCallback(async (dateStr) => {
    if (!isAuthenticated && !localStorage.getItem('daytrack_token')) return;
    try {
      setLoading(true);
      const res = await api.getDashboard(dateStr);
      setDashboardData(res);
      if (res.userStats && setUser) {
        setUser(prev => prev ? {
          ...prev,
          totalPoints: res.userStats.totalPoints,
          currentStreak: res.userStats.currentStreak,
          longestStreak: res.userStats.longestStreak
        } : prev);
      }
    } catch (err) {
      console.error('Failed to load dashboard:', err);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, setUser]);

  const loadCategories = useCallback(async () => {
    if (!isAuthenticated && !localStorage.getItem('daytrack_token')) return;
    try {
      const res = await api.getCategories();
      setCategories(res.categories || []);
    } catch (err) {
      console.error('Failed to load categories:', err);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (isAuthenticated) {
      loadDashboard();
      loadCategories();
    }
  }, [isAuthenticated, loadDashboard, loadCategories]);

  // Check for upcoming task reminders every 30 seconds
  useEffect(() => {
    if (!isAuthenticated || !dashboardData?.todayTasks) return;

    const interval = setInterval(() => {
      const now = new Date();
      const currentHours = String(now.getHours()).padStart(2, '0');
      const currentMinutes = String(now.getMinutes()).padStart(2, '0');
      const currentTimeStr = `${currentHours}:${currentMinutes}`;

      const pendingTasks = dashboardData.todayTasks.filter(t => t.status === 'pending');
      for (const t of pendingTasks) {
        if (t.scheduledTime === currentTimeStr && !t.snoozeUntil) {
          // Trigger reminder
          setActiveReminder(t);

          if (user?.settings?.notificationsEnabled) {
            notificationService.sendBrowserNotification(`🔔 DayTrack Reminder: ${t.title}`, {
              body: `It's ${t.scheduledTime}. Time to tackle your planned task!`,
              requireInteraction: true
            });
          }
          break;
        }
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [isAuthenticated, dashboardData, user]);

  const completeTask = async (occurrenceId) => {
    try {
      const res = await api.completeOccurrence(occurrenceId);
      
      // Trigger sound
      if (user?.settings?.soundEnabled !== false) {
        notificationService.playCelebrationSound();
      }

      // Trigger Confetti!
      try {
        confetti({
          particleCount: 75,
          spread: 70,
          origin: { y: 0.7 },
          colors: ['#7c3aed', '#10b981', '#f59e0b', '#3b82f6', '#ec4899']
        });
      } catch (e) {}

      // Trigger Completion Toast
      setCompletionToast({
        title: res.occurrence.title,
        points: res.totalBonusPoints || res.pointsAwarded,
        isLate: res.lateBonus > 0,
        message: res.encouragementMessage,
        perfectDayBonus: res.perfectDayBonus > 0
      });

      setTimeout(() => {
        setCompletionToast(null);
      }, 4000);

      // Refresh dashboard
      await loadDashboard();
      return res;
    } catch (err) {
      console.error('Error completing task:', err);
      throw err;
    }
  };

  const uncompleteTask = async (occurrenceId) => {
    try {
      await api.uncompleteOccurrence(occurrenceId);
      await loadDashboard();
    } catch (err) {
      console.error('Error uncompleting task:', err);
      throw err;
    }
  };

  const snoozeTask = async (occurrenceId, duration) => {
    try {
      const res = await api.snoozeOccurrence(occurrenceId, duration);
      setActiveReminder(null);
      await loadDashboard();
      return res;
    } catch (err) {
      console.error('Error snoozing task:', err);
      throw err;
    }
  };

  const createTask = async (taskData) => {
    try {
      const res = await api.createTask(taskData);
      await loadDashboard();
      return res;
    } catch (err) {
      console.error('Error creating task:', err);
      throw err;
    }
  };

  const deleteTask = async (taskId) => {
    try {
      await api.deleteTask(taskId);
      await loadDashboard();
    } catch (err) {
      console.error('Error deleting task:', err);
      throw err;
    }
  };

  const createCategory = async (catData) => {
    try {
      const res = await api.createCategory(catData);
      await loadCategories();
      return res;
    } catch (err) {
      console.error('Error creating category:', err);
      throw err;
    }
  };

  return (
    <TaskContext.Provider value={{
      loading,
      dashboardData,
      categories,
      completionToast,
      activeReminder,
      setActiveReminder,
      loadDashboard,
      completeTask,
      uncompleteTask,
      snoozeTask,
      createTask,
      deleteTask,
      createCategory
    }}>
      {children}
    </TaskContext.Provider>
  );
}

export function useTasks() {
  const context = useContext(TaskContext);
  if (!context) throw new Error('useTasks must be used within a TaskProvider');
  return context;
}
