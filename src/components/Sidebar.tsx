import React, { useState } from 'react';
import { 
  Briefcase, 
  LayoutDashboard, 
  Sparkles, 
  Calendar, 
  BarChart3, 
  Settings, 
  Plus, 
  LogOut, 
  ChevronDown, 
  ShieldCheck, 
  UserCircle 
} from 'lucide-react';
import { Workspace, Subscription, User, UserRole } from '../types';

interface SidebarProps {
  user: User;
  userRole: UserRole;
  workspaces: Workspace[];
  activeWorkspaceId: string;
  onSelectWorkspace: (id: string) => void;
  onCreateWorkspace: (name: string, brandVoice: string) => void;
  activeTab: string;
  onChangeTab: (tab: string) => void;
  subscription: Subscription;
  onLogout: () => void;
}

export default function Sidebar({
  user,
  userRole,
  workspaces,
  activeWorkspaceId,
  onSelectWorkspace,
  onCreateWorkspace,
  activeTab,
  onChangeTab,
  subscription,
  onLogout,
}: SidebarProps) {
  const [showWsMenu, setShowWsMenu] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newWsName, setNewWsName] = useState('');
  const [newWsVoice, setNewWsVoice] = useState('');

  const currentWorkspace = workspaces.find(w => w.id === activeWorkspaceId) || workspaces[0];

  const handleCreateWsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWsName.trim()) return;
    onCreateWorkspace(newWsName, newWsVoice);
    setNewWsName('');
    setNewWsVoice('');
    setShowCreateModal(false);
  };

  const menuItems = [
    { id: 'dashboard', name: 'Overview Dashboard', icon: LayoutDashboard, badge: null },
    { id: 'studio', name: 'AI Content Studio', icon: Sparkles, badge: 'AI' },
    { id: 'calendar', name: 'Dynamic Calendar', icon: Calendar, badge: null },
    { id: 'analytics', name: 'Analytics Summary', icon: BarChart3, badge: null },
    { id: 'settings', name: 'Settings & Team', icon: Settings, badge: null },
  ];

  // Subscription calculation
  const aiProgress = Math.min(100, (subscription.aiUsed / subscription.aiLimit) * 100);

  return (
    <aside id="main-sidebar" className="w-64 bg-slate-900 border-r border-white/5 flex flex-col h-full shrink-0 relative z-30 font-sans text-slate-300">
      {/* Workspace Header */}
      <div className="p-4 border-b border-white/5 relative">
        <button
          onClick={() => setShowWsMenu(!showWsMenu)}
          className="w-full flex items-center justify-between p-2 rounded-xl bg-slate-950/40 border border-white/5 hover:border-white/10 text-left transition-all group"
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-indigo-600/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 shrink-0 font-bold text-sm">
              {currentWorkspace ? currentWorkspace.name.charAt(0) : 'W'}
            </div>
            <div className="min-w-0">
              <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Workspace</h3>
              <p className="text-sm font-bold text-white truncate">{currentWorkspace?.name || 'Loading...'}</p>
            </div>
          </div>
          <ChevronDown className="w-4 h-4 text-slate-400 group-hover:text-white transition-colors shrink-0" />
        </button>

        {/* Workspace Switcher Dropdown */}
        {showWsMenu && (
          <div className="absolute top-full left-4 right-4 mt-2 bg-slate-950 border border-white/10 rounded-xl shadow-2xl overflow-hidden z-50">
            <div className="p-1 max-h-48 overflow-y-auto">
              {workspaces.map((ws) => (
                <button
                  key={ws.id}
                  onClick={() => {
                    onSelectWorkspace(ws.id);
                    setShowWsMenu(false);
                  }}
                  className={`w-full text-left p-2.5 rounded-lg text-xs font-semibold flex items-center justify-between transition-all ${
                    ws.id === activeWorkspaceId
                      ? 'bg-indigo-600/10 text-indigo-400 border border-indigo-500/20'
                      : 'text-slate-300 hover:bg-white/5'
                  }`}
                >
                  <span className="truncate">{ws.name}</span>
                  {ws.id === activeWorkspaceId && <div className="w-1.5 h-1.5 rounded-full bg-indigo-400" />}
                </button>
              ))}
            </div>
            <div className="border-t border-white/5 p-1">
              <button
                onClick={() => {
                  setShowCreateModal(true);
                  setShowWsMenu(false);
                }}
                className="w-full text-left p-2 rounded-lg text-xs font-bold text-indigo-400 hover:bg-indigo-500/10 flex items-center gap-1.5 transition-all"
              >
                <Plus className="w-3.5 h-3.5" />
                New Workspace
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Main Navigation Tabs */}
      <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto">
        <h3 className="px-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Main Menu</h3>
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => onChangeTab(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all group ${
                activeTab === item.id
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/10'
                  : 'hover:bg-white/5 hover:text-white text-slate-400'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-4.5 h-4.5 transition-colors ${
                  activeTab === item.id ? 'text-white' : 'text-slate-400 group-hover:text-white'
                }`} />
                <span>{item.name}</span>
              </div>
              {item.badge && (
                <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full uppercase tracking-wider ${
                  activeTab === item.id 
                    ? 'bg-white/20 text-white' 
                    : 'bg-indigo-500/10 text-indigo-400'
                }`}>
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Subscription Quota indicators */}
      <div className="p-4 border-t border-white/5 space-y-3.5 bg-slate-950/20">
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Subscription Tier</span>
            <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 text-white uppercase tracking-wider">
              {subscription.tier}
            </span>
          </div>
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>AI Generations</span>
            <span className="font-semibold text-white">
              {subscription.aiUsed} / {subscription.aiLimit}
            </span>
          </div>
          <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden mt-1.5">
            <div 
              className={`h-full rounded-full transition-all duration-500 ${
                aiProgress > 85 ? 'bg-rose-500' : aiProgress > 50 ? 'bg-amber-500' : 'bg-indigo-500'
              }`}
              style={{ width: `${aiProgress}%` }}
            />
          </div>
        </div>
      </div>

      {/* User Information Footer */}
      <div className="p-4 border-t border-white/5 bg-slate-950/40 flex items-center justify-between">
        <div className="flex items-center gap-2.5 min-w-0">
          <img
            src={user.avatar}
            alt={user.name}
            className="w-9 h-9 rounded-full border border-white/10 shrink-0"
          />
          <div className="min-w-0 text-left">
            <p className="text-sm font-semibold text-white truncate leading-tight">{user.name}</p>
            <div className="flex items-center gap-1 mt-0.5">
              <ShieldCheck className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
              <span className="text-[10px] font-extrabold text-indigo-400 tracking-wider uppercase">
                {userRole}
              </span>
            </div>
          </div>
        </div>
        <button
          onClick={onLogout}
          title="Sign out"
          className="p-1.5 rounded-lg bg-slate-900 border border-white/5 hover:border-red-500/20 hover:bg-red-500/10 text-slate-400 hover:text-red-400 transition-all shrink-0"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>

      {/* New Workspace Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-white/10 rounded-2xl w-full max-w-md p-6 shadow-2xl relative text-left">
            <h3 className="text-lg font-bold text-white mb-2">Create Workspace</h3>
            <p className="text-xs text-slate-400 mb-4">Initialize a new multi-tenant context with dedicated team assets and brand voice guidelines.</p>
            
            <form onSubmit={handleCreateWsSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                  Workspace Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Acme Retail, Tech Startup"
                  value={newWsName}
                  onChange={(e) => setNewWsName(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-white/10 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-indigo-500 transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                  Brand Voice (AI Guidelines)
                </label>
                <textarea
                  rows={4}
                  placeholder="Professional, direct, educational, etc..."
                  value={newWsVoice}
                  onChange={(e) => setNewWsVoice(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-white/10 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-indigo-500 transition-all resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-xs font-semibold rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-lg transition-all"
                >
                  Create Workspace
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </aside>
  );
}
