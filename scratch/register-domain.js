import 'dotenv/config';

const VERCEL_API_TOKEN = process.env.VERCEL_API_TOKEN;
const VERCEL_PROJECT_ID = process.env.VERCEL_PROJECT_ID;

async function run() {
  if (!VERCEL_API_TOKEN || !VERCEL_PROJECT_ID) {
    console.error('Missing Vercel env vars');
    return;
  }
  
  const domain = 'damianminniti.com';
  console.log(`Adding domain ${domain} to Vercel...`);
  
  const response = await fetch(`https://api.vercel.com/v9/projects/${VERCEL_PROJECT_ID}/domains`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${VERCEL_API_TOKEN}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ name: domain })
  });

  const data = await response.json();
  console.log('Response status:', response.status);
  console.log('Response data:', data);
}

run();
