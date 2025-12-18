import { GoogleGenAI } from "@google/genai";
import { StandardFormData, ProFormData } from '../types';

// Only use in browser/client-side - Vite will inject this
const apiKey = import.meta.env.VITE_GEMINI_API_KEY || '';

const genAI = new GoogleGenAI({ apiKey });

type FormData = StandardFormData | ProFormData;

const isProFormData = (data: FormData): data is ProFormData => {
  return 'currentTraction' in data && 'budget' in data;
};

/**
 * Generate HTML Content from Gemini for Standard/Pro PDFs
 * Returns professionally formatted HTML ready for html2pdf.js conversion
 */
export const generateLaunchPlan = async (
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

  // Build comprehensive prompt for Gemini
  const prompt = `You are a professional SaaS launch strategist. Generate COMPLETE, ACTIONABLE HTML for a ${daysUntilLaunch}-day launch checklist.

CRITICAL REQUIREMENTS:
✓ Return VALID HTML5 with embedded CSS ONLY
✓ ALL email copy is COMPLETE (subject + body, ready to send)
✓ ALL tweets are EXACT (under 280 chars, ready to post)
✓ NO [brackets] or placeholders anywhere
✓ Specific numbers: "50 people", not "around 50"
✓ Specific dates: "Day 3", not "soon"
✓ Every task has: WHY explained + HOW to execute + SUCCESS checkpoint
✓ Professional formatting with color (#0D7F89 teal, #CC6600 orange)
✓ Use emojis for visual hierarchy (✓, 🎯, ⏱️, 📊, etc.)

PRODUCT INFORMATION:
- Product Name: ${formData.productName}
- Target Audience: ${formData.targetAudience}
- Current Users: ${formData.currentUsers}
- Launch Date: ${formData.launchDate}
- Days to Launch: ${daysUntilLaunch}
${isPro ? `- Current Traction: ${proData?.currentTraction}
- Budget: $${proData?.budget}
- Main Competitor: ${proData?.mainCompetitor}
- Marketing Channels: ${channels}` : ''}

DOCUMENT STRUCTURE (HTML):

1. COVER PAGE
   - Title: "🚀 ${formData.productName} - 30-DAY LAUNCH PLAYBOOK"
   - Product, audience, launch date, tier, generated date
   - Tagline: "Follow EXACTLY. Update daily. Celebrate progress."

2. QUICK START (Days 1-5) - MOST CRITICAL
   - Day 1: Build warm email list (30 min)
   - Day 2: Send warm-up messages (60 min)
   - Day 3: Create landing page (2 hours)
   - Day 4: Write 5 tweets (60 min)
   - Day 5: Collect first feedback (90 min)
   
   For EACH day include:
   - ⏱️ Time needed
   - 💪 Difficulty level
   - ❓ Why this matters (1 sentence)
   - ✅ ACTION STEPS (numbered, specific)
   - 📋 COPY TO USE (if applicable - exact template)
   - ✓ CHECKPOINT (yes/no validation)
   - ✨ SUCCESS (measurable outcome)

3. PHASES (Days 6-${isPro ? '30' : '25'})
   - PHASE 1: Validation & Content (Days 6-12)
   - PHASE 2: Launch Prep (Days 13-20)
   - PHASE 3: Launch & Scale (Days 21-${isPro ? '30' : '25'})
   ${isPro ? '- PHASE 4: Scale & Optimize (Days 26-30)' : ''}
   
   For EACH phase:
   - 3-4 specific tasks
   - Day range, time estimate, why it matters
   - Exact action steps
   - Success metrics (specific numbers)

4. EMAIL TEMPLATES (${tier === 'standard' ? '8' : '12'} emails)
   Format for EACH email:
   - EMAIL [N]: [PURPOSE]
   - Send: Day [X]
   - Subject: "[EXACT subject line ready to use]"
   - Body: "[COMPLETE email, 150-200 words, ready to copy/paste]"
   - Goal: [Expected metric like "40% open rate"]

5. TWEET TEMPLATES (${tier === 'standard' ? '15' : '25'} tweets)
   - Under 280 characters EXACTLY
   - Ready to post immediately
   - Mix topics: problem, solution, social proof, urgency
   - Format: "[Complete tweet]" + Purpose/explanation

6. PRODUCT HUNT STRATEGY
   - Perfect 1-line tagline
   - 150-word description (ready to copy)
   - Hour-by-hour launch day schedule
   - Exact timing + copy for each action
   - 3 PH updates with specific timestamps and content

7. SUCCESS METRICS & CHECKPOINTS
   - Day 7 targets (specific numbers)
   - Day 14 targets (specific numbers)
   - Day 21 targets (specific numbers)
   - Day 25/30 targets (specific numbers)

${isPro ? `8. PRO TIER: CALL NOTES & EXTRAS
   - Your Perfect Positioning (1 sentence)
   - Unfair Advantage (specific competitive advantage)
   - Top 10 Power Users to contact (name, why, contact script)
   - Launch Day Script (hour-by-hour exact actions)
   - PRESS LIST: 20 journalists
     * Name, publication, email
     * Angle (why they care)
     * Exact pitch email (ready to send)
   - Post-Launch Roadmap
` : ''}

HTML FORMATTING RULES:
- Use <html><head><style>...</style></head><body>...</body></html>
- Colors: Teal #0D7F89 (headers), Orange #CC6600 (emphasis), Dark Gray #1F2937 (text)
- Page breaks: <div style="page-break-after: always;"></div>
- Margins: 20px all sides
- Font: 'Segoe UI', Arial, sans-serif
- Heading sizes: h1 28px, h2 20px, h3 16px
- Body text: 14px, line-height 1.6
- Use tables for structured data
- Use boxes/backgrounds for important sections

VALIDATION CHECKLIST:
✓ All ${tier === 'standard' ? '8' : '12'} emails have COMPLETE subject + body
✓ All ${tier === 'standard' ? '15' : '25'} tweets are under 280 characters
✓ NO [brackets] or placeholders anywhere
✓ Numbers are SPECIFIC ("50 people", "Day 3", "$29")
✓ Every task explains WHY before HOW
✓ Every task has a success checkpoint
✓ All copy is ready to copy/paste
✓ Valid HTML with no syntax errors
✓ Professional formatting with colors and emojis
✓ Page count target: ${tier === 'standard' ? '14-18' : '25-30'} pages

START GENERATING THE HTML NOW. Return ONLY the HTML content.`;

  console.log(`[Gemini] Generating ${tier} tier launch plan`);
  console.log(`[Gemini] Product: ${formData.productName}, Days: ${daysUntilLaunch}`);

  try {
    const response = await genAI.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [
        {
          role: 'user',
          parts: [{ text: prompt }]
        }
      ],
      config: {
        temperature: 0.7,
        topK: 40,
        topP: 0.9,
        maxOutputTokens: 16000
      }
    });

    const responseText = response.text;

    console.log(`[Gemini] Response received: ${responseText?.length || 0} characters`);

    if (!responseText || responseText.trim().length === 0) {
      throw new Error(`Empty response from Gemini for ${tier} tier`);
    }

    // Extract HTML if present, otherwise wrap in basic HTML
    const htmlContent = responseText.includes('<html')
      ? responseText
      : `<html><head><meta charset="UTF-8"><style>
body { font-family: 'Segoe UI', Arial, sans-serif; color: #1F2937; line-height: 1.6; }
h1, h2, h3 { color: #0D7F89; }
.section { margin: 20px 0; padding: 15px; border-left: 4px solid #CC6600; }
</style></head><body>${responseText}</body></html>`;

    console.log(`[Gemini] ${tier} tier content generated successfully`);
    return htmlContent;
  } catch (error) {
    console.error(`[Gemini] Error generating ${tier} content:`, error);
    throw new Error(
      `Failed to generate ${tier} launch plan: ${error instanceof Error ? error.message : String(error)}`
    );
  }
};

