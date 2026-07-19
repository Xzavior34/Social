import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  Hash, 
  RefreshCw, 
  Image as ImageIcon, 
  Calendar, 
  Send, 
  Smile, 
  CheckCircle, 
  AlertTriangle, 
  ChevronRight,
  User,
  Heart,
  MessageCircle,
  Share2,
  Bookmark,
  MoreHorizontal,
  Twitter,
  Linkedin,
  Facebook,
  Instagram,
  ThumbsUp,
  Globe,
  Check,
  Eye
} from 'lucide-react';
import { Post, SocialAccount, PlatformType, Subscription } from '../types';

interface ContentStudioViewProps {
  workspaceId: string;
  brandVoice: string;
  targetAudience: string;
  primaryTone: string;
  socialAccounts: SocialAccount[];
  subscription: Subscription;
  onPostCreated: (post: Omit<Post, 'id' | 'createdAt' | 'comments' | 'history'>) => void;
  onIncrementUsage: () => void;
  initialPrompt?: string;
}

const REASSURING_QUOTES = [
  "Gemini is building your brand-tailored illustrations...",
  "Formatting pixels to maximize engagement CTR...",
  "Aligning composition with corporate design paradigms...",
  "Creating high-converting visual alignments for your feed...",
  "Baking deep vector digital art..."
];

export default function ContentStudioView({
  workspaceId,
  brandVoice,
  targetAudience,
  primaryTone,
  socialAccounts,
  subscription,
  onPostCreated,
  onIncrementUsage,
  initialPrompt = '',
}: ContentStudioViewProps) {
  const [content, setContent] = useState('');
  const [platforms, setPlatforms] = useState<PlatformType[]>([]);
  const [tone, setTone] = useState(primaryTone || 'Professional');
  
  // AI Prompt Tool States
  const [ideaPrompt, setIdeaPrompt] = useState(initialPrompt);
  const [aiLoading, setAiLoading] = useState(false);
  const [hashtagLoading, setHashtagLoading] = useState(false);
  const [rewriteLoading, setRewriteLoading] = useState(false);

  // AI Image Studio States
  const [imagePrompt, setImagePrompt] = useState('');
  const [aspectRatio, setAspectRatio] = useState<'1:1' | '3:4' | '4:3' | '9:16' | '16:9'>('1:1');
  const [imageLoading, setImageLoading] = useState(false);
  const [generatedImg, setGeneratedImg] = useState('');
  const [quoteIdx, setQuoteIdx] = useState(0);

  // Scheduling States
  const [publishMode, setPublishMode] = useState<'immediate' | 'schedule' | 'draft'>('draft');
  const [scheduledDate, setScheduledDate] = useState('');
  const [scheduledTime, setScheduledTime] = useState('');

  // Status Alerts
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Live Feed Simulator States
  const [previewPlatform, setPreviewPlatform] = useState<PlatformType>('linkedin');
  const [userLikes, setUserLikes] = useState<Record<PlatformType, boolean>>({
    linkedin: false,
    twitter: false,
    instagram: false,
    facebook: false
  });
  const [likesOffset, setLikesOffset] = useState<Record<PlatformType, number>>({
    linkedin: 0,
    twitter: 0,
    instagram: 0,
    facebook: 0
  });
  const [userBookmarks, setUserBookmarks] = useState<Record<PlatformType, boolean>>({
    linkedin: false,
    twitter: false,
    instagram: false,
    facebook: false
  });
  const [simulatedComments, setSimulatedComments] = useState<Record<PlatformType, { id: string; author: string; text: string; avatar: string; time: string }[]>>({
    linkedin: [
      { id: 'l1', author: 'Sarah Jenkins', text: 'This matches perfectly with our product goals! Outstanding branding insights.', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&fit=crop&q=80', time: '10m' },
      { id: 'l2', author: 'Marcus Vance', text: 'Spot-on delivery, Philip! Shared with my team.', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&fit=crop&q=80', time: '2m' }
    ],
    twitter: [
      { id: 't1', author: 'Dev_Alex 💻', text: '💯 Exactly this. Direct to the point, saving for the sprint!', avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&fit=crop&q=80', time: '4m' }
    ],
    instagram: [
      { id: 'i1', author: 'creative_pixel', text: 'This visual is insane! What was the render tool? 🔥', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&fit=crop&q=80', time: '15m' }
    ],
    facebook: [
      { id: 'f1', author: 'Michael Brown', text: 'Awesome write-up Philip! Keep sharing these insights.', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&fit=crop&q=80', time: '1h' }
    ]
  });
  const [newCommentInput, setNewCommentInput] = useState('');
  const [showCommentsSection, setShowCommentsSection] = useState(false);
  const [copierState, setCopierState] = useState(false);
  const [linkedinCollapsed, setLinkedinCollapsed] = useState(true);
  const [instaFilter, setInstaFilter] = useState<'normal' | 'vintage' | 'mono' | 'emerald' | 'cyberpunk'>('normal');

  useEffect(() => {
    if (initialPrompt) {
      setIdeaPrompt(initialPrompt);
    }
  }, [initialPrompt]);

  // Rotate quotes during image generation
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (imageLoading) {
      timer = setInterval(() => {
        setQuoteIdx((prev) => (prev + 1) % REASSURING_QUOTES.length);
      }, 3000);
    }
    return () => clearInterval(timer);
  }, [imageLoading]);

  // Quick select first linked platform if empty on load
  useEffect(() => {
    if (platforms.length === 0 && socialAccounts.length > 0) {
      setPlatforms([socialAccounts[0].platform]);
    }
  }, [socialAccounts]);

  // Character limit rules
  const isOverTwitterLimit = content.length > 280;

  // --- API CALL HANDLERS ---

  const handleGenerateCaption = async () => {
    if (!ideaPrompt.trim()) {
      setErrorMsg("Please write an idea in the AI Studio prompt first.");
      return;
    }
    if (platforms.length === 0) {
      setErrorMsg("Please select at least one social platform to tailor the post formatting.");
      return;
    }

    setAiLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const targetPlatform = platforms[0];
      const res = await fetch(`/api/workspaces/${workspaceId}/ai/caption`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: ideaPrompt,
          platform: targetPlatform,
          tone,
          brandVoice,
          targetAudience
        })
      });

      const data = await res.json();
      if (res.ok && data.caption) {
        setContent(data.caption);
        onIncrementUsage();
        setSuccessMsg(`Successfully generated and tailored post for ${targetPlatform}!`);
      } else {
        throw new Error(data.error || 'Failed to generate');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Gemini API call failed. Check secrets configuration.');
    } finally {
      setAiLoading(false);
    }
  };

  const handleGenerateHashtags = async () => {
    if (!content.trim()) {
      setErrorMsg("Write some content first before generating hashtags.");
      return;
    }

    setHashtagLoading(true);
    setErrorMsg('');
    
    try {
      const res = await fetch(`/api/workspaces/${workspaceId}/ai/hashtags`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ caption: content, count: 4 })
      });
      const data = await res.json();
      if (res.ok && data.hashtags) {
        setContent(prev => `${prev}\n\n${data.hashtags}`);
        onIncrementUsage();
        setSuccessMsg("Hashtags appended successfully!");
      } else {
        throw new Error(data.error);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Hashtag generation failed.');
    } finally {
      setHashtagLoading(false);
    }
  };

  const handleRewrite = async (option: string) => {
    if (!content.trim()) {
      setErrorMsg("No content in the editor to rewrite.");
      return;
    }

    setRewriteLoading(true);
    setErrorMsg('');

    try {
      const res = await fetch(`/api/workspaces/${workspaceId}/ai/rewrite`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content, option })
      });
      const data = await res.json();
      if (res.ok && data.rewritten) {
        setContent(data.rewritten);
        onIncrementUsage();
        setSuccessMsg(`Rewritten for style: ${option}!`);
      } else {
        throw new Error(data.error);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Rewrite Studio request failed.');
    } finally {
      setRewriteLoading(false);
    }
  };

  const handleGenerateImage = async () => {
    if (!imagePrompt.trim()) {
      setErrorMsg("Provide a prompt describing the graphic you want to generate.");
      return;
    }

    setImageLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const res = await fetch(`/api/workspaces/${workspaceId}/ai/image`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: imagePrompt, aspectRatio })
      });
      const data = await res.json();
      if (res.ok && data.imageUrl) {
        setGeneratedImg(data.imageUrl);
        onIncrementUsage();
        setSuccessMsg("AI Graphic asset generated successfully! Apply it to your post below.");
      } else {
        throw new Error(data.error);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Image Generation failed. Check environment variables.');
    } finally {
      setImageLoading(false);
    }
  };

  // --- SUBMIT FORM HANDLER ---

  const handleCreatePostSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) {
      setErrorMsg("Post content cannot be empty.");
      return;
    }
    if (platforms.length === 0) {
      setErrorMsg("Select at least one social media platform.");
      return;
    }

    let statusVal: 'draft' | 'scheduled' | 'published' = 'draft';
    let scheduledForStr = '';

    if (publishMode === 'immediate') {
      statusVal = 'published';
    } else if (publishMode === 'schedule') {
      if (!scheduledDate || !scheduledTime) {
        setErrorMsg("Please provide both Date and Time for scheduling.");
        return;
      }
      statusVal = 'scheduled';
      scheduledForStr = new Date(`${scheduledDate}T${scheduledTime}`).toISOString();
    }

    onPostCreated({
      workspaceId,
      content,
      platforms,
      mediaUrl: generatedImg || undefined,
      status: statusVal,
      scheduledFor: scheduledForStr || undefined,
      publishedAt: statusVal === 'published' ? new Date().toISOString() : undefined,
      creatorId: 'usr-1',
      creatorName: 'Philip Inem',
    });

    // Clear form
    setContent('');
    setGeneratedImg('');
    setImagePrompt('');
    setIdeaPrompt('');
    setSuccessMsg(`Successfully saved post as ${statusVal}!`);
  };

  // Setup default accounts context for live mock rendering
  const activeSocialAccount = socialAccounts[0] || {
    name: 'Philip Inem',
    handle: 'philip_builds',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    followers: 2450
  };

  const triggerCopySimulation = () => {
    setCopierState(true);
    setTimeout(() => {
      setCopierState(false);
    }, 2000);
  };

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCommentInput.trim()) return;
    const newComment = {
      id: Math.random().toString(),
      author: activeSocialAccount.name,
      text: newCommentInput.trim(),
      avatar: activeSocialAccount.avatar,
      time: 'Just now'
    };
    setSimulatedComments(prev => ({
      ...prev,
      [previewPlatform]: [...prev[previewPlatform], newComment]
    }));
    setNewCommentInput('');
  };

  const toggleLike = (platform: PlatformType) => {
    const wasLiked = userLikes[platform];
    setUserLikes(prev => ({
      ...prev,
      [platform]: !wasLiked
    }));
    setLikesOffset(prev => ({
      ...prev,
      [platform]: prev[platform] + (wasLiked ? -1 : 1)
    }));
  };

  const toggleBookmark = (platform: PlatformType) => {
    setUserBookmarks(prev => ({
      ...prev,
      [platform]: !prev[platform]
    }));
  };

  return (
    <div className="space-y-6 font-sans text-left pb-12">
      {/* Header Banner */}
      <div className="pb-2 border-b border-white/5 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-extrabold text-white tracking-tight">AI Content Studio</h2>
          <p className="text-xs text-slate-400 mt-0.5">Author posts, generate captions and trending tags, and craft AI illustrations.</p>
        </div>
        <div className="flex items-center gap-2">
          {isOverTwitterLimit && platforms.includes('twitter') && (
            <div className="text-[10px] bg-rose-500/10 border border-rose-500/20 text-rose-400 px-2.5 py-1 rounded-lg font-bold flex items-center gap-1.5 animate-pulse">
              <AlertTriangle className="w-3.5 h-3.5" />
              Twitter limit exceeded! (280 chars)
            </div>
          )}
        </div>
      </div>

      {/* Main Layout Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        
        {/* Left Side: Composer and Generators (7 cols) */}
        <div className="xl:col-span-7 space-y-5">
          
          {/* Active Brand voice banner */}
          <div className="p-3 bg-slate-900/60 border border-white/5 rounded-2xl flex items-start gap-3">
            <div className="p-2 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 shrink-0 mt-0.5">
              <Sparkles className="w-4 h-4" />
            </div>
            <div className="text-xs">
              <h4 className="font-extrabold text-white">Active Brand Voice Guidelines</h4>
              <p className="text-slate-400 mt-0.5 line-clamp-2 leading-relaxed italic">
                "{brandVoice || 'Default generic marketing tone'}"
              </p>
            </div>
          </div>

          {/* Prompt Assistant */}
          <div className="p-4 bg-slate-900/40 border border-white/5 rounded-2xl space-y-3 shadow-xl">
            <h3 className="text-xs font-extrabold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              AI Prompt Assistant
            </h3>
            
            <div className="flex gap-2.5">
              <input
                type="text"
                placeholder="Describe your post concept here..."
                value={ideaPrompt}
                onChange={(e) => setIdeaPrompt(e.target.value)}
                className="flex-1 px-3.5 py-2 rounded-xl bg-slate-950 border border-white/10 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-indigo-500 transition-all"
              />
              <button
                type="button"
                onClick={handleGenerateCaption}
                disabled={aiLoading}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 text-white font-semibold rounded-xl text-xs transition-all flex items-center gap-1.5 shadow-lg shrink-0"
              >
                {aiLoading ? (
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5" />
                    Write Post
                  </>
                )}
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-1">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Tone Profile</label>
                <select
                  value={tone}
                  onChange={(e) => setTone(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-lg bg-slate-950 border border-white/5 text-xs text-slate-300 focus:outline-none focus:border-indigo-500"
                >
                  <option value="Professional">Professional</option>
                  <option value="Thoughtful">Thoughtful</option>
                  <option value="Sarcastic">Sarcastic</option>
                  <option value="Humorous">Humorous</option>
                  <option value="Inspirational">Inspirational</option>
                  <option value="Direct & Urgent">Direct & Urgent</option>
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Target Audience</label>
                <div className="w-full px-2.5 py-1.5 rounded-lg bg-slate-950/40 border border-white/5 text-xs text-slate-400 truncate">
                  {targetAudience || 'Indie builders, architects'}
                </div>
              </div>
            </div>
          </div>

          {/* Form Composer */}
          <form onSubmit={handleCreatePostSubmit} className="space-y-4 bg-slate-900/60 border border-white/5 rounded-2xl p-5 shadow-xl relative">
            
            {/* Status alerts */}
            {successMsg && (
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs flex items-center gap-2">
                <CheckCircle className="w-4 h-4 shrink-0" />
                {successMsg}
              </div>
            )}
            {errorMsg && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                {errorMsg}
              </div>
            )}

            {/* Platform select checkboxes */}
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Publish Destinations</label>
              <div className="flex items-center gap-2 flex-wrap">
                {['linkedin', 'twitter', 'instagram', 'facebook'].map((platform) => {
                  const active = platforms.includes(platform as PlatformType);
                  return (
                    <button
                      type="button"
                      key={platform}
                      onClick={() => {
                        if (active) {
                          setPlatforms(platforms.filter(p => p !== platform));
                        } else {
                          setPlatforms([...platforms, platform as PlatformType]);
                        }
                      }}
                      className={`px-3 py-1.5 rounded-xl border text-xs font-semibold uppercase tracking-wider transition-all flex items-center gap-1.5 ${
                        active 
                          ? 'bg-indigo-600/10 border-indigo-500 text-white' 
                          : 'bg-slate-950 border-white/5 text-slate-400 hover:border-white/10'
                      }`}
                    >
                      <input 
                        type="checkbox" 
                        checked={active}
                        readOnly
                        className="rounded border-slate-700 text-indigo-600 focus:ring-0 w-3 h-3"
                      />
                      {platform}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Core Textarea */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">Content Caption</label>
                <span className={`text-[10px] font-semibold ${isOverTwitterLimit && platforms.includes('twitter') ? 'text-rose-400' : 'text-slate-500'}`}>
                  {content.length} characters
                </span>
              </div>
              <textarea
                rows={6}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Draft or write social copy..."
                className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-white/10 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-indigo-500 transition-all resize-none font-normal leading-relaxed"
              />
            </div>

            {/* Inline AI editing buttons */}
            <div className="flex items-center gap-2 flex-wrap pt-1 border-t border-white/[0.04]">
              <button
                type="button"
                onClick={handleGenerateHashtags}
                disabled={hashtagLoading}
                className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-medium flex items-center gap-1 transition-all"
              >
                {hashtagLoading ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Hash className="w-3 h-3 text-indigo-400" />}
                Add AI Tags
              </button>

              <button
                type="button"
                onClick={() => handleRewrite('make it punchier')}
                disabled={rewriteLoading}
                className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-medium flex items-center gap-1 transition-all"
              >
                💥 Make Punchier
              </button>

              <button
                type="button"
                onClick={() => handleRewrite('humorous twist')}
                disabled={rewriteLoading}
                className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-medium flex items-center gap-1 transition-all"
              >
                🎭 Add Humor
              </button>

              <button
                type="button"
                onClick={() => handleRewrite('threads-style breakdown')}
                disabled={rewriteLoading}
                className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-medium flex items-center gap-1 transition-all"
              >
                🧵 Thread breakdown
              </button>
            </div>

            {/* Applied AI Graphic display */}
            {generatedImg && (
              <div className="relative rounded-xl border border-white/5 bg-slate-950/60 p-2.5 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <img src={generatedImg} alt="AI graphic" className="w-12 h-12 object-cover rounded-lg border border-white/10" />
                  <div>
                    <h5 className="text-xs font-bold text-white">AI Graphic Attached</h5>
                    <p className="text-[10px] text-slate-500">Source: gemini-3.1-flash-lite-image</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setGeneratedImg('')}
                  className="text-[10px] text-rose-400 hover:underline font-bold"
                >
                  Remove Asset
                </button>
              </div>
            )}

            {/* Scheduler Settings Drawer */}
            <div className="p-4 rounded-xl bg-slate-950/40 border border-white/5 space-y-4">
              <div className="flex items-center gap-3 flex-wrap">
                {['draft', 'immediate', 'schedule'].map((mode) => (
                  <button
                    type="button"
                    key={mode}
                    onClick={() => setPublishMode(mode as any)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all ${
                      publishMode === mode 
                        ? 'bg-indigo-600 text-white' 
                        : 'bg-slate-900 border border-white/5 text-slate-400 hover:text-white'
                    }`}
                  >
                    {mode === 'immediate' ? 'Publish Instantly' : mode === 'schedule' ? 'Schedule Date' : 'Save As Draft'}
                  </button>
                ))}
              </div>

              {publishMode === 'schedule' && (
                <div className="grid grid-cols-2 gap-3 pt-2">
                  <div>
                    <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-1">Target Date</label>
                    <input
                      type="date"
                      value={scheduledDate}
                      onChange={(e) => setScheduledDate(e.target.value)}
                      className="w-full px-3 py-1.5 rounded-lg bg-slate-950 border border-white/10 text-xs text-white focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-1">Target Time</label>
                    <input
                      type="time"
                      value={scheduledTime}
                      onChange={(e) => setScheduledTime(e.target.value)}
                      className="w-full px-3 py-1.5 rounded-lg bg-slate-950 border border-white/10 text-xs text-white focus:outline-none"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Final Action Button */}
            <button
              type="submit"
              className="w-full py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-bold rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 uppercase tracking-wider"
            >
              {publishMode === 'immediate' ? (
                <>
                  <Send className="w-3.5 h-3.5" />
                  Publish To Selected Channels
                </>
              ) : publishMode === 'schedule' ? (
                <>
                  <Calendar className="w-3.5 h-3.5" />
                  Set Publication Queue
                </>
              ) : (
                'Save Campaign Draft'
              )}
            </button>
          </form>
        </div>

        {/* Right Side: Mock previews & Gemini Image Creator (5 cols) */}
        <div className="xl:col-span-5 space-y-5">
          
          {/* Gemini Image Studio */}
          <div className="p-5 bg-slate-900/60 backdrop-blur-xl border border-white/5 rounded-2xl shadow-xl space-y-4">
            <h3 className="text-xs font-extrabold text-white uppercase tracking-wider flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-pink-500/10 border border-pink-500/20 text-pink-400">
                <ImageIcon className="w-4 h-4" />
              </div>
              Gemini Image Studio
            </h3>

            <div className="space-y-3">
              <textarea
                rows={2}
                placeholder="Art prompt: A neon render of a modular server database scalable framework, 4k digital art..."
                value={imagePrompt}
                onChange={(e) => setImagePrompt(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-white/10 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-indigo-500 transition-all resize-none"
              />

              <div className="grid grid-cols-2 gap-3 items-center">
                <div>
                  <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-1">Canvas Ratio</label>
                  <select
                    value={aspectRatio}
                    onChange={(e) => setAspectRatio(e.target.value as any)}
                    className="w-full px-2.5 py-1.5 rounded-lg bg-slate-950 border border-white/5 text-xs text-slate-300 focus:outline-none"
                  >
                    <option value="1:1">Square (1:1)</option>
                    <option value="4:3">Landscape (4:3)</option>
                    <option value="16:9">Wide (16:9)</option>
                    <option value="3:4">Portrait (3:4)</option>
                    <option value="9:16">Story (9:16)</option>
                  </select>
                </div>

                <button
                  type="button"
                  onClick={handleGenerateImage}
                  disabled={imageLoading}
                  className="w-full py-2 bg-pink-600 hover:bg-pink-500 text-white font-bold rounded-xl text-xs transition-all flex items-center justify-center gap-1.5 shadow-lg shadow-pink-600/20 self-end"
                >
                  {imageLoading ? (
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5" />
                      Generate Asset
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Image Loading State */}
            {imageLoading && (
              <div className="p-8 border border-white/5 bg-slate-950/60 rounded-xl text-center space-y-3">
                <div className="w-10 h-10 border-2 border-pink-500 border-t-transparent rounded-full animate-spin mx-auto" />
                <p className="text-xs text-pink-400 font-extrabold animate-pulse">{REASSURING_QUOTES[quoteIdx]}</p>
                <p className="text-[10px] text-slate-500">Using gemini-3.1-flash-lite-image model</p>
              </div>
            )}

            {/* Image Preview Box */}
            {generatedImg && !imageLoading && (
              <div className="relative rounded-xl border border-white/10 overflow-hidden bg-slate-950 flex flex-col">
                <img src={generatedImg} alt="AI output" className="w-full object-contain max-h-56" />
                <div className="p-2 border-t border-white/5 bg-slate-900/60 text-center">
                  <span className="text-[10px] text-slate-400">Ready to Publish</span>
                </div>
              </div>
            )}
          </div>

          {/* Social Feed Preview Tabs */}
          <div className="p-5 bg-slate-900/60 backdrop-blur-xl border border-white/5 rounded-2xl shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-white/5 pb-2.5">
              <div>
                <h3 className="text-xs font-extrabold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Eye className="w-3.5 h-3.5 text-indigo-400" />
                  Real-time Feed Simulator
                </h3>
                <p className="text-[10px] text-slate-500 mt-0.5">Interactive sandbox • Click metrics & actions to simulate engagement</p>
              </div>
              {copierState && (
                <span className="text-[9px] bg-emerald-500/15 border border-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-md font-bold animate-pulse">
                  ✓ Link Copied
                </span>
              )}
            </div>

            {/* Premium Tab Bar Selector */}
            <div className="grid grid-cols-4 gap-1 p-1 bg-slate-950/80 rounded-xl border border-white/5">
              {[
                { id: 'linkedin', label: 'LinkedIn', icon: Linkedin, color: 'text-sky-400', activeBg: 'bg-sky-500/10 border-sky-500/20' },
                { id: 'twitter', label: 'Twitter/X', icon: Twitter, color: 'text-slate-300', activeBg: 'bg-slate-300/10 border-slate-300/20' },
                { id: 'instagram', label: 'Instagram', icon: Instagram, color: 'text-pink-400', activeBg: 'bg-pink-500/10 border-pink-500/20' },
                { id: 'facebook', label: 'Facebook', icon: Facebook, color: 'text-blue-400', activeBg: 'bg-blue-500/10 border-blue-500/20' }
              ].map((tab) => {
                const isActive = previewPlatform === tab.id;
                const isSelectedForPosting = platforms.includes(tab.id as PlatformType);
                const Icon = tab.icon;

                return (
                  <button
                    type="button"
                    key={tab.id}
                    onClick={() => {
                      setPreviewPlatform(tab.id as PlatformType);
                      setShowCommentsSection(false); // reset comments view on tab swap
                    }}
                    className={`relative py-2 px-1 rounded-lg text-[10px] font-bold flex flex-col items-center justify-center gap-1 transition-all border ${
                      isActive 
                        ? `${tab.activeBg} ${tab.color} border-white/10 shadow-sm` 
                        : 'border-transparent text-slate-500 hover:text-slate-300 hover:bg-white/[0.02]'
                    }`}
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    <span>{tab.label}</span>

                    {/* Small badge if this platform is selected as a destination */}
                    {isSelectedForPosting && (
                      <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-emerald-500 rounded-full shadow-lg shadow-emerald-500/50" title="Selected to publish" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* ACTIVE PLATFORM PREVIEW CARD */}
            <div className="transition-all duration-300">
              
              {/* --- LINKEDIN PREVIEW CARD --- */}
              {previewPlatform === 'linkedin' && (
                <div className="border border-white/5 bg-slate-950 rounded-xl p-4 text-left space-y-3.5 shadow-md relative">
                  {/* Status header */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <img src={activeSocialAccount.avatar} alt="Avatar" className="w-10 h-10 rounded-full border border-white/10 object-cover" />
                      <div>
                        <h4 className="text-xs font-extrabold text-white flex items-center gap-1">
                          {activeSocialAccount.name}
                          <span className="text-[9px] font-bold text-slate-500 bg-slate-900 px-1 py-0.5 rounded">1st</span>
                        </h4>
                        <p className="text-[9px] text-slate-400 leading-none">CTO & Founder • SocioAI Brand Platform</p>
                        <div className="flex items-center gap-1 text-[8px] text-slate-500 mt-0.5">
                          <span>1h • Edited •</span>
                          <Globe className="w-2.5 h-2.5" />
                        </div>
                      </div>
                    </div>
                    <MoreHorizontal className="w-4 h-4 text-slate-400 hover:text-white cursor-pointer" />
                  </div>

                  {/* Body Text */}
                  <div className="text-xs text-slate-200 leading-relaxed whitespace-pre-wrap font-normal">
                    {(() => {
                      const text = content || 'Your draft caption will render here dynamically... Provide some thoughts in the editor!';
                      if (linkedinCollapsed && text.length > 150) {
                        return (
                          <>
                            {text.slice(0, 150)}...
                            <button
                              type="button"
                              onClick={() => setLinkedinCollapsed(false)}
                              className="text-[10px] font-bold text-indigo-400 hover:underline ml-1 cursor-pointer inline-block"
                            >
                              see more
                            </button>
                          </>
                        );
                      }
                      return (
                        <>
                          {text}
                          {text.length > 150 && (
                            <button
                              type="button"
                              onClick={() => setLinkedinCollapsed(true)}
                              className="text-[10px] font-bold text-indigo-400 hover:underline ml-1.5 cursor-pointer inline-block"
                            >
                              see less
                            </button>
                          )}
                        </>
                      );
                    })()}
                  </div>

                  {/* Visual Attachment */}
                  {generatedImg ? (
                    <div className="border border-white/10 rounded-lg overflow-hidden bg-slate-900">
                      <img src={generatedImg} alt="visual attachment" className="w-full object-cover max-h-60" />
                    </div>
                  ) : (
                    <div className="border border-dashed border-white/5 rounded-xl py-6 px-4 text-center bg-slate-900/30 text-slate-500 space-y-1">
                      <ImageIcon className="w-6 h-6 mx-auto opacity-30" />
                      <p className="text-[10px]">No visual attachment in editor</p>
                    </div>
                  )}

                  {/* Engagement Counters */}
                  <div className="flex items-center justify-between text-[9px] text-slate-400 border-b border-white/5 pb-2">
                    <div className="flex items-center gap-1">
                      <div className="flex -space-x-1">
                        <span className="w-4.5 h-4.5 bg-blue-600 rounded-full flex items-center justify-center border border-slate-950 text-[8px] text-white">👍</span>
                        <span className="w-4.5 h-4.5 bg-red-500 rounded-full flex items-center justify-center border border-slate-950 text-[8px] text-white">❤️</span>
                        <span className="w-4.5 h-4.5 bg-yellow-500 rounded-full flex items-center justify-center border border-slate-950 text-[8px] text-white">💡</span>
                      </div>
                      <span>{42 + (likesOffset.linkedin)} • {simulatedComments.linkedin.length} comments</span>
                    </div>
                    <div className="hover:underline cursor-pointer">8 shares</div>
                  </div>

                  {/* Social Actions */}
                  <div className="pt-1 flex items-center justify-around text-slate-400 text-[10px] font-bold">
                    <button 
                      type="button" 
                      onClick={() => toggleLike('linkedin')}
                      className={`flex items-center gap-1.5 py-1 px-2 rounded-lg hover:bg-white/5 transition-all cursor-pointer ${userLikes.linkedin ? 'text-blue-400' : 'text-slate-400'}`}
                    >
                      <ThumbsUp className={`w-3.5 h-3.5 ${userLikes.linkedin ? 'fill-blue-500/20' : ''}`} /> 
                      <span>{userLikes.linkedin ? 'Liked' : 'Like'}</span>
                    </button>
                    <button 
                      type="button" 
                      onClick={() => setShowCommentsSection(!showCommentsSection)}
                      className={`flex items-center gap-1.5 py-1 px-2 rounded-lg hover:bg-white/5 transition-all cursor-pointer ${showCommentsSection ? 'text-indigo-400 bg-white/5' : ''}`}
                    >
                      <MessageCircle className="w-3.5 h-3.5" /> 
                      <span>Comment</span>
                    </button>
                    <button 
                      type="button" 
                      onClick={triggerCopySimulation}
                      className="flex items-center gap-1.5 py-1 px-2 rounded-lg hover:bg-white/5 transition-all cursor-pointer"
                    >
                      <Share2 className="w-3.5 h-3.5" /> 
                      <span>Share</span>
                    </button>
                    <button 
                      type="button" 
                      onClick={() => toggleBookmark('linkedin')}
                      className={`flex items-center gap-1.5 py-1 px-2 rounded-lg hover:bg-white/5 transition-all cursor-pointer ${userBookmarks.linkedin ? 'text-yellow-400' : ''}`}
                    >
                      <Bookmark className={`w-3.5 h-3.5 ${userBookmarks.linkedin ? 'fill-yellow-400' : ''}`} /> 
                      <span>{userBookmarks.linkedin ? 'Saved' : 'Save'}</span>
                    </button>
                  </div>
                </div>
              )}

              {/* --- TWITTER/X PREVIEW CARD --- */}
              {previewPlatform === 'twitter' && (
                <div className="border border-white/5 bg-slate-950 rounded-xl p-4 text-left space-y-3.5 shadow-md">
                  {/* Twitter/X Header */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <img src={activeSocialAccount.avatar} alt="Avatar" className="w-9 h-9 rounded-full object-cover border border-white/5" />
                      <div>
                        <h4 className="text-xs font-extrabold text-white flex items-center gap-1 leading-none">
                          {activeSocialAccount.name}
                          <span className="w-3.5 h-3.5 bg-sky-500 text-white rounded-full flex items-center justify-center text-[7px] font-extrabold">✓</span>
                        </h4>
                        <p className="text-[9px] text-slate-500 mt-0.5">@{activeSocialAccount.handle}</p>
                      </div>
                    </div>
                    {/* Retro / minimalist X logo representation */}
                    <div className="text-xs font-black font-mono text-slate-500 select-none bg-slate-900 px-2 py-1 rounded-md">𝕏</div>
                  </div>

                  {/* Body Text (with character highlight if over limit) */}
                  <div className="text-xs leading-relaxed font-normal">
                    {content.length === 0 ? (
                      <span className="text-slate-500 italic">Drafting a tweet... Write something in the caption editor!</span>
                    ) : content.length <= 280 ? (
                      <span className="text-slate-100 whitespace-pre-wrap">{content}</span>
                    ) : (
                      <div className="whitespace-pre-wrap">
                        <span className="text-slate-100">{content.slice(0, 280)}</span>
                        <span className="bg-rose-500/30 text-rose-300 border border-rose-500/40 rounded px-0.5" title="Exceeds basic Twitter limit of 280 characters">
                          {content.slice(280)}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Dynamic Twitter Specific Warning & Character Count Dial */}
                  <div className="p-2.5 bg-slate-900/50 rounded-lg border border-white/5 flex items-center justify-between gap-3 text-[10px]">
                    <div className="flex items-center gap-2 text-slate-400">
                      <div className="relative w-6 h-6 flex items-center justify-center">
                        {/* Circle background */}
                        <svg className="absolute w-full h-full rotate-270 transform">
                          <circle cx="12" cy="12" r="9" stroke="rgba(255,255,255,0.05)" strokeWidth="2.5" fill="none" />
                          <circle 
                            cx="12" 
                            cy="12" 
                            r="9" 
                            stroke={content.length > 280 ? "#f43f5e" : content.length > 250 ? "#f97316" : "#6366f1"} 
                            strokeWidth="2.5" 
                            fill="none" 
                            strokeDasharray={2 * Math.PI * 9}
                            strokeDashoffset={2 * Math.PI * 9 * (1 - Math.min(content.length, 280) / 280)}
                          />
                        </svg>
                        <span className={`text-[8px] font-bold ${content.length > 280 ? 'text-rose-400' : 'text-slate-400'}`}>
                          {280 - content.length}
                        </span>
                      </div>
                      <div>
                        <span className="font-bold text-slate-300">X Character Rule</span>
                        <p className="text-[8px] text-slate-500">280 character limit for regular accounts</p>
                      </div>
                    </div>

                    {content.length > 280 ? (
                      <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 font-extrabold px-2 py-0.5 rounded text-[8px] animate-pulse">
                        TRUNCATED/SPLIT
                      </div>
                    ) : (
                      <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-extrabold px-2 py-0.5 rounded text-[8px]">
                        OPTIMAL
                      </div>
                    )}
                  </div>

                  {/* Visual Attachment */}
                  {generatedImg ? (
                    <div className="border border-white/10 rounded-xl overflow-hidden bg-slate-900">
                      <img src={generatedImg} alt="visual attachment" className="w-full object-cover max-h-60" />
                    </div>
                  ) : (
                    <div className="border border-dashed border-white/5 rounded-xl py-6 px-4 text-center bg-slate-900/30 text-slate-500 space-y-1">
                      <ImageIcon className="w-6 h-6 mx-auto opacity-30" />
                      <p className="text-[10px]">No visual attachment in editor</p>
                    </div>
                  )}

                  {/* Time and Source metadata */}
                  <div className="text-[9px] text-slate-500 flex items-center gap-1 pb-1 border-b border-white/5">
                    <span>11:15 AM • Jul 18, 2026 •</span>
                    <span className="text-sky-400 font-bold hover:underline cursor-pointer">SocioAI Suite</span>
                  </div>

                  {/* Engagement Metrics Counters */}
                  <div className="flex items-center gap-4 text-[10px] text-slate-500">
                    <span><strong className="text-white font-bold">12</strong> Reposts</span>
                    <span><strong className="text-white font-bold">{124 + likesOffset.twitter}</strong> Likes</span>
                    <span><strong className="text-white font-bold">{simulatedComments.twitter.length}</strong> Replies</span>
                  </div>

                  {/* Social Actions */}
                  <div className="pt-1.5 flex items-center justify-around text-slate-500 text-[11px]">
                    <button 
                      type="button" 
                      onClick={() => toggleLike('twitter')}
                      className={`flex items-center gap-1 hover:text-rose-400 transition-all cursor-pointer ${userLikes.twitter ? 'text-rose-500' : ''}`}
                    >
                      <Heart className={`w-3.5 h-3.5 ${userLikes.twitter ? 'fill-rose-500' : ''}`} />
                      <span>{userLikes.twitter ? 'Liked' : 'Like'}</span>
                    </button>
                    <button 
                      type="button" 
                      onClick={() => setShowCommentsSection(!showCommentsSection)}
                      className={`flex items-center gap-1 hover:text-sky-400 transition-all cursor-pointer ${showCommentsSection ? 'text-sky-400' : ''}`}
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                      <span>Reply</span>
                    </button>
                    <button 
                      type="button" 
                      onClick={triggerCopySimulation}
                      className="flex items-center gap-1 hover:text-emerald-400 transition-all cursor-pointer"
                    >
                      <Share2 className="w-3.5 h-3.5" />
                      <span>Share</span>
                    </button>
                    <button 
                      type="button" 
                      onClick={() => toggleBookmark('twitter')}
                      className={`flex items-center gap-1 hover:text-yellow-400 transition-all cursor-pointer ${userBookmarks.twitter ? 'text-yellow-400' : ''}`}
                    >
                      <Bookmark className={`w-3.5 h-3.5 ${userBookmarks.twitter ? 'fill-yellow-400' : ''}`} />
                      <span>Bookmark</span>
                    </button>
                  </div>
                </div>
              )}

              {/* --- INSTAGRAM PREVIEW CARD (VISUAL HEAVY) --- */}
              {previewPlatform === 'instagram' && (
                <div className="border border-white/5 bg-slate-950 rounded-xl overflow-hidden text-left shadow-md space-y-3.5 pb-3">
                  {/* Instagram Header */}
                  <div className="p-3.5 flex items-center justify-between border-b border-white/[0.04]">
                    <div className="flex items-center gap-2">
                      <img src={activeSocialAccount.avatar} alt="Avatar" className="w-8 h-8 rounded-full border border-white/10 object-cover" />
                      <div>
                        <h4 className="text-xs font-extrabold text-white">@{activeSocialAccount.handle}</h4>
                        <p className="text-[8px] text-slate-500 leading-none">San Francisco, California</p>
                      </div>
                    </div>
                    <MoreHorizontal className="w-4 h-4 text-white hover:text-slate-300 cursor-pointer" />
                  </div>

                  {/* Main Square Stage */}
                  <div className="aspect-square bg-slate-900 flex items-center justify-center border-b border-white/[0.04] relative group">
                    {generatedImg ? (
                      <img 
                        src={generatedImg} 
                        alt="Instagram preview" 
                        className={`w-full h-full object-cover transition-all duration-300 ${
                          instaFilter === 'vintage' ? 'sepia contrast-110 saturate-125 brightness-95' :
                          instaFilter === 'mono' ? 'grayscale brightness-90 contrast-125' :
                          instaFilter === 'emerald' ? 'hue-rotate-60 saturate-125 contrast-105 brightness-105' :
                          instaFilter === 'cyberpunk' ? 'hue-rotate-180 saturate-200 contrast-125' : ''
                        }`} 
                      />
                    ) : (
                      <div className="text-center p-6 space-y-2 text-slate-500">
                        <ImageIcon className="w-8 h-8 mx-auto opacity-35 animate-pulse" />
                        <p className="text-xs font-bold text-slate-400">Visual Graphic Sandbox</p>
                        <p className="text-[9px] max-w-xs text-slate-600 leading-normal">Instagram is a visual-first grid. Generate a digital illustration using Gemini Image Studio above to see your feed live!</p>
                      </div>
                    )}

                    {/* Filter label indicator */}
                    {generatedImg && (
                      <span className="absolute bottom-2.5 right-2.5 bg-slate-950/80 backdrop-blur-md text-[8px] font-bold text-slate-300 px-2 py-0.5 rounded-full uppercase tracking-wider border border-white/5">
                        Filter: {instaFilter}
                      </span>
                    )}
                  </div>

                  {/* INSTAGRAM FILTERS CHIPS PANEL */}
                  {generatedImg && (
                    <div className="px-3.5 space-y-1.5">
                      <span className="text-[8px] font-bold text-slate-500 uppercase tracking-wider">AI Filter Presets</span>
                      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
                        {[
                          { id: 'normal', name: 'Normal' },
                          { id: 'vintage', name: 'Retro Warm' },
                          { id: 'mono', name: 'Noir Mono' },
                          { id: 'emerald', name: 'Emerald' },
                          { id: 'cyberpunk', name: 'Cyberpunk' }
                        ].map(f => (
                          <button
                            type="button"
                            key={f.id}
                            onClick={() => setInstaFilter(f.id as any)}
                            className={`px-2 py-1 rounded-md text-[8px] font-bold uppercase tracking-wider transition-all border shrink-0 ${
                              instaFilter === f.id
                                ? 'bg-pink-600 border-pink-500 text-white shadow-sm'
                                : 'bg-slate-900 border-white/5 text-slate-400 hover:text-white'
                            }`}
                          >
                            {f.name}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Interaction Buttons bar */}
                  <div className="px-3.5 flex items-center justify-between text-white">
                    <div className="flex items-center gap-3.5">
                      <button type="button" onClick={() => toggleLike('instagram')} className="hover:scale-110 transition-all cursor-pointer">
                        <Heart className={`w-4.5 h-4.5 ${userLikes.instagram ? 'fill-red-500 text-red-500' : 'text-white'}`} />
                      </button>
                      <button type="button" onClick={() => setShowCommentsSection(!showCommentsSection)} className="hover:scale-110 transition-all cursor-pointer">
                        <MessageCircle className={`w-4.5 h-4.5 ${showCommentsSection ? 'text-pink-400' : 'text-white'}`} />
                      </button>
                      <button type="button" onClick={triggerCopySimulation} className="hover:scale-110 transition-all cursor-pointer">
                        <Share2 className="w-4.5 h-4.5 text-white hover:text-pink-400" />
                      </button>
                    </div>
                    <button type="button" onClick={() => toggleBookmark('instagram')} className="hover:scale-110 transition-all cursor-pointer">
                      <Bookmark className={`w-4.5 h-4.5 ${userBookmarks.instagram ? 'fill-white text-white' : 'text-white'}`} />
                    </button>
                  </div>

                  {/* Likes details */}
                  <div className="px-3.5 text-[10px] font-bold text-white">
                    {356 + likesOffset.instagram} likes
                  </div>

                  {/* Caption */}
                  <div className="px-3.5 text-xs text-slate-200 leading-relaxed font-normal whitespace-pre-wrap">
                    <span className="font-extrabold text-white mr-1.5">@{activeSocialAccount.handle}</span>
                    {content || 'Your draft caption will render here alongside your Instagram handles...'}
                  </div>

                  {/* Comments Toggle indicator */}
                  <div className="px-3.5 flex justify-between items-center text-[9px] text-slate-500 font-semibold cursor-pointer" onClick={() => setShowCommentsSection(!showCommentsSection)}>
                    <span>View all {simulatedComments.instagram.length} simulated comments</span>
                    <ChevronRight className={`w-3 h-3 transition-transform ${showCommentsSection ? 'rotate-90' : ''}`} />
                  </div>
                </div>
              )}

              {/* --- FACEBOOK PREVIEW CARD --- */}
              {previewPlatform === 'facebook' && (
                <div className="border border-white/5 bg-slate-950 rounded-xl p-4 text-left space-y-3.5 shadow-md">
                  {/* Facebook header */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <img src={activeSocialAccount.avatar} alt="Avatar" className="w-9 h-9 rounded-full border border-white/10 object-cover" />
                      <div>
                        <h4 className="text-xs font-extrabold text-white flex items-center gap-1.5 leading-none">
                          {activeSocialAccount.name}
                        </h4>
                        <div className="flex items-center gap-1 text-[8px] text-slate-500 mt-1">
                          <span>Just now •</span>
                          <Globe className="w-2.5 h-2.5" />
                        </div>
                      </div>
                    </div>
                    <MoreHorizontal className="w-4 h-4 text-slate-400 hover:text-white cursor-pointer" />
                  </div>

                  {/* Body Text */}
                  <div className="text-xs text-slate-200 leading-relaxed whitespace-pre-wrap font-normal">
                    {content || 'Your draft caption will render here dynamically...'}
                  </div>

                  {/* Visual Attachment */}
                  {generatedImg ? (
                    <div className="border border-white/10 rounded-lg overflow-hidden bg-slate-900">
                      <img src={generatedImg} alt="visual attachment" className="w-full object-cover max-h-60" />
                    </div>
                  ) : (
                    <div className="border border-dashed border-white/5 rounded-xl py-6 px-4 text-center bg-slate-900/30 text-slate-500 space-y-1">
                      <ImageIcon className="w-6 h-6 mx-auto opacity-30" />
                      <p className="text-[10px]">No visual attachment in editor</p>
                    </div>
                  )}

                  {/* FB Engagement bar */}
                  <div className="flex items-center justify-between text-[9px] text-slate-500 border-b border-white/5 pb-2">
                    <div className="flex items-center gap-1">
                      <span className="w-4 h-4 bg-blue-600 rounded-full flex items-center justify-center text-[7px] text-white">👍</span>
                      <span>{88 + likesOffset.facebook} people liked this</span>
                    </div>
                    <span>{simulatedComments.facebook.length} Comments • 3 Shares</span>
                  </div>

                  {/* FB Action buttons */}
                  <div className="pt-1 flex items-center justify-around text-slate-400 text-[10px] font-bold">
                    <button 
                      type="button" 
                      onClick={() => toggleLike('facebook')}
                      className={`flex items-center gap-1.5 py-1 px-3 rounded-lg hover:bg-white/5 transition-all cursor-pointer ${userLikes.facebook ? 'text-blue-500' : 'text-slate-400'}`}
                    >
                      <ThumbsUp className={`w-3.5 h-3.5 ${userLikes.facebook ? 'fill-blue-500/15' : ''}`} />
                      <span>Like</span>
                    </button>
                    <button 
                      type="button" 
                      onClick={() => setShowCommentsSection(!showCommentsSection)}
                      className={`flex items-center gap-1.5 py-1 px-3 rounded-lg hover:bg-white/5 transition-all cursor-pointer ${showCommentsSection ? 'text-blue-400 bg-white/5' : ''}`}
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                      <span>Comment</span>
                    </button>
                    <button 
                      type="button" 
                      onClick={triggerCopySimulation}
                      className="flex items-center gap-1.5 py-1 px-3 rounded-lg hover:bg-white/5 transition-all cursor-pointer"
                    >
                      <Share2 className="w-3.5 h-3.5" />
                      <span>Share</span>
                    </button>
                  </div>
                </div>
              )}

            </div>

            {/* REAL-TIME SIMULATED COMMENTS TRAY */}
            {showCommentsSection && (
              <div className="border border-white/5 bg-slate-950/80 rounded-xl p-3 space-y-3 mt-1.5 text-left animate-fade-in">
                <div className="flex items-center justify-between border-b border-white/5 pb-1.5">
                  <span className="text-[9px] font-bold text-indigo-400 uppercase tracking-wider">Simulated Feed Comments ({simulatedComments[previewPlatform].length})</span>
                  <button type="button" onClick={() => setShowCommentsSection(false)} className="text-[9px] text-slate-500 hover:text-white cursor-pointer">Hide Tray</button>
                </div>

                {/* Comments List */}
                <div className="space-y-2.5 max-h-40 overflow-y-auto scrollbar-thin">
                  {simulatedComments[previewPlatform].map((cmt) => (
                    <div key={cmt.id} className="flex items-start gap-2 text-[10px]">
                      <img src={cmt.avatar} alt="Avatar" className="w-6.5 h-6.5 rounded-full object-cover shrink-0 border border-white/5" />
                      <div className="flex-1 bg-slate-900/60 rounded-xl p-2 border border-white/5">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-slate-200">{cmt.author}</span>
                          <span className="text-[8px] text-slate-500">{cmt.time}</span>
                        </div>
                        <p className="text-slate-300 mt-0.5 leading-relaxed font-normal">{cmt.text}</p>
                      </div>
                    </div>
                  ))}
                  {simulatedComments[previewPlatform].length === 0 && (
                    <p className="text-[9px] text-slate-500 italic text-center py-2">No comments yet. Write the first simulated response below!</p>
                  )}
                </div>

                {/* Add Mock Comment Form */}
                <form onSubmit={handleAddComment} className="flex gap-2 pt-1 border-t border-white/5">
                  <input
                    type="text"
                    placeholder="Add simulated reply..."
                    value={newCommentInput}
                    onChange={(e) => setNewCommentInput(e.target.value)}
                    className="flex-1 px-3 py-1 bg-slate-950 border border-white/10 text-[10px] rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                  <button 
                    type="submit"
                    className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-[9px] rounded-lg transition-all"
                  >
                    Reply
                  </button>
                </form>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}
