export type PlatformType = 'twitter' | 'linkedin' | 'instagram' | 'facebook';

export type UserRole = 'Admin' | 'Editor' | 'Analyst';

export interface User {
  id: string;
  email: string;
  name: string;
  avatar: string;
}

export interface Workspace {
  id: string;
  name: string;
  brandVoice: string;
  targetAudience: string;
  primaryTone: string;
  creatorId: string;
  createdAt: string;
}

export interface TeamMember {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  workspaceId: string;
  invitedAt: string;
  status: 'active' | 'invited';
}

export interface SocialAccount {
  id: string;
  workspaceId: string;
  platform: PlatformType;
  handle: string;
  name: string;
  avatar: string;
  followers: number;
  connectedAt: string;
}

export interface Comment {
  id: string;
  userName: string;
  userRole: UserRole;
  text: string;
  createdAt: string;
}

export interface Post {
  id: string;
  workspaceId: string;
  content: string;
  platforms: PlatformType[];
  mediaUrl?: string;
  status: 'draft' | 'scheduled' | 'published' | 'failed';
  scheduledFor?: string; // ISO string
  publishedAt?: string; // ISO string
  creatorId: string;
  creatorName: string;
  comments: Comment[];
  history: {
    action: string;
    userName: string;
    timestamp: string;
  }[];
  createdAt: string;
}

export interface AIGeneration {
  id: string;
  workspaceId: string;
  prompt: string;
  type: 'caption' | 'hashtags' | 'rewrite' | 'image' | 'recommendations';
  result: string;
  createdAt: string;
}

export interface PlatformMetric {
  date: string;
  impressions: number;
  likes: number;
  shares: number;
  comments: number;
  clicks: number;
  followers: number;
}

export interface AnalyticsData {
  workspaceId: string;
  metrics: {
    [key in PlatformType]?: PlatformMetric[];
  };
}

export interface Subscription {
  workspaceId: string;
  tier: 'Starter' | 'Pro' | 'Enterprise';
  status: 'active' | 'trialing' | 'past_due';
  expiresAt: string;
  aiLimit: number;
  aiUsed: number;
}

export interface ActivityLog {
  id: string;
  workspaceId: string;
  userName: string;
  action: string;
  details: string;
  createdAt: string;
}
