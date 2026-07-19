import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  Sparkles, 
  Calendar, 
  RefreshCw, 
  FileText, 
  CheckCircle, 
  Flame,
  ArrowUpRight,
  TrendingDown
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend,
  LineChart,
  Line
} from 'recharts';
import ReactMarkdown from 'react-markdown';
import { AnalyticsData, PlatformType, Subscription } from '../types';

interface AnalyticsViewProps {
  workspaceId: string;
  brandVoice: string;
  subscription: Subscription;
  onIncrementUsage: () => void;
}

export default function AnalyticsView({
  workspaceId,
  brandVoice,
  subscription,
  onIncrementUsage,
}: AnalyticsViewProps) {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [selectedPlatform, setSelectedPlatform] = useState<PlatformType>('linkedin');
  const [loading, setLoading] = useState(true);

  // AI Strategic Analyst States
  const [aiReport, setAiReport] = useState('');
  const [aiLoading, setAiLoading] = useState(false);

  // AI Campaign Planner States
  const [campaignPrompt, setCampaignPrompt] = useState('');
  const [campaignOutput, setCampaignOutput] = useState('');
  const [campaignLoading, setCampaignLoading] = useState(false);

  const [activeSegment, setActiveSegment] = useState<'analytics' | 'campaign'>('analytics');

  useEffect(() => {
    fetchAnalytics();
  }, [workspaceId]);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/workspaces/${workspaceId}/analytics`);
      const data = await res.json();
      if (res.ok) {
        setAnalytics(data);
        // Automatically select the first platform with metrics
        const platforms = Object.keys(data.metrics) as PlatformType[];
        if (platforms.length > 0) {
          setSelectedPlatform(platforms[0]);
        }
      }
    } catch (err) {
      console.error('Error fetching analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateReport = async () => {
    setAiLoading(true);
    setAiReport('');
    try {
      const res = await fetch(`/api/workspaces/${workspaceId}/ai/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      const data = await res.json();
      if (res.ok && data.analysis) {
        setAiReport(data.analysis);
        onIncrementUsage();
      } else {
        throw new Error(data.error);
      }
    } catch (err) {
      console.error('Error generating AI report:', err);
    } finally {
      setAiLoading(false);
    }
  };

  const handleGenerateCampaign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!campaignPrompt.trim()) return;

    setCampaignLoading(true);
    setCampaignOutput('');
    try {
      const res = await fetch(`/api/workspaces/${workspaceId}/ai/campaign`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: campaignPrompt })
      });
      const data = await res.json();
      if (res.ok && data.campaign) {
        setCampaignOutput(data.campaign);
        onIncrementUsage();
      } else {
        throw new Error(data.error);
      }
    } catch (err) {
      console.error('Error building campaign:', err);
    } finally {
      setCampaignLoading(false);
    }
  };

  // Process data for charts
  const getChartData = () => {
    if (!analytics || !analytics.metrics[selectedPlatform]) return [];
    return analytics.metrics[selectedPlatform] || [];
  };

  const chartData = getChartData();

  // Simple statistics
  const latestMetric = chartData.length > 0 ? chartData[chartData.length - 1] : null;
  const initialMetric = chartData.length > 0 ? chartData[0] : null;

  const totalImpressions = chartData.reduce((sum, item) => sum + item.impressions, 0);
  const totalLikes = chartData.reduce((sum, item) => sum + item.likes, 0);
  const totalClicks = chartData.reduce((sum, item) => sum + item.clicks, 0);
  const followerGrowth = latestMetric && initialMetric ? latestMetric.followers - initialMetric.followers : 0;

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-24 text-slate-400 space-y-3 font-sans">
        <RefreshCw className="w-8 h-8 text-indigo-500 animate-spin" />
        <p className="text-sm font-semibold">Consolodating enterprise social metrics...</p>
      </div>
    );
  }

  const connectedPlatforms = analytics ? (Object.keys(analytics.metrics) as PlatformType[]) : [];

  return (
    <div className="space-y-6 font-sans text-left pb-12">
      {/* Header Banner */}
      <div className="pb-2 border-b border-white/5 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-extrabold text-white tracking-tight">Analytics Summary</h2>
          <p className="text-xs text-slate-400 mt-0.5">Track growth profiles, generate strategic AI insights, and construct marketing campaigns.</p>
        </div>
        
        {/* Switch segment */}
        <div className="flex bg-slate-900 border border-white/5 rounded-xl p-1 text-xs font-semibold">
          <button
            onClick={() => setActiveSegment('analytics')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeSegment === 'analytics' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            Engagement Analytics
          </button>
          <button
            onClick={() => setActiveSegment('campaign')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeSegment === 'campaign' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            Campaign Planner
          </button>
        </div>
      </div>

      {activeSegment === 'analytics' ? (
        <div className="space-y-6">
          {/* Platform Switcher & Summary info */}
          <div className="flex items-center justify-between flex-wrap gap-4 bg-slate-900/60 p-4 border border-white/5 rounded-2xl">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mr-2">Target Channel:</span>
              <div className="flex items-center gap-1.5">
                {connectedPlatforms.map((plat) => (
                  <button
                    key={plat}
                    onClick={() => setSelectedPlatform(plat)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all border ${
                      selectedPlatform === plat
                        ? 'bg-indigo-600/10 border-indigo-500 text-white'
                        : 'bg-slate-950 border-white/5 text-slate-400 hover:border-white/10'
                    }`}
                  >
                    {plat}
                  </button>
                ))}
              </div>
            </div>

            <div className="text-xs text-slate-400">
              Database Sync: <span className="text-white font-semibold">30 Days Active History</span>
            </div>
          </div>

          {/* Core Analytics Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 bg-slate-900/40 border border-white/5 rounded-2xl space-y-1.5 text-left">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Gross Impressions</span>
              <p className="text-xl font-black text-white">{totalImpressions.toLocaleString()}</p>
              <div className="flex items-center gap-1 text-[10px] text-emerald-400 font-semibold">
                <TrendingUp className="w-3.5 h-3.5" />
                +14.5% vs prev period
              </div>
            </div>

            <div className="p-4 bg-slate-900/40 border border-white/5 rounded-2xl space-y-1.5 text-left">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Total Likes & Saves</span>
              <p className="text-xl font-black text-white">{totalLikes.toLocaleString()}</p>
              <div className="flex items-center gap-1 text-[10px] text-emerald-400 font-semibold">
                <TrendingUp className="w-3.5 h-3.5" />
                +18.2% vs prev period
              </div>
            </div>

            <div className="p-4 bg-slate-900/40 border border-white/5 rounded-2xl space-y-1.5 text-left">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Follower Gain</span>
              <p className="text-xl font-black text-white">+{followerGrowth.toLocaleString()}</p>
              <div className="flex items-center gap-1 text-[10px] text-emerald-400 font-semibold">
                <TrendingUp className="w-3.5 h-3.5" />
                +8.9% overall growth
              </div>
            </div>

            <div className="p-4 bg-slate-900/40 border border-white/5 rounded-2xl space-y-1.5 text-left">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Active Conversions (Clicks)</span>
              <p className="text-xl font-black text-white">{totalClicks.toLocaleString()}</p>
              <div className="flex items-center gap-1 text-[10px] text-rose-400 font-semibold">
                <TrendingDown className="w-3.5 h-3.5" />
                -1.2% click velocity
              </div>
            </div>
          </div>

          {/* Chart Panels Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            
            {/* Impressions Trend Chart (7 cols) */}
            <div className="lg:col-span-8 bg-slate-900/60 border border-white/5 p-5 rounded-2xl shadow-xl space-y-4">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="text-left">
                  <h3 className="text-sm font-bold text-white">Impressions Distribution</h3>
                  <p className="text-[11px] text-slate-400">Daily impression levels accumulated over the last 30 days.</p>
                </div>
              </div>

              <div className="h-64 w-full text-slate-400 text-xs">
                {chartData.length === 0 ? (
                  <div className="h-full flex items-center justify-center">No metrics available.</div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorImp" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2}/>
                          <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                      <XAxis dataKey="date" stroke="#475569" />
                      <YAxis stroke="#475569" />
                      <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: 'rgba(255,255,255,0.1)' }} />
                      <Area type="monotone" dataKey="impressions" stroke="#6366f1" strokeWidth={2} fillOpacity={1} fill="url(#colorImp)" />
                    </AreaChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>

            {/* Platform Engagement bar chart (4 cols) */}
            <div className="lg:col-span-4 bg-slate-900/60 border border-white/5 p-5 rounded-2xl shadow-xl space-y-4 flex flex-col justify-between">
              <div className="text-left">
                <h3 className="text-sm font-bold text-white">Engagement Breakdown</h3>
                <p className="text-[11px] text-slate-400">Direct comparison of likes vs active clicks.</p>
              </div>

              <div className="h-48 w-full">
                {chartData.length === 0 ? (
                  <div className="h-full flex items-center justify-center text-slate-500 text-xs">No metrics.</div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData.slice(-7)}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.02)" />
                      <XAxis dataKey="date" stroke="#475569" hide />
                      <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: 'rgba(255,255,255,0.1)' }} />
                      <Bar dataKey="likes" fill="#ec4899" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="clicks" fill="#06b6d4" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>

              <div className="border-t border-white/5 pt-3 flex items-center justify-between text-[11px] text-slate-400 font-semibold">
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded bg-pink-500" />
                  <span>Likes</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded bg-cyan-500" />
                  <span>Link Clicks</span>
                </div>
              </div>
            </div>
          </div>

          {/* Follower Cumulative Line Chart */}
          <div className="bg-slate-900/60 border border-white/5 p-5 rounded-2xl shadow-xl space-y-4">
            <div className="text-left">
              <h3 className="text-sm font-bold text-white">Audience Growth</h3>
              <p className="text-[11px] text-slate-400">Cumulative trajectory of follower counts over 30 days.</p>
            </div>

            <div className="h-52 w-full">
              {chartData.length === 0 ? (
                <div className="h-full flex items-center justify-center text-slate-500 text-xs">No metrics.</div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" />
                    <XAxis dataKey="date" stroke="#475569" />
                    <YAxis stroke="#475569" domain={['auto', 'auto']} />
                    <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: 'rgba(255,255,255,0.1)' }} />
                    <Line type="monotone" dataKey="followers" stroke="#10b981" strokeWidth={2.5} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* AI Strategic Advisory Analyst Panel */}
          <div className="p-5 bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950/40 border border-white/10 rounded-2xl relative overflow-hidden shadow-2xl">
            <div className="absolute top-0 right-0 transform translate-x-12 -translate-y-12 w-64 h-64 rounded-full bg-indigo-500/5 blur-[50px] pointer-events-none" />
            
            <div className="flex items-start justify-between mb-4 flex-wrap gap-2">
              <div className="text-left space-y-1">
                <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[10px] font-bold uppercase tracking-wider">
                  <Sparkles className="w-3 h-3 animate-pulse" />
                  Gemini AI Advisor
                </div>
                <h3 className="text-base font-extrabold text-white">Strategic Brand Performance Analysis</h3>
                <p className="text-xs text-slate-400">Trigger Gemini to evaluate 30-day analytics logs and formulate targeted actionable checklists.</p>
              </div>

              <button
                onClick={handleGenerateReport}
                disabled={aiLoading}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 text-white text-xs font-bold rounded-xl transition-all shadow-lg flex items-center gap-1.5 shrink-0"
              >
                {aiLoading ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <>
                    <FileText className="w-3.5 h-3.5" />
                    Compute Strategic Advisory
                  </>
                )}
              </button>
            </div>

            {/* AI Report Output */}
            {aiReport && (
              <div className="mt-4 p-5 rounded-xl bg-slate-950 border border-indigo-500/20 text-slate-200 text-xs font-normal overflow-y-auto max-h-[420px] shadow-inner text-left">
                <div className="markdown-body space-y-4 leading-relaxed font-sans select-text">
                  <ReactMarkdown>{aiReport}</ReactMarkdown>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Campaign Builder Segment */
        <div className="space-y-6">
          <div className="p-5 bg-slate-900/60 border border-white/5 rounded-2xl shadow-xl space-y-4">
            <div className="text-left space-y-1">
              <h3 className="text-base font-extrabold text-white">AI 3-Phase Campaign Planner</h3>
              <p className="text-xs text-slate-400">Type in a new launch idea or seasonal campaign. Gemini will map out structured Awareness, Engagement, and Conversion posts aligned to your brand voice guidelines.</p>
            </div>

            <form onSubmit={handleGenerateCampaign} className="flex gap-2.5">
              <input
                type="text"
                required
                placeholder="e.g. Next-Gen Server API security gateway rollout with rotative JWTs..."
                value={campaignPrompt}
                onChange={(e) => setCampaignPrompt(e.target.value)}
                className="flex-1 px-4 py-2.5 rounded-xl bg-slate-950 border border-white/10 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-indigo-500 transition-all"
              />
              <button
                type="submit"
                disabled={campaignLoading}
                className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-xs transition-all flex items-center gap-1.5 shadow-lg shrink-0"
              >
                {campaignLoading ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <>
                    <Flame className="w-3.5 h-3.5 text-amber-400" />
                    Build Campaign
                  </>
                )}
              </button>
            </form>
          </div>

          {campaignOutput && (
            <div className="p-6 bg-slate-900/40 border border-white/5 rounded-2xl shadow-xl text-left max-h-[600px] overflow-y-auto">
              <div className="markdown-body space-y-4 leading-relaxed font-sans text-xs text-slate-300">
                <ReactMarkdown>{campaignOutput}</ReactMarkdown>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
