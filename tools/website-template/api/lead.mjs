// Lead capture endpoint for the client website. Deploys automatically with the
// site (Vercel turns /api/*.mjs at the project root into serverless functions).
//
// This is the endpoint that makes the enquiry form REAL. Before it existed the
// forms called preventDefault and navigated to /thank-you, so a homeowner filled
// it in, saw "thank you", and the business owner never heard about it. That is
// worse than having no form at all, because the customer believes they made
// contact and stops calling around.
//
// One submit fans out to every channel that is configured, in parallel:
//   1. Email to the owner        (RESEND_API_KEY + LEAD_FROM + LEAD_TO)
//   2. Slack message to the team (SLACK_WEBHOOK_URL)
//   3. Instant reply to the lead (same Resend config, only if they left an email)
//   4. Row in the CRM sheet      (LEAD_SHEET_URL)
//
// Nothing is required except one working channel. A site with only Slack set up
// still works; a site with nothing set up fails loudly rather than pretending.
//
// .mjs on purpose, matching api/chat.mjs: it is ESM no matter what package.json
// says, so the same file runs deployed from the project folder and dropped into
// a bare static bundle. Business facts are baked at build time by
// build-from-template.py, and the new URL(import.meta.url) read is the pattern
// Vercel's file tracer follows, so _business.json ships with the bundle.
import { readFileSync } from 'fs';

let BUSINESS = {};
try {
  BUSINESS = JSON.parse(readFileSync(new URL('./_business.json', import.meta.url), 'utf8')) || {};
} catch (e) { /* generic wording */ }

// Best-effort per-IP throttle (per warm instance). Stops a bot hammering the
// form from filling the owner's inbox. Not a security boundary.
//
// Fails OPEN when the caller cannot be identified. Vercel always sets
// x-forwarded-for, but if it ever goes missing every visitor would share one
// bucket and the sixth genuine enquiry of the minute would be thrown away.
// Losing a real lead is the exact failure this endpoint exists to prevent, so
// an unidentifiable caller is never throttled.
const hits = new Map();
function rateLimited(ip) {
  if (!ip || ip === 'unknown') return false;
  const now = Date.now();
  const windowStart = now - 60_000;
  const arr = (hits.get(ip) || []).filter((t) => t > windowStart);
  arr.push(now);
  hits.set(ip, arr);
  if (hits.size > 500) hits.clear();
  return arr.length > 5;
}

const FIELD_LABELS = {
  name: 'Name',
  phone: 'Phone',
  email: 'Email',
  service: 'Service needed',
  address: 'Address',
  message: 'Message',
};

function clean(v) {
  return String(v == null ? '' : v).replace(/\s+/g, ' ').trim().slice(0, 500);
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, (c) => (
    { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]
  ));
}

function looksLikeEmail(s) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(s);
}

async function resendSend(payload) {
  const r = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
    },
    body: JSON.stringify(payload),
    signal: AbortSignal.timeout(12_000),
  });
  if (!r.ok) {
    const detail = await r.text().catch(() => '');
    throw new Error(`resend ${r.status} ${detail.slice(0, 300)}`);
  }
  return r.json().catch(() => ({}));
}

function ownerEmail(fields, meta, bizName) {
  const rows = Object.entries(fields)
    .map(([k, v]) => `<tr>
      <td style="padding:8px 16px 8px 0;color:#64748b;font:600 13px system-ui,sans-serif;white-space:nowrap;vertical-align:top">${escapeHtml(FIELD_LABELS[k] || k)}</td>
      <td style="padding:8px 0;color:#0f172a;font:400 15px system-ui,sans-serif">${escapeHtml(v)}</td>
    </tr>`).join('');

  const callBtn = fields.phone
    ? `<a href="tel:${escapeHtml(fields.phone.replace(/[^\d+]/g, ''))}" style="display:inline-block;background:#0f172a;color:#fff;text-decoration:none;padding:13px 22px;border-radius:6px;font:700 15px system-ui,sans-serif">Call ${escapeHtml(fields.name || 'them')} now</a>`
    : '';

  const html = `<div style="max-width:560px;margin:0 auto;padding:28px 24px;background:#fff">
    <p style="margin:0 0 4px;font:700 12px system-ui,sans-serif;letter-spacing:.08em;text-transform:uppercase;color:#b45309">New enquiry</p>
    <h1 style="margin:0 0 6px;font:700 24px system-ui,sans-serif;color:#0f172a">${escapeHtml(fields.name || 'Someone')} just enquired</h1>
    <p style="margin:0 0 22px;font:400 15px system-ui,sans-serif;color:#475569">Straight from your website. The faster you call back, the more likely you win the job.</p>
    <table style="width:100%;border-collapse:collapse;border-top:1px solid #e2e8f0;border-bottom:1px solid #e2e8f0">${rows}</table>
    <p style="margin:22px 0 0">${callBtn}</p>
    <p style="margin:22px 0 0;font:400 12px system-ui,sans-serif;color:#94a3b8">Sent by your website${meta.page ? ` from ${escapeHtml(meta.page)}` : ''}. Reply to this email to answer them directly.</p>
  </div>`;

  const text = [
    `New enquiry for ${bizName}`,
    '',
    ...Object.entries(fields).map(([k, v]) => `${FIELD_LABELS[k] || k}: ${v}`),
    '',
    'Reply to this email to answer them directly.',
  ].join('\n');

  return { html, text };
}

function leadReply(fields, bizName, phone) {
  const first = (fields.name || '').split(' ')[0] || 'there';
  const html = `<div style="max-width:520px;margin:0 auto;padding:28px 24px;background:#fff">
    <h1 style="margin:0 0 12px;font:700 22px system-ui,sans-serif;color:#0f172a">Thanks ${escapeHtml(first)}, we have got it.</h1>
    <p style="margin:0 0 14px;font:400 16px system-ui,sans-serif;line-height:1.6;color:#334155">Your enquiry landed with us just now and a real person will be back to you shortly.</p>
    ${phone ? `<p style="margin:0 0 14px;font:400 16px system-ui,sans-serif;line-height:1.6;color:#334155">If it is urgent, call us on <a href="tel:${escapeHtml(String(phone).replace(/[^\d+]/g, ''))}" style="color:#0f172a;font-weight:700">${escapeHtml(phone)}</a> and we will pick up.</p>` : ''}
    <p style="margin:24px 0 0;font:400 15px system-ui,sans-serif;color:#475569">${escapeHtml(bizName)}</p>
  </div>`;
  const text = `Thanks ${first}, we have got it.\n\nYour enquiry landed with us just now and a real person will be back to you shortly.${phone ? `\n\nIf it is urgent, call us on ${phone}.` : ''}\n\n${bizName}`;
  return { html, text };
}

function slackBlocks(fields, bizName) {
  const lines = Object.entries(fields)
    .map(([k, v]) => `*${FIELD_LABELS[k] || k}:* ${v}`)
    .join('\n');
  return {
    text: `New enquiry for ${bizName}: ${fields.name || 'someone'}`,
    blocks: [
      { type: 'header', text: { type: 'plain_text', text: 'New website enquiry' } },
      { type: 'section', text: { type: 'mrkdwn', text: lines || '(no details)' } },
      {
        type: 'context',
        elements: [{ type: 'mrkdwn', text: `Call back fast. Speed to lead is the whole game.` }],
      },
    ],
  };
}

export default async (req, res) => {
  if (req.method !== 'POST') { res.status(405).json({ error: 'POST only' }); return; }

  const ip = (req.headers['x-forwarded-for'] || '').split(',')[0].trim() || 'unknown';
  if (rateLimited(ip)) { res.status(429).json({ error: 'Too many submissions, give it a minute.' }); return; }

  let body = req.body;
  if (typeof body === 'string') { try { body = JSON.parse(body); } catch (e) { body = {}; } }
  if (!body || typeof body !== 'object') body = {};

  // Honeypot. A human never sees or fills this input, so anything in it is a
  // bot. Answer 200 so the bot believes it succeeded and does not retry, but
  // send nothing.
  if (clean(body.website_url)) { res.status(200).json({ ok: true }); return; }

  const fields = {};
  for (const key of Object.keys(FIELD_LABELS)) {
    const v = clean(body[key]);
    if (v) fields[key] = v;
  }

  if (!fields.name || (!fields.phone && !fields.email)) {
    res.status(400).json({ error: 'Please add your name and either a phone number or an email so we can reply.' });
    return;
  }
  if (fields.email && !looksLikeEmail(fields.email)) {
    res.status(400).json({ error: 'That email address does not look right, please check it.' });
    return;
  }

  const bizName = BUSINESS.name || 'the business';
  const bizPhone = BUSINESS.phone || '';
  const meta = { page: clean(body.page), at: new Date().toISOString() };

  const to = process.env.LEAD_TO || BUSINESS.email || '';
  const from = process.env.LEAD_FROM || '';
  const canEmail = Boolean(process.env.RESEND_API_KEY && from && to);

  const attempted = [];
  const jobs = [];

  if (canEmail) {
    attempted.push('owner_email');
    const { html, text } = ownerEmail(fields, meta, bizName);
    jobs.push(resendSend({
      from,
      to: to.split(',').map((s) => s.trim()).filter(Boolean),
      subject: `New enquiry: ${fields.name}${fields.service ? ` (${fields.service})` : ''}`,
      html,
      text,
      ...(fields.email ? { reply_to: fields.email } : {}),
    }).then(() => ({ channel: 'owner_email', ok: true })));
  }

  if (canEmail && fields.email) {
    attempted.push('lead_reply');
    const { html, text } = leadReply(fields, bizName, bizPhone);
    jobs.push(resendSend({
      from,
      to: [fields.email],
      subject: `We have got your enquiry, ${(fields.name || '').split(' ')[0] || 'thanks'}`,
      html,
      text,
    }).then(() => ({ channel: 'lead_reply', ok: true })));
  }

  if (process.env.SLACK_WEBHOOK_URL) {
    attempted.push('slack');
    jobs.push(fetch(process.env.SLACK_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(slackBlocks(fields, bizName)),
      signal: AbortSignal.timeout(8_000),
    }).then((r) => {
      if (!r.ok) throw new Error(`slack ${r.status}`);
      return { channel: 'slack', ok: true };
    }));
  }

  if (process.env.LEAD_SHEET_URL) {
    attempted.push('sheet');
    jobs.push(fetch(process.env.LEAD_SHEET_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ source: 'website', business: bizName, ...fields, ...meta }),
      signal: AbortSignal.timeout(12_000),
    }).then((r) => {
      if (!r.ok) throw new Error(`sheet ${r.status}`);
      return { channel: 'sheet', ok: true };
    }));
  }

  // Nothing is configured at all. Never answer 200 here: that is exactly the
  // silent-bin behaviour this endpoint exists to kill.
  if (!jobs.length) {
    console.error('lead endpoint has no delivery channel configured, enquiry dropped', fields);
    res.status(501).json({
      error: 'not_configured',
      message: bizPhone ? `Our form is not accepting messages right now. Please call us on ${bizPhone}.` : 'Our form is not accepting messages right now. Please call us.',
    });
    return;
  }

  const results = await Promise.allSettled(jobs);
  const delivered = results.filter((r) => r.status === 'fulfilled').map((r) => r.value.channel);
  const failed = results.filter((r) => r.status === 'rejected');

  for (const f of failed) console.error('lead delivery failed', f.reason && f.reason.message);

  // The owner email is the channel that actually matters. If some channel got
  // through, the lead is not lost, so the visitor sees success. If every single
  // one failed, tell the truth and give them the phone number.
  if (!delivered.length) {
    console.error('lead endpoint delivered nothing, enquiry lost', fields);
    res.status(502).json({
      error: 'delivery_failed',
      message: bizPhone ? `We could not send that through. Please call us on ${bizPhone} and we will help right away.` : 'We could not send that through. Please call us and we will help right away.',
    });
    return;
  }

  res.status(200).json({ ok: true, delivered, attempted });
};
