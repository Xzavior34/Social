import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { db } from './src/server/db';
import { 
  generateCaption, 
  generateHashtags, 
  rewriteContent, 
  generateStrategicAnalysis, 
  generateCampaignIdeas, 
  generateImage 
} from './src/server/gemini';
import dotenv from 'dotenv';

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Setup standard JSON middleware
  app.use(express.json({ limit: '10mb' }));

  // --- API ROUTES ---

  // Workspaces
  app.get('/api/workspaces', (req, res) => {
    try {
      res.json(db.getWorkspaces());
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post('/api/workspaces', (req, res) => {
    try {
      const { name, brandVoice, targetAudience, primaryTone, creatorId } = req.body;
      if (!name) {
        return res.status(400).json({ error: 'Workspace name is required' });
      }
      const newWs = db.createWorkspace({
        name,
        brandVoice: brandVoice || '',
        targetAudience: targetAudience || '',
        primaryTone: primaryTone || 'Professional',
        creatorId: creatorId || 'usr-1',
      });
      res.status(201).json(newWs);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.patch('/api/workspaces/:id', (req, res) => {
    try {
      const { name, brandVoice, targetAudience, primaryTone } = req.body;
      const updated = db.updateWorkspace(req.params.id, {
        name,
        brandVoice,
        targetAudience,
        primaryTone,
      });
      if (!updated) {
        return res.status(404).json({ error: 'Workspace not found' });
      }
      res.json(updated);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Social Accounts
  app.get('/api/workspaces/:wsId/social-accounts', (req, res) => {
    try {
      res.json(db.getSocialAccounts(req.params.wsId));
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post('/api/workspaces/:wsId/social-accounts', (req, res) => {
    try {
      const { platform, handle, name } = req.body;
      if (!platform || !handle || !name) {
        return res.status(400).json({ error: 'platform, handle, and name are required' });
      }
      const newAcc = db.connectSocialAccount(req.params.wsId, platform, handle, name);
      res.status(201).json(newAcc);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.delete('/api/workspaces/:wsId/social-accounts/:id', (req, res) => {
    try {
      db.disconnectSocialAccount(req.params.wsId, req.params.id);
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Team Members
  app.get('/api/workspaces/:wsId/team-members', (req, res) => {
    try {
      res.json(db.getTeamMembers(req.params.wsId));
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post('/api/workspaces/:wsId/team-members', (req, res) => {
    try {
      const { name, email, role } = req.body;
      if (!name || !email || !role) {
        return res.status(400).json({ error: 'name, email, and role are required' });
      }
      const member = db.inviteTeamMember(req.params.wsId, name, email, role);
      res.status(201).json(member);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.delete('/api/workspaces/:wsId/team-members/:id', (req, res) => {
    try {
      db.removeTeamMember(req.params.wsId, req.params.id);
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Posts
  app.get('/api/workspaces/:wsId/posts', (req, res) => {
    try {
      res.json(db.getPosts(req.params.wsId));
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post('/api/workspaces/:wsId/posts', (req, res) => {
    try {
      const { content, platforms, mediaUrl, status, scheduledFor, creatorId, creatorName } = req.body;
      if (!content || !platforms || !Array.isArray(platforms)) {
        return res.status(400).json({ error: 'content and platforms array are required' });
      }
      const post = db.createPost({
        workspaceId: req.params.wsId,
        content,
        platforms,
        mediaUrl,
        status: status || 'draft',
        scheduledFor,
        creatorId: creatorId || 'usr-1',
        creatorName: creatorName || 'Philip Inem',
      });
      res.status(201).json(post);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.patch('/api/workspaces/:wsId/posts/:id', (req, res) => {
    try {
      const { content, platforms, mediaUrl, status, scheduledFor, userName } = req.body;
      const updated = db.updatePost(req.params.id, {
        content,
        platforms,
        mediaUrl,
        status,
        scheduledFor,
      }, userName || 'Philip Inem');
      if (!updated) {
        return res.status(404).json({ error: 'Post not found' });
      }
      res.json(updated);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.delete('/api/workspaces/:wsId/posts/:id', (req, res) => {
    try {
      db.deletePost(req.params.wsId, req.params.id);
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post('/api/workspaces/:wsId/posts/:id/comments', (req, res) => {
    try {
      const { userName, userRole, text } = req.body;
      if (!userName || !userRole || !text) {
        return res.status(400).json({ error: 'userName, userRole, and text are required' });
      }
      const post = db.addComment(req.params.wsId, req.params.id, userName, userRole, text);
      if (!post) {
        return res.status(404).json({ error: 'Post not found' });
      }
      res.status(201).json(post);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // AI Content Studio Operations
  app.post('/api/workspaces/:wsId/ai/caption', async (req, res) => {
    try {
      const { prompt, platform, tone, brandVoice, targetAudience } = req.body;
      if (!prompt || !platform) {
        return res.status(400).json({ error: 'prompt and platform are required' });
      }
      const caption = await generateCaption(
        prompt, 
        platform, 
        tone || 'Professional', 
        brandVoice || '', 
        targetAudience || ''
      );
      
      // Save AI log entry
      db.logAIGeneration(req.params.wsId, prompt, 'caption', caption);
      res.json({ caption });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post('/api/workspaces/:wsId/ai/hashtags', async (req, res) => {
    try {
      const { caption, count } = req.body;
      if (!caption) {
        return res.status(400).json({ error: 'caption is required' });
      }
      const hashtags = await generateHashtags(caption, count || 5);
      db.logAIGeneration(req.params.wsId, caption.slice(0, 50), 'hashtags', hashtags);
      res.json({ hashtags });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post('/api/workspaces/:wsId/ai/rewrite', async (req, res) => {
    try {
      const { content, option } = req.body;
      if (!content || !option) {
        return res.status(400).json({ error: 'content and option are required' });
      }
      const rewritten = await rewriteContent(content, option);
      db.logAIGeneration(req.params.wsId, `Rewrite to ${option}: ${content.slice(0, 30)}`, 'rewrite', rewritten);
      res.json({ rewritten });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post('/api/workspaces/:wsId/ai/image', async (req, res) => {
    try {
      const { prompt, aspectRatio } = req.body;
      if (!prompt) {
        return res.status(400).json({ error: 'prompt is required' });
      }
      const imageUrl = await generateImage(prompt, aspectRatio || '1:1');
      db.logAIGeneration(req.params.wsId, prompt, 'image', imageUrl);
      res.json({ imageUrl });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post('/api/workspaces/:wsId/ai/analyze', async (req, res) => {
    try {
      const analytics = db.getAnalytics(req.params.wsId);
      const ws = db.getWorkspaces().find(w => w.id === req.params.wsId);
      
      const metricsJson = JSON.stringify(analytics || {}, null, 2);
      const brandVoice = ws?.brandVoice || 'Default generic marketing';
      
      const analysis = await generateStrategicAnalysis(metricsJson, brandVoice);
      db.logAIGeneration(req.params.wsId, 'Strategic Performance Analysis Request', 'recommendations', analysis);
      res.json({ analysis });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post('/api/workspaces/:wsId/ai/campaign', async (req, res) => {
    try {
      const { prompt } = req.body;
      if (!prompt) {
        return res.status(400).json({ error: 'prompt is required' });
      }
      const ws = db.getWorkspaces().find(w => w.id === req.params.wsId);
      const brandVoice = ws?.brandVoice || 'Default generic marketing';
      
      const campaign = await generateCampaignIdeas(prompt, brandVoice);
      db.logAIGeneration(req.params.wsId, `Campaign Idea: ${prompt}`, 'recommendations', campaign);
      res.json({ campaign });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get('/api/workspaces/:wsId/ai/generations', (req, res) => {
    try {
      res.json(db.getAIGenerations(req.params.wsId));
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Analytics, Subscriptions, and Activity Logs
  app.get('/api/workspaces/:wsId/analytics', (req, res) => {
    try {
      res.json(db.getAnalytics(req.params.wsId) || { workspaceId: req.params.wsId, metrics: {} });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get('/api/workspaces/:wsId/subscription', (req, res) => {
    try {
      res.json(db.getSubscription(req.params.wsId));
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post('/api/workspaces/:wsId/subscription', (req, res) => {
    try {
      const { tier } = req.body;
      if (!tier || !['Starter', 'Pro', 'Enterprise'].includes(tier)) {
        return res.status(400).json({ error: 'Invalid subscription tier' });
      }
      const updated = db.updateSubscription(req.params.wsId, tier);
      res.json(updated);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get('/api/workspaces/:wsId/activity-logs', (req, res) => {
    try {
      res.json(db.getActivityLogs(req.params.wsId));
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // --- VITE MIDDLEWARE CONFIGURATION ---

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  // Listen on standard host and port
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server successfully started on http://0.0.0.0:${PORT}`);
  });
}

startServer();
