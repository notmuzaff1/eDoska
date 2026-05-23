# 🔑 API Keys - Quick Reference

## Where is the `.env` file?

Located in your project root directory:

```
your-project-folder/
├── .env  ← YOUR API KEYS GO HERE
├── src/
├── public/
└── package.json
```

---

## How to Add API Keys

### Step 1: Open `.env` file
Use any text editor (VS Code, Notepad, etc.)

### Step 2: Replace the placeholders

**Current content:**
```
VITE_YOUTUBE_API_KEY=your_youtube_api_key_here
VITE_OPENAI_API_KEY=your_openai_api_key_here
VITE_GEMINI_API_KEY=your_gemini_api_key_here
VITE_TELEGRAM_BOT_TOKEN=your_telegram_bot_token_here
VITE_API_URL=http://localhost:3001
```

**After adding keys:**
```
VITE_YOUTUBE_API_KEY=AIzaSyD1234567890abcdef
VITE_OPENAI_API_KEY=sk-proj-abc123xyz
VITE_GEMINI_API_KEY=AIzaSy4567890abcdef
VITE_TELEGRAM_BOT_TOKEN=1234567890:ABCDEfghij
VITE_API_URL=http://localhost:3001
```

### Step 3: Save the file

### Step 4: Restart dev server
```bash
# Stop current server (Ctrl+C)
# Then restart:
npm run dev
```

---

## Getting Each API Key (Quicklinks)

### 1. YouTube API
👉 https://console.cloud.google.com/
- Search "YouTube Data API v3"
- Enable it
- Go to Credentials → Create API Key
- Copy key to `.env`

### 2. OpenAI API
👉 https://platform.openai.com/api-keys
- Sign up / Login
- Create new secret key
- Copy to `.env`

### 3. Google Gemini API
👉 https://aistudio.google.com/app/apikey
- Create API key
- Copy to `.env`

### 4. Telegram Bot Token
👉 https://t.me/botfather
- Send `/newbot`
- Follow prompts
- Copy token to `.env`

### 5. Backend URL (Optional)
- Keep as `http://localhost:3001` for local development
- Change to `https://your-server.com` for production

---

## How to Test If Keys Work

### In browser console:

```javascript
// Check if keys are loaded:
console.log(import.meta.env.VITE_YOUTUBE_API_KEY)    // Should show your key
console.log(import.meta.env.VITE_OPENAI_API_KEY)     // Should show your key
console.log(import.meta.env.VITE_GEMINI_API_KEY)     // Should show your key
```

### If you see "undefined"
- Key not added to `.env`
- Server not restarted after adding key
- Check spelling: `VITE_` prefix required

### If you see your key
✅ **It's working!** The app can now use it

---

## What Each API Does

| API | What it does | Optional? |
|-----|-------------|-----------|
| **YouTube** | Search for real educational videos | Yes (uses mock if not added) |
| **OpenAI** | Real AI responses in chat and lesson generator | Yes (uses mock if not added) |
| **Gemini** | Alternative AI (instead of OpenAI) | Yes (uses mock if not added) |
| **Telegram** | Teacher login via Telegram Mini App | Yes (dev auth works without it) |
| **Backend** | Real-time multi-device sync | Yes (works locally without it) |

---

## Without API Keys

✅ **The app works fine without any API keys!**

All features use **mock data/responses**:
- Student picker works
- Whiteboard works
- Browser works
- AI chat responds with demo answers
- AI lesson generator creates sample lessons
- Dashboard displays real schedule

👉 **Add API keys later** when you want real YouTube videos or AI power.

---

## Is the `.env` Secure?

✅ **YES! The `.env` file:**
- Is in `.gitignore` (never uploaded to Git)
- Only readable on your computer
- Not exposed in production build
- Only variables prefixed with `VITE_` are exposed to frontend

⚠️ **But:**
- Don't share your `.env` file
- Don't commit it to Git
- Use different keys for dev/prod environments

---

## Examples

### Example 1: Adding YouTube API Key

1. Get key from Google Cloud Console
2. Open `.env`
3. Replace:
   ```
   VITE_YOUTUBE_API_KEY=AIzaSyD...
   ```
4. Save
5. Restart: `npm run dev`
6. AI Lesson Generator now searches real videos! ✅

### Example 2: Adding OpenAI API Key

1. Get key from OpenAI website
2. Open `.env`
3. Replace:
   ```
   VITE_OPENAI_API_KEY=sk-proj-...
   ```
4. Save
5. Restart: `npm run dev`
6. AI Assistant & Lesson Generator now use ChatGPT! ✅

### Example 3: No API Keys (Just Run)

1. No changes to `.env` needed
2. Run: `npm run dev`
3. Everything works with demo data ✅
4. Add real keys anytime without changing code ✅

---

## FAQ

**Q: Can I run eDoska without API keys?**
A: Yes! All features work with mock data. Add keys anytime for real power.

**Q: Where do I get a Supabase key?**
A: Already included! Supabase is pre-configured.

**Q: What if I add wrong API key?**
A: Will show error in browser console. Check console and fix the key.

**Q: Can I have multiple API keys for different environments?**
A: Yes! Create `.env.local` for dev, `.env.production` for prod.

**Q: Will my API keys be exposed?**
A: No. Variables starting with `VITE_` are only for frontend. Secret keys should go in backend `.env` only.

**Q: How much do API keys cost?**
A: YouTube (free), OpenAI ($5/mo typical), Gemini (free tier), Telegram (free).

---

## Quick Checklist

- [ ] Open `.env` file
- [ ] Add YouTube API key (optional)
- [ ] Add OpenAI API key (optional)
- [ ] Add Telegram Bot token (optional)
- [ ] Save `.env` file
- [ ] Restart dev server with `npm run dev`
- [ ] Test in browser console: `import.meta.env.VITE_YOUTUBE_API_KEY`
- [ ] Done! 🎉

---

**Need more details?** See `API_KEYS_SETUP.md` for comprehensive guide.

