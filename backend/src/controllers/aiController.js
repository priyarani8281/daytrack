import { store } from '../models/store.js';
import { getTodayString } from '../utils/dateHelpers.js';
import { reconcileUserTasks } from '../utils/reconciliation.js';

/**
 * Call Gemini API if GEMINI_API_KEY is available in env or user settings
 */
async function callGeminiIfAvailable(prompt, systemInstruction = '', userKey = null) {
  const apiKey = userKey || process.env.GEMINI_API_KEY;
  if (!apiKey) return null;

  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
    const payload = {
      contents: [
        {
          role: 'user',
          parts: [{ text: `${systemInstruction ? systemInstruction + '\n\n' : ''}${prompt}` }]
        }
      ],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 800
      }
    };

    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!res.ok) {
      const errText = await res.text();
      console.warn('Gemini API request failed:', res.status, errText);
      return null;
    }

    const data = await res.json();
    return data?.candidates?.[0]?.content?.parts?.[0]?.text || null;
  } catch (err) {
    console.warn('Gemini invocation error:', err.message);
    return null;
  }
}

/**
 * AI Coach Daily Strategic Insight
 */
export async function getAICoachInsight(req, res) {
  try {
    const userId = req.user.id;
    const today = req.query.date || getTodayString();
    const user = await store.findUserById(userId);
    const reconciled = await reconcileUserTasks(userId, today);

    const pendingMissed = reconciled.pendingFromPrevious;
    const todayTasks = reconciled.todayTasks;
    const streak = user.currentStreak || 0;
    const points = user.totalPoints || 0;

    // Check if user has Gemini key configured
    const userGeminiKey = user.settings?.geminiApiKey || process.env.GEMINI_API_KEY;

    let geminiInsight = null;
    if (userGeminiKey) {
      const prompt = `
User Context:
- Name: ${user.name}
- Current Streak: ${streak} days
- Total Points: ${points}
- Pending missed tasks from previous days: ${pendingMissed.map(t => `${t.title} (due ${t.originalDueDate})`).join(', ') || 'None'}
- Today's tasks: ${todayTasks.map(t => `${t.title} (${t.status}, priority ${t.priority})`).join(', ') || 'None'}

Goal: Provide a supportive, motivating, guilt-free 2-sentence daily coaching message and 1 top priority action. Follow DayTrack's principle: 'Don't let missed tasks disappear. You missed this yesterday. No problem — you can still complete it today.'
Output valid JSON format with keys: "headline", "advice", "recommendedAction".
`;
      const geminiRes = await callGeminiIfAvailable(prompt, "You are DayTrack AI Coach, an empathetic consistency mentor.", userGeminiKey);
      if (geminiRes) {
        try {
          const clean = geminiRes.replace(/```json/g, '').replace(/```/g, '').trim();
          geminiInsight = JSON.parse(clean);
        } catch (e) {
          // ignore parse error, use fallback
        }
      }
    }

    if (geminiInsight) {
      return res.json({
        source: 'gemini',
        ...geminiInsight
      });
    }

    // Built-in Intelligent Heuristic Coach Engine (Zero-dependency, 100% reliable)
    let headline = 'Steady Momentum Wins the Race';
    let advice = 'Every small task you complete reinforces your self-trust. Keep showing up today!';
    let recommendedAction = 'Pick your first high-priority task and focus for 20 minutes.';

    if (pendingMissed.length > 0) {
      const topMissed = pendingMissed[0];
      headline = 'Catch-Up & Reclaim Your Momentum';
      advice = `You missed "${topMissed.title}" on ${topMissed.originalDueDate}. No problem at all—DayTrack carried it forward. Completing it today earns +${(topMissed.taskPoints || 10) + 5} points and clears mental clutter!`;
      recommendedAction = `Tackle "${topMissed.title}" early today. It takes less time than you think!`;
    } else if (todayTasks.some(t => t.priority === 'high' && t.status === 'pending')) {
      const highPrio = todayTasks.find(t => t.priority === 'high' && t.status === 'pending');
      headline = 'High-Impact Focus Required';
      advice = `"${highPrio.title}" is your highest leverage goal for today. Completing it will secure your streak and give you peace of mind.`;
      recommendedAction = `Block out uninterrupted time for "${highPrio.title}".`;
    } else if (todayTasks.every(t => t.status === 'completed' || t.status === 'completed_late') && todayTasks.length > 0) {
      headline = '🔥 Perfect Day Achieved!';
      advice = `You completed all your scheduled goals for today! Your ${streak}-day streak is fully locked in.`;
      recommendedAction = 'Take time to recharge and celebrate your consistency.';
    }

    return res.json({
      source: 'daytrack-coach-engine',
      headline,
      advice,
      recommendedAction,
      streakProtectionTip: streak > 3 ? `You have a strong ${streak}-day streak! Completing at least 1 core goal today keeps the flame burning.` : 'Consistency builds fast: complete your daily goals to ignite your streak!'
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
}

/**
 * Interactive Chat with AI Coach
 */
export async function chatWithCoach(req, res) {
  try {
    const userId = req.user.id;
    const { message } = req.body;
    if (!message) {
      return res.status(400).json({ message: 'Message is required' });
    }

    const today = getTodayString();
    const user = await store.findUserById(userId);
    const reconciled = await reconcileUserTasks(userId, today);
    const pendingMissed = reconciled.pendingFromPrevious;
    const todayTasks = reconciled.todayTasks;

    const userGeminiKey = user.settings?.geminiApiKey || process.env.GEMINI_API_KEY;

    if (userGeminiKey) {
      const systemPrompt = `
You are the DayTrack AI Accountability Coach.
User Info:
- Name: ${user.name}
- Streak: ${user.currentStreak || 0} days | Points: ${user.totalPoints || 0}
- Pending missed tasks from past days: ${pendingMissed.map(t => `${t.title} (due ${t.originalDueDate})`).join(', ') || 'None'}
- Today's tasks: ${todayTasks.map(t => `${t.title} [${t.status}]`).join(', ') || 'None'}

Core Principles:
1. Don't let missed tasks disappear. You missed this yesterday. No problem — you can still complete it today.
2. Never shame the user or say "You failed". Use empathetic, encouraging language.
3. Provide crisp, realistic, timeboxed advice (e.g., 15-minute rule, 2-minute rule, task decomposition).
4. Keep responses concise (under 120 words), actionable, and friendly.
`;
      const reply = await callGeminiIfAvailable(message, systemPrompt, userGeminiKey);
      if (reply) {
        return res.json({
          reply,
          source: 'gemini'
        });
      }
    }

    // Heuristic AI Coach Reply Engine
    const lower = message.toLowerCase();
    let reply = '';

    if (lower.includes('procrastinat') || lower.includes('lazy') || lower.includes('start') || lower.includes('hard')) {
      reply = `Procrastination is usually just emotional resistance to starting, not laziness. Use the **5-Minute Rule**: tell yourself you will only work on your task for just 5 minutes. Once you open the editor or notes, 80% of the friction dissolves. You've got this!`;
    } else if (lower.includes('missed') || lower.includes('yesterday') || lower.includes('dsa') || lower.includes('late')) {
      if (pendingMissed.length > 0) {
        reply = `You have "${pendingMissed[0].title}" pending from ${pendingMissed[0].originalDueDate}. Remember DayTrack's rule: *You missed this yesterday. No problem — you can still complete it today.* You'll even get +5 bonus catch-up points when you finish! Don't worry about perfection; just solve or review one small part right now.`;
      } else {
        reply = `You're all caught up on previous days! Celebrate that clean slate and tackle your top task for today with zero baggage.`;
      }
    } else if (lower.includes('streak') || lower.includes('break') || lower.includes('protect')) {
      reply = `Your streak currently stands at **${user.currentStreak || 0} Days 🔥**. To protect it, focus on completing at least your core daily task today. If you feel short on time, reduce the scope: doing 5 minutes is infinitely better than doing zero!`;
    } else if (lower.includes('break down') || lower.includes('split') || lower.includes('step')) {
      reply = `To break down any task: 1) Clarify the single smallest initial step (e.g. read the problem or open the doc). 2) Spend 15 minutes drafting a rough attempt. 3) Take a 3-minute breather, then polish. Use the '✨ AI Breakdown' button on any task card to see an instant plan!`;
    } else if (lower.includes('plan') || lower.includes('today') || lower.includes('routine')) {
      const topTask = pendingMissed[0]?.title || todayTasks[0]?.title || 'your main goal';
      reply = `Here is your optimal 3-block flow for today:
1. **Quick Win (Morning)**: Clear pending backlog "${topTask}".
2. **Deep Focus (Afternoon)**: 45 minutes on today's highest priority task.
3. **Wrap-up (Evening)**: Check off completed items and collect your streak bonus!`;
    } else {
      reply = `I'm here to keep you consistent without guilt. You currently have ${todayTasks.filter(t => t.status === 'pending').length} task(s) remaining today and ${pendingMissed.length} pending from yesterday. Which one would you like to knock out first?`;
    }

    return res.json({
      reply,
      source: 'daytrack-coach-engine'
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
}

/**
 * AI Micro-Step Breakdown for a Task
 */
export async function breakdownTask(req, res) {
  try {
    const { title, category = 'General', description = '' } = req.body;
    if (!title) {
      return res.status(400).json({ message: 'Task title is required' });
    }

    const userId = req.user.id;
    const user = await store.findUserById(userId);
    const userGeminiKey = user?.settings?.geminiApiKey || process.env.GEMINI_API_KEY;

    if (userGeminiKey) {
      const prompt = `
Task: "${title}" (Category: ${category})
Description: "${description}"

Decompose this task into exactly 3 low-friction micro-steps that an overwhelmed student or worker can do in under 30 minutes total.
Output valid JSON array with objects: [{"step": 1, "title": "...", "duration": "10 min", "tip": "..."}].
`;
      const geminiRes = await callGeminiIfAvailable(prompt, "You are an expert productivity coach specializing in breaking down tasks.", userGeminiKey);
      if (geminiRes) {
        try {
          const clean = geminiRes.replace(/```json/g, '').replace(/```/g, '').trim();
          const steps = JSON.parse(clean);
          return res.json({ taskTitle: title, steps, source: 'gemini' });
        } catch (e) {
          // fallback
        }
      }
    }

    // Heuristic task breakdown generator tailored to common categories
    const lower = title.toLowerCase();
    let steps = [];

    if (lower.includes('dsa') || lower.includes('leetcode') || lower.includes('code') || lower.includes('program') || category === 'Coding') {
      steps = [
        {
          step: 1,
          title: 'Understand the problem & dry run 2 test inputs',
          duration: '8 min',
          tip: 'Write down edge cases (empty array, negative numbers, single element) on scratchpad before typing any code.'
        },
        {
          step: 2,
          title: 'Implement brute force or intuitive solution',
          duration: '12 min',
          tip: 'Do not worry about O(N) right away. Get working green tests first.'
        },
        {
          step: 3,
          title: 'Optimize data structure (Hash Map / Two Pointers) & verify',
          duration: '10 min',
          tip: 'Identify repeated work and check if sorting or a lookup table reduces time complexity.'
        }
      ];
    } else if (lower.includes('read') || lower.includes('book') || category === 'Reading') {
      steps = [
        {
          step: 1,
          title: 'Set up quiet environment & set 15-minute timer',
          duration: '2 min',
          tip: 'Put your phone in another room or turn on Do Not Disturb.'
        },
        {
          step: 2,
          title: 'Read first 5 pages without stopping',
          duration: '10 min',
          tip: 'Do not pause to reread sentences; keep forward momentum.'
        },
        {
          step: 3,
          title: 'Complete remaining pages & jot down 1 key takeaway',
          duration: '10 min',
          tip: 'Summarizing in 1 sentence cements memory retention.'
        }
      ];
    } else if (lower.includes('exercise') || lower.includes('workout') || lower.includes('gym') || category === 'Health') {
      steps = [
        {
          step: 1,
          title: 'Put on workout shoes & drink 1 glass of water',
          duration: '3 min',
          tip: 'Putting on the shoes is the biggest psychological barrier.'
        },
        {
          step: 2,
          title: '5-minute dynamic warm-up or stretch',
          duration: '5 min',
          tip: 'Arm circles, bodyweight squats, and deep breathing.'
        },
        {
          step: 3,
          title: 'Main session (20 mins brisk exercise)',
          duration: '20 min',
          tip: 'Listen to an energetic playlist or podcast to make it effortless.'
        }
      ];
    } else {
      steps = [
        {
          step: 1,
          title: `Prepare workspace and define done-state for "${title}"`,
          duration: '5 min',
          tip: 'Write down: "This task is finished when I have..."'
        },
        {
          step: 2,
          title: 'Focus block: execute the first 50% without distractions',
          duration: '15 min',
          tip: 'Turn off notification tabs and work on a single file/window.'
        },
        {
          step: 3,
          title: 'Review, wrap up and check off in DayTrack',
          duration: '10 min',
          tip: 'Claim your points and feel proud of your progress!'
        }
      ];
    }

    return res.json({
      taskTitle: title,
      steps,
      source: 'daytrack-coach-engine'
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
}

/**
 * Smart Habit Suggestions Engine
 */
export async function getSmartSuggestions(req, res) {
  try {
    const userId = req.user.id;
    const existingTasks = await store.findTasks({ userId, isActive: true });
    const existingCategories = new Set(existingTasks.map(t => t.category));

    // Catalog of high-impact consistency habits
    const catalog = [
      {
        title: 'Solve 3 DSA Problems',
        category: 'Coding',
        priority: 'high',
        points: 15,
        repeatFrequency: 'daily',
        dueTime: '20:00',
        description: 'Practice NeetCode or LeetCode daily problem to keep problem-solving sharp.'
      },
      {
        title: 'Deep Work Focus Block (45 min)',
        category: 'Study',
        priority: 'high',
        points: 15,
        repeatFrequency: 'daily',
        dueTime: '10:00',
        description: 'Single-tasking on coursework or complex system design without social media.'
      },
      {
        title: '30-Minute Brisk Walk / Fitness',
        category: 'Health',
        priority: 'medium',
        points: 10,
        repeatFrequency: 'daily',
        dueTime: '07:30',
        description: 'Physical activity resets dopamine and fuels cognitive stamina.'
      },
      {
        title: 'Read 10 Pages of Non-Fiction',
        category: 'Reading',
        priority: 'medium',
        points: 10,
        repeatFrequency: 'daily',
        dueTime: '21:30',
        description: 'Consistent reading compounds into 12+ books read every year.'
      },
      {
        title: 'End-of-Day Review & Tomorrow Planning',
        category: 'Personal',
        priority: 'low',
        points: 10,
        repeatFrequency: 'daily',
        dueTime: '22:00',
        description: 'Clear DayTrack pending items and set tomorrow up for frictionless success.'
      },
      {
        title: 'Practice Python / Backend API (30 min)',
        category: 'Coding',
        priority: 'medium',
        points: 10,
        repeatFrequency: 'daily',
        dueTime: '18:00',
        description: 'Build micro-features or test API endpoints to reinforce system skills.'
      }
    ];

    // Filter out templates the user already has by title similarity
    const existingTitles = existingTasks.map(t => t.title.toLowerCase());
    const recommendations = catalog.filter(item => 
      !existingTitles.some(et => et.includes(item.title.toLowerCase().slice(0, 10)))
    );

    // Identify category gaps
    const gapCategories = ['Coding', 'Study', 'Health', 'Reading', 'Personal'].filter(
      cat => !existingCategories.has(cat)
    );

    let balanceTip = 'Your routine looks balanced! Keep maintaining steady daily consistency.';
    if (gapCategories.length > 0) {
      balanceTip = `You currently have no active habits in: ${gapCategories.join(', ')}. Adding a simple habit here will boost overall momentum!`;
    }

    return res.json({
      recommendations: recommendations.slice(0, 4),
      balanceTip,
      gapCategories
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
}
