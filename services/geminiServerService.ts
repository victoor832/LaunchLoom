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
    ? `You are a launch strategist. Generate a PRO+ launch playbook in JSON format.

PRODUCT: ${formData.productName} | AUDIENCE: ${formData.targetAudience} | DAYS: ${daysUntilLaunch} | BUDGET: ${proData?.budget}
CHANNELS: ${channels}

Generate JSON with these EXACT keys:
{
  "executiveSummary": "...",
  "emailSequences": ["..."],
  "twitterPosts": ["..."],
  "linkedinPosts": ["..."],
  "timeline": ["..."],
  "successMetrics": "..."
}`
    : `You are a launch strategist. Generate a STANDARD launch playbook in JSON format.

PRODUCT: ${formData.productName} | AUDIENCE: ${formData.targetAudience} | DAYS: ${daysUntilLaunch}

Generate JSON with these EXACT keys:
{
  "summary": "...",
  "strategy": "...",
  "emails": ["...", "..."],
  "posts": ["...", "..."],
  "timeline": ["day 1: ...", "day 2: ..."],
  "metrics": "..."
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
