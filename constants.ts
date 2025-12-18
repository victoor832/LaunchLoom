import { TierConfig, TierId, FeatureRow } from './types';

export const TIER_CONFIGS: Record<TierId, TierConfig> = {
  free: {
    id: 'free',
    name: 'Free',
    price: 0,
    description: 'For hobbyists just starting out',
    features: [
      'Core checklist (20 items)',
      'Basic support',
      'Community access'
    ],
    requiresPayment: false,
    requiresForm: false,
    requiresChat: false,
    colors: {
      border: 'border-gray-300',
      button: 'bg-gray-600',
      buttonHover: 'hover:bg-gray-700',
      bg: 'bg-white'
    }
  },
  standard: {
    id: 'standard',
    name: 'Standard',
    price: 9,
    description: 'For modern launching products',
    features: [
      'Everything in Free',
      '50-checklist items',
      'Automation tools',
      'Priority email support'
    ],
    requiresPayment: true,
    requiresForm: true,
    requiresChat: false,
    badge: 'POPULAR',
    colors: {
      border: 'border-teal-primary',
      button: 'bg-teal-primary',
      buttonHover: 'hover:bg-teal-hover',
      bg: 'bg-blue-50'
    }
  },
  pro: {
    id: 'pro',
    name: 'Pro+',
    price: 15,
    description: 'For agencies and teams',
    features: [
      'Everything in Standard',
      'Unlimited items',
      'Team collaboration (3 seats)',
      'API Access'
    ],
    requiresPayment: true,
    requiresForm: true,
    requiresChat: true,
    badge: 'BEST VALUE',
    colors: {
      border: 'border-orange-warm',
      button: 'bg-orange-warm',
      buttonHover: 'hover:bg-orange-dark',
      bg: 'bg-orange-50'
    }
  }
};

export const FEATURE_COMPARISON: FeatureRow[] = [
  {
    category: 'USAGE & LIMITS',
    features: [
      { name: 'Checklist items', free: '20', standard: '50', pro: 'Unlimited' },
      { name: 'Active Projects', free: '1', standard: '5', pro: 'Unlimited' },
      { name: 'File Storage', free: '100MB', standard: '50B', pro: '100B' }
    ]
  },
  {
    category: 'CORE FEATURES',
    features: [
      { name: 'Pre-built templates', free: false, standard: true, pro: true },
      { name: 'Custom Branding', free: false, standard: true, pro: true },
      { name: 'Analytics Dashboard', free: 'Basic', standard: 'Advanced', pro: 'Real-time' },
      { name: 'Data Export (PDF/CSV)', free: false, standard: true, pro: true }
    ]
  },
  {
    category: 'AUTOMATION & API',
    features: [
      { name: 'Zapier Integration', free: false, standard: true, pro: true },
      { name: 'Webhook Access', free: false, standard: false, pro: true },
      { name: 'API Access', free: false, standard: false, pro: true }
    ]
  },
  {
    category: 'TEAM & SUPPORT',
    features: [
      { name: 'Team Seats', free: '1', standard: '1', pro: '3 included' },
      { name: 'Support Level', free: 'Community', standard: 'Priority Email', pro: '24/7 Live Chat' }
    ]
  }
];

export const GENERATION_SYSTEM_INSTRUCTION = `
You are an expert SaaS launch strategist with 10 years of experience.
Your goal is to generate a DETAILED, ACTIONABLE 30-day launch checklist for a SaaS product based on user input.

TONE:
Direct, actionable, no fluff.
Specific numbers and data.
Assume founder has limited time.
Make every task take <2 hours.

PERSONALIZATION:
Reference the product name in examples.
Tailor timeline to the target audience.
Adjust urgency based on launch date.
Scale social proof tactics based on current user count.
`;

export const WHATSAPP_GROUP_LINK = "https://whatsapp.com/group/launchloom-vip-123";
