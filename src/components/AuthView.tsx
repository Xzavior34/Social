import React, { useState } from 'react';
import { Shield, Sparkles, LogIn, ChevronRight, UserCheck } from 'lucide-react';
import { User, UserRole } from '../types';

interface AuthViewProps {
  onLogin: (user: User, role: UserRole) => void;
}

const PRESET_USERS = [
  {
    id: 'usr-1',
    email: 'philipinem7@gmail.com',
    name: 'Philip Inem',
    role: 'Admin' as UserRole,
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    desc: 'Full workspace administration, billing controls, brand voices, and team invites.',
  },
  {
    id: 'usr-2',
    email: 'sarah.jones@acme.com',
    name: 'Sarah Jones',
    role: 'Editor' as UserRole,
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    desc: 'Content creation, AI Studio tools, drafting updates, and managing calendar posts.',
  },
  {
    id: 'usr-3',
    email: 'alex.m@acme.com',
    name: 'Alex Miller',
    role: 'Analyst' as UserRole,
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    desc: 'Analytics reports, platform metrics insights, and Gemini strategic recommendations.',
  }
];

export default function AuthView({ onLogin }: AuthViewProps) {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [activeTab, setActiveTab] = useState<'signin' | 'signup'>('signin');
  const [customLoading, setCustomLoading] = useState(false);

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    
    setCustomLoading(true);
    setTimeout(() => {
      onLogin({
        id: `usr-${Date.now()}`,
        email: email,
        name: name || email.split('@')[0],
        avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${email}`,
      }, 'Admin');
      setCustomLoading(false);
    }, 1000);
  };

  const handleSelectPreset = (p: typeof PRESET_USERS[0]) => {
    onLogin({
      id: p.id,
      email: p.email,
      name: p.name,
      avatar: p.avatar
    }, p.role);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center relative overflow-hidden px-4 font-sans selection:bg-indigo-500/30">
      {/* Background Gradients */}
      <div className="absolute top-[-20%] left-[-20%] w-[60%] h-[60%] rounded-full bg-indigo-900/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-20%] w-[60%] h-[60%] rounded-full bg-fuchsia-900/10 blur-[120px] pointer-events-none" />
      <div className="absolute top-[40%] left-[50%] -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full bg-slate-900/40 border border-white/[0.03] pointer-events-none" />

      {/* Main Container */}
      <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-12 gap-8 items-center relative z-10 my-8">
        {/* Left Hand: Hero & branding */}
        <div className="md:col-span-6 space-y-6 text-left">
          <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-semibold tracking-wide">
            <Sparkles className="w-3.5 h-3.5 animate-pulse" />
            ENTERPRISE AI SOCIAL SaaS
          </div>
          <h1 className="text-4xl md:text-5xl font-black tracking-tight text-white leading-[1.1]">
            Automate Your Brand with <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">Gemini AI</span>
          </h1>
          <p className="text-slate-400 text-base md:text-lg max-w-md font-normal leading-relaxed">
            Configure multi-tenant brand voices, schedule posts automatically across connected social networks, and review AI Strategic Analytics reports on a premium secure console.
          </p>

          {/* Value Props */}
          <div className="space-y-4 pt-2">
            <div className="flex items-start gap-3">
              <div className="mt-1 p-1 bg-white/5 border border-white/10 rounded-lg text-indigo-400">
                <Shield className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-white">Full Role-Based Authorization</h4>
                <p className="text-xs text-slate-400">Assign Admin, Editor, or Analyst permissions to control features.</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="mt-1 p-1 bg-white/5 border border-white/10 rounded-lg text-indigo-400">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-white">Gemini-Powered Studio</h4>
                <p className="text-xs text-slate-400">Instantly generate tailored copy, hashtags, rewrites, and custom base64 graphics.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Hand: Auth Form / Persona Switcher */}
        <div className="md:col-span-6 space-y-6">
          <div className="bg-slate-900/70 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-2xl relative">
            <div className="absolute top-0 right-0 transform translate-x-3 -translate-y-3 p-1.5 bg-indigo-600 rounded-lg shadow-lg">
              <Shield className="w-4 h-4 text-white" />
            </div>

            {/* Custom Tab Selector */}
            <div className="flex border-b border-white/10 pb-4 mb-5">
              <button
                onClick={() => setActiveTab('signin')}
                className={`flex-1 text-center py-2 text-sm font-semibold transition-all ${
                  activeTab === 'signin' 
                    ? 'text-white border-b-2 border-indigo-500' 
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Preset Personas
              </button>
              <button
                onClick={() => setActiveTab('signup')}
                className={`flex-1 text-center py-2 text-sm font-semibold transition-all ${
                  activeTab === 'signup' 
                    ? 'text-white border-b-2 border-indigo-500' 
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Custom Credentials
              </button>
            </div>

            {activeTab === 'signin' ? (
              <div className="space-y-4">
                <div className="text-left mb-2">
                  <h3 className="text-base font-bold text-white">Select a Developer Account</h3>
                  <p className="text-xs text-slate-400">Test different workspaces and roles instantaneously.</p>
                </div>

                <div className="space-y-3">
                  {PRESET_USERS.map((preset) => (
                    <button
                      key={preset.id}
                      onClick={() => handleSelectPreset(preset)}
                      className="w-full text-left p-3.5 rounded-xl bg-slate-950/50 hover:bg-slate-800/80 border border-white/5 hover:border-indigo-500/40 transition-all flex items-start gap-3.5 group"
                    >
                      <img
                        src={preset.avatar}
                        alt={preset.name}
                        className="w-10 h-10 rounded-full border border-white/10 flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h4 className="text-sm font-bold text-white group-hover:text-indigo-400 transition-colors">
                            {preset.name}
                          </h4>
                          <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold tracking-wider uppercase ${
                            preset.role === 'Admin' ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20' :
                            preset.role === 'Editor' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                            'bg-teal-500/10 text-teal-400 border border-teal-500/20'
                          }`}>
                            {preset.role}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">{preset.desc}</p>
                        <p className="text-[10px] text-slate-500 font-mono mt-1">{preset.email}</p>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-white self-center transition-transform group-hover:translate-x-1" />
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <form onSubmit={handleCustomSubmit} className="space-y-4 text-left">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                    Your Name
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Philip Inem"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-white/10 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-indigo-500 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                    Email Address
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="philipinem7@gmail.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-white/10 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-indigo-500 transition-all"
                  />
                </div>

                <button
                  type="submit"
                  disabled={customLoading}
                  className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl text-sm transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/20 hover:shadow-indigo-600/40"
                >
                  {customLoading ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <LogIn className="w-4 h-4" />
                      Create & Enter Workspace
                    </>
                  )}
                </button>
                
                <p className="text-[11px] text-slate-500 text-center leading-relaxed mt-2">
                  Signing up automatically instantiates a new local tenant workspace with Starter Tier allowances.
                </p>
              </form>
            )}
          </div>
          
          <div className="text-center">
            <p className="text-xs text-slate-500 font-mono">
              socioAI Dev v1.0.0 • Local Time: 2026-07-17
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
