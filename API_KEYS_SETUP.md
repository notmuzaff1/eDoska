# API Keys Setup Guide for eDoska

## Overview

eDoska has several optional API integrations that enhance functionality. This guide shows you how to set up each one.

**Status:**
- ✅ **Supabase** - Already configured (database & auth ready)
- ⏳ **YouTube API** - Optional (for real video search)
- ⏳ **OpenAI/Gemini** - Optional (for real AI responses)
- ⏳ **Telegram Bot** - Optional (for Mini App auth)
- ⏳ **Backend Server** - Optional (for real-time sync)

---

## 📍 Where to Add API Keys

All API keys go in the `.env` file in your project root:

```
project-root/
├── .env  ← PUT YOUR KEYS HERE
├── src/
└── [other files]
```

**Current keys in `.env`:**
```
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...
VITE_YOUTUBE_API_KEY=
VITE_OPENAI_API_KEY=
VITE_GEMINI_API_KEY=
VITE_TELEGRAM_BOT_TOKEN=
VITE_API_URL=
```

---

## 🔑 API Key Setup (Step-by-Step)

### 1️⃣ YouTube API (Optional - For Real Video Discovery)

**Why:** Search for real educational videos related to lesson topics

**Steps:**

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project (or select existing)
3. Enable **YouTube Data API v3**:
   - Search for "YouTube Data API v3"
   - Click "Enable"
4. Create API Key:
   - Go to Credentials (left sidebar)
   - Click "Create Credentials" → API Key
   - Copy the key

5. Add to `.env`:
```
VITE_YOUTUBE_API_KEY=AIzaSyD...your_key_here...
```

6. Update `src/lib/aiLessonGenerator.ts` to use real API:
```typescript
// Replace mock videos with real YouTube API call
const response = await fetch(
  `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${topic}&key=${import.meta.env.VITE_YOUTUBE_API_KEY}`
);
```

**Cost:** Free tier includes 10,000 requests/day

---

### 2️⃣ OpenAI API (Optional - For Real AI Responses)

**Why:** Get real AI-powered lesson generation and chat responses

**Steps:**

1. Go to [OpenAI Platform](https://platform.openai.com/)
2. Sign up / Log in
3. Go to "API keys" section
4. Click "Create new secret key"
5. Copy the key (⚠️ Save it securely - you won't see it again!)

6. Add to `.env`:
```
VITE_OPENAI_API_KEY=sk-proj-...your_key_here...
```

7. Update `src/components/AIAssistant.tsx`:
```typescript
const response = await fetch('https://api.openai.com/v1/chat/completions', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${import.meta.env.VITE_OPENAI_API_KEY}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    model: 'gpt-4',
    messages: [{ role: 'user', content: userMessage }]
  })
});
```

8. Update `src/lib/aiLessonGenerator.ts` for real lesson generation

**Cost:** Pay-as-you-go (typically $0.01-0.03 per 1K tokens)

---

### 3️⃣ Google Gemini API (Optional - Alternative to OpenAI)

**Why:** Alternative AI provider, potentially cheaper

**Steps:**

1. Go to [Google AI Studio](https://aistudio.google.com/)
2. Click "Get API key"
3. Create API key in Google Cloud
4. Copy the key

5. Add to `.env`:
```
VITE_GEMINI_API_KEY=AIzaSy...your_key_here...
```

6. Use in code:
```typescript
const response = await fetch(
  `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${import.meta.env.VITE_GEMINI_API_KEY}`,
  {
    method: 'POST',
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }]
    })
  }
);
```

**Cost:** Free tier + paid options

---

### 4️⃣ Telegram Bot Token (Optional - For Mini App Auth)

**Why:** Real teacher authentication via Telegram

**Steps:**

1. Open Telegram and chat with [@BotFather](https://t.me/botfather)
2. Send `/newbot`
3. Follow prompts:
   - Name: "eDoska Classroom"
   - Username: "edoska_classroom_bot"
4. Copy the token you receive

5. Add to `.env`:
```
VITE_TELEGRAM_BOT_TOKEN=7890123456:ABCDef...your_token_here...
```

6. Use in backend for Mini App verification (see Backend section below)

**Cost:** Free

---

### 5️⃣ Backend Server (Optional - For Real-Time Sync)

**Why:** Multi-device synchronization, real Socket.IO connection

**Steps:**

1. **Create Node.js backend:**
```bash
mkdir edoska-backend
cd edoska-backend
npm init -y
npm install express socket.io cors dotenv
```

2. **Create `server.js`:**
```javascript
const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const cors = require('cors');

const app = express();
const server = http.createServer(app);
const io = socketIO(server, {
  cors: { origin: 'http://localhost:5173' }
});

app.use(cors());
app.use(express.json());

io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  socket.on('authenticate', (data) => {
    console.log('Authentication request:', data.sessionId);
    io.emit('authenticated', { sessionId: data.sessionId });
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

server.listen(3001, () => {
  console.log('Server running on port 3001');
});
```

3. **Start backend:**
```bash
node server.js
```

4. **Add to `.env`:**
```
VITE_API_URL=http://localhost:3001
```

5. **Update `src/lib/socketManager.ts`:**
```typescript
const serverUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';
socketInstance = io(serverUrl, { /* ... */ });
```

**Cost:** Free (self-hosted or cloud hosting)

---

## 🚀 How to Use API Keys in Code

### Environment Variables Access

```typescript
// In any React component or library:
const apiKey = import.meta.env.VITE_YOUTUBE_API_KEY;
const openaiKey = import.meta.env.VITE_OPENAI_API_KEY;
const geminiKey = import.meta.env.VITE_GEMINI_API_KEY;
const backendUrl = import.meta.env.VITE_API_URL;
```

### Example: Using YouTube API in AILessonGenerator

```typescript
// src/lib/aiLessonGenerator.ts

export const aiLessonGenerator = {
  getRelatedVideos: async (subject: string): Promise<YouTubeVideo[]> => {
    const apiKey = import.meta.env.VITE_YOUTUBE_API_KEY;
    
    if (!apiKey) {
      // Fall back to mock data if no API key
      return mockYoutubeVideos[subject] || [];
    }

    try {
      const response = await fetch(
        `https://www.googleapis.com/youtube/v3/search?` +
        `part=snippet&q=${subject}&type=video&key=${apiKey}`
      );
      const data = await response.json();
      
      return data.items.map((item: any) => ({
        id: item.id.videoId,
        title: item.snippet.title,
        thumbnail: item.snippet.thumbnails.default.url,
        duration: '45:00', // Would need another API call for this
        views: '1M+'
      }));
    } catch (error) {
      console.error('YouTube API error:', error);
      return mockYoutubeVideos[subject] || [];
    }
  }
};
```

### Example: Using OpenAI in AIAssistant

```typescript
// src/components/AIAssistant.tsx

const handleSendMessage = async (text: string) => {
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
  
  if (!apiKey) {
    // Use mock response if no API key
    setMessages(prev => [...prev, mockResponse]);
    return;
  }

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: `You are an educational AI assistant for subject: ${subject}` },
          { role: 'user', content: text }
        ]
      })
    });

    const data = await response.json();
    const aiResponse = data.choices[0].message.content;
    // Use real response
  } catch (error) {
    console.error('OpenAI error:', error);
    // Fall back to mock
  }
};
```

---

## ⚙️ Development vs Production

### Development (.env)
```
VITE_YOUTUBE_API_KEY=your_dev_key
VITE_OPENAI_API_KEY=your_dev_key
VITE_API_URL=http://localhost:3001
```

### Production (.env.production)
```
VITE_YOUTUBE_API_KEY=your_prod_key
VITE_OPENAI_API_KEY=your_prod_key
VITE_API_URL=https://api.yourdomain.com
```

---

## 🔒 Security Best Practices

⚠️ **IMPORTANT:**

1. **Never commit `.env` to Git**
   - Add to `.gitignore` (already done)
   ```
   .env
   .env.local
   .env.*.local
   ```

2. **Use environment-specific keys**
   - Dev keys for development
   - Prod keys for production

3. **Frontend vs Backend keys**
   - ✅ Frontend: Public/Anon keys (limited scope)
   - ❌ Never expose: Secret/Private keys on frontend
   - ✅ Backend only: Secret keys (in Node.js server)

4. **Rotate keys regularly**
   - Delete old keys after switching

5. **Set API quotas**
   - YouTube: Restrict to Search API only
   - OpenAI: Set monthly budget limits
   - Telegram: Only allow specific domains

---

## 📋 Quick Checklist

- [ ] Copy your YouTube API key to `.env`
- [ ] Copy your OpenAI API key to `.env`
- [ ] Copy your Gemini API key to `.env`
- [ ] Copy your Telegram Bot token to `.env`
- [ ] Set up backend server (optional)
- [ ] Copy backend URL to `.env`
- [ ] Never commit `.env` to Git
- [ ] Test each integration
- [ ] Set API quotas/limits

---

## 🆘 Troubleshooting

### "API key not found" error
**Solution:** Make sure key is in `.env` with correct variable name starting with `VITE_`

### "API request failed"
**Solution:** 
- Check API key is valid
- Check API is enabled in provider console
- Check network tab for actual error
- Verify CORS headers if cross-origin

### "Mock data still showing"
**Solution:** 
- Reload page after adding key
- Check console for errors
- Verify environment variable loaded: `console.log(import.meta.env.VITE_YOUTUBE_API_KEY)`

### "Rate limit exceeded"
**Solution:**
- Check provider dashboard for usage
- Upgrade plan if needed
- Implement caching to reduce calls

---

## 📞 Support

Each API provider has documentation:
- [YouTube API Docs](https://developers.google.com/youtube/v3)
- [OpenAI API Docs](https://platform.openai.com/docs)
- [Google Gemini Docs](https://ai.google.dev/docs)
- [Telegram Bot API](https://core.telegram.org/bots/api)

---

## Summary

| API | Type | Optional? | Cost | Setup Time |
|-----|------|-----------|------|------------|
| Supabase | Database | No (included) | Free | Done ✅ |
| YouTube | Search videos | Yes | Free | 10 min |
| OpenAI | AI responses | Yes | ~$5/mo | 5 min |
| Gemini | AI responses | Yes | Free | 5 min |
| Telegram | Auth | Yes | Free | 10 min |
| Backend | Real-time | Yes | Variable | 30 min |

**Start with:** YouTube + OpenAI for maximum impact!

