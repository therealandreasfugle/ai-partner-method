// Vercel serverless function: STEP 1 of signing.
// The agency (student), on the sales call, fills in the client's name, location,
// date, and email and clicks "Send contract to sign". This function validates
// the request, mints an HMAC-signed token that carries the deal (so the client
// cannot alter price or terms), and emails the CLIENT a private signing link.
// No PDF is produced here. The executed PDF is built in complete-signature.js
// once the client signs.
//
// Required env on the Vercel project:
//   RESEND_API_KEY   your Resend API key
//   RESEND_FROM      verified sender, e.g. "Your Agency <hello@youragency.com>"
//   SIGNING_SECRET   any long random string; signs the link (keep it secret)
//   AGENCY_EMAIL     where you receive the executed copy (used at completion)

const lib = require('./_lib');

const LINK_TTL_DAYS = 14;

module.exports = async (req, res) => {
  if (req.method !== 'POST') { res.status(405).json({ error: 'POST only' }); return; }
  try {
    const { RESEND_API_KEY, RESEND_FROM, SIGNING_SECRET } = process.env;
    if (!RESEND_API_KEY || !RESEND_FROM) {
      res.status(500).json({ error: 'Email is not configured on this deployment (RESEND_API_KEY / RESEND_FROM).' });
      return;
    }
    if (!SIGNING_SECRET) {
      res.status(500).json({ error: 'Signing is not configured on this deployment (SIGNING_SECRET).' });
      return;
    }
    if (!lib.sameOrigin(req)) { res.status(403).json({ error: 'Requests must come from the proposal page.' }); return; }
    if (!lib.rateLimit('send:' + lib.clientIp(req), 6, 10 * 60 * 1000)) {
      res.status(429).json({ error: 'Too many attempts. Wait a few minutes and try again.' });
      return;
    }

    const b = lib.readJsonBody(req);
    const company = lib.clean(b.company, 120);
    const clientName = lib.clean(b.clientName, 120);
    const clientLocation = lib.clean(b.clientLocation, 160);
    const clientEmail = lib.clean(b.clientEmail, 200);
    const agencyName = lib.clean(b.agencyName, 120);
    const agencySigner = lib.clean(b.agencySigner, 120);
    const date = lib.clean(b.date, 40) || new Date().toISOString().slice(0, 10);
    const setup = lib.money(b.setup);
    const monthly = lib.money(b.monthly);
    const paymentTerms = lib.clean(b.paymentTerms, 900);

    if (!company || !clientName || !agencyName) { res.status(400).json({ error: 'Missing party details.' }); return; }
    if (!lib.validEmail(clientEmail)) { res.status(400).json({ error: 'A valid client email is required so we can send the contract to sign.' }); return; }

    // Optional per-clause edits the seller made on the proposal. Each entry is
    // [sectionIndex, finalText]; only changed clauses are sent. Clean, length-cap,
    // and count-cap them here, then seal them inside the HMAC token so the client
    // cannot alter them. Capped small so the signing link stays short.
    const overrides = [];
    if (Array.isArray(b.overrides)) {
      for (const pair of b.overrides) {
        if (!Array.isArray(pair) || pair.length < 2) continue;
        const idx = parseInt(pair[0], 10);
        if (!Number.isInteger(idx) || idx < 0 || idx > 60) continue;
        const txt = lib.clean(pair[1], 2500);
        if (txt) overrides.push([idx, txt]);
        if (overrides.length >= 30) break;
      }
    }
    const ovChars = overrides.reduce((a, o) => a + o[1].length, 0);
    if (ovChars > 9000) { res.status(400).json({ error: 'The edited agreement is too long to fit in a secure signing link. Please shorten your edits.' }); return; }

    const now = Math.floor(Date.now() / 1000);
    const tokenPayload = {
      v: 1,
      jti: lib.newId(),
      iat: now,
      exp: now + LINK_TTL_DAYS * 24 * 60 * 60,
      company, clientName, clientLocation, clientEmail,
      agencyName, agencySigner, date, setup, monthly, paymentTerms,
    };
    if (overrides.length) tokenPayload.ov = overrides;
    const token = lib.signToken(tokenPayload, SIGNING_SECRET);

    const host = lib.deploymentHost(req);
    const signUrl = `https://${host}/sign.html?t=${token}`;

    const safeAgency = lib.escapeHtml(agencyName);
    const safeCompany = lib.escapeHtml(company);
    const safeClient = lib.escapeHtml(clientName);
    const html = [
      `<div style="font-family:Arial,Helvetica,sans-serif;max-width:560px;margin:0 auto;color:#1f1a15">`,
      `<p>Hi ${safeClient},</p>`,
      `<p>${safeAgency} has prepared your Website Services Agreement for <strong>${safeCompany}</strong>, ready for your signature. Please review the full contract and sign using the secure link below.</p>`,
      `<p style="text-align:center;margin:28px 0"><a href="${signUrl}" style="display:inline-block;background:#1f1a15;color:#fff;text-decoration:none;padding:14px 28px;border-radius:999px;font-weight:bold">Review &amp; sign the agreement &rarr;</a></p>`,
      `<p style="font-size:13px;color:#6a655c">Or paste this link into your browser:<br>${lib.escapeHtml(signUrl)}</p>`,
      `<p style="font-size:13px;color:#6a655c">This link is unique to you and expires in ${LINK_TTL_DAYS} days. The moment you sign, a signed PDF copy is emailed to you and to ${safeAgency}.</p>`,
      `</div>`,
    ].join('');

    // Plain-text alternative alongside the HTML. A multipart (text + html)
    // email scores materially lower on spam filters than HTML-only, and gives a
    // clean fallback in text-only clients. Values are already length-capped and
    // control-stripped by lib.clean; plain text needs no HTML escaping.
    const text = [
      `Hi ${clientName},`,
      ``,
      `${agencyName} has prepared your Website Services Agreement for ${company}, ready for your signature.`,
      ``,
      `Review and sign the agreement here:`,
      signUrl,
      ``,
      `This link is unique to you and expires in ${LINK_TTL_DAYS} days. The moment you sign, a signed PDF copy is emailed to you and to ${agencyName}.`,
    ].join('\n');

    const payload = {
      from: RESEND_FROM,
      to: [clientEmail],
      subject: `Sign your agreement: ${agencyName} x ${company}`,
      html,
      text,
    };
    if (lib.validEmail(process.env.AGENCY_EMAIL || '')) payload.reply_to = process.env.AGENCY_EMAIL;

    const resp = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${RESEND_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!resp.ok) {
      const detail = await resp.text();
      res.status(502).json({ error: 'Email provider rejected the send.', detail: detail.slice(0, 300) });
      return;
    }
    res.status(200).json({ ok: true, sentTo: clientEmail });
  } catch (err) {
    res.status(500).json({ error: 'Send failed.', detail: String((err && err.message) || err).slice(0, 300) });
  }
};
