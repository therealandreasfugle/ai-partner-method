// AI chat endpoint for the client website. Deploys automatically with the site
// (Vercel turns /api/*.js at the project root into serverless functions).
//
// Provider is chosen by whichever ONE key is set on the Vercel project:
//   GROQ_API_KEY    (recommended: free at console.groq.com/keys, no card)
//   GEMINI_API_KEY  (free tier at aistudio.google.com/apikey)
//   OPENAI_API_KEY  (paid, platform.openai.com)
// All three speak the same OpenAI chat format, so one request shape serves all.
// See CHATBOT-SETUP.md for the 2-minute setup.
//
// Business facts come from ./_business.json, written by the website factory at
// build time (Stage 10.1), so the bot knows this client's services, area,
// phone, and hours without any per-site code changes. The key never reaches
// the browser: the widget talks only to this endpoint.

// .mjs on purpose: it is ESM no matter what package.json says, so this one
// file runs both deployed from the project folder (type:module) and dropped
// into a bare static bundle. Business facts are
// baked at build time by build-from-template.py; the new URL(import.meta.url)
// read is the pattern Vercel's file tracer follows, so _business.json ships
// with the function bundle.
import { readFileSync } from 'fs';

let BUSINESS = {};
try {
  BUSINESS = JSON.parse(readFileSync(new URL('./_business.json', import.meta.url), 'utf8')) || {};
} catch (e) { /* generic answers */ }

const PROVIDERS = [
  { env: 'GROQ_API_KEY', url: 'https://api.groq.com/openai/v1/chat/completions', model: 'llama-3.3-70b-versatile' },
  { env: 'GEMINI_API_KEY', url: 'https://generativelanguage.googleapis.com/v1beta/openai/chat/completions', model: 'gemini-2.0-flash' },
  { env: 'OPENAI_API_KEY', url: 'https://api.openai.com/v1/chat/completions', model: 'gpt-4o-mini' },
];

// Best-effort per-IP throttle (per warm instance): keeps a runaway visitor or a
// dumb bot from burning the student's free-tier quota. Not a security boundary.
const hits = new Map();
function rateLimited(ip) {
  const now = Date.now();
  const windowStart = now - 60_000;
  const arr = (hits.get(ip) || []).filter((t) => t > windowStart);
  arr.push(now);
  hits.set(ip, arr);
  if (hits.size > 500) hits.clear();
  return arr.length > 20;
}

function systemPrompt(biz) {
  const name = biz.name || 'this local business';
  const aName = biz.assistantName || 'Alex';
  const lines = [
    `You are ${aName}, the friendly AI assistant for ${name}${biz.trade ? ', a local ' + biz.trade + ' company' : ''}${biz.serviceRegion ? ' serving ' + biz.serviceRegion : ''}.`,
    `Your name is ${aName}. If someone asks your name, tell them warmly ("I'm ${aName}!"). Never say you have no name and never break character.`,
    'Your one job: help visitors and turn them into booked enquiries.',
    'Rules:',
    '- Keep answers short: 1-3 sentences for real questions, ONE short friendly sentence for smalltalk. Plain language, no markdown headings or bullet lists.',
    '- Only talk about this business and its services. For anything else, politely steer back.',
    '- Never invent prices, discounts, or availability. For pricing say a fast free quote is one form away.',
    `- When the visitor is ready, or asks for a quote or callback, tell them to use the quote form on this page${biz.phone ? ' or call ' + biz.phone : ''}.`,
    '- If it is an emergency, tell them to call right away' + (biz.phone ? ' on ' + biz.phone : '') + '.',
    '- Never ask for payment details. Never claim a booking is confirmed; the team confirms every job.',
  ];
  if (biz.services && biz.services.length) lines.push('Services offered: ' + biz.services.join('; ') + '.');
  if (biz.serviceAreas && biz.serviceAreas.length) lines.push('Areas covered: ' + biz.serviceAreas.join(', ') + '.');
  if (biz.hours) lines.push('Opening hours: ' + biz.hours + '.');
  if (biz.description) lines.push('About the business: ' + biz.description);
  if (biz.knowledge) {
    lines.push('Authoritative business knowledge, answer from this first and never contradict it:');
    lines.push(String(biz.knowledge).slice(0, 6000));
  }
  return lines.join('\n');
}

export default async (req, res) => {
  if (req.method !== 'POST') { res.status(405).json({ error: 'POST only' }); return; }

  const provider = PROVIDERS.find((p) => process.env[p.env]);
  if (!provider) { res.status(501).json({ error: 'chat_not_configured' }); return; }

  const ip = (req.headers['x-forwarded-for'] || '').split(',')[0].trim() || 'unknown';
  if (rateLimited(ip)) { res.status(429).json({ error: 'Too many messages, give it a minute.' }); return; }

  let body = req.body;
  if (typeof body === 'string') { try { body = JSON.parse(body); } catch (e) { body = {}; } }
  const raw = Array.isArray(body && body.messages) ? body.messages : [];

  // Keep only well-formed recent turns, hard-capped, so the request stays small
  // and a hostile payload cannot smuggle its own system prompt.
  const messages = raw
    .filter((m) => m && (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string')
    .slice(-10)
    .map((m) => ({ role: m.role, content: m.content.slice(0, 1000) }));
  if (!messages.length || messages[messages.length - 1].role !== 'user') {
    res.status(400).json({ error: 'Send at least one user message.' });
    return;
  }

  try {
    const upstream = await fetch(provider.url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env[provider.env]}`,
      },
      body: JSON.stringify({
        model: process.env.CHAT_MODEL || provider.model,
        messages: [{ role: 'system', content: systemPrompt(BUSINESS) }, ...messages],
        max_tokens: 360,
        temperature: 0.6,
      }),
      signal: AbortSignal.timeout(25_000),
    });
    if (!upstream.ok) {
      const detail = await upstream.text().catch(() => '');
      console.error('chat upstream error', upstream.status, detail.slice(0, 500));
      res.status(502).json({ error: 'The assistant had a hiccup. Try again in a moment.' });
      return;
    }
    const data = await upstream.json();
    const reply = data && data.choices && data.choices[0] && data.choices[0].message
      ? String(data.choices[0].message.content || '').trim()
      : '';
    if (!reply) { res.status(502).json({ error: 'Empty reply, try again.' }); return; }
    res.status(200).json({ reply });
  } catch (e) {
    console.error('chat error', e && e.message);
    res.status(502).json({ error: 'The assistant is unavailable right now.' });
  }
};
