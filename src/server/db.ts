import fs from 'fs';
import path from 'path';
import { 
  User, 
  Workspace, 
  TeamMember, 
  SocialAccount, 
  Post, 
  AIGeneration, 
  AnalyticsData, 
  Subscription, 
  ActivityLog,
  PlatformType,
  PlatformMetric
} from '../types';

const DATA_DIR = path.join(process.cwd(), '.data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

interface Schema {
  users: User[];
  workspaces: Workspace[];
  teamMembers: TeamMember[];
  socialAccounts: SocialAccount[];
  posts: Post[];
  aiGenerations: AIGeneration[];
  analytics: AnalyticsData[];
  subscriptions: Subscription[];
  activityLogs: ActivityLog[];
}

const DEFAULT_USER: User = {
  id: 'usr-1',
  email: 'philipinem7@gmail.com',
  name: 'Philip Inem',
  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
};

// Seed 30 days of dense metrics
function generateMockMetrics(baseFollowers: number, growth: number, engagementRate: number): PlatformMetric[] {
  const metrics: PlatformMetric[] = [];
  const now = new Date();
  
  for (let i = 30; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(now.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    
    const randomFactor = 0.8 + Math.random() * 0.4; // +/- 20%
    const currentFollowers = Math.round(baseFollowers + (30 - i) * growth * randomFactor);
    const impressions = Math.round(currentFollowers * (0.15 + Math.random() * 0.05));
    const likes = Math.round(impressions * engagementRate * randomFactor);
    const shares = Math.round(likes * 0.12 * randomFactor);
    const comments = Math.round(likes * 0.08 * randomFactor);
    const clicks = Math.round(impressions * 0.02 * randomFactor);
    
    metrics.push({
      date: dateStr,
      impressions,
      likes,
      shares,
      comments,
      clicks,
      followers: currentFollowers,
    });
  }
  return metrics;
}

const INITIAL_WORKSPACES: Workspace[] = [
  {
    id: 'ws-1',
    name: 'Acme Enterprise',
    brandVoice: 'Professional, forward-thinking, and precise. Focus on enterprise solutions, developer experience, and scalability. Avoid corporate jargon; use human, direct language.',
    targetAudience: 'CTOs, VP of Engineering, Senior Architects, and Tech Decision Makers',
    primaryTone: 'Authoritative yet engaging',
    creatorId: 'usr-1',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'ws-2',
    name: 'Philip Personal Brand',
    brandVoice: 'Thoughtful, visionary, educational. Share engineering insights, SaaS building experiences, and AI product design paradigms.',
    targetAudience: 'Indie Hackers, Product Designers, AI Builders, and SaaS developers',
    primaryTone: 'Empathetic, authentic, curious',
    creatorId: 'usr-1',
    createdAt: new Date().toISOString(),
  }
];

class Database {
  private schema: Schema = {
    users: [],
    workspaces: [],
    teamMembers: [],
    socialAccounts: [],
    posts: [],
    aiGenerations: [],
    analytics: [],
    subscriptions: [],
    activityLogs: [],
  };

  constructor() {
    this.init();
  }

  private init() {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }

      if (fs.existsSync(DB_FILE)) {
        const fileContent = fs.readFileSync(DB_FILE, 'utf-8');
        this.schema = JSON.parse(fileContent);
      } else {
        this.seed();
      }
    } catch (error) {
      console.error('Error initializing database:', error);
      this.seed();
    }
  }

  private seed() {
    const ws1Id = 'ws-1';
    const ws2Id = 'ws-2';

    this.schema.users = [DEFAULT_USER];
    this.schema.workspaces = INITIAL_WORKSPACES;

    this.schema.teamMembers = [
      {
        id: 'tm-1',
        email: 'philipinem7@gmail.com',
        name: 'Philip Inem',
        role: 'Admin',
        workspaceId: ws1Id,
        invitedAt: new Date().toISOString(),
        status: 'active',
      },
      {
        id: 'tm-2',
        email: 'sarah.jones@acme.com',
        name: 'Sarah Jones',
        role: 'Editor',
        workspaceId: ws1Id,
        invitedAt: new Date().toISOString(),
        status: 'active',
      },
      {
        id: 'tm-3',
        email: 'alex.m@acme.com',
        name: 'Alex Miller',
        role: 'Analyst',
        workspaceId: ws1Id,
        invitedAt: new Date().toISOString(),
        status: 'active',
      },
      {
        id: 'tm-4',
        email: 'philipinem7@gmail.com',
        name: 'Philip Inem',
        role: 'Admin',
        workspaceId: ws2Id,
        invitedAt: new Date().toISOString(),
        status: 'active',
      }
    ];

    // Seed Social Accounts
    this.schema.socialAccounts = [
      {
        id: 'sa-1',
        workspaceId: ws1Id,
        platform: 'linkedin',
        handle: 'acme-corp',
        name: 'Acme Corp Enterprise',
        avatar: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&auto=format&fit=crop&q=80',
        followers: 12400,
        connectedAt: new Date().toISOString(),
      },
      {
        id: 'sa-2',
        workspaceId: ws1Id,
        platform: 'twitter',
        handle: 'AcmeCorp',
        name: 'Acme Corp',
        avatar: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&auto=format&fit=crop&q=80',
        followers: 43200,
        connectedAt: new Date().toISOString(),
      },
      {
        id: 'sa-3',
        workspaceId: ws2Id,
        platform: 'twitter',
        handle: 'philip_builds',
        name: 'Philip Inem',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
        followers: 2450,
        connectedAt: new Date().toISOString(),
      },
      {
        id: 'sa-4',
        workspaceId: ws2Id,
        platform: 'instagram',
        handle: 'philip_creates',
        name: 'Philip Inem',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
        followers: 1870,
        connectedAt: new Date().toISOString(),
      }
    ];

    // Seed some initial posts
    const now = new Date();
    const futureDate1 = new Date(now.getTime() + 1000 * 60 * 60 * 24); // Tomorrow
    const futureDate2 = new Date(now.getTime() + 1000 * 60 * 60 * 48); // In 2 days
    const pastDate = new Date(now.getTime() - 1000 * 60 * 60 * 12); // 12 hours ago

    this.schema.posts = [
      {
        id: 'post-1',
        workspaceId: ws1Id,
        content: 'Enterprise engineering is all about resilience. Today we are launching Acme Grid: our brand new multi-region database solution built to manage 10M+ operations per second. Proud of our team! 🌐🚀\n\n#Enterprise #CloudComputing #Databases #TechScaling',
        platforms: ['linkedin', 'twitter'],
        status: 'published',
        publishedAt: pastDate.toISOString(),
        creatorId: 'usr-1',
        creatorName: 'Philip Inem',
        comments: [
          {
            id: 'c-1',
            userName: 'Sarah Jones',
            userRole: 'Editor',
            text: 'This post went viral! Outstanding engagement rate on LinkedIn.',
            createdAt: new Date().toISOString(),
          }
        ],
        history: [
          { action: 'Post created', userName: 'Philip Inem', timestamp: pastDate.toISOString() },
          { action: 'Approved for publishing', userName: 'Sarah Jones', timestamp: pastDate.toISOString() },
          { action: 'Published to LinkedIn, Twitter', userName: 'System API Scheduler', timestamp: pastDate.toISOString() },
        ],
        createdAt: pastDate.toISOString(),
      },
      {
        id: 'post-2',
        workspaceId: ws1Id,
        content: 'How do you handle API security at scale? In our next technical brief, we will explore decentralized API gateways and JWT rotative structures.\n\nSave the date: Next Tuesday at 10 AM EST. 🧑‍💻🛡️\n\n#Security #APIs #SoftwareArchitecture #CTO',
        platforms: ['linkedin'],
        status: 'scheduled',
        scheduledFor: futureDate1.toISOString(),
        creatorId: 'usr-1',
        creatorName: 'Philip Inem',
        comments: [],
        history: [
          { action: 'Post draft written', userName: 'Philip Inem', timestamp: new Date().toISOString() },
          { action: 'Scheduled for publishing', userName: 'Philip Inem', timestamp: new Date().toISOString() },
        ],
        createdAt: new Date().toISOString(),
      },
      {
        id: 'post-3',
        workspaceId: ws2Id,
        content: 'Build in public or build in secret? For me, building in public is like having 1,000 co-founders giving you real-time feedback. Best design decision ever. 🛠️✨\n\nWhat are you working on today?\n\n#BuildInPublic #SaaS #IndieHackers #Solopreneur',
        platforms: ['twitter', 'instagram'],
        status: 'draft',
        creatorId: 'usr-1',
        creatorName: 'Philip Inem',
        comments: [],
        history: [
          { action: 'Draft initialized', userName: 'Philip Inem', timestamp: new Date().toISOString() },
        ],
        createdAt: new Date().toISOString(),
      }
    ];

    // Seed Dense Analytics
    this.schema.analytics = [
      {
        workspaceId: ws1Id,
        metrics: {
          linkedin: generateMockMetrics(12400, 15, 0.045),
          twitter: generateMockMetrics(43200, 48, 0.021),
        }
      },
      {
        workspaceId: ws2Id,
        metrics: {
          twitter: generateMockMetrics(2450, 6, 0.052),
          instagram: generateMockMetrics(1870, 4, 0.068),
        }
      }
    ];

    // Seed Subscriptions
    this.schema.subscriptions = [
      {
        workspaceId: ws1Id,
        tier: 'Enterprise',
        status: 'active',
        expiresAt: new Date(now.getTime() + 1000 * 60 * 60 * 24 * 365).toISOString(), // 1 year
        aiLimit: 5000,
        aiUsed: 312,
      },
      {
        workspaceId: ws2Id,
        tier: 'Starter',
        status: 'active',
        expiresAt: new Date(now.getTime() + 1000 * 60 * 60 * 24 * 30).toISOString(), // 30 days
        aiLimit: 100,
        aiUsed: 42,
      }
    ];

    // Seed Activity Logs
    this.schema.activityLogs = [
      {
        id: 'al-1',
        workspaceId: ws1Id,
        userName: 'Philip Inem',
        action: 'Workspace Created',
        details: 'Acme Enterprise workspace setup completed',
        createdAt: pastDate.toISOString(),
      },
      {
        id: 'al-2',
        workspaceId: ws1Id,
        userName: 'Philip Inem',
        action: 'Social Account Linked',
        details: 'Connected LinkedIn account: acme-corp',
        createdAt: pastDate.toISOString(),
      },
      {
        id: 'al-3',
        workspaceId: ws1Id,
        userName: 'System API Scheduler',
        action: 'Social Post Published',
        details: 'Successfully published Grid post to LinkedIn and Twitter',
        createdAt: pastDate.toISOString(),
      },
    ];

    this.save();
  }

  private save() {
    try {
      fs.writeFileSync(DB_FILE, JSON.stringify(this.schema, null, 2), 'utf-8');
    } catch (error) {
      console.error('Error saving database:', error);
    }
  }

  // --- QUERY APIS ---

  getUsers() { return this.schema.users; }
  
  getUserById(id: string) { return this.schema.users.find(u => u.id === id); }
  
  getWorkspaces() { return this.schema.workspaces; }
  
  createWorkspace(ws: Omit<Workspace, 'id' | 'createdAt'>) {
    const newWs: Workspace = {
      ...ws,
      id: `ws-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    this.schema.workspaces.push(newWs);
    
    // Auto add Admin team member
    const user = this.getUserById(ws.creatorId) || DEFAULT_USER;
    this.schema.teamMembers.push({
      id: `tm-${Date.now()}`,
      email: user.email,
      name: user.name,
      role: 'Admin',
      workspaceId: newWs.id,
      invitedAt: new Date().toISOString(),
      status: 'active',
    });

    // Auto set Subscription tier to Starter for new workspaces
    this.schema.subscriptions.push({
      workspaceId: newWs.id,
      tier: 'Starter',
      status: 'active',
      expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30).toISOString(),
      aiLimit: 100,
      aiUsed: 0,
    });

    // Seed mock analytics for the new workspace so charts aren't completely blank
    this.schema.analytics.push({
      workspaceId: newWs.id,
      metrics: {
        twitter: generateMockMetrics(200, 2, 0.04),
        linkedin: generateMockMetrics(100, 1, 0.05)
      }
    });

    this.logActivity(newWs.id, user.name, 'Workspace Created', `Workspace "${newWs.name}" was initialized successfully.`);
    this.save();
    return newWs;
  }

  updateWorkspace(id: string, updates: Partial<Omit<Workspace, 'id' | 'creatorId' | 'createdAt'>>) {
    const idx = this.schema.workspaces.findIndex(w => w.id === id);
    if (idx !== -1) {
      this.schema.workspaces[idx] = { ...this.schema.workspaces[idx], ...updates };
      this.save();
      return this.schema.workspaces[idx];
    }
    return null;
  }

  getTeamMembers(workspaceId: string) {
    return this.schema.teamMembers.filter(t => t.workspaceId === workspaceId);
  }

  inviteTeamMember(workspaceId: string, name: string, email: string, role: 'Admin' | 'Editor' | 'Analyst') {
    const newMember: TeamMember = {
      id: `tm-${Date.now()}`,
      email,
      name,
      role,
      workspaceId,
      invitedAt: new Date().toISOString(),
      status: 'invited',
    };
    this.schema.teamMembers.push(newMember);
    this.logActivity(workspaceId, 'Philip Inem', 'Team Member Invited', `Sent workspace invitation to ${name} (${email}) as ${role}`);
    this.save();
    return newMember;
  }

  removeTeamMember(workspaceId: string, id: string) {
    const member = this.schema.teamMembers.find(t => t.id === id);
    this.schema.teamMembers = this.schema.teamMembers.filter(t => t.id !== id || t.workspaceId !== workspaceId);
    if (member) {
      this.logActivity(workspaceId, 'Philip Inem', 'Team Member Removed', `Removed ${member.name} from team`);
    }
    this.save();
  }

  getSocialAccounts(workspaceId: string) {
    return this.schema.socialAccounts.filter(s => s.workspaceId === workspaceId);
  }

  connectSocialAccount(workspaceId: string, platform: PlatformType, handle: string, name: string) {
    const avatarMap: { [key in PlatformType]: string } = {
      twitter: 'https://images.unsplash.com/photo-1611605698335-8b15d27e03f4?w=150&auto=format&fit=crop&q=80',
      linkedin: 'https://images.unsplash.com/photo-1616469829581-73993eb86b02?w=150&auto=format&fit=crop&q=80',
      instagram: 'https://images.unsplash.com/photo-1611224885990-ab7363d1f2a9?w=150&auto=format&fit=crop&q=80',
      facebook: 'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=150&auto=format&fit=crop&q=80',
    };

    const newAcc: SocialAccount = {
      id: `sa-${Date.now()}`,
      workspaceId,
      platform,
      handle,
      name,
      avatar: avatarMap[platform],
      followers: Math.round(100 + Math.random() * 5000),
      connectedAt: new Date().toISOString(),
    };

    // Remove existing if duplicate platform/handle
    this.schema.socialAccounts = this.schema.socialAccounts.filter(
      s => !(s.workspaceId === workspaceId && s.platform === platform && s.handle === handle)
    );

    this.schema.socialAccounts.push(newAcc);
    this.logActivity(workspaceId, 'Philip Inem', 'Platform Connected', `Linked ${platform} channel @${handle}`);
    this.save();
    return newAcc;
  }

  disconnectSocialAccount(workspaceId: string, accountId: string) {
    const acc = this.schema.socialAccounts.find(s => s.id === accountId);
    this.schema.socialAccounts = this.schema.socialAccounts.filter(s => s.id !== accountId);
    if (acc) {
      this.logActivity(workspaceId, 'Philip Inem', 'Platform Disconnected', `Removed ${acc.platform} channel @${acc.handle}`);
    }
    this.save();
  }

  getPosts(workspaceId: string) {
    return this.schema.posts.filter(p => p.workspaceId === workspaceId);
  }

  getPostById(id: string) {
    return this.schema.posts.find(p => p.id === id);
  }

  createPost(post: Omit<Post, 'id' | 'createdAt' | 'comments' | 'history'>) {
    const newPost: Post = {
      ...post,
      id: `post-${Date.now()}`,
      comments: [],
      history: [
        { action: 'Draft initialized', userName: post.creatorName, timestamp: new Date().toISOString() }
      ],
      createdAt: new Date().toISOString(),
    };
    this.schema.posts.push(newPost);
    this.logActivity(post.workspaceId, post.creatorName, 'Post Draft Created', `Created post draft: "${post.content.slice(0, 40)}..."`);
    this.save();
    return newPost;
  }

  updatePost(id: string, updates: Partial<Omit<Post, 'id' | 'workspaceId' | 'creatorId' | 'createdAt'>>, userName: string) {
    const idx = this.schema.posts.findIndex(p => p.id === id);
    if (idx !== -1) {
      const current = this.schema.posts[idx];
      const historyUpdate = [...current.history];
      
      if (updates.status && updates.status !== current.status) {
        historyUpdate.push({
          action: `Status changed from ${current.status} to ${updates.status}`,
          userName,
          timestamp: new Date().toISOString()
        });
      } else {
        historyUpdate.push({
          action: 'Post edited',
          userName,
          timestamp: new Date().toISOString()
        });
      }

      this.schema.posts[idx] = {
        ...current,
        ...updates,
        history: historyUpdate,
      };
      
      this.logActivity(current.workspaceId, userName, 'Post Updated', `Modified post ${id}`);
      this.save();
      return this.schema.posts[idx];
    }
    return null;
  }

  deletePost(workspaceId: string, id: string) {
    this.schema.posts = this.schema.posts.filter(p => p.id !== id || p.workspaceId !== workspaceId);
    this.logActivity(workspaceId, 'Philip Inem', 'Post Deleted', `Deleted post ${id}`);
    this.save();
  }

  addComment(workspaceId: string, postId: string, userName: string, userRole: 'Admin' | 'Editor' | 'Analyst', text: string) {
    const postIdx = this.schema.posts.findIndex(p => p.id === postId && p.workspaceId === workspaceId);
    if (postIdx !== -1) {
      const comment = {
        id: `c-${Date.now()}`,
        userName,
        userRole,
        text,
        createdAt: new Date().toISOString()
      };
      this.schema.posts[postIdx].comments.push(comment);
      this.schema.posts[postIdx].history.push({
        action: `Comment added by ${userName}`,
        userName,
        timestamp: new Date().toISOString(),
      });
      this.save();
      return this.schema.posts[postIdx];
    }
    return null;
  }

  getSubscription(workspaceId: string) {
    return this.schema.subscriptions.find(s => s.workspaceId === workspaceId) || {
      workspaceId,
      tier: 'Starter',
      status: 'active',
      expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30).toISOString(),
      aiLimit: 100,
      aiUsed: 0,
    };
  }

  updateSubscription(workspaceId: string, tier: 'Starter' | 'Pro' | 'Enterprise') {
    const limits = { Starter: 100, Pro: 1000, Enterprise: 5000 };
    const idx = this.schema.subscriptions.findIndex(s => s.workspaceId === workspaceId);
    const sub: Subscription = {
      workspaceId,
      tier,
      status: 'active',
      expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 365).toISOString(),
      aiLimit: limits[tier],
      aiUsed: idx !== -1 ? this.schema.subscriptions[idx].aiUsed : 0,
    };

    if (idx !== -1) {
      this.schema.subscriptions[idx] = sub;
    } else {
      this.schema.subscriptions.push(sub);
    }
    
    this.logActivity(workspaceId, 'Philip Inem', 'Subscription Upgraded', `Workspace upgraded to ${tier} Tier`);
    this.save();
    return sub;
  }

  incrementAIUsage(workspaceId: string, count: number = 1) {
    const idx = this.schema.subscriptions.findIndex(s => s.workspaceId === workspaceId);
    if (idx !== -1) {
      this.schema.subscriptions[idx].aiUsed += count;
      this.save();
      return this.schema.subscriptions[idx];
    }
    return null;
  }

  getAIGenerations(workspaceId: string) {
    return this.schema.aiGenerations.filter(g => g.workspaceId === workspaceId).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  logAIGeneration(workspaceId: string, prompt: string, type: 'caption' | 'hashtags' | 'rewrite' | 'image' | 'recommendations', result: string) {
    const gen: AIGeneration = {
      id: `gen-${Date.now()}`,
      workspaceId,
      prompt,
      type,
      result,
      createdAt: new Date().toISOString(),
    };
    this.schema.aiGenerations.push(gen);
    this.incrementAIUsage(workspaceId);
    this.save();
    return gen;
  }

  getAnalytics(workspaceId: string) {
    return this.schema.analytics.find(a => a.workspaceId === workspaceId);
  }

  getActivityLogs(workspaceId: string) {
    return this.schema.activityLogs
      .filter(l => l.workspaceId === workspaceId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  logActivity(workspaceId: string, userName: string, action: string, details: string) {
    const newLog: ActivityLog = {
      id: `al-${Date.now()}`,
      workspaceId,
      userName,
      action,
      details,
      createdAt: new Date().toISOString(),
    };
    this.schema.activityLogs.push(newLog);
    this.save();
  }

  // Background Publish simulation
  runPublishWorker() {
    const now = new Date();
    let updated = false;

    this.schema.posts.forEach(post => {
      if (post.status === 'scheduled' && post.scheduledFor && new Date(post.scheduledFor) <= now) {
        post.status = 'published';
        post.publishedAt = now.toISOString();
        post.history.push({
          action: `Published to ${post.platforms.join(', ')}`,
          userName: 'System API Scheduler',
          timestamp: now.toISOString(),
        });
        
        // Append dynamic mock analytics record
        const analyticsRecord = this.schema.analytics.find(a => a.workspaceId === post.workspaceId);
        if (analyticsRecord) {
          post.platforms.forEach(platform => {
            const list = analyticsRecord.metrics[platform];
            if (list && list.length > 0) {
              const last = list[list.length - 1];
              last.impressions += Math.round(500 + Math.random() * 1000);
              last.likes += Math.round(20 + Math.random() * 80);
              last.comments += Math.round(5 + Math.random() * 15);
              last.clicks += Math.round(10 + Math.random() * 30);
            }
          });
        }

        this.logActivity(
          post.workspaceId, 
          'System API Scheduler', 
          'Social Post Published', 
          `Auto-published post ${post.id} to ${post.platforms.join(', ')}`
        );
        updated = true;
      }
    });

    if (updated) {
      this.save();
    }
  }
}

export const db = new Database();

// Start scheduled post publisher worker
setInterval(() => {
  db.runPublishWorker();
}, 8000);
