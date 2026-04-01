const { GoogleGenerativeAI } = require('@google/generative-ai');

async function list() {
  const apiKey = 'AIzaSyCdJ2GundOLjZMGKV199Kk2VENa6XPN1bk';
  const genAI = new GoogleGenerativeAI(apiKey);
  
  try {
    // In @google/generative-ai, we can't easily list models on genAI instance
    // but we can try to guess or use the V1 API manually if needed.
    // Let's try 'gemini-pro'
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
    const result = await model.generateContent('hi');
    console.log('SUCCESS (gemini-pro):', result.response.text());
  } catch (err) {
    console.error('FAILED (gemini-pro):', err.message);
  }
}

list();
