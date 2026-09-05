// Client onboarding intake. Sent AFTER the client has paid, never before.
//
// The rule this whole repo follows: we never ask a prospect to fill in a form.
// A prospect books a call. Once they have paid, this is the one form they fill
// in, and it collects everything needed to build their site.
//
// It emails you the answers and sends the client a short confirmation. Uses the
// same Resend account as the contract and lead alerts, so there is nothing new
// to set up.
//
// Environment variables:
//   RESEND_API_KEY   required
//   ONBOARDING_FROM  required, a verified sender, e.g. "You <you@yourdomain.com>"
//   ONBOARDING_TO    required, where the answers land (comma separated is fine)

const FIELDS = [
  ['business', 'Business name'],
  ['owner', 'Owner'],
  ['phone', 'Phone'],
  ['email', 'Email'],
  ['address', 'Address'],
  ['hours', 'Opening hours'],
  ['services', 'Services'],
  ['areas', 'Areas covered'],
  ['work_wanted', 'Work they want more of'],
  ['customer_worry', 'What customers worry about'],
  ['edge', 'Their edge'],
  ['bottleneck', 'What is holding them back'],
  ['ninety_day_win', 'Ninety day win'],
  ['years', 'Years trading'],
  ['team', 'Team size'],
  ['price_position', 'Price position'],
  ['vibe', 'Vibe'],
  ['likes', 'Sites they like'],
  ['assets_link', 'Photos and logo'],
  ['accreditations', 'Accreditations'],
  ['reviews_note', 'Reviews to feature'],
  ['domain', 'Domain'],
  ['gbp', 'Google Business Profile'],
  ['review_link', 'Google review link'],
  ['socials', 'Socials'],
  ['lead_email', 'Lead alerts to'],
  ['lead_extra', 'Also notify'],
  ['anything', 'Anything else'],
];

const REQUIRED = ['business', 'owner', 'phone', 'email', 'services', 'areas', 'lead_email'];

const hits = new Map();
function rateLimited(ip) {
  // Fails open on an unidentifiable caller. Losing a paying client's intake to a
  // throttle would be far worse than letting a duplicate through.
  if (!ip || ip === 'unknown') return false;
  const now = Date.now();
  const arr = (hits.get(ip) || []).filter((t) => t > now - 60_000);
  arr.push(now);
  hits.set(ip, arr);
  if (hits.size > 500) hits.clear();
  return arr.length > 5;
}

const clean = (v) => String(v == null ? '' : v).trim().slice(0, 4000);
const esc = (s) => String(s).replace(/[&<>"']/g, (c) => (
  { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const nl2br = (s) => esc(s).replace(/\n/g, '<br>');

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
  if (!r.ok) throw new Error(`resend ${r.status} ${(await r.text().catch(() => '')).slice(0, 300)}`);
  return r.json().catch(() => ({}));
}

export default async (req, res) => {
  if (req.method !== 'POST') { res.status(405).json({ error: 'POST only' }); return; }

  const ip = (req.headers['x-forwarded-for'] || '').split(',')[0].trim() || 'unknown';
  if (rateLimited(ip)) { res.status(429).json({ ok: false, message: 'Too many submissions, give it a minute.' }); return; }

  let body = req.body;
  if (typeof body === 'string') { try { body = JSON.parse(body); } catch (e) { body = {}; } }
  if (!body || typeof body !== 'object') body = {};

  if (clean(body.website_url)) { res.status(200).json({ ok: true }); return; }

  const answers = {};
  for (const [key] of FIELDS) {
    const v = clean(body[key]);
    if (v) answers[key] = v;
  }

  const missing = REQUIRED.filter((k) => !answers[k]);
  if (missing.length) {
    res.status(400).json({ ok: false, message: 'Some required answers are missing. Please check the fields marked with a star.' });
    return;
  }

  const from = process.env.ONBOARDING_FROM || '';
  const to = process.env.ONBOARDING_TO || '';
  if (!process.env.RESEND_API_KEY || !from || !to) {
    // Never tell a paying client "thanks" for something that went nowhere.
    console.error('onboarding not configured, intake dropped for', answers.business);
    res.status(501).json({
      ok: false,
      message: 'Our form is not set up correctly. Please email us your answers and we will take it from there.',
    });
    return;
  }

  const rows = FIELDS
    .filter(([k]) => answers[k])
    .map(([k, label]) => `<tr>
      <td style="padding:9px 16px 9px 0;color:#64748b;font:600 13px system-ui,sans-serif;white-space:nowrap;vertical-align:top">${esc(label)}</td>
      <td style="padding:9px 0;color:#0f172a;font:400 15px system-ui,sans-serif">${nl2br(answers[k])}</td>
    </tr>`).join('');

  const ownerHtml = `<div style="max-width:640px;margin:0 auto;padding:28px 24px;background:#fff">
    <p style="margin:0 0 4px;font:700 12px system-ui,sans-serif;letter-spacing:.08em;text-transform:uppercase;color:#b45309">New client intake</p>
    <h1 style="margin:0 0 18px;font:700 24px system-ui,sans-serif;color:#0f172a">${esc(answers.business)} is ready to build</h1>
    <table style="width:100%;border-collapse:collapse;border-top:1px solid #e2e8f0;border-bottom:1px solid #e2e8f0">${rows}</table>
  </div>`;

  const ownerText = FIELDS.filter(([k]) => answers[k])
    .map(([k, label]) => `${label}: ${answers[k]}`).join('\n');

  const first = (answers.owner || '').split(' ')[0] || 'there';
  const clientHtml = `<div style="max-width:520px;margin:0 auto;padding:28px 24px;background:#fff">
    <h1 style="margin:0 0 12px;font:700 22px system-ui,sans-serif;color:#0f172a">Thanks ${esc(first)}, that is everything we need</h1>
    <p style="margin:0 0 14px;font:400 16px/1.6 system-ui,sans-serif;color:#334155">We have got your answers and we are starting on ${esc(answers.business)} now.</p>
    <p style="margin:0;font:400 16px/1.6 system-ui,sans-serif;color:#334155">If anything needs a follow up we will come back to you within one working day. You do not need to do anything else in the meantime.</p>
  </div>`;

  const jobs = [
    resendSend({
      from,
      to: to.split(',').map((s) => s.trim()).filter(Boolean),
      subject: `Client intake: ${answers.business}`,
      html: ownerHtml,
      text: ownerText,
      reply_to: answers.email,
    }).then(() => 'owner'),
  ];

  jobs.push(
    resendSend({
      from,
      to: [answers.email],
      subject: 'Thanks, we have everything we need',
      html: clientHtml,
      text: `Thanks ${first}, that is everything we need.\n\nWe have got your answers and we are starting on ${answers.business} now. If anything needs a follow up we will come back to you within one working day.`,
    }).then(() => 'client')
  );

  const results = await Promise.allSettled(jobs);
  const delivered = results.filter((r) => r.status === 'fulfilled').map((r) => r.value);
  for (const f of results.filter((r) => r.status === 'rejected')) {
    console.error('onboarding delivery failed', f.reason && f.reason.message);
  }

  // The owner email is the one that must land. The client confirmation is a
  // courtesy; losing it is not worth making the client re-type ten minutes of work.
  if (!delivered.includes('owner')) {
    console.error('onboarding intake LOST for', answers.business, JSON.stringify(answers));
    res.status(502).json({
      ok: false,
      message: 'That did not send. Please try once more, and if it fails again email us your answers so nothing is lost.',
    });
    return;
  }

  res.status(200).json({ ok: true, delivered });
};
