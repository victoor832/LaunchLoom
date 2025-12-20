#!/usr/bin/env node

// Quick test to verify simplified Gemini prompts work
import { generateLaunchPlanServer } from './services/geminiServerService.ts';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.production' });

const testData = {
  productName: 'LaunchLoom Test Product',
  targetAudience: 'SaaS founders',
  launchDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days
};

(async () => {
  try {
    console.log('🧪 Testing simplified Gemini prompts...\n');
    
    // Test Standard tier
    console.log('📋 STANDARD TIER:');
    const standardResult = await generateLaunchPlanServer(testData, 'standard');
    const standardJSON = JSON.parse(standardResult);
    
    console.log('✅ Standard JSON keys:', Object.keys(standardJSON));
    console.log('   Keys count:', Object.keys(standardJSON).length);
    console.log('   Sample:', JSON.stringify(standardJSON).slice(0, 200) + '...\n');
    
    // Calculate estimated pages
    const contentLength = JSON.stringify(standardJSON).length;
    const estPages = Math.ceil(contentLength / 3000); // ~3KB per page
    console.log(`📄 Estimated pages: ${estPages} (vs 48 before)\n`);
    
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
})();
