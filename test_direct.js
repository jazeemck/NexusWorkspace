const k1 = 'AIzaSyAU8UlNFNN2LqjvUD5tMfLaSclOm4hi6qo';
const k2 = 'AIzaSyCj9HlFQ3HC99BDcFjkrY5zJX2z_4j5HSg';

async function test(key, label) {
  try {
    const res = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=' + key, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contents: [{ parts: [{ text: "Explain the word validation" }] }] })
    });
    console.log(`[${label}] Status: ${res.status}`);
    const text = await res.text();
    console.log(`[${label}] Body:`, text.substring(0, 100));
  } catch (e) {
    console.error(`[${label}] Catch:`, e.message);
  }
}

async function run() {
  await test(k1, 'Primary');
  await test(k2, 'Backup');
}
run();
