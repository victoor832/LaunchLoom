import https from 'https';

// Test production endpoint
const productionUrl = 'p01--launchloom--4zv2kh7sbk9r.code.run';

const payload = {
  productName: 'TestProduct',
  targetAudience: 'Tech Startups',
  launchDate: '2025-12-25',
  tier: 'standard',
  daysToLaunch: 5
};

console.log('🔍 Testing production API...');
console.log(`URL: https://${productionUrl}/api/generate-pdf`);
console.log(`Payload: ${JSON.stringify(payload, null, 2)}`);

const options = {
  hostname: productionUrl,
  port: 443,
  path: '/api/generate-pdf',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(JSON.stringify(payload))
  }
};

const req = https.request(options, (res) => {
  console.log(`\n📊 Response Status: ${res.statusCode}`);
  
  let data = Buffer.alloc(0);
  
  res.on('data', (chunk) => {
    data = Buffer.concat([data, chunk]);
  });
  
  res.on('end', () => {
    console.log(`📦 Response Size: ${data.length} bytes`);
    
    // Try to parse JSON response
    try {
      const json = JSON.parse(data.toString());
      console.log(`\n📄 Response (JSON):`);
      console.log(JSON.stringify(json, null, 2));
    } catch (e) {
      // Might be PDF binary data
      if (data.length > 1000) {
        console.log(`\n✅ Appears to be PDF (${data.length} bytes of binary data)`);
        // Check if it starts with PDF magic number
        if (data[0] === 0x25 && data[1] === 0x50 && data[2] === 0x44 && data[3] === 0x46) {
          console.log(`✓ Confirmed: Valid PDF file`);
          // Save to temp file
          const fs = require('fs');
          fs.writeFileSync('/tmp/prod-test.pdf', data);
          console.log(`✓ Saved to /tmp/prod-test.pdf`);
          
          // Try pdfinfo
          const { execSync } = require('child_process');
          try {
            const result = execSync('pdfinfo /tmp/prod-test.pdf 2>&1 | grep -E "Pages|Title|Producer"').toString();
            console.log('\n📋 PDF Info:');
            console.log(result);
          } catch (e) {
            console.log('Note: pdfinfo not available');
          }
        } else {
          console.log(`First bytes: ${data.slice(0, 20).toString('hex')}`);
        }
      } else {
        console.log(`\n📄 Response (Text):\n${data.toString('utf-8')}`);
      }
    }
  });
});

req.on('error', (e) => {
  console.error(`❌ Error: ${e.message}`);
});

req.write(JSON.stringify(payload));
req.end();
