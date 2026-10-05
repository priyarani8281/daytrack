# 🌅 DayTrack — Accountability & Consistency Engine

> **“Don’t let missed tasks disappear.”**  
> A normal reminder app simply marks a task as overdue or deletes it. DayTrack remembers your missed daily goals, carries them forward to the next day with supportive coaching, and rewards you when you catch up—without ever erasing your authentic consistency history.

---

## 🚀 Key Features

### 1. Dedicated Accountability & Carry-Forward Engine
- Recurring daily tasks that are not completed on Monday are automatically marked **Missed** at day-end.
- On Tuesday, the dashboard presents:
  - **Today's New Task**: `○ Solve 3 DSA Problems (Tuesday)`
  - **Pending Backlog**: `⚠️ Solve 3 DSA Problems — Missed on Monday`
- Supportive messaging: *"You missed this on Monday. No problem — you can still complete it today for +15 points!"*
- When marked as completed late, the original scheduled date is strictly preserved (`originalDueDate: Monday`, `completedAt: Tuesday`).

### 2. Clean, Student-Friendly Dashboard
- **Greeting & Progress**: Dynamic time greeting (e.g. *Good Morning, Priya!*), `2 / 4 Tasks Completed` progress ring and bar.
- **Key Metrics**:
  - 🔥 **Current Streak**: Computed from consecutive on-time completed days.
  - ⭐ **Total Points**: Earned through task completion and consistency bonuses.
  - ⚠️ **Pending / Missed Count**: Overdue backlog items awaiting recovery.
- **Your Focus Today**: Smart daily accountability assistant summarizing immediate priorities.

### 3. Task Creation with Recurrence
- Task Title & Notes
- Categorization (💻 Coding, 📚 Study, 🏃 Health, 📖 Reading, 💼 Work, 🎯 Personal, 🧠 Learning + Custom Category creator)
- Priority: Low, Medium, High (+15 pts)
- Recurrence Cadence: Once, Daily, Weekly, Selected Days, Custom
- Due time & Points reward configuration

### 4. Browser Notifications & Smart Snooze
- Opt-in Web Notifications API alerts with clear user justification.
- Instant in-app reminder modal when task due time arrives.
- Snooze options: **10 minutes**, **30 minutes**, **1 hour**, **Tomorrow**.

### 5. Gamification & Streaks
- Complete normal task: **+10 points**
- Complete high-priority task: **+15 points**
- Complete a missed pending task: **+5 bonus points** (catch-up bonus)
- Complete all daily tasks: **+20 bonus points**
- Milestone achievement badges:
  - 🏆 *First Step* (First task completed)
  - 🔥 *Consistency Kickstart* (3-day streak)
  - ⚡ *Momentum Master* (7-day streak)
  - 👑 *Iron Will* (30-day streak)
  - 🛡️ *Comeback Hero* (Completed 3 missed tasks)
  - 💯 *Century Club* (100 total tasks completed)
  - 🚀 *High Roller* (500 total points)

### 6. Calendar & Historical Audit Trail
- Color-coded monthly view:
  - 🟢 **Completed**: All tasks completed on time
  - 🟡 **Partially Completed**: Some completed, some missed/pending
  - 🔴 **Missed**: Tasks scheduled, none completed
  - ⚪ **No Task**: Rest day
- Clicking any date displays a detailed breakdown of tasks, completion timestamps, and points earned.

### 7. Consistency Analytics
- Weekly completion bar chart (Monday to Sunday).
- 12-week GitHub-style activity heatmap tracking consistency.
- Category energy distribution breakdown.

---

## 🛠️ Tech Stack & Architecture

- **Frontend**: React 18, Vite, Tailwind CSS, Lucide Icons, Canvas Confetti.
- **Backend**: Node.js, Express, JWT Authentication, Bcrypt.
- **Storage Layer**: Dual-mode storage architecture:
  - Full **MongoDB & Mongoose** support when connected to MongoDB URI.
  - Automatic, seamless fallback to high-performance **Embedded File Store** (`data/db.json`) if MongoDB is not running locally, guaranteeing 100% out-of-the-box zero-setup execution.

---

## ⚡ Quick Start Guide

### 1. Install & Run Backend
```bash
cd daytrack/backend
npm install
npm start
```
*Backend runs on `http://localhost:5000`*

### 2. Install & Run Frontend
```bash
cd daytrack/frontend
npm install
npm run dev
```
*Frontend runs on `http://localhost:5173`*

### 3. Demo Account (Priya Sharma)
You can click **"Explore Priya's 7-Day Streak Demo"** on the landing page or login with:
- **Email**: `priya@example.com`
- **Password**: `password123`
*(Pre-loaded with a 7-day streak, 340 points, Monday's missed DSA task, and 4 daily tasks)*
