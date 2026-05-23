const OLLAMA_HOST = import.meta.env.VITE_OLLAMA_BASE_URL || 'http://localhost:11434';
const GROQ_KEY = import.meta.env.VITE_GROQ_API_KEY;
const OPENROUTER_KEY = import.meta.env.VITE_OPENROUTER_API_KEY;
const GEMINI_KEY = import.meta.env.VITE_GEMINI_API_KEY;

export interface SlideData {
  id: number;
  title: string;
  content: string;
}

export interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: number;
}

export interface GeneratedPresentation {
  slides: SlideData[];
  quiz: QuizQuestion[];
  summary: string;
}

const tryOllama = async (prompt: string): Promise<string> => {
  const res = await fetch(`${OLLAMA_HOST}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'llama3.2:3b',
      messages: [{ role: 'user', content: prompt }],
      stream: false,
      options: { temperature: 0.5 },
    }),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Ollama returned status ${res.status}: ${text}`);
  }
  const data = await res.json();
  const output = data.message?.content || '';
  if (!output) throw new Error('Ollama returned empty response');
  return output;
};

const tryGroq = async (prompt: string): Promise<string> => {
  if (!GROQ_KEY) throw new Error('No Groq API key configured');
  console.log('[AI] Calling Groq API...');
  const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${GROQ_KEY}`,
    },
    body: JSON.stringify({
      model: 'llama-3.1-8b-instant',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.5,
    }),
  });
  if (!res.ok) {
    const text = await res.text();
    console.error('[AI] Groq error response:', text);
    throw new Error(`Groq returned status ${res.status}: ${text}`);
  }
  const data = await res.json();
  console.log('[AI] Groq success, got response of length:', data.choices?.[0]?.message?.content?.length);
  return data.choices?.[0]?.message?.content || '';
};

const tryOpenRouter = async (prompt: string): Promise<string> => {
  if (!OPENROUTER_KEY) throw new Error('No OpenRouter API key configured');
  const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${OPENROUTER_KEY}`,
      'HTTP-Referer': window.location.origin,
    },
    body: JSON.stringify({
      model: 'google/gemini-2.0-flash-exp:free',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.5,
    }),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`OpenRouter returned status ${res.status}: ${text}`);
  }
  const data = await res.json();
  return data.choices?.[0]?.message?.content || '';
};

const tryGemini = async (prompt: string): Promise<string> => {
  if (!GEMINI_KEY) throw new Error('No Gemini API key configured');
  const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_KEY}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.5 },
    }),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Gemini returned status ${res.status}: ${text}`);
  }
  const data = await res.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text || '';
};

const generateContent = async (prompt: string): Promise<string> => {
  const errors: string[] = [];

  // Try Ollama first (local dev)
  try {
    console.log('[AI] Trying Ollama...');
    return await tryOllama(prompt);
  } catch (e: any) {
    console.warn('[AI] Ollama failed:', e.message);
    errors.push(`Ollama: ${e.message}`);
  }

  // Try Groq (fast & free)
  try {
    console.log('[AI] Trying Groq...');
    return await tryGroq(prompt);
  } catch (e: any) {
    console.warn('[AI] Groq failed:', e.message);
    errors.push(`Groq: ${e.message}`);
  }

  // Try OpenRouter
  try {
    console.log('[AI] Trying OpenRouter...');
    return await tryOpenRouter(prompt);
  } catch (e: any) {
    console.warn('[AI] OpenRouter failed:', e.message);
    errors.push(`OpenRouter: ${e.message}`);
  }

  // Try Gemini as last resort
  try {
    console.log('[AI] Trying Gemini...');
    return await tryGemini(prompt);
  } catch (e: any) {
    console.warn('[AI] Gemini failed:', e.message);
    errors.push(`Gemini: ${e.message}`);
  }

  throw new Error(
    'All AI providers failed.\n\n' + errors.join('\n') + '\n\n' +
    'To use locally:\n' +
    '1. Run: ollama serve\n' +
    '2. Run: ollama pull llama3.2:3b\n' +
    '3. Refresh this page\n\n' +
    'For cloud AI, add API keys in .env:\n' +
    '- VITE_GROQ_API_KEY (free at https://console.groq.com/keys)\n' +
    '- VITE_OPENROUTER_API_KEY (free at https://openrouter.ai/keys)\n' +
    '- VITE_GEMINI_API_KEY (free at https://aistudio.google.com/apikey)'
  );
};

export const generatePresentation = async (subject: string, topic: string): Promise<GeneratedPresentation> => {
  const prompt = `Create a lesson about "${topic}" in "${subject}".

Return ONLY this JSON (no markdown, no extra text):
{
  "slides": [
    {"id":1,"title":"Slide title","content":"• point 1\\n• point 2\\n• point 3"}
  ],
  "quiz": [
    {"question":"Question?","options":["A) opt1","B) opt2","C) opt3","D) opt4"],"correctAnswer":0}
  ],
  "summary": "Summary paragraph."
}

- 6 slides with bullet points (•)
- 4 quiz questions with 4 options each
- 1 summary paragraph
- Text only`;

  const text = await generateContent(prompt);

  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    console.error('[AI] No JSON found in output. Full output:', text);
    throw new Error(
      `AI returned unexpected text. First 300 chars: ${text.slice(0, 300)}`
    );
  }

  try {
    const parsed = JSON.parse(jsonMatch[0]);
    if (!parsed.slides || !parsed.quiz || !parsed.summary) {
      throw new Error('Missing required fields (slides, quiz, or summary)');
    }
    return parsed;
  } catch (e: any) {
    throw new Error(`Failed to parse AI response as JSON: ${e.message}\n\nRaw JSON: ${jsonMatch[0].slice(0, 300)}`);
  }
};

export const generateLessonResponse = async (subject: string, question: string): Promise<string> => {
  const prompt = `You are a teacher assistant for "${subject}". Answer concisely (2-3 paragraphs, bullet points where helpful).\n\nQuestion: ${question}`;
  return generateContent(prompt);
};