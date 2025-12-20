/**
 * Fallback content templates for when Gemini API is slow or quota-exhausted
 */

export function generateFallbackContent(
  productName: string,
  targetAudience: string,
  tier: 'standard' | 'pro'
): string {
  const isProTier = tier === 'pro';

function generateStandardContent(productName: string, targetAudience: string): string {
  const jsonObj = {
    executiveSummary: `${productName} is launching to ${targetAudience} with a focused value proposition and clear market positioning. This launch playbook provides a structured 5-day pre-launch and launch day strategy. Success depends on reaching the right people, at the right time, with the right message. The following playbook breaks down every step from pre-launch awareness to post-launch momentum building.`,
    
    targetMarket: `The target market for ${productName} is ${targetAudience}. These are decision-makers looking for solutions that save time and deliver measurable results. Pain points include inefficient processes, scattered tools, and lack of integration. The buying signal is when they start evaluating competitive solutions. We position ${productName} as the solution that brings everything together.`,
    
    productPositioning: `${productName} solves the critical pain point of disjointed workflows. Our unique value is simplicity combined with powerful features. Unlike competitors, we prioritize user experience and fast onboarding. The positioning message is: "Work smarter, not harder." We emphasize the time saved and productivity gains from day one.`,
    
    pricePosition: `Pricing strategy focuses on value-based positioning. Standard tier is positioned as the core offering with essential features. Pro tier targets power users and teams. Free tier serves as the acquisition funnel. Price anchoring against competitor alternatives shows strong ROI within 3 months.`,
    
    emailSequence: [
      {
        subject: `${productName} Launches Tomorrow - Here's What Changes`,
        body: `We're excited to announce that ${productName} is officially launching tomorrow. After months of development, we're ready to share this with you. ${productName} is designed specifically for ${targetAudience}. The early response has been overwhelming. Here's what you need to know.`
      },
      {
        subject: `3 Ways ${productName} Saves 5+ Hours Per Week`,
        body: `Most ${targetAudience} waste time switching between tools. ${productName} consolidates everything into one clean interface. Users report saving 5-10 hours per week. See how it works in our quick 2-minute demo. The time savings compound over months and years.`
      },
      {
        subject: `${productName} vs. The Tools You're Using Today`,
        body: `We compared ${productName} to the top 5 solutions in the market. The results: faster setup, better pricing, and 3x more integrations. Your team will be productive immediately. No multi-week implementation. No steep learning curve.`
      },
      {
        subject: `Last Chance: Launch Week Pricing Expires Tonight`,
        body: `Launch week pricing is officially ending at midnight. Early adopters have locked in 40% savings forever. After tonight, pricing returns to standard rates. Secure your spot now and join hundreds already using ${productName}.`
      }
    ],
    
    socialContent: [
      `🚀 ${productName} is LIVE. We built this for ${targetAudience}. The response has been incredible. Get access now → [link] #launch #newproduct`,
      `90% of our users report saving 5+ hours per week with ${productName}. Work smarter. Not harder. Learn more → [link]`,
      `Stop switching between tools. ${productName} brings everything together. Launch week: 40% off → [link]`,
      `${productName} vs competitors: faster setup, better price, more features. See the comparison → [link]`
    ],
    
    launch5DayPlan: [
      {
        day: 'Day 1 (T-4 days)',
        actions: 'Finalize marketing materials. Send teaser email to list. Post countdown on social media. Set up launch day infrastructure.'
      },
      {
        day: 'Day 2 (T-3 days)',
        actions: 'Launch awareness campaign. Post feature spotlight content. Reach out to key influencers. Send follow-up email.'
      },
      {
        day: 'Day 3 (T-2 days)',
        actions: 'Momentum building content. Share customer testimonials. Run social ads. Prepare customer support team.'
      },
      {
        day: 'Day 4 (T-1 day)',
        actions: 'Final reminder email. Last social push. Confirm all systems ready. Brief team on launch day schedule.'
      },
      {
        day: 'Day 5 (LAUNCH)',
        actions: 'Go live at 9 AM. Send launch announcement. Monitor systems. Respond to early feedback. Celebrate!'
      }
    ],
    
    keyMetrics: [
      'Signups on launch day: Target 500+',
      'Email open rate: Target 45%+',
      'Click-through rate: Target 5%+',
      'Social engagement: Target 1000+ impressions',
      'Customer support response: <2 hour average'
    ]
  };

  return JSON.stringify(json);
}

function generateProContent(productName: string, targetAudience: string): string {
  const json = {
    executiveSummary: `${productName} represents a market opportunity of $500M+ in the ${targetAudience} segment. Our launch strategy capitalizes on emerging market trends and positions us as the category leader. Differentiation centers on superior technology, customer experience, and pricing. Success metrics: 1000+ launches signups, 100+ enterprise pilots, 30%+ trial-to-paid conversion. This playbook details the 90-day go-to-market strategy starting from launch week.`,
    
    targetMarketAnalysis: `${targetAudience} represents a high-TAM segment with $10B+ annual spend. Primary buyer personas include CTOs, VPs of Operations, and CFOs. Pain points: fragmented tooling, integration hell, vendor lock-in. Secondary segments: sales leaders, product teams, consulting firms. Buying cycle: 2-4 weeks for standard tier, 6-12 weeks for enterprise. Vertical expansion opportunities: SaaS, healthcare, financial services.`,
    
    competitorAnalysis: [
      `Competitor A: Strong brand, weak UX, 3x higher pricing. We win on usability and cost.`,
      `Competitor B: Newer entrant, similar feature set, smaller network effects. We differentiate on integrations.`,
      `Competitor C: Established but legacy technology. We win on speed, modern design, AI-powered features.`,
      `${productName} advantages: 50% faster setup, 30% lower price, 5x better support, built for modern teams.`
    ],
    
    positioning: `Category: Workflow automation and collaboration platform. Value prop: "Unify your team. Eliminate chaos." Differentiation: purpose-built for ${targetAudience}, not a one-size-fits-all tool. Target profile: fast-growing teams (20-200 people) tired of tool sprawl. Message architecture: Problem (scattered workflows) → Solution (${productName} consolidation) → Result (team alignment, time savings).`,
    
    pricingStrategy: `Freemium model: Free tier caps at 3 projects, targets SMB adoption. Standard tier ($99/mo): positioned for growing teams 10-100 people. Pro tier ($299/mo): enterprise features, priority support, custom integrations. Enterprise: custom pricing for 500+ users. GTM lever: 50% launch discount for first 1000 customers, locked in for life.`,
    
    goToMarketChannels: [
      `Product Hunt: Featured launch, target top 5. Organic reach to 50K+ tech-savvy early adopters.`,
      `Email: Segment list by persona. Launch sequence: teaser (T-4), demo (T-2), launch (T-0), FOMO (T+1).`,
      `LinkedIn: B2B targeting of CTOs and VPs. Organic content + paid ads. Budget: $5K week 1.`,
      `Strategic partnerships: 5-10 complementary tool integrations pre-launch. Co-promotion with partners.`,
      `Influencer outreach: 20 SaaS influencers pre-launch week. Personal demos and early access for TikTok/Twitter.`
    ],
    
    emailSequence: [
      {
        subject: `${productName} Is Changing How Teams Work (Launch Day)`,
        body: `We've spent 18 months building ${productName} - a platform purpose-built for ${targetAudience}. After customer research with 200+ teams, we identified the core problem: tool fragmentation kills productivity. ${productName} solves this with one unified platform. Launch week pricing: 50% off forever. This offer expires at midnight in 7 days.`
      },
      {
        subject: `${productName} vs 7 Tools Your Team Probably Uses`,
        body: `The average ${targetAudience} uses 15+ SaaS tools. Context switching costs your team 2.1 hours per day. ${productName} consolidates into one platform. Switch costs: zero because we integrate with all your existing tools. ROI: $15K+ per 50-person team, per year.`
      },
      {
        subject: `Why ${targetAudience} Leaders Choose ${productName}`,
        body: `Customers report: 40% faster task completion, 60% fewer meetings, 80% better team alignment. Case study: $50M SaaS company saved 500 hours/quarter. Your team could be next. Book a 15-min demo with our team.`
      },
      {
        subject: `Launch Week Ending: Final 24 Hours for 50% Off`,
        body: `In 24 hours, launch pricing ends and our standard rates apply. Early adopters have locked in 50% savings forever. This is your last chance to join 2000+ teams already using ${productName}. Secure your spot now.`
      },
      {
        subject: `You're Missing Out (Social Proof)`,
        body: `This week, 2000+ teams launched with ${productName}. From indie hackers to 500-person companies. Customers highlight: onboarding in <1 hour, team adoption 100%, ROI visible in week 2. Don't be left behind.`
      },
      {
        subject: `${productName} Early Adopter Exclusive: Enterprise Features Free`,
        body: `As an early adopter, we're giving you a $200/month feature pack free for 6 months. Advanced analytics, audit logs, SSO, custom fields. This offer is exclusive to launch week adoptees. Claim yours now.`
      }
    ],
    
    socialMediaStrategy: [
      {
        platform: 'Twitter',
        posts: [
          `🚀 We're launching ${productName}. For the past 18 months, we've been obsessed with one question: "Why do teams use 15+ tools?" Today we have the answer. (1/) [link]`,
          `${productName} isn't another tool to add to the pile. It's the one tool that replaces 7 others. Unified workflows. Integrated ecosystems. One login. 40% faster work.`,
          `Average ${targetAudience} wastes 2.1 hours/day context-switching. ${productName} users save that time. Imagine 10.5 hours/week back. That's 25+ days/year of reclaimed time.`,
          `Launch week pricing: 50% off forever. We're betting on speed here - if you onboard in the first 7 days, you never pay full price. We want your feedback while we're building.`
        ]
      },
      {
        platform: 'LinkedIn',
        posts: [
          `After interviewing 200+ ${targetAudience} teams, we learned the same thing: tool fragmentation is the #1 pain point. So we built ${productName}. One platform. Every feature your team needs. Zero context switching. Launch: today. Pricing: 50% off for first 7 days. 🚀`,
          `If your team uses Slack, Notion, Asana, GitHub, and 10 other tools, you understand the pain of fragmentation. ${productName} brings everything together. The ROI is undeniable.`,
          `Excited to announce we're official! 🎉 ${productName} launches today for ${targetAudience}. Our mission: help teams work smarter, move faster, and focus on what matters. Join us. [link]`
        ]
      }
    ],
    
    launchTimeline: [
      {
        day: 'Day 1 (T-5 days)',
        actions: 'Finalize all marketing collateral. Send soft-launch to warm audience (1000 people). Brief customer support on common questions. Prepare product for scale (load testing, monitoring).'
      },
      {
        day: 'Day 2 (T-4 days)',
        actions: 'Launch on Product Hunt (morning). Begin LinkedIn influencer outreach. Send blog post + launch announcement. Monitor support tickets and fix critical bugs in real-time.'
      },
      {
        day: 'Day 3 (T-3 days)',
        actions: 'Launch paid ads ($5K budget across LinkedIn/Twitter). Send email to broader list. Share customer success stories. Interview early customers for testimonials.'
      },
      {
        day: 'Day 4 (T-2 days)',
        actions: 'Co-promotion with 5 partner companies. Influencer demo day (5-10 influencers). Follow-up email sequence. Prepare case study materials.'
      },
      {
        day: 'Day 5 (T-1 day)',
        actions: 'Final email push. Social media blitz. Confirm all systems are green. Brief team on day-of schedule.'
      },
      {
        day: 'Day 6 (LAUNCH)',
        actions: 'Go live with full marketing push. Email, social, ads simultaneously. Customer support standing by. CEO available for interviews. Monitor for bugs and scale issues every 30 minutes.'
      },
      {
        day: 'Day 7 (T+1)',
        actions: 'Analyze day-1 metrics. Send thank you emails to early customers. Publish first user stories. Start planning next release based on feedback.'
      }
    ],
    
    successMetrics: [
      'Launch week signups: 1000+ (target)',
      'Trial-to-paid conversion: 30%+ (target)',
      'Email open rate: 50%+ (benchmark: 25%)',
      'Product Hunt ranking: Top 5 (ambition)',
      'Social impressions week 1: 250K+ (target)',
      'Enterprise pilots: 10+ by end of month',
      'Customer satisfaction (NPS): 50+',
      'Activation rate (% creating first project): 80%+'
    ]
  };

  return JSON.stringify(json);
}
