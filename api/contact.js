// POST /api/contact — sends a portfolio contact-form message to the owner's Gmail.
// Works as a Vercel serverless function and is also mounted by server.js (local / Render).
//
// Required environment variables:
//   GMAIL_USER          the Gmail address that sends the mail (e.g. punay.jeric@gmail.com)
//   GMAIL_APP_PASSWORD  a Google "App password" for that account (not the normal password)
// Optional:
//   CONTACT_TO          where messages are delivered (defaults to GMAIL_USER)

import nodemailer from 'nodemailer';

const LIMITS = { name: 100, email: 200, message: 5000 };
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Simple in-memory rate limit: 5 messages per IP per 10 minutes (per server instance).
const WINDOW_MS = 10 * 60 * 1000;
const MAX_PER_WINDOW = 5;
const hits = new Map();

let transporter;
function getTransporter() {
  if (!transporter) {
    const user = (process.env.GMAIL_USER || '').trim();
    const pass = (process.env.GMAIL_APP_PASSWORD || '').replace(/\s+/g, '');
    transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      auth: { user, pass },
    });
  }
  return transporter;
}

function send(res, status, payload) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  res.end(JSON.stringify(payload));
}

async function readBody(req) {
  if (req.body && typeof req.body === 'object') return req.body; // already parsed (Vercel)
  if (typeof req.body === 'string') return JSON.parse(req.body);
  let raw = '';
  for await (const chunk of req) {
    raw += chunk;
    if (raw.length > 20000) throw new Error('Body too large');
  }
  return raw ? JSON.parse(raw) : {};
}

function clientIp(req) {
  const fwd = req.headers['x-forwarded-for'];
  return (typeof fwd === 'string' && fwd.split(',')[0].trim()) || req.socket?.remoteAddress || 'unknown';
}

function rateLimited(ip) {
  const now = Date.now();
  const recent = (hits.get(ip) || []).filter(t => now - t < WINDOW_MS);
  recent.push(now);
  hits.set(ip, recent);
  return recent.length > MAX_PER_WINDOW;
}

const escapeHtml = str => str.replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const oneLine = str => str.replace(/[\r\n]+/g, ' ');

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return send(res, 405, { ok: false, error: 'Method not allowed.' });
  }

  let body;
  try {
    body = await readBody(req);
  } catch {
    return send(res, 400, { ok: false, error: 'Invalid request.' });
  }

  // Honeypot: real visitors never see this field
  if (body._honey) return send(res, 200, { ok: true });

  const name = String(body.name || '').trim();
  const email = String(body.email || '').trim();
  const message = String(body.message || '').trim();

  if (!name || !email || !message) return send(res, 400, { ok: false, error: 'Please complete all fields.' });
  if (!EMAIL_RE.test(email)) return send(res, 400, { ok: false, error: 'Please enter a valid email address.' });
  if (name.length > LIMITS.name || email.length > LIMITS.email || message.length > LIMITS.message) {
    return send(res, 400, { ok: false, error: 'Your message is too long.' });
  }

  if (rateLimited(clientIp(req))) {
    return send(res, 429, { ok: false, error: 'Too many messages. Please try again later.' });
  }

  const user = process.env.GMAIL_USER;
  if (!user || !process.env.GMAIL_APP_PASSWORD) {
    console.error('[contact] GMAIL_USER / GMAIL_APP_PASSWORD are not set');
    return send(res, 500, { ok: false, error: 'The email service is not configured yet.' });
  }

  try {
    await getTransporter().sendMail({
      from: { name: 'Portfolio Contact', address: user },
      to: process.env.CONTACT_TO || user,
      replyTo: { name: oneLine(name), address: email },
      subject: `Portfolio message from ${oneLine(name)}`,
      text: `Name: ${name}\nEmail: ${email}\n\n${message}`,
      html: `<p><strong>Name:</strong> ${escapeHtml(name)}<br><strong>Email:</strong> ${escapeHtml(email)}</p>`
        + `<p style="white-space:pre-wrap">${escapeHtml(message)}</p>`,
    });
    return send(res, 200, { ok: true });
  } catch (err) {
    console.error('[contact] sendMail failed:', err.message);
    return send(res, 502, { ok: false, error: 'Could not send your message right now.' });
  }
}
