import { GoogleGenerativeAI } from '@google/generative-ai';

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  console.error('❌ GEMINI_API_KEY not set');
  process.exit(1);
}

console.log('🔍 Testing Gemini API...');

const client = new GoogleGenerativeAI({ apiKey });
const model = client.getGenerativeModel({ model: 'gemini-2.5-flash' });

(async () => {
  try {
    console.log('📤 Sending request to Gemini...');
    const startTime = Date.now();
    
    const response = await model.generateContent({
      contents: [{
        role: 'user',
        parts: [{
          text: 'Say hello'
        }]
      }]
    });

    const elapsed = Date.now() - startTime;
    console.log(`✅ Success (${elapsed}ms)`);
    
    if (response.response.candidates && response.response.candidates[0]) {
      const text = response.response.candidates[0].content.parts[0].text;
      console.log(`📝 Response: "${text.substring(0, 100)}..."`);
    }
    
    // Try another request to see if quota is hit
    console.log('\n📤 Sending second request...');
    const startTime2 = Date.now();
    
    const response2 = await model.generateContent('Say goodbye');
    const elapsed2 = Date.now() - startTime2;
    console.log(`✅ Success (${elapsed2}ms)`);
    
  } catch (err) {
    console.error('❌ Error:', err instanceof Error ? err.message : String(err));
  }
})();
