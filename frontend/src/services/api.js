const API_BASE = '/api';

function getAuthHeader() {
  const token = localStorage.getItem('daytrack_token');
  return token ? { 'Authorization': `Bearer ${token}` } : {};
}

async function request(endpoint, options = {}) {
  const headers = {
    'Content-Type': 'application/json',
    ...getAuthHeader(),
    ...(options.headers || {})
  };

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const errorMsg = data.message || `Request failed with status ${response.status}`;
    const err = new Error(errorMsg);
    err.status = response.status;
    err.data = data;
    throw err;
  }

  return data;
}

export const api = {
  // Auth
  async login(email, password) {
    const data = await request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
    if (data.token) {
      localStorage.setItem('daytrack_token', data.token);
    }
    if (data.user) {
      localStorage.setItem('daytrack_user', JSON.stringify(data.user));
    }
    return data;
  },

  async register(name, email, password) {
    const data = await request('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password })
    });
    if (data.token) {
      localStorage.setItem('daytrack_token', data.token);
    }
    if (data.user) {
      localStorage.setItem('daytrack_user', JSON.stringify(data.user));
    }
    return data;
  },

  async seedDemo() {
    const data = await request('/auth/seed-demo', {
      method: 'POST'
    });
    if (data.token) {
      localStorage.setItem('daytrack_token', data.token);
    }
    if (data.user) {
      localStorage.setItem('daytrack_user', JSON.stringify(data.user));
    }
    return data;
  },

  async getMe() {
    return request('/auth/me');
  },

  async updateSettings(settings) {
    const data = await request('/auth/settings', {
      method: 'PATCH',
      body: JSON.stringify(settings)
    });
    if (data.user) {
      localStorage.setItem('daytrack_user', JSON.stringify(data.user));
    }
    return data;
  },

  logout() {
    localStorage.removeItem('daytrack_token');
    localStorage.removeItem('daytrack_user');
  },

  // Dashboard & Occurrences
  async getDashboard(dateStr) {
    const q = dateStr ? `?date=${dateStr}` : '';
    return request(`/occurrences/dashboard${q}`);
  },

  async completeOccurrence(id, dateStr) {
    return request(`/occurrences/${id}/complete`, {
      method: 'POST',
      body: JSON.stringify({ date: dateStr })
    });
  },

  async uncompleteOccurrence(id) {
    return request(`/occurrences/${id}/uncomplete`, {
      method: 'POST'
    });
  },

  async snoozeOccurrence(id, duration) {
    return request(`/occurrences/${id}/snooze`, {
      method: 'POST',
      body: JSON.stringify({ duration })
    });
  },

  async getCalendar(year, month) {
    const q = (year && month) ? `?year=${year}&month=${month}` : '';
    return request(`/occurrences/calendar${q}`);
  },

  // Tasks
  async getTasks() {
    return request('/tasks');
  },

  async createTask(taskData) {
    return request('/tasks', {
      method: 'POST',
      body: JSON.stringify(taskData)
    });
  },

  async updateTask(id, taskData) {
    return request(`/tasks/${id}`, {
      method: 'PUT',
      body: JSON.stringify(taskData)
    });
  },

  async deleteTask(id) {
    return request(`/tasks/${id}`, {
      method: 'DELETE'
    });
  },

  async getCategories() {
    return request('/tasks/categories/list');
  },

  async createCategory(catData) {
    return request('/tasks/categories/create', {
      method: 'POST',
      body: JSON.stringify(catData)
    });
  },

  // Stats & Gamification
  async getStatsOverview() {
    return request('/stats/overview');
  },

  async getContributionHeatmap() {
    return request('/stats/heatmap');
  },

  async getBadges() {
    return request('/stats/badges');
  },

  // Google Calendar & iCal Sync
  async getCalendarSyncInfo() {
    return request('/calendar/sync-info');
  },

  async getGoogleCalendarUrl(params) {
    const q = new URLSearchParams(params).toString();
    return request(`/calendar/google-url?${q}`);
  },

  downloadICSUrl() {
    const token = localStorage.getItem('daytrack_token');
    return `/api/calendar/export.ics`;
  },

  // AI Accountability Coach & Smart Suggestions
  async getAICoachInsight(dateStr) {
    const q = dateStr ? `?date=${dateStr}` : '';
    return request(`/ai/insight${q}`);
  },

  async chatWithAICoach(message) {
    return request('/ai/chat', {
      method: 'POST',
      body: JSON.stringify({ message })
    });
  },

  async breakdownTask(taskData) {
    return request('/ai/breakdown', {
      method: 'POST',
      body: JSON.stringify(taskData)
    });
  },

  async getSmartSuggestions() {
    return request('/ai/suggestions');
  }
};
