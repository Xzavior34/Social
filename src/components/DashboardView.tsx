import React, { useState } from 'react';
import { 
  Users, 
  Eye, 
  Heart, 
  MousePointer, 
  ArrowUpRight, 
  Sparkles, 
  Calendar, 
  Activity, 
  Clock, 
  Send,
  Linkedin,
  Twitter,
  Instagram,
  Facebook
} from 'lucide-react';
import { Post, SocialAccount, ActivityLog, PlatformType } from '../types';

interface DashboardViewProps {
  posts: Post[];
  socialAccounts: SocialAccount[];
  activityLogs: ActivityLog[];
  onQuickPost: (text: string) => void;
  onNavigateTab: (tab: string) => void;
}

export default function DashboardView({
  posts,
  socialAccounts,
  activityLogs,
  onQuickPost,
  onNavigateTab,
}: DashboardViewProps) {
  const [quickIdea, setQuickIdea] = useState('');

  // Calculate aggregated stats from connected accounts
  const totalFollowers = socialAccounts.reduce((sum, sa) => sum + sa.followers, 0);
  
  // Aggregate mock impressions, clicks, engagement
  const impressions = Math.round(totalFollowers * 4.2);
  const clicks = Math.round(impressions * 0.022);
  const engagement = socialAccounts.length > 0 ? '4.8%' : '0%';

  const stats = [
    { name: 'Total Audience', value: totalFollowers.toLocaleString(), change: '+12%', icon: Users, color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20' },
    { name: 'Impressions (30d)', value: impressions.toLocaleString(), change: '+18.4%', icon: Eye, color: 'text-indigo-400', bg: 'bg-indigo-500/10 border-indigo-500/20' },
    { name: 'Total Clicks (30d)', value: clicks.toLocaleString(), change: '+8.2%', icon: MousePointer, color: 'text-pink-400', bg: 'bg-pink-500/10 border-pink-500/20' },
    { name: 'Engagement Rate', value: engagement, change: '+1.4%', icon: Heart, color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/20' },
  ];

  const handleQuickSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickIdea.trim()) return;
    onQuickPost(quickIdea);
    setQuickIdea('');
  };

  const scheduledPosts = posts
    .filter(p => p.status === 'scheduled')
    .sort((a, b) => new Date(a.scheduledFor || '').getTime() - new Date(b.scheduledFor || '').getTime())
    .slice(0, 3);

  const getPlatformIcon = (platform: PlatformType) => {
    switch (platform) {
      case 'twitter': return <Twitter className="w-4 h-4 text-sky-400" />;
      case 'linkedin': return <Linkedin className="w-4 h-4 text-blue-400" />;
      case 'instagram': return <Instagram className="w-4 h-4 text-pink-400" />;
      case 'facebook': return <Facebook className="w-4 h-4 text-blue-600" />;
    }
  };

  return (
    <div className="space-y-6 font-sans text-left pb-12">
      {/* Header Banner */}
      <div className="flex items-center justify-between pb-2 border-b border-white/5">
        <div>
          <h2 className="text-xl font-extrabold text-white tracking-tight">Overview Dashboard</h2>
          <p className="text-xs text-slate-400 mt-0.5">Real-time indicators, scheduler previews, and platform activity trackers.</p>
        </div>
        <div className="text-xs text-slate-400 font-medium px-3 py-1.5 rounded-lg bg-slate-900 border border-white/5 flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5 text-indigo-400" />
          Auto-Sync Active
        </div>
      </div>

      {/* Grid Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <div 
              key={idx} 
              className="p-4 bg-slate-900/60 backdrop-blur-xl border border-white/5 rounded-2xl flex items-center justify-between shadow-lg hover:border-white/10 transition-all"
            >
              <div className="space-y-1">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">{stat.name}</span>
                <p className="text-2xl font-black text-white tracking-tight">{stat.value}</p>
                <div className="flex items-center gap-1">
                  <span className="text-[10px] font-extrabold text-emerald-400">{stat.change}</span>
                  <span className="text-[9px] text-slate-500 font-medium">vs last month</span>
                </div>
              </div>
              <div className={`p-3 rounded-xl border ${stat.color} ${stat.bg}`}>
                <Icon className="w-5 h-5" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Main Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Column (8 cols): Quick Idea & Scheduled Posts */}
        <div className="lg:col-span-8 space-y-5">
          
          {/* Quick AI Idea Wizard */}
          <div className="p-5 bg-slate-900/40 border border-white/5 rounded-2xl relative overflow-hidden shadow-xl">
            <div className="absolute top-0 right-0 transform translate-x-12 -translate-y-12 w-48 h-48 rounded-full bg-indigo-500/5 blur-[50px] pointer-events-none" />
            <div className="flex items-start justify-between mb-3.5">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Quick AI Generator</h3>
                  <p className="text-[11px] text-slate-400">Type an idea to instantiate a prompt directly in the Content Studio.</p>
                </div>
              </div>
            </div>
            
            <form onSubmit={handleQuickSubmit} className="flex gap-2">
              <input
                type="text"
                placeholder="e.g. Write a Twitter post explaining our API jwt token rotation structure..."
                value={quickIdea}
                onChange={(e) => setQuickIdea(e.target.value)}
                className="flex-1 px-4 py-2.5 rounded-xl bg-slate-950 border border-white/10 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-indigo-500 transition-all"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl text-xs transition-all flex items-center gap-1.5 shadow-lg shadow-indigo-600/20"
              >
                <Send className="w-3.5 h-3.5" />
                Draft
              </button>
            </form>
          </div>

          {/* Next Up in Calendar */}
          <div className="p-5 bg-slate-900/60 backdrop-blur-xl border border-white/5 rounded-2xl shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-pink-500/10 border border-pink-500/20 text-pink-400">
                  <Calendar className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold text-white">Upcoming Queue</h3>
              </div>
              <button 
                onClick={() => onNavigateTab('calendar')}
                className="text-[11px] font-bold text-indigo-400 hover:text-indigo-300 flex items-center gap-0.5 transition-colors"
              >
                Full Calendar
                <ArrowUpRight className="w-3 h-3" />
              </button>
            </div>

            {scheduledPosts.length === 0 ? (
              <div className="p-8 text-center rounded-xl bg-slate-950/30 border border-white/[0.02] space-y-2">
                <Calendar className="w-8 h-8 text-slate-600 mx-auto" />
                <p className="text-xs text-slate-400 font-medium">No scheduled posts queue active.</p>
                <button
                  onClick={() => onNavigateTab('studio')}
                  className="px-3.5 py-1.5 bg-white/5 hover:bg-white/10 text-white font-semibold rounded-lg text-[10px] transition-all"
                >
                  Schedule A Post Now
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {scheduledPosts.map((post) => (
                  <div 
                    key={post.id}
                    className="p-3.5 rounded-xl bg-slate-950/50 border border-white/5 flex items-start justify-between gap-4 group hover:border-indigo-500/30 transition-all"
                  >
                    <div className="space-y-1.5 min-w-0 flex-1 text-left">
                      <div className="flex items-center gap-2 flex-wrap">
                        <div className="flex items-center gap-1">
                          {post.platforms.map((p, idx) => (
                            <span key={idx} className="p-1 rounded-md bg-white/5 border border-white/10">
                              {getPlatformIcon(p)}
                            </span>
                          ))}
                        </div>
                        <span className="text-[10px] font-bold text-slate-400 bg-slate-900 px-2 py-0.5 rounded-full border border-white/5 flex items-center gap-1">
                          <Clock className="w-3 h-3 text-indigo-400" />
                          {new Date(post.scheduledFor || '').toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed font-normal">
                        {post.content}
                      </p>
                    </div>
                    
                    <button 
                      onClick={() => onNavigateTab('studio')}
                      className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-all shrink-0"
                    >
                      <ArrowUpRight className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column (4 cols): Connected Platforms & Audit Activity Logs */}
        <div className="lg:col-span-4 space-y-5">
          {/* Connected Channels */}
          <div className="p-5 bg-slate-900/60 backdrop-blur-xl border border-white/5 rounded-2xl shadow-xl">
            <h3 className="text-sm font-bold text-white mb-3.5 flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-teal-500/10 border border-teal-500/20 text-teal-400">
                <Users className="w-4 h-4" />
              </div>
              Linked Platforms
            </h3>

            {socialAccounts.length === 0 ? (
              <div className="p-4 text-center rounded-xl bg-slate-950/30 border border-white/[0.02]">
                <p className="text-xs text-slate-500">No active channels linked.</p>
                <button
                  onClick={() => onNavigateTab('settings')}
                  className="mt-2 text-[10px] text-indigo-400 font-bold hover:underline"
                >
                  Link Accounts Now
                </button>
              </div>
            ) : (
              <div className="space-y-2.5">
                {socialAccounts.map((sa) => (
                  <div 
                    key={sa.id}
                    className="p-2 rounded-xl bg-slate-950/50 border border-white/5 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="relative">
                        <img 
                          src={sa.avatar} 
                          alt={sa.handle} 
                          className="w-8 h-8 rounded-full border border-white/10 object-cover"
                        />
                        <div className="absolute -bottom-1 -right-1 p-0.5 bg-slate-900 border border-white/10 rounded-md">
                          {getPlatformIcon(sa.platform)}
                        </div>
                      </div>
                      <div className="min-w-0 text-left">
                        <p className="text-xs font-bold text-white truncate leading-snug">{sa.name}</p>
                        <p className="text-[10px] text-slate-500 truncate">@{sa.handle}</p>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-xs font-bold text-slate-200">{sa.followers.toLocaleString()}</p>
                      <p className="text-[9px] text-slate-500">Followers</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Audit Activity Logs */}
          <div className="p-5 bg-slate-900/60 backdrop-blur-xl border border-white/5 rounded-2xl shadow-xl flex flex-col max-h-[340px]">
            <h3 className="text-sm font-bold text-white mb-3.5 flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400">
                <Activity className="w-4 h-4" />
              </div>
              SaaS Operations Audit
            </h3>

            <div className="space-y-3 overflow-y-auto flex-1 pr-1 text-left">
              {activityLogs.length === 0 ? (
                <p className="text-xs text-slate-500 text-center py-6">No operations logged yet.</p>
              ) : (
                activityLogs.map((log) => (
                  <div key={log.id} className="text-xs flex gap-2 border-b border-white/[0.02] pb-2 last:border-0 last:pb-0">
                    <div className="mt-0.5 w-1.5 h-1.5 rounded-full bg-indigo-500 shrink-0" />
                    <div>
                      <p className="text-slate-300 font-medium leading-relaxed">
                        <span className="font-extrabold text-white">{log.userName}</span>: {log.action}
                      </p>
                      <p className="text-[10px] text-slate-500 mt-0.5 font-normal leading-relaxed">{log.details}</p>
                      <span className="text-[9px] text-slate-500 font-mono">
                        {new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
