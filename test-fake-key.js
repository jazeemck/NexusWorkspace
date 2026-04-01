const { GoogleGenerativeAI } = require('@google/generative-ai');

async function test() {
  const apiKey = 'THIS_IS_A_FAKE_KEY_12345';
  const genAI = new GoogleGenerativeAI(apiKey);
  const modelName = 'gemini-1.5-flash';

  console.log(`--- Testing model: ${modelName} with FAKE KEY ---`);
  try {
    const model = genAI.getGenerativeModel({ model: modelName });
    const result = await model.generateContent('Say hello');
    console.log('SUCCESS:', result.response.text());
  } catch (err) {
    console.log('ERROR STATUS:', err.status);
    console.log('ERROR MESSAGE:', err.message);
  }
}

test();
