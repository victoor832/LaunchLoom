console.log('VITE_GEMINI_API_KEY:', process.env.VITE_GEMINI_API_KEY?.substring(0, 10) + '...');
console.log('GEMINI_API_KEY:', process.env.GEMINI_API_KEY?.substring(0, 10) + '...');

const apiKey = process.env.VITE_GEMINI_API_KEY || process.env.GEMINI_API_KEY || '';
console.log('Selected API key:', apiKey.substring(0, 10) + '...');
console.log('API key length:', apiKey.length);
