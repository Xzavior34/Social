import React, { useState } from 'react';
import { 
  Clock, 
  Trash2, 
  Send, 
  X, 
  Linkedin, 
  Twitter, 
  Instagram, 
  Facebook, 
  Check, 
  ChevronLeft, 
  ChevronRight,
  Plus,
  AlertCircle
} from 'lucide-react';
import { Post, PlatformType } from '../types';

interface CalendarViewProps {
  posts: Post[];
  onUpdatePost: (id: string, updates: Partial<Post>) => void;
  onDeletePost: (id: string) => void;
  onNavigateTab: (tab: string) => void;
}

export default function CalendarView({
  posts,
  onUpdatePost,
  onDeletePost,
  onNavigateTab,
}: CalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date(2026, 6, 17)); // Match metadata year (July 2026)
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [rescheduleDate, setRescheduleDate] = useState('');
  const [rescheduleTime, setRescheduleTime] = useState('');

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const getPlatformIcon = (platform: PlatformType) => {
    switch (platform) {
      case 'twitter': return <Twitter className="w-3 h-3 text-sky-400" />;
      case 'linkedin': return <Linkedin className="w-3 h-3 text-blue-400" />;
      case 'instagram': return <Instagram className="w-3 h-3 text-pink-400" />;
      case 'facebook': return <Facebook className="w-3 h-3 text-blue-600" />;
    }
  };

  const getDaysInMonth = (y: number, m: number) => new Date(y, m + 1, 0).getDate();
  const getFirstDayOfMonth = (y: number, m: number) => new Date(y, m, 1).getDay();

  const daysInMonth = getDaysInMonth(year, month);
  const firstDayIndex = getFirstDayOfMonth(year, month);

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 17));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 17));

  // Build grid blocks
  const calendarBlocks: (number | null)[] = [];
  for (let i = 0; i < firstDayIndex; i++) {
    calendarBlocks.push(null);
  }
  for (let i = 1; i <= daysInMonth; i++) {
    calendarBlocks.push(i);
  }

  const getPostsForDay = (day: number) => {
    return posts.filter(post => {
      const dateStr = post.scheduledFor || post.publishedAt || post.createdAt;
      if (!dateStr) return false;
      const d = new Date(dateStr);
      return d.getFullYear() === year && d.getMonth() === month && d.getDate() === day;
    });
  };

  const handleRescheduleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPost || !rescheduleDate || !rescheduleTime) return;
    
    const isoString = new Date(`${rescheduleDate}T${rescheduleTime}`).toISOString();
    onUpdatePost(selectedPost.id, {
      scheduledFor: isoString,
      status: 'scheduled',
    });
    
    setSelectedPost(null);
    setRescheduleDate('');
    setRescheduleTime('');
  };

  const handlePublishImmediately = (post: Post) => {
    onUpdatePost(post.id, {
      status: 'published',
      publishedAt: new Date().toISOString(),
    });
    setSelectedPost(null);
  };

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  return (
    <div className="space-y-6 font-sans text-left pb-12">
      {/* Header Banner */}
      <div className="pb-2 border-b border-white/5 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-extrabold text-white tracking-tight">Dynamic Calendar</h2>
          <p className="text-xs text-slate-400 mt-0.5">Visualize your content pipeline, reschedule slots, and audit platform releases.</p>
        </div>
        <button
          onClick={() => onNavigateTab('studio')}
          className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-xs transition-all flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4" />
          Schedule Post
        </button>
      </div>

      {/* Calendar Controls */}
      <div className="flex items-center justify-between bg-slate-900/60 p-4 border border-white/5 rounded-2xl">
        <div className="flex items-center gap-2">
          <button 
            onClick={prevMonth}
            className="p-1.5 rounded-lg bg-slate-950 border border-white/5 hover:border-white/10 text-slate-400 hover:text-white transition-all"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <h3 className="text-sm font-bold text-white tracking-tight">
            {monthNames[month]} {year}
          </h3>
          <button 
            onClick={nextMonth}
            className="p-1.5 rounded-lg bg-slate-950 border border-white/5 hover:border-white/10 text-slate-400 hover:text-white transition-all"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="flex items-center gap-4 text-xs text-slate-400">
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-amber-500" />
            <span>Scheduled</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <span>Published</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-slate-500" />
            <span>Draft</span>
          </div>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="bg-slate-900/60 border border-white/5 rounded-2xl overflow-hidden shadow-xl">
        {/* Days of week */}
        <div className="grid grid-cols-7 border-b border-white/5 bg-slate-950/40 text-center py-2.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
            <div key={d}>{d}</div>
          ))}
        </div>

        {/* Days Grid */}
        <div className="grid grid-cols-7 grid-flow-row">
          {calendarBlocks.map((day, idx) => {
            const dayPosts = day ? getPostsForDay(day) : [];
            const isToday = day === 17 && month === 6 && year === 2026; // Seeding local date (July 17, 2026)

            return (
              <div 
                key={idx}
                className={`min-h-24 p-2 border-r border-b border-white/[0.03] flex flex-col justify-between text-left transition-all relative ${
                  day ? 'bg-slate-900/30' : 'bg-slate-950/20 opacity-30'
                } ${isToday ? 'bg-indigo-600/5' : ''}`}
              >
                {day && (
                  <div className="flex items-center justify-between mb-1">
                    <span className={`text-[11px] font-bold ${
                      isToday 
                        ? 'w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center' 
                        : 'text-slate-400'
                    }`}>
                      {day}
                    </span>
                    {dayPosts.length > 0 && (
                      <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-slate-950 text-slate-400 font-bold border border-white/5">
                        {dayPosts.length}
                      </span>
                    )}
                  </div>
                )}

                {/* Post Blocks inside calendar cell */}
                <div className="flex-1 space-y-1 overflow-y-auto max-h-16 pr-0.5 pt-0.5">
                  {dayPosts.map((post) => (
                    <button
                      key={post.id}
                      onClick={() => setSelectedPost(post)}
                      className={`w-full text-left p-1 rounded-md text-[9px] truncate block font-medium transition-all flex items-center gap-1 border ${
                        post.status === 'published' 
                          ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20' 
                          : post.status === 'scheduled'
                          ? 'bg-amber-500/10 border-amber-500/20 text-amber-400 hover:bg-amber-500/20'
                          : 'bg-slate-500/10 border-slate-500/20 text-slate-400 hover:bg-slate-500/20'
                      }`}
                    >
                      <span className="flex gap-0.5 shrink-0">
                        {post.platforms.map((p, pIdx) => (
                          <span key={pIdx}>{getPlatformIcon(p)}</span>
                        ))}
                      </span>
                      <span className="truncate">{post.content}</span>
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Post Details Modal */}
      {selectedPost && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-white/10 rounded-2xl w-full max-w-lg p-6 shadow-2xl relative text-left flex flex-col max-h-[90vh]">
            
            {/* Header */}
            <div className="flex items-center justify-between border-b border-white/5 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                  selectedPost.status === 'published' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                  selectedPost.status === 'scheduled' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                  'bg-slate-500/10 text-slate-400 border border-white/5'
                }`}>
                  {selectedPost.status}
                </span>
                <span className="text-xs text-slate-400 font-medium">Created by {selectedPost.creatorName}</span>
              </div>
              <button 
                onClick={() => setSelectedPost(null)}
                className="p-1 rounded-lg hover:bg-white/5 text-slate-400 hover:text-white transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Post Content */}
            <div className="flex-1 overflow-y-auto space-y-4 pr-1">
              <div className="space-y-1.5">
                <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Post Caption</h4>
                <div className="p-3.5 rounded-xl bg-slate-950 border border-white/5 text-sm text-slate-200 leading-relaxed font-normal whitespace-pre-wrap">
                  {selectedPost.content}
                </div>
              </div>

              {selectedPost.mediaUrl && (
                <div className="space-y-1.5">
                  <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Visual Graphic</h4>
                  <img src={selectedPost.mediaUrl} alt="Attached asset" className="rounded-xl border border-white/10 max-h-48 object-cover mx-auto" />
                </div>
              )}

              {/* Reschedule Drawer Form */}
              {selectedPost.status !== 'published' && (
                <form onSubmit={handleRescheduleSubmit} className="p-4 rounded-xl bg-slate-950/40 border border-white/5 space-y-3">
                  <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-amber-400" />
                    Reschedule Calendar Slot
                  </h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-1">Target Date</label>
                      <input
                        type="date"
                        required
                        value={rescheduleDate}
                        onChange={(e) => setRescheduleDate(e.target.value)}
                        className="w-full px-3 py-1.5 rounded-lg bg-slate-950 border border-white/10 text-xs text-white focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-1">Target Time</label>
                      <input
                        type="time"
                        required
                        value={rescheduleTime}
                        onChange={(e) => setRescheduleTime(e.target.value)}
                        className="w-full px-3 py-1.5 rounded-lg bg-slate-950 border border-white/10 text-xs text-white focus:outline-none"
                      />
                    </div>
                  </div>
                  <button
                    type="submit"
                    className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-lg text-xs transition-all"
                  >
                    Reschedule
                  </button>
                </form>
              )}

              {/* Operations History/Audit logs */}
              <div className="space-y-2">
                <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Post History Logs</h4>
                <div className="space-y-2 bg-slate-950/20 p-3 rounded-xl border border-white/5">
                  {selectedPost.history.map((h, idx) => (
                    <div key={idx} className="text-[11px] flex justify-between text-slate-400 border-b border-white/[0.02] last:border-0 pb-1 last:pb-0">
                      <span>• {h.action} (by {h.userName})</span>
                      <span className="font-mono text-[10px] text-slate-500">
                        {new Date(h.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Footer Buttons */}
            <div className="flex items-center justify-between border-t border-white/5 pt-4 mt-4 shrink-0">
              <button
                onClick={() => {
                  onDeletePost(selectedPost.id);
                  setSelectedPost(null);
                }}
                className="px-3.5 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-xs font-bold transition-all flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Delete
              </button>

              <div className="flex items-center gap-2">
                {selectedPost.status !== 'published' && (
                  <button
                    onClick={() => handlePublishImmediately(selectedPost)}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs transition-all flex items-center gap-1.5 shadow-lg shadow-emerald-600/20"
                  >
                    <Send className="w-3.5 h-3.5" />
                    Publish Now
                  </button>
                )}
                <button
                  onClick={() => setSelectedPost(null)}
                  className="px-4 py-2 text-xs font-bold rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-all"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
