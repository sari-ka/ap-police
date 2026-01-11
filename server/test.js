require('dotenv').config({ path: './.env' });
const { ChatGoogleGenerativeAI } = require("@langchain/google-genai");

const modelNames = [
  "gemini-pro",
  "gemini-1.5-pro",
  "gemini-1.5-flash",
  "gemini-2.0-flash-exp",
  "models/gemini-pro",
  "models/gemini-1.5-flash"
];

async function testModels() {
  console.log('🔑 API Key:', process.env.GEMINI_API_KEY ? 'Loaded ✅\n' : 'Missing ❌\n');
  
  for (const modelName of modelNames) {
    try {
      console.log(`🧪 Testing: ${modelName}`);
      
      const model = new ChatGoogleGenerativeAI({
        model: modelName,
        apiKey: process.env.GEMINI_API_KEY,
        temperature: 0,
      });
      
      const response = await model.invoke("Say 'test successful'");
      console.log(`✅ ${modelName} WORKS!`);
      console.log(`   Response: ${response.content}\n`);
      
    } catch (error) {
      console.log(`❌ ${modelName} FAILED`);
      console.log(`   Error: ${error.message}\n`);
    }
    
    // Wait 2 seconds between tests to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
  
  console.log('\n✅ Test complete!');
}

testModels();