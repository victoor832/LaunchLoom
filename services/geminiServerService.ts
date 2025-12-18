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
    ? `You are a launch strategist. Generate a CONCISE PRO+ launch playbook in JSON format. Keep content practical and actionable.

PRODUCT: ${formData.productName} | AUDIENCE: ${formData.targetAudience} | DAYS: ${daysUntilLaunch} | BUDGET: ${proData?.budget}
CHANNELS: ${channels} | COMPETITOR: ${proData?.mainCompetitor || 'auto-detect'}

Generate JSON with:
- Executive Summary (2-3 paragraphs)
- Competitor Analysis (vs 2-3 real competitors)
- Budget Breakdown (with allocations)
- 10 email sequences
- 20 Twitter posts
- 10 LinkedIn posts
- 7-day action plan
- Product Hunt strategy
- Success Metrics

Return valid JSON with all fields populated.`
    : `You are a launch strategist. Generate a CONCISE STANDARD launch playbook in JSON format.

PRODUCT: ${formData.productName} | AUDIENCE: ${formData.targetAudience} | DAYS: ${daysUntilLaunch}

Generate JSON with:
- Executive Summary
- Go-to-Market Strategy
- 5 email templates
- 15 social media posts
- 7-day timeline
- Success Metrics

Return valid JSON with all fields populated.`;

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
