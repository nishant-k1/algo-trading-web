# algo-trading-web

Frontend for the algo trading app (Vite + React + TypeScript). Deploy on **Vercel**.

## Push to GitHub

1. Create a new repo on GitHub named `algo-trading-web` (no README/license).
2. Then run:

```bash
cd /Users/nishantkumar/dev/algo-trading-web
git remote add origin https://github.com/YOUR_USERNAME/algo-trading-web.git
git push -u origin main
```

## Deploy on Vercel

- **Build command:** `npm run build`
- **Output directory:** `dist`
- **Environment variable:** `VITE_API_BASE_URL` = your Render backend URL (e.g. `https://algo-trading-core.onrender.com`)
