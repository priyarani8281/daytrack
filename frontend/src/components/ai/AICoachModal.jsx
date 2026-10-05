import React, { useState, useEffect, useRef } from 'react';
import { X, Sparkles, Send, Bot, User, Flame, Star, AlertCircle, Compass, Loader2 } from 'lucide-react';
import { api } from '../../services/api.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { useTasks } from '../../context/TaskContext.jsx';

export default function AICoachModal({ isOpen, onClose }) {
  const { user } = useAuth();
  const { dashboardData } = useTasks();
  const [messages, setMessages] = useState([
    {
      sender: 'coach',
      text: `Hello ${user?.name?.split(' ')[0] || 'there'}! I'm your DayTrack AI Accountability Coach. Remember our core rule: Don't let missed tasks disappear. You missed this yesterday? No problem — you can still complete it today!\n\nHow can I help you build effortless consistency today?`
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [insight, setInsight] = useState(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      api.getAICoachInsight(dashboardData?.targetDate).then(setInsight).catch(() => {});
    }
  }, [isOpen, dashboardData?.targetDate]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  if (!isOpen) return null;

  const handleSend = async (messageToSend) => {
    const text = messageToSend || input.trim();
    if (!text || loading) return;

    setInput('');
    setMessages(prev => [...prev, { sender: 'user', text }]);
    setLoading(true);

    try {
      const res = await api.chatWithAICoach(text);
      setMessages(prev => [...prev, { sender: 'coach', text: res.reply }]);
    } catch (err) {
      setMessages(prev => [
        ...prev,
        { sender: 'coach', text: 'Sorry, I hit a slight connection glitch. Remember: take it one micro-step at a time and tackle your highest priority task first!' }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const quickPrompts = [
    'How do I beat procrastination on my missed task?',
    'What should I do today to protect my streak?',
    'Help me plan my day in 3 focused blocks',
    'Suggest a high-impact new habit for my routine'
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in text-slate-100">
      <div className="bg-slate-900 rounded-3xl max-w-xl w-full h-[85vh] shadow-2xl border border-slate-800 flex flex-col overflow-hidden relative">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 bg-gradient-to-r from-brand-950 via-indigo-950 to-slate-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center text-amber-400 backdrop-blur-md border border-white/10">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-base tracking-tight text-white">DayTrack AI Coach</h3>
                <span className="px-2 py-0.5 text-[10px] font-bold bg-brand-500/30 text-brand-300 rounded-full border border-brand-400/30">
                  Online
                </span>
              </div>
              <p className="text-xs text-slate-300">
                Guilt-free accountability & consistency mentor
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Live Context Banner */}
        <div className="bg-slate-850 px-5 py-2.5 border-b border-slate-800 flex items-center justify-between text-xs text-slate-300 shrink-0 bg-slate-800/50">
          <div className="flex items-center gap-3 font-semibold">
            <span className="flex items-center gap-1 text-amber-400">
              <Flame className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              {user?.currentStreak || 0}d Streak
            </span>
            <span className="flex items-center gap-1 text-purple-300">
              <Star className="w-3.5 h-3.5 fill-purple-400 text-purple-400" />
              {user?.totalPoints || 0} pts
            </span>
          </div>

          {dashboardData?.pendingFromPrevious?.length > 0 && (
            <span className="text-[11px] font-bold text-amber-300 bg-amber-950/60 border border-amber-800/60 px-2 py-0.5 rounded-full flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />
              {dashboardData.pendingFromPrevious.length} Missed Pending
            </span>
          )}
        </div>

        {/* Dynamic Coach Insight card */}
        {insight && (
          <div className="mx-4 mt-3 p-3 bg-amber-950/30 border border-amber-500/30 rounded-2xl shrink-0 text-slate-200">
            <div className="flex items-start gap-2.5">
              <Compass className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <span className="text-xs font-bold text-amber-300 block leading-tight">
                  {insight.headline}
                </span>
                <p className="text-[11px] text-slate-300 mt-0.5 leading-relaxed">
                  {insight.advice}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Chat History */}
        <div className="flex-1 p-5 overflow-y-auto space-y-4">
          {messages.map((msg, idx) => {
            const isCoach = msg.sender === 'coach';
            return (
              <div
                key={idx}
                className={`flex items-start gap-3 ${isCoach ? '' : 'flex-row-reverse'}`}
              >
                <div
                  className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                    isCoach
                      ? 'bg-brand-600 text-white shadow-sm'
                      : 'bg-slate-700 text-white'
                  }`}
                >
                  {isCoach ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
                </div>

                <div
                  className={`p-4 rounded-2xl max-w-[82%] text-xs sm:text-sm leading-relaxed ${
                    isCoach
                      ? 'bg-slate-800 border border-slate-700 text-slate-100 rounded-tl-sm'
                      : 'bg-brand-600 text-white rounded-tr-sm shadow-lg shadow-brand-600/30 font-medium'
                  }`}
                >
                  {msg.text.split('\n').map((line, i) => (
                    <p key={i} className={i > 0 ? 'mt-2' : ''}>
                      {line}
                    </p>
                  ))}
                </div>
              </div>
            );
          })}

          {loading && (
            <div className="flex items-center gap-2 text-slate-400 text-xs py-2">
              <Bot className="w-4 h-4 text-brand-400 animate-pulse" />
              <span className="italic font-medium">DayTrack Coach is formulating supportive advice...</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Prompts */}
        <div className="px-4 py-2 border-t border-slate-800 bg-slate-900/60 flex gap-2 overflow-x-auto shrink-0 scrollbar-none">
          {quickPrompts.map((prompt, i) => (
            <button
              key={i}
              onClick={() => handleSend(prompt)}
              className="px-3 py-1.5 rounded-xl bg-slate-800 border border-slate-700 text-[11px] font-semibold text-slate-300 hover:text-brand-300 hover:border-brand-500/40 hover:bg-slate-750 shrink-0 transition-all text-left"
            >
              {prompt}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="p-4 border-t border-slate-800 bg-slate-900 flex items-center gap-2 shrink-0"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask your coach anything about consistency, habits or tasks..."
            className="flex-1 px-4 py-3 bg-slate-800 border border-slate-700 rounded-2xl text-xs sm:text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 caret-brand-400 transition-all"
          />
          <button
            type="submit"
            disabled={!input.trim() || loading}
            className="p-3 bg-brand-600 hover:bg-brand-500 active:bg-brand-700 disabled:opacity-40 text-white rounded-2xl transition-all shadow-lg shadow-brand-600/30 shrink-0"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
          </button>
        </form>
      </div>
    </div>
  );
}
