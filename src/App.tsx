import React, { useState, useEffect } from 'react';
import { User, Workspace, TeamMember, SocialAccount, Post, Subscription, ActivityLog, UserRole } from './types';
import AuthView from './components/AuthView';
import Sidebar from './components/Sidebar';
import DashboardView from './components/DashboardView';
import ContentStudioView from './components/ContentStudioView';
import CalendarView from './components/CalendarView';
import AnalyticsView from './components/AnalyticsView';
import SettingsView from './components/SettingsView';
import { Sparkles, RefreshCw } from 'lucide-react';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [userRole, setUserRole] = useState<UserRole>('Admin');
  const [activeTab, setActiveTab] = useState('dashboard');

  // Multi-workspace data states
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [activeWorkspaceId, setActiveWorkspaceId] = useState('');
  const [posts, setPosts] = useState<Post[]>([]);
  const [socialAccounts, setSocialAccounts] = useState<SocialAccount[]>([]);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [subscription, setSubscription] = useState<Subscription | null>(null);

  const [loading, setLoading] = useState(false);
  const [quickStudioPrompt, setQuickStudioPrompt] = useState('');

  // 1. Fetch initial workspaces on startup
  useEffect(() => {
    if (user) {
      fetchWorkspaces();
    }
  }, [user]);

  // 2. Refresh workspace dataset every time active workspace id changes
  useEffect(() => {
    if (activeWorkspaceId) {
      fetchWorkspaceData();
    }
  }, [activeWorkspaceId]);

  const fetchWorkspaces = async () => {
    try {
      const res = await fetch('/api/workspaces');
      const data = await res.json();
      if (res.ok && data.length > 0) {
        setWorkspaces(data);
        // Find if user has an associated workspace, or select first
        setActiveWorkspaceId(data[0].id);
      }
    } catch (err) {
      console.error('Error fetching workspaces:', err);
    }
  };

  const fetchWorkspaceData = async () => {
    setLoading(true);
    try {
      const [pRes, sRes, subRes, logRes] = await Promise.all([
        fetch(`/api/workspaces/${activeWorkspaceId}/posts`),
        fetch(`/api/workspaces/${activeWorkspaceId}/social-accounts`),
        fetch(`/api/workspaces/${activeWorkspaceId}/subscription`),
        fetch(`/api/workspaces/${activeWorkspaceId}/activity-logs`),
      ]);

      const [postsData, socialData, subData, logsData] = await Promise.all([
        pRes.json(),
        sRes.json(),
        subRes.json(),
        logRes.json(),
      ]);

      if (pRes.ok) setPosts(postsData);
      if (sRes.ok) setSocialAccounts(socialData);
      if (subRes.ok) setSubscription(subData);
      if (logRes.ok) setActivityLogs(logsData);
    } catch (err) {
      console.error('Error loading workspace data:', err);
    } finally {
      setLoading(false);
    }
  };

  // --- ACTIONS ---

  const handleLogin = (newUser: User, role: UserRole) => {
    setUser(newUser);
    setUserRole(role);
  };

  const handleLogout = () => {
    setUser(null);
    setActiveTab('dashboard');
    setWorkspaces([]);
    setActiveWorkspaceId('');
    setPosts([]);
    setSocialAccounts([]);
    setSubscription(null);
    setActivityLogs([]);
  };

  const handleCreateWorkspace = async (name: string, brandVoice: string) => {
    try {
      const res = await fetch('/api/workspaces', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          brandVoice,
          creatorId: user?.id || 'usr-1',
        })
      });
      const data = await res.json();
      if (res.ok) {
        setWorkspaces(prev => [...prev, data]);
        setActiveWorkspaceId(data.id);
      }
    } catch (err) {
      console.error('Error creating workspace:', err);
    }
  };

  const handleUpdateWorkspace = async (updates: Partial<Workspace>) => {
    try {
      const res = await fetch(`/api/workspaces/${activeWorkspaceId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
      const data = await res.json();
      if (res.ok) {
        setWorkspaces(prev => prev.map(w => w.id === activeWorkspaceId ? data : w));
      }
    } catch (err) {
      console.error('Error updating brand guidelines:', err);
    }
  };

  const handlePostCreated = async (newPost: Omit<Post, 'id' | 'createdAt' | 'comments' | 'history'>) => {
    try {
      const res = await fetch(`/api/workspaces/${activeWorkspaceId}/posts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newPost,
          creatorName: user?.name || 'Philip Inem',
          creatorId: user?.id || 'usr-1',
        })
      });
      if (res.ok) {
        // Reload workspace dataset to include new post + recalculated quotas + activity logs
        await fetchWorkspaceData();
      }
    } catch (err) {
      console.error('Error adding post:', err);
    }
  };

  const handleUpdatePost = async (id: string, updates: Partial<Post>) => {
    try {
      const res = await fetch(`/api/workspaces/${activeWorkspaceId}/posts/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...updates,
          userName: user?.name || 'Philip Inem',
        })
      });
      if (res.ok) {
        await fetchWorkspaceData();
      }
    } catch (err) {
      console.error('Error modifying calendar slot:', err);
    }
  };

  const handleDeletePost = async (id: string) => {
    try {
      const res = await fetch(`/api/workspaces/${activeWorkspaceId}/posts/${id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        await fetchWorkspaceData();
      }
    } catch (err) {
      console.error('Error deleting post:', err);
    }
  };

  const handleIncrementAIUsage = () => {
    if (subscription) {
      setSubscription({
        ...subscription,
        aiUsed: subscription.aiUsed + 1
      });
    }
  };

  const handleUpdateSubscription = (tier: 'Starter' | 'Pro' | 'Enterprise') => {
    if (subscription) {
      const limits = { Starter: 100, Pro: 1000, Enterprise: 5000 };
      setSubscription({
        ...subscription,
        tier,
        aiLimit: limits[tier]
      });
    }
  };

  // Quick Action Routing from Overview Stats
  const handleQuickPostRoute = (promptText: string) => {
    setQuickStudioPrompt(promptText);
    setActiveTab('studio');
  };

  if (!user) {
    return <AuthView onLogin={handleLogin} />;
  }

  const activeWorkspace = workspaces.find(w => w.id === activeWorkspaceId);

  return (
    <div className="flex h-screen w-screen bg-slate-950 overflow-hidden relative font-sans selection:bg-indigo-500/30 text-slate-200">
      
      {/* Active Sidebar */}
      <Sidebar
        user={user}
        userRole={userRole}
        workspaces={workspaces}
        activeWorkspaceId={activeWorkspaceId}
        onSelectWorkspace={setActiveWorkspaceId}
        onCreateWorkspace={handleCreateWorkspace}
        activeTab={activeTab}
        onChangeTab={setActiveTab}
        subscription={subscription || { workspaceId: activeWorkspaceId, tier: 'Starter', status: 'active', expiresAt: '', aiLimit: 100, aiUsed: 0 }}
        onLogout={handleLogout}
      />

      {/* Main Panel Area */}
      <main className="flex-1 flex flex-col h-full overflow-hidden bg-slate-950 text-slate-100 relative">
        {/* Background Gradients */}
        <div className="absolute top-0 right-0 w-[450px] h-[450px] rounded-full bg-indigo-500/5 blur-[100px] pointer-events-none" />
        <div className="absolute bottom-0 left-[20%] w-[450px] h-[450px] rounded-full bg-pink-500/5 blur-[100px] pointer-events-none" />

        {/* Floating Sync indicator when loading */}
        {loading && (
          <div className="absolute top-4 right-6 flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-600/10 border border-indigo-500/20 text-indigo-400 text-[10px] font-bold uppercase tracking-wider z-50 animate-pulse">
            <RefreshCw className="w-3 h-3 animate-spin" />
            Workspace Syncing
          </div>
        )}

        <div className="flex-1 overflow-y-auto px-6 py-6 relative z-10">
          <div className="max-w-6xl mx-auto">
            {activeTab === 'dashboard' && (
              <DashboardView
                posts={posts}
                socialAccounts={socialAccounts}
                activityLogs={activityLogs}
                onQuickPost={handleQuickPostRoute}
                onNavigateTab={setActiveTab}
              />
            )}

            {activeTab === 'studio' && (
              <ContentStudioView
                workspaceId={activeWorkspaceId}
                brandVoice={activeWorkspace?.brandVoice || ''}
                targetAudience={activeWorkspace?.targetAudience || ''}
                primaryTone={activeWorkspace?.primaryTone || 'Professional'}
                socialAccounts={socialAccounts}
                subscription={subscription || { workspaceId: activeWorkspaceId, tier: 'Starter', status: 'active', expiresAt: '', aiLimit: 100, aiUsed: 0 }}
                onPostCreated={handlePostCreated}
                onIncrementUsage={handleIncrementAIUsage}
                initialPrompt={quickStudioPrompt}
              />
            )}

            {activeTab === 'calendar' && (
              <CalendarView
                posts={posts}
                onUpdatePost={handleUpdatePost}
                onDeletePost={handleDeletePost}
                onNavigateTab={setActiveTab}
              />
            )}

            {activeTab === 'analytics' && (
              <AnalyticsView
                workspaceId={activeWorkspaceId}
                brandVoice={activeWorkspace?.brandVoice || ''}
                subscription={subscription || { workspaceId: activeWorkspaceId, tier: 'Starter', status: 'active', expiresAt: '', aiLimit: 100, aiUsed: 0 }}
                onIncrementUsage={handleIncrementAIUsage}
              />
            )}

            {activeTab === 'settings' && activeWorkspace && (
              <SettingsView
                workspaceId={activeWorkspaceId}
                currentWorkspace={activeWorkspace}
                onUpdateWorkspace={handleUpdateWorkspace}
                subscription={subscription || { workspaceId: activeWorkspaceId, tier: 'Starter', status: 'active', expiresAt: '', aiLimit: 100, aiUsed: 0 }}
                onUpdateSubscription={handleUpdateSubscription}
                userRole={userRole}
              />
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
