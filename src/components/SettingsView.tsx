import React, { useState, useEffect } from 'react';
import { 
  Briefcase, 
  Users, 
  CreditCard, 
  Trash2, 
  Plus, 
  CheckCircle, 
  AlertTriangle, 
  Check, 
  X,
  RefreshCw,
  Sparkles,
  ShieldAlert
} from 'lucide-react';
import { Workspace, TeamMember, Subscription, UserRole } from '../types';

interface SettingsViewProps {
  workspaceId: string;
  currentWorkspace: Workspace;
  onUpdateWorkspace: (updates: Partial<Workspace>) => void;
  subscription: Subscription;
  onUpdateSubscription: (tier: 'Starter' | 'Pro' | 'Enterprise') => void;
  userRole: UserRole;
}

export default function SettingsView({
  workspaceId,
  currentWorkspace,
  onUpdateWorkspace,
  subscription,
  onUpdateSubscription,
  userRole,
}: SettingsViewProps) {
  // Brand Settings State
  const [wsName, setWsName] = useState(currentWorkspace?.name || '');
  const [brandVoice, setBrandVoice] = useState(currentWorkspace?.brandVoice || '');
  const [targetAudience, setTargetAudience] = useState(currentWorkspace?.targetAudience || '');
  const [primaryTone, setPrimaryTone] = useState(currentWorkspace?.primaryTone || 'Professional');

  // Team Collaboration State
  const [team, setTeam] = useState<TeamMember[]>([]);
  const [inviteName, setInviteName] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<UserRole>('Editor');
  const [teamLoading, setTeamLoading] = useState(false);

  // Billing Upgrade States
  const [showCheckout, setShowCheckout] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<'Starter' | 'Pro' | 'Enterprise' | null>(null);
  const [cardNo, setCardNo] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [checkoutLoading, setCheckoutLoading] = useState(false);

  // Status Alerts
  const [alertMsg, setAlertMsg] = useState('');
  const [alertType, setAlertType] = useState<'success' | 'error' | ''>('');

  useEffect(() => {
    if (currentWorkspace) {
      setWsName(currentWorkspace.name);
      setBrandVoice(currentWorkspace.brandVoice);
      setTargetAudience(currentWorkspace.targetAudience);
      setPrimaryTone(currentWorkspace.primaryTone);
    }
    fetchTeam();
  }, [workspaceId, currentWorkspace]);

  const fetchTeam = async () => {
    setTeamLoading(true);
    try {
      const res = await fetch(`/api/workspaces/${workspaceId}/team-members`);
      const data = await res.json();
      if (res.ok) {
        setTeam(data);
      }
    } catch (err) {
      console.error('Error fetching team members:', err);
    } finally {
      setTeamLoading(false);
    }
  };

  // --- BRAND FORM SUBMIT ---

  const handleBrandSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (userRole !== 'Admin') {
      triggerAlert('Only Admin roles are authorized to modify Brand voice guidelines.', 'error');
      return;
    }
    onUpdateWorkspace({
      name: wsName,
      brandVoice,
      targetAudience,
      primaryTone,
    });
    triggerAlert('Workspace metadata & brand voice guidelines saved!', 'success');
  };

  // --- TEAM INVITE SUBMIT ---

  const handleInviteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (userRole !== 'Admin') {
      triggerAlert('Only Admin roles can invite new team members.', 'error');
      return;
    }
    if (!inviteName || !inviteEmail) return;

    try {
      const res = await fetch(`/api/workspaces/${workspaceId}/team-members`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: inviteName, email: inviteEmail, role: inviteRole })
      });
      const data = await res.json();
      if (res.ok) {
        setTeam(prev => [...prev, data]);
        setInviteName('');
        setInviteEmail('');
        triggerAlert(`Successfully invited ${inviteName}!`, 'success');
      } else {
        throw new Error(data.error);
      }
    } catch (err: any) {
      triggerAlert(err.message || 'Invitation failed.', 'error');
    }
  };

  const handleRemoveTeamMember = async (id: string) => {
    if (userRole !== 'Admin') {
      triggerAlert('Only Admin roles are authorized to delete team members.', 'error');
      return;
    }
    try {
      const res = await fetch(`/api/workspaces/${workspaceId}/team-members/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setTeam(prev => prev.filter(t => t.id !== id));
        triggerAlert('Removed team member.', 'success');
      }
    } catch (err) {
      console.error('Error removing team member:', err);
    }
  };

  // --- STRIPE BILLING UPGRADE SUBMIT ---

  const handleStripeCheckout = (plan: 'Starter' | 'Pro' | 'Enterprise') => {
    if (userRole !== 'Admin') {
      triggerAlert('Only Admin roles are authorized to modify billing tiers.', 'error');
      return;
    }
    setSelectedPlan(plan);
    setShowCheckout(true);
  };

  const handleCompleteCheckout = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cardNo || !selectedPlan) return;

    setCheckoutLoading(true);
    setTimeout(async () => {
      try {
        const res = await fetch(`/api/workspaces/${workspaceId}/subscription`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ tier: selectedPlan })
        });
        const data = await res.json();
        if (res.ok) {
          onUpdateSubscription(selectedPlan);
          triggerAlert(`Billing subscription upgraded successfully to ${selectedPlan}!`, 'success');
        }
      } catch (err) {
        console.error('Checkout error:', err);
      } finally {
        setCheckoutLoading(false);
        setShowCheckout(false);
        setCardNo('');
        setCardExpiry('');
        setCardCvv('');
      }
    }, 1500);
  };

  const triggerAlert = (msg: string, type: 'success' | 'error') => {
    setAlertMsg(msg);
    setAlertType(type);
    setTimeout(() => {
      setAlertMsg('');
      setAlertType('');
    }, 5000);
  };

  return (
    <div className="space-y-6 font-sans text-left pb-12">
      {/* Header Banner */}
      <div className="pb-2 border-b border-white/5">
        <h2 className="text-xl font-extrabold text-white tracking-tight">Settings & Team</h2>
        <p className="text-xs text-slate-400 mt-0.5">Control tenant branding guides, manage team collaborations, and adjust billing quotas.</p>
      </div>

      {/* Global Status Banner */}
      {alertMsg && (
        <div className={`p-4 rounded-xl border text-xs flex items-center gap-2.5 ${
          alertType === 'success' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-rose-500/10 border-rose-500/20 text-rose-400'
        }`}>
          {alertType === 'success' ? <CheckCircle className="w-4 h-4 shrink-0" /> : <AlertTriangle className="w-4 h-4 shrink-0" />}
          <span className="font-semibold">{alertMsg}</span>
        </div>
      )}

      {/* Grid Settings Layout */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5 items-start">
        
        {/* Left Hand: Brand guidelines & Team Invite (8 cols) */}
        <div className="xl:col-span-8 space-y-5">
          
          {/* Brand Settings Form */}
          <div className="bg-slate-900/60 border border-white/5 rounded-2xl p-5 shadow-xl">
            <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
                <Briefcase className="w-4 h-4" />
              </div>
              Workspace Branding Settings
            </h3>

            {userRole !== 'Admin' && (
              <div className="mb-4 p-3 rounded-xl bg-amber-500/5 border border-amber-500/10 text-amber-400 text-xs flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 shrink-0" />
                <span>You are logged in with the role: <span className="font-extrabold">{userRole}</span>. Some settings are read-only.</span>
              </div>
            )}

            <form onSubmit={handleBrandSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Workspace Title</label>
                  <input
                    type="text"
                    required
                    disabled={userRole !== 'Admin'}
                    value={wsName}
                    onChange={(e) => setWsName(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-white/10 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-indigo-500 transition-all disabled:opacity-50"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Primary Brand Tone</label>
                  <select
                    value={primaryTone}
                    disabled={userRole !== 'Admin'}
                    onChange={(e) => setPrimaryTone(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-white/10 text-slate-300 text-sm focus:outline-none focus:border-indigo-500 transition-all disabled:opacity-50"
                  >
                    <option value="Professional">Professional</option>
                    <option value="Thoughtful">Thoughtful</option>
                    <option value="Sarcastic">Sarcastic</option>
                    <option value="Humorous">Humorous</option>
                    <option value="Inspirational">Inspirational</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Target Audience Definition</label>
                <input
                  type="text"
                  placeholder="e.g. CTOs, Product Developers, Solopreneurs, Dev Decision Makers"
                  value={targetAudience}
                  disabled={userRole !== 'Admin'}
                  onChange={(e) => setTargetAudience(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-white/10 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-indigo-500 transition-all disabled:opacity-50"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Brand Voice & AI Prompt Guidelines</label>
                <textarea
                  rows={4}
                  placeholder="Professional, direct, technical, avoids corporate jargon..."
                  value={brandVoice}
                  disabled={userRole !== 'Admin'}
                  onChange={(e) => setBrandVoice(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-white/10 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-indigo-500 transition-all resize-none disabled:opacity-50 font-normal leading-relaxed"
                />
              </div>

              {userRole === 'Admin' && (
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-indigo-600/20"
                >
                  Save Brand Guide
                </button>
              )}
            </form>
          </div>

          {/* Team Collaboration Panel */}
          <div className="bg-slate-900/60 border border-white/5 rounded-2xl p-5 shadow-xl space-y-4">
            <h3 className="text-sm font-bold text-white mb-2 flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-teal-500/10 border border-teal-500/20 text-teal-400">
                <Users className="w-4 h-4" />
              </div>
              Team Collaboration & Roles
            </h3>

            {/* Invite Form */}
            {userRole === 'Admin' && (
              <form onSubmit={handleInviteSubmit} className="grid grid-cols-1 sm:grid-cols-4 gap-3 bg-slate-950/40 p-4 border border-white/5 rounded-xl">
                <input
                  type="text"
                  required
                  placeholder="Invite Name"
                  value={inviteName}
                  onChange={(e) => setInviteName(e.target.value)}
                  className="px-3 py-1.5 rounded-lg bg-slate-950 border border-white/10 text-xs text-white"
                />
                <input
                  type="email"
                  required
                  placeholder="Invite Email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  className="px-3 py-1.5 rounded-lg bg-slate-950 border border-white/10 text-xs text-white"
                />
                <select
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value as any)}
                  className="px-3 py-1.5 rounded-lg bg-slate-950 border border-white/10 text-xs text-slate-300"
                >
                  <option value="Admin">Admin</option>
                  <option value="Editor">Editor</option>
                  <option value="Analyst">Analyst</option>
                </select>
                <button
                  type="submit"
                  className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-lg text-xs flex items-center justify-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Invite Member
                </button>
              </form>
            )}

            {/* Members List Table */}
            <div className="border border-white/5 rounded-xl overflow-hidden">
              <table className="w-full border-collapse text-left text-xs">
                <thead>
                  <tr className="bg-slate-950/40 border-b border-white/5 text-slate-400 font-bold">
                    <th className="p-3">Team Member</th>
                    <th className="p-3">Role</th>
                    <th className="p-3">Status</th>
                    {userRole === 'Admin' && <th className="p-3 text-right">Action</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.02]">
                  {teamLoading ? (
                    <tr>
                      <td colSpan={4} className="p-6 text-center text-slate-500">Loading team...</td>
                    </tr>
                  ) : team.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="p-6 text-center text-slate-500">No external team members.</td>
                    </tr>
                  ) : (
                    team.map((member) => (
                      <tr key={member.id} className="hover:bg-white/[0.01] text-slate-300 font-medium">
                        <td className="p-3 flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-full bg-slate-800 border border-white/5 flex items-center justify-center text-slate-300 text-[10px] font-extrabold uppercase">
                            {member.name.charAt(0)}
                          </div>
                          <div>
                            <p className="font-bold text-white">{member.name}</p>
                            <p className="text-[10px] text-slate-500 font-mono">{member.email}</p>
                          </div>
                        </td>
                        <td className="p-3">
                          <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                            member.role === 'Admin' ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20' :
                            member.role === 'Editor' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                            'bg-teal-500/10 text-teal-400 border border-teal-500/20'
                          }`}>
                            {member.role}
                          </span>
                        </td>
                        <td className="p-3">
                          <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider ${
                            member.status === 'active' ? 'text-emerald-400 bg-emerald-500/10' : 'text-slate-400 bg-slate-950'
                          }`}>
                            {member.status}
                          </span>
                        </td>
                        {userRole === 'Admin' && (
                          <td className="p-3 text-right">
                            {member.email !== 'philipinem7@gmail.com' && (
                              <button
                                onClick={() => handleRemoveTeamMember(member.id)}
                                className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 transition-all"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </td>
                        )}
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Hand: Subscriptions Pricing Panel (4 cols) */}
        <div className="xl:col-span-4 bg-slate-900/60 border border-white/5 rounded-2xl p-5 shadow-xl space-y-5">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-pink-500/10 border border-pink-500/20 text-pink-400">
              <CreditCard className="w-4 h-4" />
            </div>
            SaaS Subscription Tiers
          </h3>

          <div className="space-y-4">
            {/* Starter Plan */}
            <div className={`p-4 rounded-xl border flex flex-col justify-between ${
              subscription.tier === 'Starter' 
                ? 'bg-indigo-600/10 border-indigo-500 text-white shadow-lg' 
                : 'bg-slate-950 border-white/5 text-slate-400'
            }`}>
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-black text-white">Starter Plan</h4>
                  {subscription.tier === 'Starter' && <span className="text-[9px] font-extrabold px-1.5 py-0.5 bg-indigo-600 text-white rounded uppercase tracking-wider">Active</span>}
                </div>
                <p className="text-2xl font-black text-white tracking-tight">$49<span className="text-xs font-normal text-slate-500"> / mo</span></p>
                <p className="text-[10px] text-slate-500 leading-relaxed font-normal">Best for individual indie builders looking to scale public brands.</p>
              </div>
              <ul className="text-[10px] text-slate-400 space-y-1 my-3 text-left font-medium">
                <li className="flex items-center gap-1.5"><Check className="w-3 h-3 text-indigo-400" /> 100 AI Generations / mo</li>
                <li className="flex items-center gap-1.5"><Check className="w-3 h-3 text-indigo-400" /> 1 Linked Team Workspace</li>
              </ul>
              {subscription.tier !== 'Starter' && (
                <button
                  onClick={() => handleStripeCheckout('Starter')}
                  className="w-full py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-lg text-xs transition-all border border-white/5"
                >
                  Downgrade
                </button>
              )}
            </div>

            {/* Pro Plan */}
            <div className={`p-4 rounded-xl border flex flex-col justify-between relative overflow-hidden ${
              subscription.tier === 'Pro' 
                ? 'bg-indigo-600/10 border-indigo-500 text-white shadow-lg' 
                : 'bg-slate-950 border-white/5 text-slate-400 hover:border-indigo-500/20'
            }`}>
              <div className="absolute top-0 right-0 transform translate-x-8 translate-y-2 rotate-45 p-1 bg-gradient-to-r from-pink-500 to-purple-500 text-[8px] font-bold text-white uppercase px-6 tracking-wide">Popular</div>
              
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-black text-white">Professional Plan</h4>
                  {subscription.tier === 'Pro' && <span className="text-[9px] font-extrabold px-1.5 py-0.5 bg-indigo-600 text-white rounded uppercase tracking-wider">Active</span>}
                </div>
                <p className="text-2xl font-black text-white tracking-tight">$149<span className="text-xs font-normal text-slate-500"> / mo</span></p>
                <p className="text-[10px] text-slate-500 leading-relaxed font-normal">Great for scaling agencies requiring multi-collaborator queues.</p>
              </div>
              <ul className="text-[10px] text-slate-400 space-y-1 my-3 text-left font-medium">
                <li className="flex items-center gap-1.5"><Check className="w-3 h-3 text-indigo-400" /> 1,000 AI Generations / mo</li>
                <li className="flex items-center gap-1.5"><Check className="w-3 h-3 text-indigo-400" /> 3 Team Collaborators</li>
                <li className="flex items-center gap-1.5"><Check className="w-3 h-3 text-indigo-400" /> Advanced Strategic Reports</li>
              </ul>
              {subscription.tier !== 'Pro' && (
                <button
                  onClick={() => handleStripeCheckout('Pro')}
                  className="w-full py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-lg text-xs transition-all shadow-md shadow-indigo-600/10"
                >
                  Upgrade to Pro
                </button>
              )}
            </div>

            {/* Enterprise Plan */}
            <div className={`p-4 rounded-xl border flex flex-col justify-between ${
              subscription.tier === 'Enterprise' 
                ? 'bg-indigo-600/10 border-indigo-500 text-white shadow-lg' 
                : 'bg-slate-950 border-white/5 text-slate-400 hover:border-indigo-500/20'
            }`}>
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-black text-white">Enterprise Plan</h4>
                  {subscription.tier === 'Enterprise' && <span className="text-[9px] font-extrabold px-1.5 py-0.5 bg-indigo-600 text-white rounded uppercase tracking-wider">Active</span>}
                </div>
                <p className="text-2xl font-black text-white tracking-tight">$499<span className="text-xs font-normal text-slate-500"> / mo</span></p>
                <p className="text-[10px] text-slate-500 leading-relaxed font-normal">For corporate channels managing massive multi-workspace campaigns.</p>
              </div>
              <ul className="text-[10px] text-slate-400 space-y-1 my-3 text-left font-medium">
                <li className="flex items-center gap-1.5"><Check className="w-3 h-3 text-indigo-400" /> 5,000 AI Generations / mo</li>
                <li className="flex items-center gap-1.5"><Check className="w-3 h-3 text-indigo-400" /> Unlimited Workspaces & Teams</li>
                <li className="flex items-center gap-1.5"><Check className="w-3 h-3 text-indigo-400" /> Dedicated Gemini Image Model</li>
              </ul>
              {subscription.tier !== 'Enterprise' && (
                <button
                  onClick={() => handleStripeCheckout('Enterprise')}
                  className="w-full py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-lg text-xs transition-all shadow-md"
                >
                  Go Enterprise
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Stripe Mock Checkout Modal */}
      {showCheckout && selectedPlan && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-white/10 rounded-2xl w-full max-w-sm p-6 shadow-2xl relative text-left">
            <button 
              onClick={() => setShowCheckout(false)}
              className="absolute top-4 right-4 p-1 rounded-lg hover:bg-white/5 text-slate-400 hover:text-white transition-all"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 mb-4 border-b border-white/5 pb-3">
              <CreditCard className="w-5 h-5 text-indigo-400" />
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">Stripe Secure Checkout</h3>
            </div>

            <div className="mb-4 bg-slate-950 p-3 rounded-lg border border-white/5">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-slate-400">Upgrading to:</span>
                <span className="text-white font-bold">{selectedPlan} Plan</span>
              </div>
              <div className="flex justify-between text-xs mt-1.5 font-semibold">
                <span className="text-slate-400">Monthly Amount:</span>
                <span className="text-indigo-400 font-extrabold">{selectedPlan === 'Pro' ? '$149.00' : selectedPlan === 'Enterprise' ? '$499.00' : '$49.00'}</span>
              </div>
            </div>

            <form onSubmit={handleCompleteCheckout} className="space-y-4">
              <div>
                <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">Card Number</label>
                <input
                  type="text"
                  required
                  placeholder="4242 4242 4242 4242"
                  value={cardNo}
                  onChange={(e) => setCardNo(e.target.value.replace(/\s?/g, '').replace(/(\d{4})/g, '$1 ').trim())}
                  maxLength={19}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-white/10 text-xs text-white focus:outline-none placeholder-slate-600 font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">Expiration</label>
                  <input
                    type="text"
                    required
                    placeholder="MM / YY"
                    value={cardExpiry}
                    onChange={(e) => setCardExpiry(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-white/10 text-xs text-white focus:outline-none placeholder-slate-600"
                  />
                </div>
                <div>
                  <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">CVC Code</label>
                  <input
                    type="password"
                    required
                    placeholder="•••"
                    value={cardCvv}
                    onChange={(e) => setCardCvv(e.target.value)}
                    maxLength={3}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-white/10 text-xs text-white focus:outline-none placeholder-slate-600 font-mono"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={checkoutLoading}
                className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 text-white font-bold rounded-xl text-xs transition-all flex items-center justify-center gap-1.5"
              >
                {checkoutLoading ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <Sparkles className="w-4.5 h-4.5 text-indigo-200" />
                    Complete Secure Payment
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
