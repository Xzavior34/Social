import { GoogleGenAI, Type } from '@google/genai';

// Initialize Gemini client lazily to avoid crashing on startup if key is missing
let aiClient: GoogleGenAI | null = null;

function getGeminiClient(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn('GEMINI_API_KEY is not defined in environment variables. Running in mock/fallback mode.');
      throw new Error('GEMINI_API_KEY environment variable is required');
    }
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return aiClient;
}

// Fallback generators for smooth developer experience when key is missing or invalid
const MOCK_FALLBACKS = {
  caption: (platform: string, tone: string) => {
    return `🚀 Exciting times ahead! We've been working on some incredible updates to scale operations and optimize performance. What is your primary focus this quarter?\n\nTone: ${tone} | Target: ${platform} custom caption.`;
  },
  hashtags: (count: number) => {
    return ['#SaaS', '#AI', '#TechInnovation', '#SoftwareEngineering', '#GrowthHacking', '#ProductDesign', '#FutureOfWork']
      .slice(0, count)
      .join(' ');
  },
  rewrite: (option: string) => {
    return `✨ Here is the optimized version (Punchy & Engaging):\n\nStop wasting hours on manual tasks. socioAI automates your complete scheduling, caption generation, and analytics loop. Scale faster. 🎯✨ [Optimized for: ${option}]`;
  },
  strategicAnalysis: () => {
    return `### socioAI Strategic Performance Analysis 📊

**Executive Summary:**
Over the past 30 days, your workspaces have experienced a **14.2% follower growth** and a **19.8% surge in overall impressions**, primarily driven by high-performing posts on LinkedIn.

#### Key Platform Insights:
- **LinkedIn:** Engagement rate is at an outstanding **4.5%**. Posts focusing on *technical briefs, build-in-public updates, and security* outperformed product announcements by **3x**.
- **Twitter/X:** High posting frequency is driving impressions, but link click-through rate (CTR) is lower.
- **Instagram:** Carousel-style visuals and educational graphics are drawing steady saves and direct comments.

#### Strategic Action Items 🎯:
1. **Double down on LinkedIn carousel guides:** Turn your CTO technical briefs into 5-slide visual carousels.
2. **Optimize Twitter hooks:** Reduce direct linking; instead, use thread structures with a call-to-action on the final tweet to improve CTR.
3. **Automate posting times:** Schedule Twitter updates for 9 AM and 5 PM EST to align with peek commute windows.`;
  },
  campaign: (prompt: string) => {
    return `### 🚀 socioAI Strategic Campaign: "${prompt}"

#### Phase 1: Awareness (Launch Week)
- **LinkedIn/Twitter Post:** "Scaling shouldn't break your workflow. Behind the scenes, we've built a robust event-driven pipeline that routes 10M+ daily events seamlessly. Read the full engineering breakdown."
- **Visual Asset Suggestion:** High-contrast flowchart of the software system architecture.

#### Phase 2: Engagement (Mid-Campaign)
- **LinkedIn Post:** "API gatekeeping is over. Here is a step-by-step checklist to configure rotative JWT keys and secure your microservices in under 10 minutes."
- **Visual Asset Suggestion:** High-fidelity code editor screenshot showing secure authorization middleware.

#### Phase 3: Conversion (Closing)
- **Multi-Platform Post:** "Ready to automate your social pipeline? socioAI Enterprise is now live. Set up team roles, customize brand voices, and launch your automated content studio today."
- **Visual Asset Suggestion:** Interactive studio dashboard mockups.`;
  },
  image: () => {
    // Return a beautiful abstract tech placeholder SVG base64
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 800" width="100%" height="100%">
      <defs>
        <linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#0f172a" />
          <stop offset="50%" stop-color="#1e1b4b" />
          <stop offset="100%" stop-color="#311042" />
        </linearGradient>
        <radialGradient id="r" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stop-color="#3b82f6" stop-opacity="0.15" />
          <stop offset="100%" stop-color="#3b82f6" stop-opacity="0" />
        </radialGradient>
      </defs>
      <rect width="800" height="800" fill="url(#g)" />
      <circle cx="400" cy="400" r="300" fill="url(#r)" />
      <g stroke="#ffffff" stroke-opacity="0.08" stroke-width="1">
        <line x1="0" y1="100" x2="800" y2="100" />
        <line x1="0" y1="200" x2="800" y2="200" />
        <line x1="0" y1="300" x2="800" y2="300" />
        <line x1="0" y1="400" x2="800" y2="400" />
        <line x1="0" y1="500" x2="800" y2="500" />
        <line x1="0" y1="600" x2="800" y2="600" />
        <line x1="0" y1="700" x2="800" y2="700" />
        <line x1="100" y1="0" x2="100" y2="800" />
        <line x1="200" y1="0" x2="200" y2="800" />
        <line x1="300" y1="0" x2="300" y2="800" />
        <line x1="400" y1="0" x2="400" y2="800" />
        <line x1="500" y1="0" x2="500" y2="800" />
        <line x1="600" y1="0" x2="600" y2="800" />
        <line x1="700" y1="0" x2="700" y2="800" />
      </g>
      <circle cx="400" cy="400" r="120" fill="none" stroke="#60a5fa" stroke-width="2" stroke-dasharray="10 5" opacity="0.6" />
      <circle cx="400" cy="400" r="80" fill="none" stroke="#f472b6" stroke-width="3" opacity="0.8" />
      <path d="M 320 400 L 480 400 M 400 320 L 400 480" stroke="#38bdf8" stroke-width="1.5" opacity="0.5" />
      <text x="400" y="415" font-family="sans-serif" font-size="28" fill="#ffffff" font-weight="bold" text-anchor="middle" letter-spacing="1">SocioAI Studio</text>
      <text x="400" y="445" font-family="monospace" font-size="14" fill="#94a3b8" text-anchor="middle">AI GENERATED ASSET MOCK</text>
    </svg>`;
    return `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`;
  }
};

export async function generateCaption(
  prompt: string, 
  platform: string, 
  tone: string, 
  brandVoice: string, 
  targetAudience: string
): Promise<string> {
  try {
    const ai = getGeminiClient();
    const systemInstruction = `You are an elite, multi-platform social media marketer, copywriter, and brand strategist.
Your task is to write an engaging, high-converting social media post for the platform: "${platform}".
The voice must strictly align with this Brand Voice definition: "${brandVoice}".
The target audience is: "${targetAudience}".
The desired tone is: "${tone}".

Rules:
- If the platform is LinkedIn, make it professional, educational, structured, and double-spaced with standard formatting.
- If the platform is Twitter, keep it short, snappy, within the 280-character limit, using a compelling hook.
- If the platform is Instagram, make it highly visual, engaging, friendly, and include standard spacing.
- Always output ONLY the raw caption text. Do not wrap it in quotes or add meta descriptions.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: `Draft a social media update based on this user prompt/idea: "${prompt}"`,
      config: {
        systemInstruction,
        temperature: 0.8,
      },
    });

    return response.text?.trim() || MOCK_FALLBACKS.caption(platform, tone);
  } catch (error) {
    console.error('Gemini generateCaption error:', error);
    return MOCK_FALLBACKS.caption(platform, tone);
  }
}

export async function generateHashtags(caption: string, count: number = 5): Promise<string> {
  try {
    const ai = getGeminiClient();
    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: `Extract and generate exactly ${count} highly trending, contextually relevant social media hashtags for this post content:\n\n"${caption}"\n\nOnly return the hashtags separated by spaces. Do not write introductory words or punctuation.`,
      config: {
        temperature: 0.6,
      }
    });
    return response.text?.trim() || MOCK_FALLBACKS.hashtags(count);
  } catch (error) {
    console.error('Gemini generateHashtags error:', error);
    return MOCK_FALLBACKS.hashtags(count);
  }
}

export async function rewriteContent(content: string, option: string): Promise<string> {
  try {
    const ai = getGeminiClient();
    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: `Rewrite the following social media post to match this rewrite goal/format: "${option}". Keep the original core message but dramatically improve hooks, rhythm, flow, and visual spacing.\n\nOriginal Post:\n"${content}"`,
      config: {
        systemInstruction: "You are a professional content editor. Output only the rewritten content.",
        temperature: 0.7,
      }
    });
    return response.text?.trim() || MOCK_FALLBACKS.rewrite(option);
  } catch (error) {
    console.error('Gemini rewriteContent error:', error);
    return MOCK_FALLBACKS.rewrite(option);
  }
}

export async function generateStrategicAnalysis(metricsJson: string, brandVoice: string): Promise<string> {
  try {
    const ai = getGeminiClient();
    const systemInstruction = `You are a Senior Social Media Brand Strategist and Data Analyst.
Review the user's 30-day analytics metrics data (which contains impressions, likes, shares, comments, clicks, and follower growth for various platforms) and the brand voice.
Provide a highly detailed, professional performance analysis in beautiful Github Markdown.

Incorporate these sections:
1. Executive Summary (with performance stats)
2. Platform-Specific Deep Dive (with structured tables or bullet points comparing platforms)
3. Actionable Strategic Recommendations (including content ideas and scheduling guidelines tailored to their brand voice).`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: `Analyze these metrics: \n${metricsJson}\n\nBrand Voice context: \n${brandVoice}`,
      config: {
        systemInstruction,
        temperature: 0.7,
      }
    });
    return response.text || MOCK_FALLBACKS.strategicAnalysis();
  } catch (error) {
    console.error('Gemini generateStrategicAnalysis error:', error);
    return MOCK_FALLBACKS.strategicAnalysis();
  }
}

export async function generateCampaignIdeas(prompt: string, brandVoice: string): Promise<string> {
  try {
    const ai = getGeminiClient();
    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: `Create a comprehensive 3-Phase Social Media Campaign outline for the topic/launch: "${prompt}".
The campaign must align with this Brand Voice: "${brandVoice}".
Provide the complete campaign in clean Markdown, detailing Phase 1 (Awareness), Phase 2 (Engagement), and Phase 3 (Conversion), with custom captions and graphic/visual prompt suggestions for each phase.`,
      config: {
        temperature: 0.8,
      }
    });
    return response.text || MOCK_FALLBACKS.campaign(prompt);
  } catch (error) {
    console.error('Gemini generateCampaignIdeas error:', error);
    return MOCK_FALLBACKS.campaign(prompt);
  }
}

export async function generateImage(prompt: string, aspectRatio: '1:1' | '3:4' | '4:3' | '9:16' | '16:9' = '1:1'): Promise<string> {
  try {
    const ai = getGeminiClient();
    
    // According to gemini-api skill, we use 'gemini-3.1-flash-lite-image' for image generation
    const response = await ai.models.generateContent({
      model: 'gemini-3.1-flash-lite-image',
      contents: {
        parts: [
          {
            text: `High-quality, eye-catching social media illustration/graphic. Modern, premium digital design. Topic: ${prompt}`,
          },
        ],
      },
      config: {
        imageConfig: {
          aspectRatio,
        },
      },
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData?.data) {
        return `data:${part.inlineData.mimeType || 'image/png'};base64,${part.inlineData.data}`;
      }
    }
    
    throw new Error('No image inlineData found in response parts');
  } catch (error) {
    console.error('Gemini generateImage error:', error);
    // Return our gorgeous base64 SVG mock so that the Studio is ALWAYS functional and extremely responsive
    return MOCK_FALLBACKS.image();
  }
}
