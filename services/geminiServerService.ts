import { GoogleGenAI } from "@google/genai";
import { StandardFormData, ProFormData } from '../types';

// En serverless, las variables están sin VITE_
const apiKey = process.env.VITE_GEMINI_API_KEY || process.env.GEMINI_API_KEY || '';

if (!apiKey) {
  console.warn('⚠️ WARNING: GEMINI_API_KEY is not set. Gemini API calls will fail.');
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
    ? `You are a world-class SaaS launch strategist. Generate a comprehensive PRO+ TIER launch playbook in VALID JSON format.

CRITICAL: Return ONLY valid JSON, no markdown, no code blocks, no explanation.

PRODUCT INFORMATION:
- Name: ${formData.productName}
- Target Audience: ${formData.targetAudience}
- Days Until Launch: ${daysUntilLaunch}
- Budget: ${proData?.budget}
- Channels: ${channels}
- Competitor: ${proData?.mainCompetitor || 'auto-detect'}

Generate PRO+ content with this EXACT JSON structure:
{
  "executiveSummary": "2-3 paragraph summary of launch strategy",
  "competitorAnalysis": ["Competitor 1 with strengths/weaknesses", "Competitor 2...", "Competitor 3..."],
  "budgetBreakdown": ["Ads: X%", "Content: Y%", "Tools: Z%"],
  "emailSequences": [
    "Subject: Welcome - Body: ...",
    "Subject: Feature highlight - Body: ...",
    "Subject: Social proof - Body: ...",
    "Subject: Urgency - Body: ...",
    "Subject: Re-engagement - Body: ...",
    "Subject: Final push - Body: ...",
    "Subject: Post-launch followup - Body: ...",
    "Subject: Case study - Body: ...",
    "Subject: Best practices - Body: ...",
    "Subject: Special offer - Body: ...",
    "Subject: Partnership - Body: ...",
    "Subject: Testimonial - Body: ..."
  ],
  "twitterPosts": ["Post 1", "Post 2", "Post 3", ...30 posts],
  "linkedInPosts": ["Post 1", "Post 2", "Post 3", ...10 posts],
  "productHuntStrategy": ["Preparation step 1", "Preparation step 2", "Day-of strategy", "Post-launch"],
  "dailyTimeline": ["Day 1: ...", "Day 2: ...", ...30 days],
  "successMetrics": ["Metric 1: Target X", "Metric 2: Target Y", "Metric 3: Target Z"]
}`
    : `You are a professional SaaS launch strategist. Generate a comprehensive STANDARD TIER launch playbook in VALID JSON format.

CRITICAL: Return ONLY valid JSON, no markdown, no code blocks, no explanation.

PRODUCT INFORMATION:
- Name: ${formData.productName}
- Target Audience: ${formData.targetAudience}
- Days Until Launch: ${daysUntilLaunch}

Generate STANDARD content with this EXACT JSON structure:
{
  "executiveSummary": "2-3 paragraph launch strategy overview",
  "goToMarketStrategy": ["Channel 1: Description", "Channel 2: Description", "Channel 3: Description"],
  "emailTemplates": [
    "Subject: Welcome to [Product] - Body: ...",
    "Subject: How [Product] works - Body: ...",
    "Subject: Customer success story - Body: ...",
    "Subject: Limited time offer - Body: ...",
    "Subject: Why [Competitor] users switch - Body: ...",
    "Subject: Your personalized demo - Body: ...",
    "Subject: Join [N] users - Body: ...",
    "Subject: Final launch day - Body: ...",
    "Subject: Thank you - Body: ...",
    "Subject: Next steps - Body: ..."
  ],
  "twitterPosts": ["Post 1", "Post 2", "Post 3", ...25 posts],
  "linkedInPosts": ["Post 1", "Post 2", "Post 3", ...8 posts],
  "actionTimeline": ["Day 1: ...", "Day 2: ...", "Day 3: ...", "Day 4: ...", "Day 5: ...", "Day 6: ...", "Day 7: ..."],
  "successMetrics": ["Users: X", "Signups: Y", "Revenue: Z"]
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
    
    const errorMsg = error instanceof Error ? error.message : String(error);
    
    // Check if it's a quota error
    if (errorMsg.includes('RESOURCE_EXHAUSTED') || errorMsg.includes('quota')) {
      console.error('[Gemini] ⚠️  QUOTA EXCEEDED - Free tier limit reached (20 requests/day). Please upgrade to a paid plan.');
      throw new Error('Gemini API quota exceeded. Free tier allows only 20 requests per day. Please upgrade to a paid plan at https://ai.google.dev/pricing');
    }
    
    throw new Error(`Gemini API error: ${errorMsg}`);
  }
};
