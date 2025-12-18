#!/usr/bin/env node
/**
 * Test script to reproduce the PDF generation issue locally
 * Tests with productName: TrustMRR, targetAudience: b2b
 */

import { generateLaunchPlanServer } from './services/geminiServerService';
import { generatePDFFromContent } from './services/pdfKitService';
import { writeFileSync } from 'fs';

async function testPDFGeneration() {
  const testData = {
    productName: 'TrustMRR',
    targetAudience: 'b2b',
    launchDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 7 days from now
  };

  console.log('🧪 Testing PDF generation with:');
  console.log(`   Product: ${testData.productName}`);
  console.log(`   Audience: ${testData.targetAudience}`);
  console.log(`   Launch Date: ${testData.launchDate}\n`);

  try {
    // Step 1: Generate content
    console.log('📝 Step 1: Generating content with Gemini...');
    const startTime = Date.now();
    
    const content = await generateLaunchPlanServer(testData, 'standard');
    
    const geminiTime = Date.now() - startTime;
    console.log(`✅ Content generated in ${geminiTime}ms`);
    console.log(`   Length: ${content.length} characters`);
    console.log(`   First 200 chars: ${content.substring(0, 200)}...\n`);

    // Step 2: Generate PDF
    console.log('📄 Step 2: Generating PDF from content...');
    const pdfStart = Date.now();
    
    const pdfBuffer = await generatePDFFromContent(testData.productName, content, 'standard');
    
    const pdfTime = Date.now() - pdfStart;
    console.log(`✅ PDF generated in ${pdfTime}ms`);
    console.log(`   Size: ${pdfBuffer.length} bytes`);

    // Step 3: Save to file
    const filename = `test-${testData.productName}-${testData.targetAudience}.pdf`;
    writeFileSync(filename, pdfBuffer);
    console.log(`\n📦 PDF saved to: ${filename}`);

    console.log('\n✨ Test completed successfully!');
  } catch (error) {
    console.error('\n❌ Error during test:');
    console.error(error);
    process.exit(1);
  }
}

testPDFGeneration();
