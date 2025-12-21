import { OpenRouter } from "@openrouter/sdk";
import type { StandardFormData, ProFormData } from '../types';

// Get API key from environment
const apiKey = process.env.VITE_OPENROUTER_API_KEY || process.env.OPENROUTER_API_KEY || '';

if (!apiKey) {
  console.warn('⚠️ WARNING: OPENROUTER_API_KEY is not set. Mistral API calls will fail.');
}

const openrouter = new OpenRouter({ apiKey });

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

  // Optimized prompts for Mistral: full content but concise instructions
  const prompt = isPro 
    ? `Generate PRO tier launch playbook JSON for: ${formData.productName}, Target: ${formData.targetAudience}, Days until launch: ${daysUntilLaunch}

Return ONLY valid JSON, no markdown or explanation:
{
  "executiveSummary": "Write 3-4 sentences: why launch now, target market opportunity, competitive advantage, 90-day vision",
  "targetMarketAnalysis": "Write 3 sentences analyzing TAM, pain points, buying signals",
  "positioning": "Write 2 sentences on value prop and differentiation",
  "emailSequence": [
    {"subject": "Pre-launch awareness hook", "body": "3-4 sentences hook copy"},
    {"subject": "Feature benefit", "body": "3-4 sentences benefit copy"},
    {"subject": "Social proof", "body": "3-4 sentences credibility copy"},
    {"subject": "Strong CTA", "body": "3-4 sentences urgency and call-to-action"}
  ],
  "launch5DayPlan": [
    {"day": "Day 1 (5 days before)", "actions": "List 3-4 specific pre-launch actions"},
    {"day": "Day 2 (4 days before)", "actions": "List 3-4 specific actions"},
    {"day": "Day 3 (3 days before)", "actions": "List 3-4 specific actions"},
    {"day": "Day 4 (2 days before)", "actions": "List 3-4 specific actions"},
    {"day": "Day 5 (Launch day)", "actions": "List 3-4 launch day actions"}
  ],
  "successMetrics": ["Metric 1 with success threshold", "Metric 2 with success threshold", "Metric 3 with success threshold", "Metric 4 with success threshold"]
}`
    : `Generate STANDARD tier launch playbook JSON for: ${formData.productName}, Target: ${formData.targetAudience}, Days until launch: ${daysUntilLaunch}

Return ONLY valid JSON, no markdown or explanation:
{
  "executiveSummary": "Write 3 sentences: why launch now, target customer, success vision",
  "targetMarket": "Write 2-3 sentences on TAM, pain points, buying signals",
  "emailSequence": [
    {"subject": "Awareness hook", "body": "2-3 sentences hook"},
    {"subject": "Feature benefit", "body": "2-3 sentences benefit"},
    {"subject": "CTA", "body": "2-3 sentences action"}
  ],
  "launch5DayPlan": [
    {"day": "Day 1 (5 days before)", "actions": "2-3 actions"},
    {"day": "Day 2 (4 days before)", "actions": "2-3 actions"},
    {"day": "Day 3 (3 days before)", "actions": "2-3 actions"},
    {"day": "Day 4 (2 days before)", "actions": "2-3 actions"},
    {"day": "Day 5 (Launch)", "actions": "2-3 launch actions"}
  ],
  "keyMetrics": ["Metric 1 with target", "Metric 2 with target", "Metric 3 with target"]
}`;

  try {
    console.log('[Mistral] Generating launch plan...');
    
    // Add 50-second timeout to prevent Istio timeout (60s) and give buffer
    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('Mistral API request timeout after 50 seconds')), 50000)
    );

    const responsePromise = openrouter.chat.send({
      model: 'mistralai/devstral-2512:free',
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ]
    });

    const result = await Promise.race([responsePromise, timeoutPromise]) as any;

    // Extract content from streaming response
    let content = '';
    for await (const chunk of result) {
      const chunkContent = chunk.choices?.[0]?.delta?.content;
      if (chunkContent) {
        content += chunkContent;
      }
    }
    
    if (!content) {
      throw new Error('No content generated from Mistral API');
    }
    
    try {
      const jsonStart = content.indexOf('{');
      const jsonEnd = content.lastIndexOf('}');
      if (jsonStart !== -1 && jsonEnd !== -1) {
        const jsonStr = content.substring(jsonStart, jsonEnd + 1);
        JSON.parse(jsonStr);
        console.log('[Mistral] Content generated successfully (JSON format)');
        return jsonStr;
      }
    } catch (parseError) {
      console.warn('[Mistral] Failed to extract JSON, returning raw content');
    }
    
    return content;
  } catch (error) {
    console.error('[Mistral] Error generating content:', error);
    
    const errorMsg = error instanceof Error ? error.message : String(error);
    
    // Check if it's a rate limit error
    if (errorMsg.includes('429') || errorMsg.includes('rate limit')) {
      console.error('[Mistral] ⚠️  Rate limit exceeded');
      throw new Error('Mistral API rate limit exceeded. Please try again in a moment.');
    }

    // Check if it's a timeout
    if (errorMsg.includes('timeout')) {
      console.error('[Mistral] ⚠️  Timeout - API took too long');
      throw new Error('Mistral API request timed out. Please try again in a moment.');
    }
    
    throw new Error(`Mistral API error: ${errorMsg}`);
  }
};
