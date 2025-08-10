# trendy.ai — Social Media Caption Agent

Generate 30 bilingual captions + hashtags for Tanzanian SMEs.

## Deploy with Vercel (no coding)
1) Create a free account at https://vercel.com
2) Click "New Project" → "Import" → choose your GitHub repository (trendy-ai).
3) In Vercel project → Settings → Environment Variables, add:
   - LLM_PROVIDER = openrouter
   - OPENROUTER_API_KEY = sk-... (get from openrouter.ai)
   - OPENROUTER_MODEL = meta-llama/llama-3.1-8b-instruct:free
   - SITE_URL = https://trendy-ai.vercel.app
4) Click "Deploy". Your site will be live in ~1 minute.

## Run locally (optional)
1) Install Node.js 18+
2) npm install
3) Copy `.env.local.example` to `.env.local`, fill your keys
4) npm run dev → open http://localhost:3000

## Customize
- Replace /public/logo.svg with your logo.
- Colors are in src/app/page.tsx under `styles`.
