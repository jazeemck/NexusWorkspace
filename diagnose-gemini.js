const { GoogleGenerativeAI } = require("@google/generative-ai");
const fs = require("fs");

async function diagnose() {
  const resultObj = { success: false, logs: [] };
  const log = (msg) => {
    console.log(msg);
    resultObj.logs.push(msg);
  };

  let apiKey = "";
  try {
    const envContent = fs.readFileSync(".env.local", "utf8");
    const match = envContent.match(/GEMINI_API_KEY=(.+)/);
    if (match) apiKey = match[1].trim();
  } catch (e) {
    log("❌ Could not read .env.local file");
  }

  if (!apiKey) {
    log("❌ GEMINI_API_KEY is missing");
    fs.writeFileSync("diag_result.json", JSON.stringify(resultObj, null, 2));
    return;
  }
  log("✅ API Key found (starts with: " + apiKey.substring(0, 8) + "...)");

  const genAI = new GoogleGenerativeAI(apiKey);
  // Testing the NEWER models from the model list!
  const modelsToTest = ["gemini-1.5-flash", "gemini-1.5-pro", "gemini-2.0-flash", "gemini-2.5-flash", "gemini-3.1-flash-lite-preview"];
  
  for (const modelName of modelsToTest) {
    log(`📡 Testing model: ${modelName}...`);
    try {
      const model = genAI.getGenerativeModel({ model: modelName });
      const result = await model.generateContent("Hello! Response with YES if you hear me");
      const res = await result.response;
      const text = res.text();
      log(`🟢 SUCCESS with ${modelName}! Response: ${text}`);
      resultObj.success = true;
      resultObj.workingModel = modelName;
      break; 
    } catch (error) {
      log(`🔴 FAILED with ${modelName}: ${error.message}`);
    }
  }

  fs.writeFileSync("diag_result.json", JSON.stringify(resultObj, null, 2));
}

diagnose();
