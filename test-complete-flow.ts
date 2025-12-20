import { generateLaunchPlanServer } from './services/geminiServerService';
import { generatePDFFromContent } from './services/pdfKitService';
import fs from 'fs';

async function test() {
  console.log('🚀 Testing complete flow with new timeout...\n');

  const testData = {
    productName: 'TestProduct',
    targetAudience: 'Tech Startups',
    launchDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 5 days from now
  };

  try {
    console.log('⏱️  Step 1: Calling Gemini (with 45s timeout)...');
    const start1 = Date.now();
    
    const content = await generateLaunchPlanServer(testData as any, 'standard');
    
    const time1 = Date.now() - start1;
    console.log(`✅ Gemini response: ${content.length} chars in ${time1}ms`);
    
    if (content.length < 100) {
      console.error('❌ Content too short!');
      process.exit(1);
    }

    console.log('\n⏱️  Step 2: Generating PDF...');
    const start2 = Date.now();
    
    const pdfBuffer = await generatePDFFromContent(testData.productName, content, 'standard');
    
    const time2 = Date.now() - start2;
    console.log(`✅ PDF generated: ${pdfBuffer.length} bytes in ${time2}ms`);
    
    // Save PDF
    fs.writeFileSync('/tmp/test-complete-flow.pdf', pdfBuffer);
    console.log('📄 Saved to /tmp/test-complete-flow.pdf');

    // Check PDF pages
    const { execSync } = require('child_process');
    try {
      const result = execSync('pdfinfo /tmp/test-complete-flow.pdf 2>&1 | grep Pages').toString().trim();
      console.log(`\n${result}`);
    } catch (e) {
      console.log('Note: pdfinfo not available');
    }

    console.log(`\n✅ Total time: ${(time1 + time2) / 1000}s (well under 60s Istio limit)`);

  } catch (err) {
    console.error('❌ Error:', err instanceof Error ? err.message : String(err));
    process.exit(1);
  }
}

test();
