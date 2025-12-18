import { PersonalizationFormData } from '../types';
import { GoogleGenAI, Type, Schema } from '@google/genai';

const API_KEY = (import.meta as any).env.VITE_GEMINI_API_KEY || '';
const ai = new GoogleGenAI({ apiKey: API_KEY });

/**
 * Helper function to calculate days until launch
 */
export const calculateDaysUntilLaunch = (launchDate: string): number => {
  const launch = new Date(launchDate);
  const today = new Date();
  const diffTime = launch.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return Math.max(1, diffDays);
};

/**
 * Generate personalized launch plan using Gemini API
 * For STANDARD tier ($9)
 */
export const generateStandardLaunchPlan = async (
  formData: PersonalizationFormData
): Promise<any> => {
  const daysUntilLaunch = calculateDaysUntilLaunch(formData.launchDate);

  const responseSchema: Schema = {
    type: Type.OBJECT,
    properties: {
      executiveSummary: { type: Type.STRING },
      timeline: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            day: { type: Type.INTEGER },
            task: { type: Type.STRING },
            why: { type: Type.STRING },
            time: { type: Type.STRING },
            phase: { type: Type.STRING },
          },
          required: ['day', 'task', 'why', 'time', 'phase'],
        },
      },
      emailTemplates: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING },
            subject: { type: Type.STRING },
            purpose: { type: Type.STRING },
            body: { type: Type.STRING },
          },
          required: ['name', 'subject', 'purpose', 'body'],
        },
      },
      tweetTemplates: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            content: { type: Type.STRING },
            type: { type: Type.STRING },
          },
          required: ['content', 'type'],
        },
      },
      successMetrics: {
        type: Type.ARRAY,
        items: { type: Type.STRING },
      },
    },
    required: ['executiveSummary', 'timeline', 'emailTemplates', 'tweetTemplates', 'successMetrics'],
  };

  const prompt = `You are a SaaS launch strategist expert.

CONTEXT:
- Product: ${formData.productName}
- Target Audience: ${formData.targetAudience}
- Launch Date: ${formData.launchDate}
- Current Stage: ${formData.currentUsers}
- Days until launch: ${daysUntilLaunch}

TASK: Generate a personalized 30-day SaaS launch checklist for ${formData.productName}.

REQUIREMENTS:
1. Create a day-by-day timeline for ${daysUntilLaunch} days
2. Each day must have:
   - Task name (specific action)
   - Why it matters
   - Time estimate (15 min, 1 hour, etc)
   - Phase (Foundation/Marketing/Launch)

3. Create 5 email templates with:
   - Template name
   - Subject line
   - Purpose
   - Body copy (150-200 words)

4. Create 5 tweet templates with:
   - Tweet content (280 chars max)
   - Type (announcement/teaser/social-proof/fomo/educational)

5. Include success metrics

Make it specific to ${formData.targetAudience} and ${formData.productName}.
Be direct and actionable, not generic.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: responseSchema,
      },
    });

    const text = response.text;
    if (!text) throw new Error('No response from Gemini');

    return JSON.parse(text);
  } catch (error) {
    console.error('Error generating launch plan:', error);
    throw error;
  }
};

/**
 * Generate comprehensive launch strategy using Gemini API
 * For PRO+ tier ($15)
 */
export const generateProLaunchStrategy = async (
  formData: PersonalizationFormData & {
    currentTraction?: string;
    budget?: string;
    distributionChannels?: string[];
  }
): Promise<any> => {
  const daysUntilLaunch = calculateDaysUntilLaunch(formData.launchDate);

  const prompt = `You are a world-class SaaS growth strategist.

CONTEXT:
- Product: ${formData.productName}
- Target: ${formData.targetAudience}
- Launch Date: ${formData.launchDate} (${daysUntilLaunch} days away)
- Stage: ${formData.currentUsers}
- Traction: ${(formData as any).currentTraction || 'Unknown'}
- Budget: ${(formData as any).budget || 'Unknown'}
- Channels: ${((formData as any).distributionChannels || []).join(', ') || 'All'}

TASK: Generate a comprehensive, multi-channel SaaS launch strategy for ${formData.productName}.

Create a complete launch plan with:
1. 30-day timeline with detailed, actionable tasks (${daysUntilLaunch} days)
2. 15 complete email sequences (pre-launch, launch day, post-launch) with FULL copy
3. 30+ social media posts ready to publish (specific to ${formData.targetAudience})
4. Product Hunt strategy and description
5. Partnership opportunities with outreach templates
6. Press strategy with press release
7. Analytics and success metrics framework
8. Risk mitigation plan

Make every email, tweet, and tactic READY TO USE.
Include specific copy, not templates.
Focus on ${formData.targetAudience} audience.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const text = response.text;
    if (!text) throw new Error('No response from Gemini');

    // Parse JSON from response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('Could not parse JSON response');

    return JSON.parse(jsonMatch[0]);
  } catch (error) {
    console.error('Error generating strategy:', error);
    throw error;
  }
};
