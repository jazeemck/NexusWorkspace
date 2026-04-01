const fs = require("fs");

async function listModels() {
  let apiKey = "";
  try {
    const envContent = fs.readFileSync(".env.local", "utf8");
    const match = envContent.match(/GEMINI_API_KEY=(.+)/);
    if (match) apiKey = match[1].trim();
  } catch (e) {}

  if (!apiKey) return;

  try {
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
    const data = await res.json();
    fs.writeFileSync("models_list.json", JSON.stringify(data, null, 2));
    console.log("Success! Models listed in models_list.json");
  } catch (e) {
    fs.writeFileSync("models_list.json", JSON.stringify({ error: e.message }, null, 2));
    console.error("Error:", e.message);
  }
}

listModels();
