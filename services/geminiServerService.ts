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
    ? `You are a world-class SaaS launch strategist with 20+ years experience. Generate an EXTREMELY DETAILED PRO+ TIER launch playbook (20-30 pages worth of content).

CRITICAL: Generate massive amounts of content. Every section should be VERY detailed with multiple paragraphs.

PRODUCT: ${formData.productName}
AUDIENCE: ${formData.targetAudience}
LAUNCH: ${daysUntilLaunch} days away
BUDGET: ${proData?.budget}
CHANNELS: ${channels}
COMPETITOR: ${proData?.mainCompetitor || 'auto-detect'}

Generate as JSON with EXTENSIVE content:

{
  "executiveSummary": "Write 5+ detailed paragraphs covering market opportunity, differentiation, target customers, GTM approach, and success metrics",
  
  "marketAnalysis": "Write 3-4 paragraphs analyzing the market size, growth trends, competitive landscape, and positioning opportunities",
  
  "targetAudience": "Write 3-4 paragraphs describing the ideal customer profile, their pain points, buying behavior, and decision criteria",
  
  "competitorAnalysis": [
    "Competitor 1 (name): DETAILED analysis of strengths, weaknesses, market position, pricing strategy",
    "Competitor 2 (name): DETAILED analysis of strengths, weaknesses, market position, pricing strategy",
    "Competitor 3 (name): DETAILED analysis of strengths, weaknesses, market position, pricing strategy",
    "Competitive advantages of ${formData.productName}: How we differentiate and win"
  ],
  
  "productPositioning": "Write 4-5 paragraphs on unique value proposition, messaging framework, and positioning vs competitors",
  
  "pricingStrategy": "Write 3 paragraphs analyzing pricing models, price points, and monetization approach",
  
  "budgetBreakdown": [
    "Paid Advertising (36%): Details on Google Ads, LinkedIn Ads, Twitter Ads strategy",
    "Content Marketing (24%): Blog posts, case studies, whitepapers, webinars",
    "Tools & Platforms (15%): Analytics, CRM, email tools, design tools",
    "PR & Events (15%): Press releases, industry events, sponsorships",
    "Team & Operations (10%): Additional team members, tools, overhead"
  ],
  
  "emailSequences": [
    "Email 1 - Welcome Series (Subject: Welcome to ${formData.productName} - Get [Benefit] in 5 minutes): Warm welcome, quick value prop, CTA to try product. 150+ words.",
    "Email 2 - Feature Deep Dive (Subject: [Key Feature] explained: How to [Outcome]): Detailed explanation of main feature with use case. 200+ words.",
    "Email 3 - Social Proof (Subject: See how [Company] increased [Metric] by X% with ${formData.productName}): Case study or testimonial. 180+ words.",
    "Email 4 - Objection Handling (Subject: Common objection about [concern] - Here's the truth): Address customer objection. 200+ words.",
    "Email 5 - FOMO & Urgency (Subject: Early adopters get [exclusive benefit] - Limited time): Create urgency with exclusive offer. 150+ words.",
    "Email 6 - Re-engagement (Subject: We miss you - Here's why you should come back): Win-back campaign. 160+ words.",
    "Email 7 - Final Push (Subject: Last chance for [Launch benefit] pricing): Launch day urgency. 140+ words.",
    "Email 8 - Post-Launch Success (Subject: You're in! Here's how to get started): Success email with onboarding steps. 200+ words.",
    "Email 9 - Upsell Opportunity (Subject: Ready for the next level? Introducing [Premium feature]): Upsell email. 180+ words.",
    "Email 10 - Loyalty & Retention (Subject: Thank you for being part of the ${formData.productName} journey): Customer appreciation. 150+ words.",
    "Email 11 - Case Study (Subject: [Customer] story: From [Problem] to [Success]): Detailed customer case study. 250+ words.",
    "Email 12 - Expert Tips (Subject: 5 expert tips to maximize your [benefit] with ${formData.productName}): Value-add content. 200+ words."
  ],
  
  "twitterPosts": ["Post 1: Problem statement", "Post 2: Solution teaser", "Post 3: Feature benefit", "Post 4: Social proof", "Post 5: FOMO", "Post 6: Launch announcement", "Post 7: Success story", "Post 8: Customer testimonial", "Post 9: Behind the scenes", "Post 10: Team spotlight", "Post 11: Milestone celebration", "Post 12: Educational tip", "Post 13: Industry insight", "Post 14: Product demo", "Post 15: Limited offer", "Post 16: Customer case study", "Post 17: Feature deep-dive", "Post 18: Integration announcement", "Post 19: Pricing breakdown", "Post 20: Success metrics", "Post 21: Thank you message", "Post 22: Community shoutout", "Post 23: Next feature teaser", "Post 24: Media mention", "Post 25: Customer appreciation", "Post 26: Milestone anniversary", "Post 27: Year-end reflection", "Post 28: Product roadmap preview", "Post 29: Partnership announcement", "Post 30: Exclusive offer"],
  
  "linkedInPosts": [
    "Post 1 (500 words): Why we built ${formData.productName} - The problem we solved",
    "Post 2 (500 words): How ${formData.productName} helps [audience segment] achieve [outcome]",
    "Post 3 (500 words): The future of [industry] - Why ${formData.productName} is essential",
    "Post 4 (400 words): Customer success story: [Company] results",
    "Post 5 (450 words): Industry trends shaping [market] in 2025",
    "Post 6 (400 words): Team behind ${formData.productName} - Meet the founders",
    "Post 7 (500 words): Launch day reflection - Lessons learned",
    "Post 8 (450 words): How to evaluate [category] tools - Checklist",
    "Post 9 (400 words): Common mistakes in [process] and how to avoid them",
    "Post 10 (500 words): The future of ${formData.productName} - Vision and roadmap"
  ],
  
  "productHuntStrategy": [
    "Pre-launch (Week -1): Prepare Hunter profile, create teaser content, build email list, get early reviews",
    "Launch morning: Post at optimal time (5-6 AM PT), brief description, compelling tagline, beautiful thumbnail",
    "Launch day engagement: Respond to comments in real-time, thank supporters, address questions within first 2 hours",
    "Post-launch (Week 1): Maintain momentum with daily updates, share metrics, celebrate milestones with community"
  ],
  
  "dailyTimeline": [
    "Day 1: Finalize product demo, prepare marketing materials, send preview to advisors",
    "Day 2: Complete all website pages, setup analytics and tracking, prepare email sequences",
    "Day 3: Test all CTAs and payment flows, schedule social media posts, prepare press releases",
    "Day 4: Final QA testing, train support team, setup customer onboarding process",
    "Day 5: Setup monitoring and alerts, backup database, prepare communications for launch day",
    "Day 6: Final marketing push to email list, schedule social content, brief all stakeholders",
    "Day 7 (LAUNCH): Post on ProductHunt, send launch email, activate all marketing channels",
    "Day 8: Measure initial metrics, respond to feedback, optimize based on initial results",
    "Day 9: Share results with community, continue momentum with content",
    "Day 10: Plan next phase, gather testimonials, start creating case studies"
  ],
  
  "successMetrics": [
    "Website traffic: Target 10,000+ unique visitors in first week",
    "Signups: Target 500+ signups by day 7",
    "Activation: Target 30%+ signup-to-activation rate",
    "Revenue: Target $5,000+ ARR by end of month",
    "ProductHunt: Target top 5 ranking on day of launch",
    "Social engagement: Target 10,000+ impressions on social",
    "Customer satisfaction: Target 4.5+ star rating from early users",
    "Retention: Track 30-day retention rate, target 50%+ weekly active users"
  ]
}`
    : `You are a professional SaaS launch strategist. Generate an EXTREMELY DETAILED STANDARD TIER launch playbook (15-25 pages worth of content).

CRITICAL: Generate massive amounts of content. Every section should be DETAILED with multiple paragraphs and items.

PRODUCT: ${formData.productName}
AUDIENCE: ${formData.targetAudience}
LAUNCH: ${daysUntilLaunch} days away

Generate as JSON with EXTENSIVE content:

{
  "executiveSummary": "Write 4-5 detailed paragraphs covering the launch strategy, target market, key differentiators, go-to-market approach, and success metrics",
  
  "marketOpportunity": "Write 3 paragraphs on market size, trends, and why now is the right time to launch",
  
  "targetAudience": "Write 3 paragraphs describing ideal customers, their pain points, and buying triggers",
  
  "goToMarketStrategy": [
    "Email Marketing: Build email list with lead magnet, segment by interest, create nurture sequences reaching 5,000+ subscribers",
    "Social Media (Twitter): Daily posts about product benefits, industry insights, launch day updates - target 50,000+ impressions",
    "Social Media (LinkedIn): Thought leadership posts, customer stories, industry commentary - target 30,000+ impressions",
    "Content Marketing: Blog posts about [industry/problem], SEO-optimized guides, how-to tutorials (6-10 pieces)",
    "Community Engagement: Launch on ProductHunt, participate in relevant Slack communities, respond to all feedback",
    "Influencer & Partnerships: Partner with 5-10 relevant influencers/publications in the [industry]"
  ],
  
  "productPositioning": "Write 3-4 paragraphs on unique value proposition, why customers need this, and main competitive advantages",
  
  "emailTemplates": [
    "Email 1 (Welcome, 150+ words): Subject: Welcome to ${formData.productName} - Your [benefit] starts here",
    "Email 2 (Feature explainer, 200+ words): Subject: How [Feature] helps you [outcome]",
    "Email 3 (Social proof, 180+ words): Subject: See how [Customer] achieved [result] with ${formData.productName}",
    "Email 4 (Objection, 200+ words): Subject: Concerns about [common objection]? Here's what you should know",
    "Email 5 (Urgency, 150+ words): Subject: Limited launch offer - Get [benefit] for [price]",
    "Email 6 (Re-engagement, 160+ words): Subject: We haven't seen you in a while - Here's what's new",
    "Email 7 (Launch day, 140+ words): Subject: It's here! ${formData.productName} officially launches today",
    "Email 8 (Success, 200+ words): Subject: You're set up! Here's your first win",
    "Email 9 (Upgrade, 180+ words): Subject: Ready for more? Introducing our premium features",
    "Email 10 (Retention, 150+ words): Subject: You're awesome - Here's why we built ${formData.productName} for people like you"
  ],
  
  "twitterPosts": [
    "Post about the problem you solve (20+ chars)",
    "Post about your solution (20+ chars)",
    "Post about key feature (20+ chars)",
    "Post about user benefits (20+ chars)",
    "Post creating FOMO about launch (20+ chars)",
    "Post about pricing (20+ chars)",
    "LAUNCH ANNOUNCEMENT POST (50+ words) (20+ chars)",
    "Post celebrating early wins (20+ chars)",
    "Post with customer testimonial (20+ chars)",
    "Post about team behind product (20+ chars)",
    "Post about company mission (20+ chars)",
    "Post with how-to tip (20+ chars)",
    "Post about industry trends (20+ chars)",
    "Post with product demo link (20+ chars)",
    "Post about launch day metrics (20+ chars)",
    "Post thanking community (20+ chars)",
    "Post previewing next feature (20+ chars)",
    "Post about integration (20+ chars)",
    "Post about customer success (20+ chars)",
    "Post about special offer (20+ chars)",
    "Post about media coverage (20+ chars)",
    "Post about partnership (20+ chars)",
    "Post about team member highlight (20+ chars)",
    "Post about roadmap (20+ chars)",
    "Post celebrating milestone (20+ chars)"
  ],
  
  "linkedInPosts": [
    "Post 1 (500 words): Why we built ${formData.productName} and the problem we solve for ${formData.targetAudience}",
    "Post 2 (400 words): The evolution of [category] - why ${formData.productName} is the future",
    "Post 3 (450 words): How to [achieve outcome] with ${formData.productName} - step by step guide",
    "Post 4 (400 words): Customer story: How [company] saved [metric] with our product",
    "Post 5 (500 words): Industry insights on [topic] and what it means for 2025",
    "Post 6 (400 words): The team behind ${formData.productName} - meet the founders",
    "Post 7 (500 words): Launch day reflection and lessons learned",
    "Post 8 (400 words): Common mistakes in [process] and how to avoid them"
  ],
  
  "actionTimeline": [
    "Day 1: Finalize product, prepare marketing materials and social content calendar",
    "Day 2: Setup email sequences and landing page, create ProductHunt profile",
    "Day 3: Test all critical paths, prepare support responses, schedule all social posts",
    "Day 4: Email list building push, finalize blog content, prepare launch day script",
    "Day 5: Final testing and QA, monitor system status, prepare monitoring dashboards",
    "Day 6: Email preview to list, final social scheduling, align team on launch day",
    "Day 7 (LAUNCH): Post on ProductHunt, send launch email, activate all channels, monitor metrics in real-time",
    "Day 8: Measure day 1 results, respond to feedback, continue momentum"
  ],
  
  "successMetrics": [
    "Website visitors: 5,000+ in first week",
    "Email signups: 300+ from launch",
    "Product signups: 200+ trial users",
    "ProductHunt: Top 10 ranking",
    "Social media: 50,000+ combined impressions",
    "Customer retention: 40%+ weekly active rate",
    "Net Promoter Score: 50+",
    "Revenue: $2,000+ MRR target"
  ]
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
