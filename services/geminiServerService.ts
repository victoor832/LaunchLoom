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

  // Balanced prompts: concise but comprehensive
  const prompt = isPro 
    ? `Launch strategy for ${formData.productName} targeting ${formData.targetAudience}, launching in ${daysUntilLaunch} days. Return valid JSON only, no markdown:
{
  "executiveSummary": "3-4 sentences on why launch now and 90-day vision",
  "targetMarketAnalysis": "3 sentences on TAM and customer pain points",  
  "positioning": "2 sentences on differentiation and value",
  "emailSequence": [{"subject": "Awareness", "body": "2-3 sentences hook"}, {"subject": "Features", "body": "2-3 sentences benefit"}, {"subject": "Social Proof", "body": "2-3 sentences credibility"}, {"subject": "CTA", "body": "2-3 sentences action"}],
  "launch5DayPlan": [{"day": "Day 1", "actions": "pre-launch prep"}, {"day": "Day 2", "actions": "content setup"}, {"day": "Day 3", "actions": "audience warmup"}, {"day": "Day 4", "actions": "final checklist"}, {"day": "Day 5", "actions": "go live sequence"}],
  "successMetrics": ["Signups/Early Access", "Email Open Rate", "Social Engagement", "Launch Day Conversions"]
}`
    : `Launch strategy for ${formData.productName} targeting ${formData.targetAudience}, launching in ${daysUntilLaunch} days. Return valid JSON only, no markdown:
{
  "executiveSummary": "3 sentences on why, audience, vision",
  "targetMarket": "2-3 sentences on TAM and needs",
  "emailSequence": [{"subject": "Awareness", "body": "2 sentences hook"}, {"subject": "Features", "body": "2 sentences benefit"}, {"subject": "CTA", "body": "2 sentences action"}],
  "launch5DayPlan": [{"day": "Day 1", "actions": "prep"}, {"day": "Day 2", "actions": "setup"}, {"day": "Day 3", "actions": "warmup"}, {"day": "Day 4", "actions": "final"}, {"day": "Day 5", "actions": "launch"}],
  "keyMetrics": ["Signups", "Engagement", "Conversions"]
}`;

  try {
    console.log('[Gemini] Generating launch plan...');
    
    // Add 50-second timeout to prevent Istio timeout (60s) and give buffer
    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('Gemini API request timeout after 50 seconds')), 50000)
    );

    const responsePromise = genAI.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
    });

    const result = await Promise.race([responsePromise, timeoutPromise]) as any;

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
      console.error('[Gemini] ⚠️  QUOTA EXCEEDED - Free tier limit reached (20 requests/day)');
      throw new Error('Gemini API quota exceeded. Free tier allows only 20 requests per day. Please upgrade to a paid plan at https://ai.google.dev/pricing');
    }

    // Check if it's a timeout
    if (errorMsg.includes('timeout')) {
      console.error('[Gemini] ⚠️  Timeout - API took too long');
      throw new Error('Gemini API request timed out. Please try again in a moment.');
    }
    
    throw new Error(`Gemini API error: ${errorMsg}`);
  }
};
