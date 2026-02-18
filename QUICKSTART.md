# ⚡ QUICK START - COPY & PASTE THESE COMMANDS

## 🏠 Test Locally (5 minutes)

1. Open PowerShell in the `agentforge` folder
2. Run these commands ONE BY ONE:

```bash
npm install
```
(Wait 30 seconds)

```bash
npm run dev
```
(Opens at http://localhost:3000)

Press Ctrl+C to stop

---

## 🌐 Deploy to Internet (5 minutes)

```bash
npm install -g vercel
```

```bash
vercel login
```
(Opens browser, click Confirm)

```bash
vercel --prod
```
(Answer questions, press Enter for defaults)

**Your site is LIVE!** ✅

---

## 🔐 Add API Key (ONE TIME ONLY)

```bash
vercel env add ANTHROPIC_API_KEY
```

**Paste this when asked:**
```
ANTHROPIC_API_KEY=your_api_key_here
```

