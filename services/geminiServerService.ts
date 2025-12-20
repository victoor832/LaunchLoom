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
    ? `You are a SaaS launch strategist. Generate a PRO launch playbook.

PRODUCT: ${formData.productName}
AUDIENCE: ${formData.targetAudience}
LAUNCH: ${daysUntilLaunch} days away

CRITICAL: Return ONLY valid JSON with NO markdown code blocks. NO placeholders. Every field must have REAL, specific content.

Generate JSON with these fields (required):
{
  "executiveSummary": "2-3 paragraphs on launch strategy and market opportunity",
  "competitorAnalysis": ["Competitor 1 with specific advantages", "Competitor 2 with specific advantages"],
  "positioning": "1-2 paragraphs on unique value",
  "pricingStrategy": "1 paragraph on pricing approach",
  "emailSequences": ["Email 1: Subject and body", "Email 2: Subject and body", "Email 3: Subject and body", "Email 4: Subject and body"],
  "twitterContent": ["Tweet 1", "Tweet 2", "Tweet 3", "Tweet 4", "Tweet 5", "Tweet 6"],
  "linkedinContent": ["Post 1", "Post 2", "Post 3"],
  "launchSchedule": ["Day 1 action", "Day 2 action", "Day 3 action", "Day 4 action", "Day 5 action"],
  "metrics": ["Signup target", "Engagement target", "Conversion target"]
}`
    : `You are a SaaS launch strategist. Generate a STANDARD launch playbook.

PRODUCT: ${formData.productName}
AUDIENCE: ${formData.targetAudience}
LAUNCH: ${daysUntilLaunch} days away

CRITICAL: Return ONLY valid JSON with NO markdown code blocks. NO placeholders. Every field must have REAL, specific content.

Generate JSON with these fields (required):
{
  "executiveSummary": "1-2 paragraphs on launch strategy",
  "positioning": "1 paragraph on unique value",
  "emailSequences": ["Email 1: Subject and body", "Email 2: Subject and body"],
  "twitterContent": ["Tweet 1", "Tweet 2", "Tweet 3", "Tweet 4"],
  "linkedinContent": ["Post 1", "Post 2"],
  "launchSchedule": ["Day 1 action", "Day 2 action", "Day 3 action"],
  "metrics": ["Signup target", "Engagement target"]
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
