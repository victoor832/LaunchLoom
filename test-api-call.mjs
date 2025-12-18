#!/usr/bin/env node
/**
 * Test script to call the API endpoint directly
 * This will help us see what error is happening on the server
 */

const apiUrl = 'https://p01--launchloom--4zv2kh7sbk9r.code.run/api/generate-pdf';

const testPayload = {
  productName: 'TrustMRR',
  targetAudience: 'b2b',
  launchDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  tier: 'standard',
};

console.log('🧪 Testing API endpoint directly');
console.log(`📍 URL: ${apiUrl}`);
console.log(`📦 Payload:`, testPayload);
console.log('\n');

async function testAPI() {
  try {
    console.log('⏳ Sending request...');
    const startTime = Date.now();

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testPayload),
    });

    const elapsed = Date.now() - startTime;
    console.log(`✓ Response received in ${elapsed}ms`);
    console.log(`📊 Status: ${response.status} ${response.statusText}`);

    // Log headers
    console.log('\n📋 Response Headers:');
    for (const [key, value] of response.headers.entries()) {
      console.log(`   ${key}: ${value}`);
    }

    const contentType = response.headers.get('content-type');
    
    if (contentType && contentType.includes('application/pdf')) {
      console.log('\n✅ Got PDF response!');
      const buffer = await response.arrayBuffer();
      console.log(`📦 PDF size: ${buffer.byteLength} bytes`);
    } else if (contentType && contentType.includes('application/json')) {
      console.log('\n📄 Got JSON response:');
      const data = await response.json();
      console.log(JSON.stringify(data, null, 2));
    } else {
      const text = await response.text();
      console.log('\n📝 Response text:');
      console.log(text.substring(0, 500));
    }
  } catch (error) {
    console.error('\n❌ Error:', error.message);
  }
}

testAPI();
