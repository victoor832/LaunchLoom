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
    ? `You are a world-class SaaS launch strategist. Generate a PRO+ TIER launch playbook in VALID JSON format.

PRODUCT INFORMATION:
- Name: ${formData.productName}
- Target Audience: ${formData.targetAudience}
- Days Until Launch: ${daysUntilLaunch}
- Budget: ${proData?.budget}
- Channels: ${channels}
- Competitor: ${proData?.mainCompetitor || 'auto-detect'}

Generate comprehensive PRO+ content:
- Executive Summary (tailored to their market position)
- Competitor Analysis
- Budget Breakdown
- 12 personalized email sequences
- 30 Twitter posts optimized for ${channels}
- 10 LinkedIn posts
- Product Hunt strategy
- 30-day daily timeline
- Success metrics

Return ONLY valid JSON with ALL fields populated. No markdown, no explanation.`
    : `You are a professional SaaS launch strategist. Generate a STANDARD TIER launch playbook in VALID JSON format.

PRODUCT INFORMATION:
- Name: ${formData.productName}
- Target Audience: ${formData.targetAudience}
- Days Until Launch: ${daysUntilLaunch}

Generate comprehensive STANDARD content:
- Executive Summary
- Go-to-Market Strategy (top 3 channels)
- 10 email templates (copy/paste ready)
- 25 Twitter posts (full month coverage)
- 8 LinkedIn posts (professional)
- 7-day action timeline
- Success metrics

Return ONLY valid JSON with ALL fields populated. No markdown, no explanation.`;

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
