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
    ? `You are a SaaS launch strategist. Generate a COMPREHENSIVE PRO tier launch playbook.

PRODUCT: ${formData.productName}
AUDIENCE: ${formData.targetAudience}
LAUNCH: ${daysUntilLaunch} days away

CRITICAL REQUIREMENTS:
- Return ONLY valid JSON with NO markdown code blocks
- NO placeholders like "Post 1", "Email 1", etc
- EVERY field must have REAL, specific, detailed content
- Write 2-4 paragraphs for text fields (not just 1 sentence)
- For arrays, provide 6-10 actual items with substance
- Make content launch-ready and actionable

Generate JSON:
{
  "executiveSummary": "4 detailed paragraphs: 1) Why launch now, 2) Target market opportunity, 3) Key differentiators vs competitors, 4) 90-day success vision",
  "targetMarketAnalysis": "3 detailed paragraphs analyzing TAM, customer pain points, and buying signals",
  "competitorAnalysis": ["Competitor 1 name: Specific strengths (2-3 sentences)", "Competitor 2: Specific strengths", "How ${formData.productName} wins: 3-4 sentences"],
  "positioning": "3 paragraphs: 1) Value proposition, 2) Differentiation story, 3) Market positioning",
  "pricingStrategy": "2 paragraphs with specific pricing tiers, rationale, and positioning",
  "goToMarketChannels": ["Channel 1: Detailed strategy for reaching ${formData.targetAudience}", "Channel 2: Specific tactics", "Channel 3: Success metrics"],
  "emailSequence": ["Email 1 - Awareness (Subject, 3-4 sentences content)", "Email 2 - Feature showcase (Subject, 3-4 sentences)", "Email 3 - Social proof (Subject, 3-4 sentences)", "Email 4 - Urgency/CTA (Subject, 3-4 sentences)", "Email 5 - Post-signup (Subject, 3-4 sentences)", "Email 6 - Re-engagement (Subject, 3-4 sentences)"],
  "socialMediaStrategy": ["Twitter strategy with 8 specific launch posts (each 2-3 sentences)", "LinkedIn strategy with 4 thought leadership posts (each 2-3 sentences)", "TikTok/Instagram strategy if applicable"],
  "launchTimeline": ["Day 1 (5 days pre-launch): Specific actions", "Day 2: Specific actions", "Day 3: Specific actions", "Day 4: Specific actions", "Day 5 (Day of): Launch day sequence", "Day 6: Post-launch momentum"],
  "successMetrics": ["Metric 1 with target and tracking method", "Metric 2", "Metric 3", "Metric 4", "Metric 5"]
}`
    : `You are a SaaS launch strategist. Generate a STANDARD tier launch playbook.

PRODUCT: ${formData.productName}
AUDIENCE: ${formData.targetAudience}
LAUNCH: ${daysUntilLaunch} days away

CRITICAL REQUIREMENTS:
- Return ONLY valid JSON with NO markdown code blocks
- NO placeholders like "Post 1", "Email 1", etc
- EVERY field must have REAL, specific, detailed content
- Write 2-3 paragraphs for text fields
- For arrays, provide 4-6 actual items with substance
- Make content launch-ready and actionable

Generate JSON:
{
  "executiveSummary": "3 detailed paragraphs: 1) Why launch now, 2) Target customer, 3) Success vision",
  "targetMarket": "2 paragraphs with specific TAM, customer pain points, and buying signals",
  "productPositioning": "2 paragraphs on value proposition and differentiation",
  "pricePosition": "1 paragraph with pricing strategy and market positioning",
  "emailSequence": ["Email 1 - Hook (Subject, 2-3 sentences)", "Email 2 - Feature benefit (Subject, 2-3 sentences)", "Email 3 - Social proof (Subject, 2-3 sentences)", "Email 4 - CTA (Subject, 2-3 sentences)"],
  "socialContent": ["4 specific Twitter posts for launch (each 2 sentences)", "3 LinkedIn posts about the product (each 2 sentences)"],
  "launch5DayPlan": ["Day 1: Specific actions", "Day 2: Specific actions", "Day 3: Specific actions", "Day 4: Specific actions", "Day 5: Launch day"],
  "keyMetrics": ["Metric 1 with target", "Metric 2 with target", "Metric 3 with target"]
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
