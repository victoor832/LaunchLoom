import { GoogleGenerativeAI } from '@google/generative-ai';

// Probar con API key sin comillas
const apiKey = 'AIzaSyDpotqyXg0gDTh-dHUc4iAmXqOoRze3TK4';
console.log('Testing with apiKey:', apiKey.substring(0, 15) + '...');

const genAI = new GoogleGenerativeAI({ apiKey });
const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

(async () => {
  try {
    console.log('Sending request...');
    const response = await model.generateContent('Say hello briefly');
    console.log('✅ Success!');
    console.log('Response:', response.response.text().substring(0, 50));
  } catch (err) {
    console.error('❌ Error:', err instanceof Error ? err.message : String(err));
  }
})();
