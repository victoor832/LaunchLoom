import PDFDocument from 'pdfkit';
import { Readable } from 'stream';
import { createReadStream } from 'fs';
import { join } from 'path';

// ==================== TYPES ====================
export interface PlaybookInput {
  productName: string;
  targetAudience: string;
  launchDate: string;
  tier: 'free' | 'standard' | 'pro';
  daysToLaunch: number;
}

// ==================== COLORS & STYLES ====================
const COLORS = {
  primary: { r: 13, g: 127, b: 137 },      // #0D7F89 - Teal
  accent: { r: 204, g: 102, b: 0 },        // #CC6600 - Orange
  text: { r: 31, g: 41, b: 55 },           // #1F2937 - Dark gray
  lightBg: { r: 243, g: 244, b: 246 },     // #F3F4F6 - Light gray
};

const MARGINS = { top: 40, bottom: 40, left: 40, right: 40 };
const PAGE_HEIGHT = 792; // 11 inches in points
const PAGE_WIDTH = 612;  // 8.5 inches in points
const CONTENT_WIDTH = PAGE_WIDTH - MARGINS.left - MARGINS.right;

// ==================== CONTENT DATA ====================
const DAYS_CONTENT = [
  {
    day: 1,
    title: 'Build Your Warm Email List',
    time: '30 minutes',
    difficulty: 'Easy',
    why: 'Your launch success depends on having real people who care about your product. A warm list ensures higher open rates (40-50% vs 5-10% cold).',
    steps: [
      'Export contacts from Gmail/LinkedIn (people you know)',
      'Create Google Sheet: Name | Email | Relationship',
      'Aim for 50-100 people minimum',
      'Add yourself to test sending later',
    ],
    copy: 'Subject: Early access to [Product]?\n\nHey [Name],\n\nBuilding something that might interest you. Can I send you early access?\n\n[Your name]',
    checkpoint: 'Do you have at least 50 warm contacts?',
    success: 'Email list created with 50+ contacts exported and organized',
  },
  {
    day: 2,
    title: 'Send Warm-Up Messages',
    time: '60 minutes',
    difficulty: 'Medium',
    why: 'Priming your audience increases email open rates by 25-35% when you send the main launch email. You\'re building anticipation.',
    steps: [
      'Send message to each person individually (not bulk)',
      'Customize if possible (1-2 personal touches)',
      'Ask for feedback or early access interest',
      'Track who responds (these are your power users)',
    ],
    copy: 'Hey [Name],\n\nWe\'re launching [Product Name] next week. It\'s designed specifically for people like you.\n\nWant early access to try it?\n\nWould love your feedback.\n\n[Your name]',
    checkpoint: 'Did you personalize at least 10 messages?',
    success: '50+ warm messages sent with 20% response rate target',
  },
  {
    day: 3,
    title: 'Create Your Landing Page',
    time: '2 hours',
    difficulty: 'Medium',
    why: 'You need a single destination for launch traffic. Landing pages convert 2-3x better than homepage links when focused on one problem/solution.',
    steps: [
      'Use template: Webflow, Framer, or Carrd',
      'Headline: Problem statement (not product name)',
      'Subheading: Specific transformation/benefit',
      'Benefit list (3-5 bullet points, scannable)',
      'Email signup CTA (no payment needed yet)',
      'Social proof if available (testimonials, beta users)',
    ],
    copy: 'Headline example:\n"Stop wasting hours on [Problem]. Get back 10 hours/week."\n\nCTA: "Get Early Access (Free)"',
    checkpoint: 'Is your landing page mobile-responsive?',
    success: 'Landing page live with email capture form working',
  },
  {
    day: 4,
    title: 'Write & Schedule 5 Pre-Launch Tweets',
    time: '60 minutes',
    difficulty: 'Easy',
    why: 'Starting your Twitter narrative 3-4 days before launch builds momentum. Early tweets get more engagement (algorithmic boost for fresh accounts).',
    steps: [
      'Write 5 different angles (Problem, Solution, Origin story, Social proof, CTA)',
      'Keep each under 280 characters (mobile-friendly)',
      'Schedule via TweetDeck or Later.com',
      'Vary posting times (9 AM, 12 PM, 3 PM, 6 PM, 9 PM)',
      'Include your landing page link in one tweet',
    ],
    copy: 'Tweet 1 (Problem):\n"Most SaaS launches fail silently. No feedback. No traction. No plan.\n\nWe built something different.\n\nLaunch next Tuesday."\n\nTweet 2 (Solution):\n"[Product] shows you exactly what to do Days 1-30 of launch.\n\nHour-by-hour.\n\nTemplate included."\n\nTweet 3 (CTA):\n"Early access opens tomorrow.\n\nOnly 100 spots.\n\nLink in bio."',
    checkpoint: 'Are all tweets under 280 characters?',
    success: '5 tweets written and scheduled across 5 different times',
  },
  {
    day: 5,
    title: 'Collect First Feedback & Finalize Positioning',
    time: '90 minutes',
    difficulty: 'Medium',
    why: 'Feedback from your warm audience helps you refine messaging before launch day. Small messaging tweaks can increase conversion 30-40%.',
    steps: [
      'Call 3-5 people from your warm list',
      'Ask: "What do you think this solves?"',
      'Listen for: Problems they mention, language they use',
      'Update landing page headline if needed',
      'Refine email subject line based on feedback',
      'Update Twitter bio with clear value prop',
    ],
    copy: 'Call script:\n"Thanks for taking this call. Quick question: In your own words, what do you think [Product] does?"\n\n[Listen. Don\'t interrupt.]\n\n"What would you change about how I\'m explaining it?"',
    checkpoint: 'Did you complete 3+ feedback calls?',
    success: 'Positioning refined, messaging updated, team aligned on launch angle',
  },
];

const EMAIL_TEMPLATES = [
  {
    day: 1,
    name: 'Launch Announcement Email',
    subject: 'We just launched [Product Name]',
    body: `Hi [Name],

It's here.

[Product Name] is now live. It's the [specific benefit] platform designed for [target audience].

Today, we're giving early access to our community. Join here:
[Landing page link]

This is the exact tool we built because we were frustrated with [problem].

Over 3 months, we tested with [number] beta users in [industry].

They saved an average of [metric] on [specific task].

Ready to try it?
[Landing page link]

Just reply to this email with any feedback. We read every single message.

[Your name]`,
    metrics: 'Expected: 35-45% open rate, 8-12% click rate',
  },
  {
    day: 3,
    name: 'Follow-Up Email (No-Response)',
    subject: 'One question about [Product]',
    body: `Hi [Name],

Quick question: Did you see my last email about [Product Name]?

I know your inbox is crazy. No worries if it got lost.

TL;DR: We launched something that solves [specific problem]. You mentioned you struggle with [specific thing].

Thought you'd want early access:
[Landing page link]

Enjoy,
[Your name]

P.S. We're limiting early access to 100 people. If you want in, now is the time.`,
    metrics: 'Expected: 25-35% open rate, 5-8% click rate',
  },
  {
    day: 7,
    name: 'Social Proof Email',
    subject: '[Name], people are loving this',
    body: `Hi [Name],

Since we launched [Product Name] 3 days ago:

• [Number] people signed up
• [Quote from beta user]
• [Specific result: X metric improved by Y%]

Honestly, the response has been wild.

If you were curious about [Product], now's the time. You can see exactly what everyone else is raving about:
[Landing page link]

[Your name]

P.S. We're closing early access Friday at 5 PM PT.`,
    metrics: 'Expected: 40-50% open rate, 10-15% click rate',
  },
  {
    day: 10,
    name: 'Last Chance Email',
    subject: 'Early access closes tomorrow',
    body: `Hi [Name],

Quick heads up: Early access to [Product Name] closes tomorrow at 5 PM PT.

After that, it's regular pricing.

If you wanted to try it risk-free with the launch crew, link below:
[Landing page link]

See you on the inside,
[Your name]

P.S. Launching is the easy part. Growth is the game. Join us as we figure it out together.`,
    metrics: 'Expected: 50-60% open rate, 12-18% click rate',
  },
];

const TWEET_TEMPLATES = Array.from({ length: 25 }, (_, i) => ({
  num: i + 1,
  category: ['Problem', 'Solution', 'Origin Story', 'Social Proof', 'CTA'][i % 5],
  text: getTweetTemplate(i),
}));

function getTweetTemplate(index: number): string {
  const templates = [
    // Problem tweets
    'Most product launches fail silently. No feedback. No traction. No plan. This changes that.',
    'You built something great. But launch day paralysis is real. What do you do first?',
    '[Product] solves the problem we all face: not knowing exactly what to do on Day 1 of launch.',
    'Launch plans are boring. Execution guides are everything. We built the latter.',
    'The difference between 10 signups and 1000 signups on launch day? Knowing exactly what to do.',

    // Solution tweets
    '[Product] gives you a 30-day roadmap. Hour-by-hour. Not vague. Not theoretical. Actionable.',
    'Open [Product]. See what to do today. Do it. Check it off. Repeat. That\'s the whole idea.',
    'We tested our launch framework with 50 founders. This is what they wish they knew on Day 1.',
    '[Product]: The launch playbook that actually works for bootstrapped teams.',
    'Your launch in 30 days. Templated. Systematized. Proven. No guessing.',

    // Origin tweets
    'We launched 4 products in 2 years. Failed twice. This is what we learned works.',
    '[Product] exists because we got 47 "what should I do on Day 1?" messages from other founders.',
    'Built by people who have actually launched. Tested by people launching right now. Here\'s what we learned.',
    'Tired of launch "advice" from people who\'ve never done it? We built [Product] by actually doing it.',
    'Spent 6 months testing launch strategies. This is the playbook that actually generated traction.',

    // Social proof tweets
    'First week of [Product]: 500 signups from founders, 8.5/10 rating, "exactly what I needed" (most common feedback)',
    'Founder feedback: "This saved me 40 hours in planning and confusion on launch week. Exact steps. No fluff."',
    'We asked early users: would you recommend this to another founder? 96% said yes. That matters to us.',
    '[Product] users reported 3x more email opens using our templates. Real data. Real results.',
    'Seeing founders actually launch because they have a plan. This. This is why we built [Product].',

    // CTA tweets
    'Early access to [Product] is now open. 100 spots. First 50 people get lifetime discount. Get in: [link]',
    'Ready to actually launch? [Product] is live with early-bird pricing. Limited spots. Join us: [link]',
    '[Product] early access closes Friday. You can\'t buy confidence, but you can buy a launch plan: [link]',
    'If you\'re launching in the next 90 days, [Product] is the thing you need before Day 1. Details: [link]',
    'Building something? Use [Product] to nail the launch. Early access: [link] (100 spots, going fast)',
  ];

  return templates[index % templates.length];
}

const PRODUCT_HUNT_SCHEDULE = [
  {
    time: '6:00 AM PT',
    action: 'Post to Product Hunt',
    copy: '[Product] is live! 30-day launch playbook for founders. Made by people who\'ve actually launched.',
  },
  {
    time: '7:30 AM PT',
    action: 'Pin comment with personal story',
    copy: 'We spent 2 years learning this the hard way. This is what we wish we knew on Day 1 of our first launch.',
  },
  {
    time: '10:00 AM PT',
    action: 'Respond to top comments',
    copy: 'Great question! [Product] includes 50+ email templates you can customize and send immediately.',
  },
  {
    time: '1:00 PM PT',
    action: 'Share behind-the-scenes story',
    copy: 'Building [Product] forced us to audit every launch decision we\'ve made. This is the honest framework.',
  },
  {
    time: '4:00 PM PT',
    action: 'Post user testimonial',
    copy: 'Founder who used beta: "Removed all the anxiety from launch planning. Exactly what I needed."',
  },
  {
    time: '6:00 PM PT',
    action: 'Final call-to-action',
    copy: 'Thanks for the support today! Early access closes at midnight. Join 500+ founders who are launching with [Product].',
  },
];

const CALL_NOTES = {
  positioning: {
    title: 'Your Positioning Statement',
    content:
      '[Product Name] is the launch playbook for [target audience] who want to [specific outcome] without [pain point].',
  },
  powerUsers: [
    {
      name: 'Name: Angel Investor / Founder',
      reason: 'Already advises on launches',
      email: 'angel@example.com',
      twitter: '@angelhandle',
      angle: 'They understand founder pain. Position as "finally, something founders actually want"',
      script: 'Hey [Name], we built a launch playbook that\'s been tested with 50 founders. Your advice would mean everything.',
    },
    {
      name: 'Name: SaaS Podcaster',
      reason: 'Reaches 10k weekly listeners interested in launches',
      email: 'podcaster@example.com',
      twitter: '@podhandle',
      angle: 'Content hook: "The only launch framework that actually works"',
      script: 'Hey [Name], would you be interested in interviewing our founder about what works on launch day? We have data.',
    },
    {
      name: 'Name: Twitter Influencer (Startup community)',
      reason: '50k followers, daily launch discussions',
      email: 'influencer@example.com',
      twitter: '@influhandle',
      angle: 'Viral angle: "I tested this launch framework and here\'s what shocked me"',
      script: 'Hey [Name], we\'d love for you to try [Product]. Would you be willing to share your honest review?',
    },
  ],
};

const PRESS_LIST = [
  {
    publication: 'TechCrunch',
    journalist: 'Reporter Name',
    email: 'reporter@techcrunch.com',
    angle: 'Democratizing founder knowledge that VCs guard',
  },
  {
    publication: 'Product Hunt',
    journalist: 'Community Lead',
    email: 'community@producthunt.com',
    angle: 'Tools for founders, by founders',
  },
  {
    publication: 'Indie Hackers',
    journalist: 'Editor',
    email: 'editor@indiehackers.com',
    angle: 'Bootstrap success story',
  },
  {
    publication: 'Startup Magazine',
    journalist: 'Editor-in-Chief',
    email: 'editor@startupmagazine.com',
    angle: 'Solving the launch problem',
  },
];

const DAILY_TRACKING_TEMPLATE = [
  'What went well today?',
  'What could have gone better?',
  'What did I learn about my audience?',
  'What will I change for tomorrow?',
  'Am I on track for my success metrics?',
  'Notes / Actions for tomorrow:',
];

// ==================== MAIN GENERATOR ====================
export function generatePlaybookStream(input: PlaybookInput): Readable {
  // For Free tier, serve static PDF from public folder
  if (input.tier === 'free') {
    try {
      const staticPdfPath = join(process.cwd(), 'public', 'reports', 'ColdMailAI-free-plan.pdf');
      return createReadStream(staticPdfPath);
    } catch (error) {
      console.error('Error serving static PDF:', error);
      throw new Error('Free tier PDF not found. Ensure public/reports/ColdMailAI-free-plan.pdf exists.');
    }
  }

  // For Standard and Pro tiers, generate dynamically
  const doc = new PDFDocument({
    margin: MARGINS.top,
    size: [PAGE_WIDTH, PAGE_HEIGHT],
    bufferPages: true,
    autoFirstPage: false,
  });

  // Add content based on tier
  doc.addPage();
  addCoverPage(doc, input);

  if (input.tier === 'standard' || input.tier === 'pro') {
    addTableOfContents(doc, input);
    addQuickStart(doc, input);
    addSuccessMetrics(doc, input);
  }

  if (input.tier === 'standard' || input.tier === 'pro') {
    addPhases(doc, input);
    addEmailTemplates(doc);
    addTweetTemplates(doc);
    addProductHuntGuide(doc);

    if (input.tier === 'pro') {
      addCallNotes(doc);
      addPressList(doc);
      addLaunchScripts(doc);
      addDailyTracking(doc);
    }
  }

  // Finalize
  doc.end();
  return doc;
}

// ==================== PAGE BUILDERS ====================
function addCoverPage(doc: PDFDocument, input: PlaybookInput): void {
  doc.rect(0, 0, PAGE_WIDTH, PAGE_HEIGHT).fill(COLORS.primary.r, COLORS.primary.g, COLORS.primary.b);

  doc.fillColor('white').fontSize(36).font('Helvetica-Bold').text('YOUR 30-DAY', { align: 'center', y: 200 });
  doc.fontSize(36).text('LAUNCH PLAYBOOK', { align: 'center' });

  doc.fontSize(14).font('Helvetica').text(`Product: ${input.productName}`, { align: 'center', y: 320 });
  doc.fontSize(12).text(`Audience: ${input.targetAudience}`, { align: 'center' });
  doc.fontSize(12).text(`Launch Date: ${input.launchDate}`, { align: 'center' });
  doc.fontSize(12).text(`Tier: ${input.tier.toUpperCase()}`, { align: 'center' });

  doc.fontSize(10).fillColor(COLORS.lightBg.r, COLORS.lightBg.g, COLORS.lightBg.b).text(`Days to Launch: ${input.daysToLaunch}`, { align: 'center', y: 450 });
}

function addTableOfContents(doc: PDFDocument, input: PlaybookInput): void {
  doc.addPage();
  doc.fillColor(COLORS.text.r, COLORS.text.g, COLORS.text.b);

  heading(doc, 'Table of Contents');
  doc.fontSize(11).text('Quick Start (Days 1-5)', { y: doc.y + 10 });
  doc.fontSize(11).text('Success Metrics Tracker', { y: doc.y + 5 });

  if (input.tier === 'standard' || input.tier === 'pro') {
    doc.fontSize(11).text('Phases (Days 6-30)', { y: doc.y + 5 });
    doc.fontSize(11).text('Email Templates', { y: doc.y + 5 });
    doc.fontSize(11).text('Tweet Templates', { y: doc.y + 5 });
    doc.fontSize(11).text('Product Hunt Guide', { y: doc.y + 5 });
  }

  if (input.tier === 'pro') {
    doc.fontSize(11).text('Strategic Call Notes', { y: doc.y + 5 });
    doc.fontSize(11).text('Press List', { y: doc.y + 5 });
    doc.fontSize(11).text('Launch Day Scripts', { y: doc.y + 5 });
    doc.fontSize(11).text('30-Day Tracking Template', { y: doc.y + 5 });
  }
}

function addQuickStart(doc: PDFDocument, input: PlaybookInput): void {
  doc.addPage();
  doc.fillColor(COLORS.text.r, COLORS.text.g, COLORS.text.b);

  heading(doc, 'Quick Start: Days 1-5');
  doc.fontSize(10).fillColor(COLORS.text.r, COLORS.text.g, COLORS.text.b);
  doc.text('Complete action steps for your launch week. Follow these exactly.', { width: CONTENT_WIDTH, y: doc.y + 5 });

  DAYS_CONTENT.forEach((day) => {
    // Check if day card fits on current page
    const dayCardHeight = 150; // Estimated height
    if (doc.y + dayCardHeight > PAGE_HEIGHT - 40) {
      doc.addPage();
    }

    // Day header
    doc.y = doc.y + 10;
    doc.rect(MARGINS.left, doc.y, CONTENT_WIDTH, 25).fill(COLORS.accent.r, COLORS.accent.g, COLORS.accent.b);
    doc.fillColor('white').fontSize(12).font('Helvetica-Bold');
    doc.text(`Day ${day.day}: ${day.title}`, MARGINS.left + 10, doc.y + 5, { width: CONTENT_WIDTH - 20 });

    doc.y = doc.y + 25;

    // Day metadata
    doc.fillColor(COLORS.text.r, COLORS.text.g, COLORS.text.b).fontSize(9).font('Helvetica');
    doc.text(`⏱️ Time: ${day.time}  |  💪 Difficulty: ${day.difficulty}`, { y: doc.y });

    // Why
    doc.y = doc.y + 15;
    doc.fontSize(10).font('Helvetica-Bold').text('Why this matters:', { y: doc.y });
    doc.fontSize(9).font('Helvetica').text(day.why, { width: CONTENT_WIDTH, y: doc.y + 15 });

    // Steps
    doc.y = doc.y + 35;
    doc.fontSize(10).font('Helvetica-Bold').text('Action steps:', { y: doc.y });
    day.steps.forEach((step, idx) => {
      doc.fontSize(9).font('Helvetica').text(`${idx + 1}. ${step}`, { width: CONTENT_WIDTH - 20, y: doc.y + 15 });
      doc.y = doc.y + 12;
    });

    // Copy to use
    doc.y = doc.y + 5;
    doc.fontSize(10).font('Helvetica-Bold').text('Copy to use:', { y: doc.y });
    doc.fontSize(8).font('Helvetica').text(day.copy, { width: CONTENT_WIDTH, y: doc.y + 12 });

    // Checkpoint & Success
    doc.y = doc.y + 40;
    doc.fontSize(9).font('Helvetica');
    doc.text(`✓ Checkpoint: ${day.checkpoint}`, { width: CONTENT_WIDTH });
    doc.text(`✨ Success: ${day.success}`, { width: CONTENT_WIDTH, y: doc.y + 5 });

    doc.y = doc.y + 20;
  });
}

function addPhases(doc: PDFDocument, input: PlaybookInput): void {
  doc.addPage();
  doc.fillColor(COLORS.text.r, COLORS.text.g, COLORS.text.b);

  heading(doc, 'Phases: Days 6-30');
  doc.fontSize(10).text('Strategic phases and milestones for sustained growth.', { width: CONTENT_WIDTH });

  const phases = [
    {
      name: 'Phase 1: Days 6-10 (Building Momentum)',
      content: [
        'Send follow-up emails to non-responders',
        'Begin Product Hunt campaign preparation',
        'Identify power users from your warm list',
        'Collect testimonials from beta users',
        'Refine messaging based on feedback',
      ],
    },
    {
      name: 'Phase 2: Days 11-20 (Product Hunt & Media)',
      content: [
        'Launch on Product Hunt with strategy',
        'Execute press outreach (15-20 journalists)',
        'Daily Twitter engagement and content',
        'Community building in relevant Slack groups',
        'Podcast outreach to relevant shows',
      ],
    },
    {
      name: 'Phase 3: Days 21-30 (Growth & Retention)',
      content: [
        'Analyze what worked (which channels?)',
        'Focus marketing on top 2-3 channels',
        'Early user onboarding and success',
        'Plan for post-launch growth',
        'Celebrate wins and thank supporters',
      ],
    },
  ];

  phases.forEach((phase) => {
    if (doc.y + 80 > PAGE_HEIGHT - 40) {
      doc.addPage();
    }

    doc.y = doc.y + 10;
    doc.fontSize(11).font('Helvetica-Bold').fillColor(COLORS.accent.r, COLORS.accent.g, COLORS.accent.b);
    doc.text(phase.name, { y: doc.y });

    doc.fontSize(9).font('Helvetica').fillColor(COLORS.text.r, COLORS.text.g, COLORS.text.b);
    phase.content.forEach((item) => {
      doc.text(`• ${item}`, { width: CONTENT_WIDTH - 20, y: doc.y + 8 });
      doc.y = doc.y + 12;
    });
  });
}

function addEmailTemplates(doc: PDFDocument): void {
  doc.addPage();
  doc.fillColor(COLORS.text.r, COLORS.text.g, COLORS.text.b);

  heading(doc, 'Email Templates');
  doc.fontSize(10).text('Copy-paste ready emails for your launch campaign.', { width: CONTENT_WIDTH, y: doc.y + 5 });

  EMAIL_TEMPLATES.forEach((email) => {
    if (doc.y + 120 > PAGE_HEIGHT - 40) {
      doc.addPage();
    }

    doc.y = doc.y + 15;
    doc.fontSize(11).font('Helvetica-Bold').text(`Day ${email.day}: ${email.name}`, { y: doc.y });

    doc.fontSize(9).font('Helvetica');
    doc.text(`Subject: ${email.subject}`, { y: doc.y + 15 });

    doc.y = doc.y + 12;
    doc.text(email.body, { width: CONTENT_WIDTH, y: doc.y + 8 });

    doc.y = doc.y + 40;
    doc.fontSize(8).fillColor(COLORS.accent.r, COLORS.accent.g, COLORS.accent.b).text(email.metrics);
    doc.y = doc.y + 8;
  });
}

function addTweetTemplates(doc: PDFDocument): void {
  doc.addPage();
  doc.fillColor(COLORS.text.r, COLORS.text.g, COLORS.text.b);

  heading(doc, 'Tweet Templates');
  doc.fontSize(10).text('25 ready-to-post tweets for your launch campaign.', { width: CONTENT_WIDTH, y: doc.y + 5 });

  TWEET_TEMPLATES.forEach((tweet, idx) => {
    if (doc.y + 40 > PAGE_HEIGHT - 40) {
      doc.addPage();
    }

    doc.y = doc.y + 10;
    doc.fontSize(9).font('Helvetica-Bold').fillColor(COLORS.accent.r, COLORS.accent.g, COLORS.accent.b);
    doc.text(`Tweet ${tweet.num} [${tweet.category}]`);

    doc.fontSize(8).font('Helvetica').fillColor(COLORS.text.r, COLORS.text.g, COLORS.text.b);
    doc.text(tweet.text, { width: CONTENT_WIDTH, y: doc.y + 5 });

    doc.y = doc.y + 20;
  });
}

function addProductHuntGuide(doc: PDFDocument): void {
  doc.addPage();
  doc.fillColor(COLORS.text.r, COLORS.text.g, COLORS.text.b);

  heading(doc, 'Product Hunt Launch Guide');
  doc.fontSize(10).text('Hour-by-hour strategy and copy for Product Hunt day.', { width: CONTENT_WIDTH, y: doc.y + 5 });

  PRODUCT_HUNT_SCHEDULE.forEach((slot) => {
    if (doc.y + 60 > PAGE_HEIGHT - 40) {
      doc.addPage();
    }

    doc.y = doc.y + 12;
    doc.fontSize(10).font('Helvetica-Bold').fillColor(COLORS.accent.r, COLORS.accent.g, COLORS.accent.b);
    doc.text(`${slot.time} - ${slot.action}`);

    doc.fontSize(9).font('Helvetica').fillColor(COLORS.text.r, COLORS.text.g, COLORS.text.b);
    doc.text(slot.copy, { width: CONTENT_WIDTH, y: doc.y + 8 });

    doc.y = doc.y + 30;
  });
}

function addSuccessMetrics(doc: PDFDocument, input: PlaybookInput): void {
  if (doc.y + 100 > PAGE_HEIGHT - 40) {
    doc.addPage();
  }

  doc.y = doc.y + 15;
  doc.fillColor(COLORS.text.r, COLORS.text.g, COLORS.text.b);
  heading(doc, 'Success Metrics Tracker');

  const metrics = [
    { name: 'Email List Size', target: '100+', current: '___' },
    { name: 'Landing Page Visits', target: '500+', current: '___' },
    { name: 'Email Open Rate', target: '40%+', current: '___' },
    { name: 'Signups on Launch Day', target: '50+', current: '___' },
    { name: 'Twitter Impressions', target: '5000+', current: '___' },
    { name: 'Total Revenue (First 7 days)', target: '$1000+', current: '___' },
  ];

  doc.fontSize(10).text('Track your launch performance against these key metrics:', { y: doc.y + 10 });

  metrics.forEach((metric) => {
    doc.y = doc.y + 18;
    doc.fontSize(9).font('Helvetica-Bold').text(metric.name, { y: doc.y });
    doc.fontSize(9).font('Helvetica').text(`Target: ${metric.target}  |  Current: ${metric.current}`, { y: doc.y + 12 });
  });
}

function addCallNotes(doc: PDFDocument): void {
  doc.addPage();
  doc.fillColor(COLORS.text.r, COLORS.text.g, COLORS.text.b);

  heading(doc, 'Strategic Call Notes');

  // Positioning
  doc.y = doc.y + 10;
  doc.fontSize(11).font('Helvetica-Bold').text(CALL_NOTES.positioning.title);
  doc.fontSize(9).font('Helvetica').text(CALL_NOTES.positioning.content, { width: CONTENT_WIDTH, y: doc.y + 12 });

  // Power users
  doc.y = doc.y + 40;
  doc.fontSize(11).font('Helvetica-Bold').text('Power Users to Contact');

  CALL_NOTES.powerUsers.forEach((user, idx) => {
    if (doc.y + 70 > PAGE_HEIGHT - 40) {
      doc.addPage();
    }

    doc.y = doc.y + 15;
    doc.fontSize(9).font('Helvetica-Bold').fillColor(COLORS.accent.r, COLORS.accent.g, COLORS.accent.b);
    doc.text(`${idx + 1}. ${user.name}`);

    doc.fontSize(8).font('Helvetica').fillColor(COLORS.text.r, COLORS.text.g, COLORS.text.b);
    doc.text(`Why: ${user.reason}`, { y: doc.y + 8 });
    doc.text(`Email: ${user.email}  Twitter: ${user.twitter}`, { y: doc.y + 12 });
    doc.text(`Angle: ${user.angle}`, { width: CONTENT_WIDTH, y: doc.y + 16 });
    doc.text(`Script: ${user.script}`, { width: CONTENT_WIDTH, y: doc.y + 28 });

    doc.y = doc.y + 35;
  });
}

function addPressList(doc: PDFDocument): void {
  doc.addPage();
  doc.fillColor(COLORS.text.r, COLORS.text.g, COLORS.text.b);

  heading(doc, 'Press List');
  doc.fontSize(10).text('Journalists and publications to reach out to.', { width: CONTENT_WIDTH, y: doc.y + 5 });

  PRESS_LIST.forEach((outlet, idx) => {
    if (doc.y + 50 > PAGE_HEIGHT - 40) {
      doc.addPage();
    }

    doc.y = doc.y + 15;
    doc.fontSize(9).font('Helvetica-Bold').fillColor(COLORS.accent.r, COLORS.accent.g, COLORS.accent.b);
    doc.text(`${idx + 1}. ${outlet.publication}`);

    doc.fontSize(8).font('Helvetica').fillColor(COLORS.text.r, COLORS.text.g, COLORS.text.b);
    doc.text(`Journalist: ${outlet.journalist}  |  Email: ${outlet.email}`, { y: doc.y + 8 });
    doc.text(`Angle: ${outlet.angle}`, { width: CONTENT_WIDTH, y: doc.y + 12 });

    doc.y = doc.y + 22;
  });
}

function addLaunchScripts(doc: PDFDocument): void {
  doc.addPage();
  doc.fillColor(COLORS.text.r, COLORS.text.g, COLORS.text.b);

  heading(doc, 'Launch Day Scripts');
  doc.fontSize(10).text('Exact scripts and timing for launch day. Customize product name and metrics.', { width: CONTENT_WIDTH, y: doc.y + 5 });

  const scripts = [
    {
      time: '6:00 AM',
      channel: 'Product Hunt',
      script:
        'Product Hunt launch goes live. Monitor for first hour. Respond to all comments within 30 minutes.',
    },
    {
      time: '7:00 AM',
      channel: 'Twitter',
      script:
        'Post: "We just launched [Product]. 30-day playbook for founders. Join 200+ early users here: [link]"',
    },
    {
      time: '10:00 AM',
      channel: 'Email',
      script:
        'Send launch day email to warm list: "It\'s live! Early access for 24 hours. Join here: [link]"',
    },
    {
      time: '2:00 PM',
      channel: 'Communities',
      script: 'Post in 5 relevant communities (Slack groups, Reddit, etc). Share in #launches channels.',
    },
    {
      time: '6:00 PM',
      channel: 'Personal Network',
      script:
        'Call/text 5 key people. Personal ask: "Would you mind sharing this with your founder friends?"',
    },
  ];

  scripts.forEach((script) => {
    if (doc.y + 60 > PAGE_HEIGHT - 40) {
      doc.addPage();
    }

    doc.y = doc.y + 12;
    doc.fontSize(10).font('Helvetica-Bold').fillColor(COLORS.accent.r, COLORS.accent.g, COLORS.accent.b);
    doc.text(`${script.time} - ${script.channel}`);

    doc.fontSize(9).font('Helvetica').fillColor(COLORS.text.r, COLORS.text.g, COLORS.text.b);
    doc.text(script.script, { width: CONTENT_WIDTH, y: doc.y + 10 });

    doc.y = doc.y + 30;
  });
}

function addDailyTracking(doc: PDFDocument): void {
  doc.addPage();
  doc.fillColor(COLORS.text.r, COLORS.text.g, COLORS.text.b);

  heading(doc, '30-Day Tracking Template');
  doc.fontSize(10).text('Daily reflection and tracking. Copy this template and fill in each day.', { width: CONTENT_WIDTH, y: doc.y + 5 });

  // 3 days per page
  for (let day = 1; day <= 30; day++) {
    if (day > 1 && day % 3 === 1) {
      doc.addPage();
      doc.fillColor(COLORS.text.r, COLORS.text.g, COLORS.text.b);
    }

    if (day > 1) {
      doc.y = doc.y + 15;
    }

    doc.fontSize(10).font('Helvetica-Bold').fillColor(COLORS.accent.r, COLORS.accent.g, COLORS.accent.b);
    doc.text(`Day ${day}`);

    doc.fontSize(8).font('Helvetica').fillColor(COLORS.text.r, COLORS.text.g, COLORS.text.b);
    DAILY_TRACKING_TEMPLATE.forEach((question) => {
      doc.text(`${question}`, { y: doc.y + 6 });
      doc.y = doc.y + 14;
    });

    doc.y = doc.y + 5;
  }
}

function addUpgradeCall(doc: PDFDocument): void {
  if (doc.y + 80 > PAGE_HEIGHT - 40) {
    doc.addPage();
  }

  doc.y = doc.y + 20;
  doc.rect(MARGINS.left, doc.y, CONTENT_WIDTH, 60).fill(COLORS.lightBg.r, COLORS.lightBg.g, COLORS.lightBg.b);

  doc.fillColor(COLORS.text.r, COLORS.text.g, COLORS.text.b).fontSize(12).font('Helvetica-Bold');
  doc.text('Want More?', MARGINS.left + 15, doc.y + 10);

  doc.fontSize(10).font('Helvetica');
  doc.text('Upgrade to Standard or Pro tier for email templates, tweets, Product Hunt guide, and more.', MARGINS.left + 15, doc.y + 28, {
    width: CONTENT_WIDTH - 30,
  });
}

// ==================== UTILITY FUNCTIONS ====================
function heading(doc: PDFDocument, text: string): void {
  doc.fillColor(COLORS.primary.r, COLORS.primary.g, COLORS.primary.b).fontSize(18).font('Helvetica-Bold');
  doc.text(text, MARGINS.left, doc.y + 10);
  doc.y = doc.y + 25;
}

// ==================== EXPORT FOR NODEJS ====================
// Usage in Node/Express:
// import { generatePlaybookStream } from './pdfGeneratorServiceV2';
// import fs from 'fs';
//
// const input = {
//   productName: 'MyApp',
//   targetAudience: 'SaaS founders',
//   launchDate: '2025-02-15',
//   tier: 'standard',
//   daysToLaunch: 10,
// };
//
// const stream = generatePlaybookStream(input);
// stream.pipe(fs.createWriteStream(`${input.productName}-playbook.pdf`));
