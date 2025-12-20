import fs from 'fs';
import { generateLaunchPlanServer } from './services/geminiServerService';
import { StandardFormData } from './types';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const testData: StandardFormData = {
  productName: 'Test Product',
  targetAudience: 'SaaS founders',
  launchDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
  currentUsers: '0',
  email: 'test@example.com',
};

(async () => {
  try {
    console.log('🔍 Debugging Gemini response for STANDARD tier...\n');
    
    const response = await generateLaunchPlanServer(testData, 'standard');
    
    console.log('📄 RAW RESPONSE:');
    console.log('─'.repeat(80));
    console.log(response);
    console.log('─'.repeat(80));
    
    // Try to parse JSON
    try {
      const json = JSON.parse(response);
      console.log('\n✅ VALID JSON PARSED');
      console.log('Keys:', Object.keys(json));
      console.log('Sizes:');
      Object.entries(json).forEach(([key, value]) => {
        if (typeof value === 'string') {
          console.log(`  ${key}: ${value.length} chars`);
        } else if (Array.isArray(value)) {
          console.log(`  ${key}: ${value.length} items (${JSON.stringify(value).length} chars)`);
        } else {
          console.log(`  ${key}: object (${JSON.stringify(value).length} chars)`);
        }
      });
      
      // Save to file for inspection
      fs.writeFileSync('/tmp/gemini-response-standard.json', JSON.stringify(json, null, 2));
      console.log('\n📁 Saved to /tmp/gemini-response-standard.json');
      
    } catch (parseError) {
      console.log('\n❌ INVALID JSON:');
      console.log(parseError);
    }
    
  } catch (error) {
    console.error('❌ ERROR:', error instanceof Error ? error.message : error);
    process.exit(1);
  }
})();
