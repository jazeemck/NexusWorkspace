const k1 = process.env.GEMINI_API_KEY;
const k2 = process.env.GEMINI_API_KEY_BACKUP;

async function test(key, label) {
  try {
    const res = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=' + key, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contents: [{ parts: [{ text: "Hi" }] }] })
    });
    console.log(`[${label}] Status: ${res.status}`);
    const text = await res.text();
    console.log(`[${label}] Body:`, text.substring(0, 500));
  } catch (e) {
    console.error(`[${label}] Catch:`, e.message);
  }
}

async function run() {
  require('dotenv').config({ path: '.env.local' });
  await test(process.env.GEMINI_API_KEY, 'Primary');
  if (process.env.GEMINI_API_KEY_BACKUP) {
    await test(process.env.GEMINI_API_KEY_BACKUP, 'Backup');
  } else {
    console.log('No backup key found.');
  }
}
run();
