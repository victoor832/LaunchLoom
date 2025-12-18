import { GoogleGenAI } from "@google/genai";
import { StandardFormData, ProFormData } from '../types';

const apiKey = process.env.VITE_GEMINI_API_KEY || '';

if (!apiKey) {
  console.warn('⚠️ WARNING: VITE_GEMINI_API_KEY is not set in .env file');
}

const genAI = new GoogleGenAI({ apiKey });

type FormData = StandardFormData | ProFormData;

const isProFormData = (data: FormData): data is ProFormData => {
  return 'currentTraction' in data && 'budget' in data;
};

export const generateLaunchPlanServer = async (
  formData: FormData,
  tier: 'standard' | 'pro'
): Promise<string> => {
  const launchDate = new Date(formData.launchDate);
  const today = new Date();
  const daysUntilLaunch = Math.ceil(
    (launchDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
  );

  const isPro = tier === 'pro';
  const proData = isPro ? (formData as ProFormData) : null;
  const channels = isPro
    ? proData?.selectedChannels?.join(', ') || 'Twitter, Email, LinkedIn'
    : '';

  const prompt = isPro 
    ? `You are a world-class SaaS launch strategist. Generate a PRO+ TIER launch playbook in VALID JSON format.

PRODUCT INFORMATION:
- Name: ${formData.productName}
- Target Audience: ${formData.targetAudience}
- Product Description: ${proData?.productDescription}
- Current Traction: ${proData?.currentTraction}
- Launch Budget: ${proData?.budget}
- Channels: ${channels}
- Product Hunt Experience: ${proData?.hasProductHuntExperience ? 'Yes' : 'No'}
- Days Until Launch: ${daysUntilLaunch}

COMPETITOR ANALYSIS INSTRUCTION:
- Provided Competitor: ${proData?.mainCompetitor || 'NOT PROVIDED - AUTO-DETECT'}
${!proData?.mainCompetitor ? `
IF NO COMPETITOR PROVIDED: Analyze the product description and identify 3-5 REAL, ACTUAL competitors in this market space. Use real company names, not fictional ones. These should be established competitors that actually exist and compete in this vertical.
` : `
Use the provided competitor as the main comparison point.
`}

Generate comprehensive PRO+ content including:
- Executive summary tailored to their traction and market position
- Competitor analysis vs the identified/provided competitor(s)
- Budget breakdown with specific allocations and expected ROI
- 15+ personalized email sequences based on their product
- 50+ Twitter posts optimized for ${channels}
- 15+ LinkedIn posts for thought leadership
- Channel-specific tactics and posting schedules
- Product Hunt strategy for ${proData?.hasProductHuntExperience ? 'experienced' : 'first-time'} users
- Multi-tier influencer strategy (Tier 1, Tier 2, Nano)
- Success metrics based on their traction level
- 30-day daily action items timeline

CRITICAL REQUIREMENTS:
- ALL values must be complete and specific (NO "undefined", NO null, NO incomplete fields)
- If a field is optional, provide reasonable inference based on product description
- Budget breakdown must show actual dollar amounts or ranges
- Competitor names must be REAL companies
- Timeline must show SPECIFIC actions for each day, not just day headers

Return ONLY valid JSON with ALL fields populated:
{
  "executiveSummary": "Personalized launch strategy for [product] targeting [audience]...",
  "competitorAnalysis": {
    "competitors": ["Company1", "Company2", "Company3"],
    "competitor1": {
      "name": "Real competitor name",
      "strengths": ["Strength 1", "Strength 2"],
      "weaknesses": ["Weakness 1", "Weakness 2"],
      "yourAdvantage": "How you differentiate"
    },
    "messagingFramework": "Your unique positioning against competitors"
  },
  "budgetBreakdown": {
    "totalBudget": "${proData?.budget || 'Infer reasonable range based on product scope'}",
    "emailMarketing": {"allocation": "15%", "tactics": ["Email sequences", "Nurturing campaigns"]},
    "paidAds": {"allocation": "35%", "tactics": ["Google Ads", "Social Ads"]},
    "influencers": {"allocation": "25%", "tactics": ["Tier 1 partnerships", "Nano-influencers"]},
    "content": {"allocation": "15%", "tactics": ["Blog posts", "Case studies"]},
    "other": {"allocation": "10%", "tactics": ["Tools", "Design", "Miscellaneous"]}
  },
  "emailSequences": [
    {"day": 1, "subject": "...", "body": "...", "tone": "..."},
    {"day": 3, "subject": "...", "body": "...", "tone": "..."}
  ],
  "twitterStrategy": {
    "voiceAndTone": "Your Twitter personality",
    "posts": [
      {"day": 1, "content": "Tweet 1", "theme": "Awareness"},
      {"day": 2, "content": "Tweet 2", "theme": "Problem/Solution"}
    ]
  },
  "linkedinStrategy": {
    "positioning": "Your LinkedIn positioning",
    "posts": [
      {"day": 1, "content": "LinkedIn post 1", "tone": "Professional"},
      {"day": 2, "content": "LinkedIn post 2", "tone": "Thought leadership"}
    ]
  },
  "channelSpecificTactics": {
    "twitter": {"frequency": "3x daily", "bestTimes": "9am, 12pm, 5pm", "tactics": ["Live threads", "Retweets", "Engagement"]},
    "email": {"frequency": "EOD daily", "segmentation": "By audience type", "tactics": ["Personalization", "CTAs"]},
    "linkedin": {"frequency": "1x daily", "contentTypes": ["Articles", "Updates", "Comments"], "tactics": ["Engagement", "Thought leadership"]},
    "productHunt": {"launchDay": "Day ${daysUntilLaunch}", "strategy": "Early voting, community engagement"}
  },
  "productHuntStrategy": {
    "launchDay": "Specific date",
    "timing": "Optimal launch time",
    "preparation": "Week before: Pre-notification, media outreach, team prep",
    "launchDay": "Hunter engagement, real-time responses, community interaction",
    "postLaunch": "Momentum maintenance, user feedback incorporation",
    "successChecklist": ["50 upvotes", "Top 5 ranking", "100+ comments"]
  },
  "influencerStrategy": {
    "tier1": [{"name": "Influencer name", "followers": "50K+", "pitch": "Specific angle", "expectedImpact": "Traffic metric"}],
    "tier2": [{"name": "Influencer name", "followers": "10K-50K", "pitch": "Specific angle"}],
    "nano": [{"name": "Niche expert", "followers": "<10K", "pitch": "Community-specific angle"}]
  },
  "timeline": [
    {"day": 1, "phase": "Pre-launch", "actions": ["Email 1 sent", "Twitter thread posted", "LinkedIn announcement"]},
    {"day": 2, "phase": "Early momentum", "actions": ["Follow-up emails", "Community engagement"]}
  ],
  "successMetrics": {
    "email": "Open rate: 35%, Click rate: 8%",
    "twitter": "Impressions: 50K+, Engagement: 5%",
    "linkedin": "Impressions: 20K+, Comments: 100+",
    "website": "Signups: 500+, Conversion: 15%"
  }
}`
    : `You are a professional SaaS launch strategist. Generate a STANDARD TIER launch playbook in VALID JSON format.

Product: ${formData.productName}
Audience: ${formData.targetAudience}
Days: ${daysUntilLaunch}

Generate comprehensive STANDARD content (30-35 pages):
- 12 complete email templates (copy/paste ready)
- 30 Twitter posts (full month coverage)
- 10 LinkedIn posts (professional)
- 5-6 blog post outlines with hooks
- Product Hunt strategy
- Influencer outreach templates
- Press release template
- 30-day timeline
- Success metrics

Return ONLY valid JSON:
{
  "emailTemplates": [{"subject": "Subject", "body": "Body"}],
  "twitterPosts": [],
  "linkedinPosts": [],
  "blogOutlines": [],
  "productHuntTemplate": {},
  "influencers": [],
  "pressReleaseTemplate": {},
  "timeline": [],
  "successMetrics": {}
}`;

  try {
    console.log('[Gemini] Generating launch plan...');
    const result = await genAI.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
    });

    const content = result.candidates?.[0]?.content?.parts?.[0]?.text || '';
    
    if (!content) {
      throw new Error('No content generated from Gemini API');
    }
    
    try {
      const jsonStart = content.indexOf('{');
      const jsonEnd = content.lastIndexOf('}');
      if (jsonStart !== -1 && jsonEnd !== -1) {
        const jsonStr = content.substring(jsonStart, jsonEnd + 1);
        JSON.parse(jsonStr);
        console.log('[Gemini] Content generated successfully (JSON format)');
        return jsonStr;
      }
    } catch (parseError) {
      console.warn('[Gemini] Failed to extract JSON, returning raw content');
    }
    
    return content;
  } catch (error) {
    console.error('[Gemini] Error generating content:', error);
    throw new Error(`Gemini API error: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};
