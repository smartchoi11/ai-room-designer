const fs = require('fs');
const path = require('path');

const envContent = fs.readFileSync(path.join(__dirname, '../.env.local'), 'utf-8');
envContent.split('\n').forEach(line => {
  const [k, v] = line.split('=');
  if (k && v) process.env[k.trim()] = v.trim().replace(/^"|"$/g, '');
});

const apiKey = process.env.GEMINI_API_KEY;

async function listModels() {
  const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;
  const res = await fetch(url);
  const data = await res.json();
  if (data.models) {
    console.log("Available models:");
    data.models.forEach(m => {
      console.log("- " + m.name + " (" + m.supportedGenerationMethods.join(', ') + ")");
    });
  } else {
    console.log("Error response:", data);
  }
}

listModels();
