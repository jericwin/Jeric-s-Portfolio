// POST /api/chat — the portfolio's "Ask about Jeric" chatbot.
// Works as a Vercel serverless function and is also mounted by server.js (local / Render).
//
// Answers stream back as plain text. Free AI providers are tried in order; a provider is skipped when it
// has no key, errors, or doesn't start answering in time:
//   1. Groq          GROQ_API_KEY      free key: https://console.groq.com/keys   (fastest)
//                    The free tier allows ~8k input tokens/min per model, so three models are rotated;
//                    a rate-limited model is skipped until Groq says it's ready again.
//   2. Google Gemini GEMINI_API_KEY    free key: https://aistudio.google.com/apikey
//   3. Vercel AI Gateway               AI_GATEWAY_API_KEY, or automatic OIDC auth on Vercel
//   4. Pollinations                    free, no key needed (slower, shared queue)
//   5. Offline brain (api/_brain.js)   always works; keyword + typo-tolerant answers
// Optional model overrides: GROQ_MODEL, GEMINI_MODEL, CHAT_MODEL (AI Gateway). Set CHAT_DISABLE_POLLINATIONS=1 to skip #4.
// The X-Chat-Source response header says which one answered.

import { SYSTEM_PROMPT } from './_profile.js';
import { offlineReply } from './_brain.js';

const MAX_MESSAGES = 12;      // conversation turns sent to the model
const MAX_CHARS = 1000;       // per visitor message
const ANSWER_MS = 45000;      // hard cap on one streamed answer

function providers(req) {
  const env = process.env;
  const list = [];
  if (env.GROQ_API_KEY) {
    const models = env.GROQ_MODEL ? [env.GROQ_MODEL] : ['qwen/qwen3.8-27b', 'openai/gpt-oss-120b', 'openai/gpt-oss-20b'];
    for (const model of models) list.push({
      name: `groq:${model}`, firstTokenMs: 10000,
      url: 'https://api.groq.com/openai/v1/chat/completions',
      key: env.GROQ_API_KEY, model,
      extra: model.startsWith('openai/gpt-oss') ? { reasoning_effort: 'low', include_reasoning: false } : undefined,
    });
  }
  if (env.GEMINI_API_KEY) list.push({
    name: 'gemini', firstTokenMs: 12000,
    url: 'https://generativelanguage.googleapis.com/v1beta/openai/chat/completions',
    key: env.GEMINI_API_KEY, model: env.GEMINI_MODEL || 'gemini-2.5-flash',
    extra: { reasoning_effort: 'none' },
  });
  const gatewayKey = env.AI_GATEWAY_API_KEY || req.headers['x-vercel-oidc-token'] || unexpired(env.VERCEL_OIDC_TOKEN);
  if (gatewayKey) list.push({
    name: 'ai-gateway', firstTokenMs: 12000,
    url: 'https://ai-gateway.vercel.sh/v1/chat/completions',
    key: gatewayKey, model: env.CHAT_MODEL || 'anthropic/claude-haiku-5.5',
  });
  if (env.CHAT_DISABLE_POLLINATIONS !== '1') list.push({
    name: 'pollinations', firstTokenMs: 20000,
    url: 'https://text.pollinations.ai/openai',
    key: '', model: 'openai',
    extra: { reasoning_effort: 'low' },
  });
  return list.filter(p => !(cooldown.get(p.name) > Date.now()));
}

// Providers that answered 429 are skipped until their retry time.
const cooldown = new Map();

// Local `vercel env pull` tokens expire after ~12 hours; skip one that already has.
function unexpired(jwt) {
  if (!jwt) return '';
  try {
    const { exp } = JSON.parse(Buffer.from(jwt.split('.')[1], 'base64url').toString());
    return !exp || exp * 1000 > Date.now() ? jwt : '';
  } catch { return jwt; }
}

// In-memory rate limit: 20 questions per IP per 10 minutes (per server instance).
const WINDOW_MS = 10 * 60 * 1000;
const MAX_PER_WINDOW = 20;
const hits = new Map();

function clientIp(req) {
  const fwd = req.headers['x-forwarded-for'];
  return (typeof fwd === 'string' && fwd.split(',')[0].trim()) || req.socket?.remoteAddress || 'unknown';
}

function rateLimited(ip) {
  const now = Date.now();
  const recent = (hits.get(ip) || []).filter(t => now - t < WINDOW_MS);
  recent.push(now);
  hits.set(ip, recent);
  if (hits.size > 5000) hits.clear();
  return recent.length > MAX_PER_WINDOW;
}

async function readBody(req) {
  if (req.body && typeof req.body === 'object') return req.body; // already parsed (Vercel)
  if (typeof req.body === 'string') return JSON.parse(req.body);
  let raw = '';
  for await (const chunk of req) {
    raw += chunk;
    if (raw.length > 40000) throw new Error('Body too large');
  }
  return raw ? JSON.parse(raw) : {};
}

function startText(res, status, source) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'text/plain; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('X-Accel-Buffering', 'no');
  if (source) res.setHeader('X-Chat-Source', source);
}

function sendText(res, status, text, source) {
  startText(res, status, source);
  res.end(text);
}

// Keep only well-formed user/assistant turns, newest last, starting with a user turn.
function cleanMessages(list) {
  if (!Array.isArray(list)) return [];
  const out = list
    .filter(m => m && (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string')
    .map(m => ({ role: m.role, content: m.content.trim().slice(0, MAX_CHARS) }))
    .filter(m => m.content)
    .slice(-MAX_MESSAGES);
  while (out.length && out[0].role !== 'user') out.shift();
  return out;
}

/**
 * Streams one provider's answer into `res`.
 * Resolves true once the answer has been streamed, false if the provider failed before sending any text
 * (so the next provider can be tried). Never throws.
 */
async function streamFrom(p, messages, req, res) {
  const ctrl = new AbortController();
  // The visitor closed the page: stop paying for tokens nobody will read.
  const onClose = () => { if (!res.writableEnded) ctrl.abort(); };
  res.on('close', onClose);
  let timer = setTimeout(() => ctrl.abort(), p.firstTokenMs);
  let started = false;
  try {
    const r = await fetch(p.url, {
      method: 'POST',
      signal: ctrl.signal,
      headers: { 'Content-Type': 'application/json', ...(p.key ? { Authorization: `Bearer ${p.key}` } : {}) },
      body: JSON.stringify({
        model: p.model,
        stream: true,
        max_tokens: 700,
        temperature: 0.4,
        messages: [{ role: 'system', content: SYSTEM_PROMPT }, ...messages],
        ...(p.extra || {}),
      }),
    });
    if (!r.ok || !r.body) {
      if (r.status === 429) {
        const wait = Number(r.headers.get('retry-after')) || 20;
        cooldown.set(p.name, Date.now() + Math.min(wait, 3600) * 1000);
      }
      const detail = await r.text().catch(() => '');
      console.error(`[chat] ${p.name} ${r.status}:`, detail.slice(0, 200));
      return false;
    }
    const decoder = new TextDecoder();
    let buffer = '';
    for await (const chunk of r.body) {
      buffer += decoder.decode(chunk, { stream: true });
      let nl;
      while ((nl = buffer.indexOf('\n')) !== -1) {
        const line = buffer.slice(0, nl).trim();
        buffer = buffer.slice(nl + 1);
        if (!line.startsWith('data:')) continue;
        const data = line.slice(5).trim();
        if (data === '[DONE]') continue;
        let delta;
        try { delta = JSON.parse(data).choices?.[0]?.delta?.content; } catch { continue; }
        if (!delta) continue;
        if (!started) {
          started = true;
          clearTimeout(timer);
          timer = setTimeout(() => ctrl.abort(), ANSWER_MS);
          startText(res, 200, p.name);
        }
        res.write(delta);
      }
    }
    if (!started) console.error(`[chat] ${p.name}: empty answer`);
    return started;
  } catch (err) {
    if (!started) console.error(`[chat] ${p.name}: ${err.name === 'AbortError' ? 'too slow, skipped' : err.message}`);
    return started; // a stream cut mid-answer still counts as answered
  } finally {
    clearTimeout(timer);
    res.off('close', onClose);
  }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return sendText(res, 405, 'Method not allowed.');
  }

  let body;
  try {
    body = await readBody(req);
  } catch {
    return sendText(res, 400, 'Invalid request.');
  }

  const messages = cleanMessages(body.messages);
  const last = messages[messages.length - 1];
  if (!last || last.role !== 'user') return sendText(res, 400, 'Please type a question.');

  if (rateLimited(clientIp(req))) {
    return sendText(res, 429, "You've asked a lot of questions in a short time. Please wait a few minutes, or email Jeric at punay.jeric@gmail.com.");
  }

  for (const p of providers(req)) {
    if (res.destroyed) return;
    if (await streamFrom(p, messages, req, res)) return res.end();
  }
  return sendText(res, 200, offlineReply(messages), 'offline');
}
