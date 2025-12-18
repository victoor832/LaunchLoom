export type TierId = 'free' | 'standard' | 'pro';

export interface TierConfig {
  id: TierId;
  name: string;
  price: number;
  description: string;
  features: string[];
  requiresPayment: boolean;
  requiresForm: boolean;
  requiresChat: boolean;
  badge?: string;
  colors: {
    border: string;
    button: string;
    buttonHover: string;
    bg: string;
  };
}

export interface Feature {
  name: string;
  free: string | boolean;
  standard: string | boolean;
  pro: string | boolean;
}

export interface FeatureRow {
  category: string;
  features: Feature[];
}

export interface StandardFormData {
  productName: string;
  targetAudience: string;
  launchDate: string;
  currentUsers: '0' | '<100' | '100-1K' | '1K+';
  email: string;
}

export interface ProFormData extends StandardFormData {
  productDescription: string;
  currentTraction: string;
  budget: string;
  selectedChannels: string[];
  hasProductHuntExperience: boolean;
  mainCompetitor: string;
}

export type PersonalizationFormData = StandardFormData | ProFormData;

// PDF Generation Types
export interface DayTask {
  dayNumber: number;
  title: string;
  timeNeeded: string; // e.g. "30 minutes"
  difficulty: 'Easy' | 'Medium' | 'Hard';
  why: string;
  steps: string[];
  copyToPaste?: string; // For emails/tweets/messages
  checkpoint: string;
  success: string;
}

export interface LaunchPhase {
  phaseNumber: number;
  title: string;
  dayRange: string; // e.g. "Days 1-5"
  goal: string;
  tasks: DayTask[];
}

export interface EmailTemplate {
  emailNumber: number;
  day: number;
  subject: string;
  body: string; // Complete, ready to send
  goal: string;
}

export interface TweetTemplate {
  tweetNumber: number;
  text: string; // Under 280 chars, ready to post
  purpose: string;
}

export interface ProductHuntGuide {
  title: string;
  tagging?: string;
  description?: string;
  prepTasks: DayTask[];
  launchDayChecklist: string[];
  updates: Array<{ time: string; content: string }>;
}

export interface CallNotes {
  positioning: string;
  unfairAdvantage: string;
  powerUsers: Array<{
    name: string;
    reason: string;
    handle?: string;
    email?: string;
    contactScript: string;
  }>;
  launchDayScript: Record<string, string>; // hour -> action
}

export interface PressList {
  contacts: Array<{
    name: string;
    publication: string;
    email: string;
    angle: string;
    subjectLine: string;
    pitchEmail: string;
  }>;
}

export interface LaunchPlanJSON {
  productName: string;
  targetAudience: string;
  launchDate: string;
  daysUntilLaunch: number;
  generatedDate: string;
  tier: 'free' | 'standard' | 'pro';
  
  // Common sections
  coverPage: {
    subtitle?: string;
    currentTraction?: string;
    budget?: string;
    mainCompetitor?: string;
  };
  
  quickStart: {
    intro: string;
    days: DayTask[]; // Days 1-5
  };
  
  phases: LaunchPhase[]; // Phases for Days 6-30
  
  // Standard + Pro sections
  emailSequences?: EmailTemplate[];
  tweetTemplates?: TweetTemplate[];
  productHuntGuide?: ProductHuntGuide;
  successMetrics?: Array<{
    metric: string;
    target: string;
    byDay: number;
  }>;
  
  // Pro+ only sections
  callNotes?: CallNotes;
  pressList?: PressList;
}

// Generated HTML content from Gemini (will be converted to PDF)
export type GeneratedChecklist = string;