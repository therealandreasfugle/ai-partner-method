// Vercel serverless function: STEP 2 of signing.
// The client opens the private link (sign.html?t=...), reviews the full contract,
// draws their signature, and submits. This function verifies the signed token
// (so the deal cannot have been tampered with), builds the executed PDF with the
// agency's on-file signature + the client's drawn signature + an audit trail, and
// emails the signed copy to BOTH the agency and the client via Resend.
//
// Required env: RESEND_API_KEY, RESEND_FROM, SIGNING_SECRET, AGENCY_EMAIL.

const { PDFDocument, StandardFonts, rgb } = require('pdf-lib');
const lib = require('./_lib');
const CONTRACT = require('./contract.json');
const crypto = require('crypto');

// Baked at build time by build-proposal.py. Falls back to a typed founder name.
let AGENCY = { jurisdiction: 'England and Wales', signature: { type: 'typed', png: null, name: '' } };
try { AGENCY = Object.assign(AGENCY, require('./_agency.json')); } catch (e) { /* use defaults */ }

const MAX_SIG_BYTES = 300 * 1024;

function pngDataUrlToBytes(dataUrl) {
  const m = /^data:image\/png;base64,([A-Za-z0-9+/=]+)$/.exec(String(dataUrl || ''));
  if (!m) return null;
  const buf = Buffer.from(m[1], 'base64');
  if (buf.length < 8 || buf.length > MAX_SIG_BYTES) return null;
  // PNG magic bytes: 89 50 4E 47 0D 0A 1A 0A
  const sig = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];
  for (let i = 0; i < 8; i++) if (buf[i] !== sig[i]) return null;
  return buf;
}

function agencyPngBytes() {
  const s = AGENCY.signature || {};
  if (s.type === 'image' && s.png) {
    try {
      const buf = Buffer.from(s.png, 'base64');
      const sig = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];
      for (let i = 0; i < 8; i++) if (buf[i] !== sig[i]) return null;
      if (buf.length > MAX_SIG_BYTES) return null;
      return buf;
    } catch (e) { return null; }
  }
  return null;
}

function wrapText(text, font, size, maxWidth) {
  const out = [];
  for (const rawLine of String(text).split('\n')) {
    const words = rawLine.split(' ');
    let line = '';
    for (const w of words) {
      const probe = line ? line + ' ' + w : w;
      if (font.widthOfTextAtSize(probe, size) > maxWidth && line) { out.push(line); line = w; }
      else line = probe;
    }
    out.push(line);
  }
  return out;
}

async function buildPdf(p) {
  const doc = await PDFDocument.create();
  const font = await doc.embedFont(StandardFonts.TimesRoman);
  const bold = await doc.embedFont(StandardFonts.TimesRomanBold);
  const italic = await doc.embedFont(StandardFonts.TimesRomanItalic);
  const A4 = [595.28, 841.89];
  let page = doc.addPage(A4);
  const margin = 64;
  const width = A4[0] - margin * 2;
  let y = A4[1] - margin;
  const ink = rgb(0.09, 0.08, 0.07);

  const ensure = (need) => { if (y - need < margin) { page = doc.addPage(A4); y = A4[1] - margin; } };
  const para = (text, f, size, gap, color) => {
    for (const line of wrapText(lib.winansiSafe(text), f, size, width)) {
      ensure(size + 4);
      page.drawText(line, { x: margin, y: y - size, size, font: f, color: color || ink });
      y -= size + 4;
    }
    y -= gap;
  };

  para(CONTRACT.title || 'WEBSITE SERVICES AGREEMENT', bold, 16, 6);
  para(`${p.agencyName}  x  ${p.company}`, font, 11, 2, rgb(0.35, 0.3, 0.2));
  para(`Executed ${p.date}`, font, 10, 14, rgb(0.45, 0.42, 0.36));

  const fill = (s) => String(s)
    .split('{AGENCY}').join(p.agencyName)
    .split('{COMPANY}').join(p.company)
    .split('{CLIENT}').join(p.clientName)
    .split('{CLIENT_LOCATION_CLAUSE}').join(p.locationClause)
    .split('{CLIENT_LOCATION}').join(p.clientLocation)
    .split('{DATE}').join(p.date)
    .split('{PAYBODY}').join(p.payBody)
    .split('{JURISDICTION}').join(p.jurisdiction);

  CONTRACT.sections.forEach(([head, body], i) => {
    ensure(40);
    para(fill(head), bold, 11.5, 2);
    para((p.ov && Object.prototype.hasOwnProperty.call(p.ov, i)) ? p.ov[i] : fill(body), font, 10.5, 10);
  });

  ensure(180);
  y -= 8;
  para('SIGNATURES', bold, 11.5, 6);

  const colW = width / 2 - 12;
  const sigTop = y;
  const drawSig = async (x, label, name, org, sigBytes, typedName) => {
    let yy = sigTop;
    page.drawText(label, { x, y: yy - 9, size: 9, font: bold, color: rgb(0.45, 0.42, 0.36) });
    yy -= 16;
    if (sigBytes) {
      const png = await doc.embedPng(sigBytes);
      const dims = png.scaleToFit(colW, 64);
      page.drawImage(png, { x, y: yy - dims.height, width: dims.width, height: dims.height });
      yy -= dims.height + 6;
    } else if (typedName) {
      page.drawText(lib.winansiSafe(typedName), { x, y: yy - 30, size: 22, font: italic, color: ink });
      yy -= 46;
    } else {
      yy -= 70;
    }
    page.drawLine({ start: { x, y: yy }, end: { x: x + colW, y: yy }, thickness: 0.7, color: ink });
    yy -= 13;
    page.drawText(lib.winansiSafe(name), { x, y: yy, size: 10.5, font: bold, color: ink });
    yy -= 13;
    page.drawText(lib.winansiSafe(org), { x, y: yy, size: 9.5, font, color: rgb(0.35, 0.32, 0.27) });
    yy -= 13;
    page.drawText(`Date: ${p.date}`, { x, y: yy, size: 9, font, color: rgb(0.45, 0.42, 0.36) });
    return yy;
  };

  const agencyTyped = p.sigAgencyBytes ? '' : (p.agencySigner || p.agencyName);
  const y1 = await drawSig(margin, 'PROVIDER', p.agencySigner || p.agencyName, p.agencyName, p.sigAgencyBytes, agencyTyped);
  const y2 = await drawSig(margin + colW + 24, 'CLIENT', p.clientName, p.company, p.sigClientBytes, '');
  y = Math.min(y1, y2) - 22;

  // ---- Certificate of Completion (own page, DocuSign-style audit record) ----
  // Fingerprint the exact filled agreement text so any later edit is detectable.
  const canonical = [CONTRACT.title].concat(CONTRACT.sections.map(([h, b], i) => fill(h) + '\n' + ((p.ov && Object.prototype.hasOwnProperty.call(p.ov, i)) ? p.ov[i] : fill(b)))).join('\n');
  const docHash = crypto.createHash('sha256').update(canonical, 'utf8').digest('hex');

  page = doc.addPage(A4);
  y = A4[1] - margin;
  para('CERTIFICATE OF COMPLETION', bold, 15, 4);
  para('This certificate accompanies the executed Website Services Agreement and records how it was signed electronically.', font, 9.5, 12, rgb(0.4, 0.37, 0.32));
  page.drawLine({ start: { x: margin, y }, end: { x: margin + width, y }, thickness: 0.6, color: rgb(0.8, 0.78, 0.74) });
  y -= 16;

  const row = (labelText, valueText) => {
    ensure(34);
    page.drawText(labelText, { x: margin, y: y - 8, size: 8, font: bold, color: rgb(0.45, 0.42, 0.36) });
    y -= 12;
    for (const line of wrapText(lib.winansiSafe(valueText), font, 10, width)) {
      ensure(14);
      page.drawText(line, { x: margin, y: y - 10, size: 10, font, color: ink });
      y -= 13;
    }
    y -= 9;
  };

  row('DOCUMENT', `${CONTRACT.title}  (Agreement ID ${p.jti})`);
  row('STATUS', 'Completed and executed by both parties');
  row('PROVIDER', `${p.agencySigner || p.agencyName} for ${p.agencyName}. Executed ${p.preparedAt}.`);
  row('SIGNER', `${p.clientName}${p.company ? ', ' + p.company : ''}  <${p.clientEmail}>`);
  row('SIGNING METHOD', `A unique, single-purpose signing link was emailed to ${p.clientEmail}; access to that inbox verified the signer's email. The signature was captured on the hosted signing page.`);
  row('SIGNED', `${p.signedAt}  from IP address ${p.clientIp}`);
  row('DOCUMENT FINGERPRINT (SHA-256)', docHash);
  row('CONSENT', 'The signer confirmed they read the full agreement, consented to sign electronically, and agreed their electronic signature is legally binding under the U.S. ESIGN Act and UETA and equivalent electronic-transaction law. Any later change to the agreement text changes the fingerprint above and is therefore detectable.');

  return Buffer.from(await doc.save());
}

module.exports = async (req, res) => {
  if (req.method !== 'POST') { res.status(405).json({ error: 'POST only' }); return; }
  try {
    const { RESEND_API_KEY, RESEND_FROM, SIGNING_SECRET, AGENCY_EMAIL } = process.env;
    if (!RESEND_API_KEY || !RESEND_FROM || !SIGNING_SECRET) {
      res.status(500).json({ error: 'This deployment is not fully configured (RESEND_API_KEY / RESEND_FROM / SIGNING_SECRET).' });
      return;
    }
    if (!lib.sameOrigin(req)) { res.status(403).json({ error: 'Requests must come from the signing page.' }); return; }
    if (!lib.rateLimit('sign:' + lib.clientIp(req), 12, 10 * 60 * 1000)) {
      res.status(429).json({ error: 'Too many attempts. Wait a few minutes and try again.' });
      return;
    }

    const b = lib.readJsonBody(req);
    const payload = lib.verifyToken(b.token, SIGNING_SECRET);
    if (!payload) { res.status(401).json({ error: 'This signing link is invalid or has expired. Ask for a fresh link.' }); return; }

    const sigClientBytes = pngDataUrlToBytes(b.sigClient);
    if (!sigClientBytes) { res.status(400).json({ error: 'A signature is required.' }); return; }

    // Per-clause seller edits sealed in the token (index -> final text). Trusted
    // (HMAC-verified) but re-cleaned for PDF safety; winansiSafe is applied at draw.
    const ovMap = {};
    if (Array.isArray(payload.ov)) {
      for (const pair of payload.ov) {
        if (Array.isArray(pair) && pair.length >= 2) {
          const oi = parseInt(pair[0], 10);
          if (Number.isInteger(oi) && oi >= 0) ovMap[oi] = lib.clean(pair[1], 2500);
        }
      }
    }

    const clientLocation = lib.clean(payload.clientLocation, 160);
    const p = {
      ov: ovMap,
      jti: lib.clean(payload.jti, 40),
      agencyName: lib.clean(payload.agencyName, 120),
      agencySigner: lib.clean(payload.agencySigner, 120),
      company: lib.clean(payload.company, 120),
      clientName: lib.clean(payload.clientName, 120),
      clientLocation,
      locationClause: clientLocation ? ` of ${clientLocation}` : '',
      clientEmail: lib.clean(payload.clientEmail, 200),
      date: lib.clean(payload.date, 40) || new Date().toISOString().slice(0, 10),
      payBody: lib.buildPayBody(payload.setup, payload.monthly, payload.paymentTerms),
      jurisdiction: lib.clean(AGENCY.jurisdiction, 120) || 'England and Wales',
      sigAgencyBytes: agencyPngBytes(),
      sigClientBytes,
      preparedAt: new Date(((payload.iat || 0) * 1000) || Date.now()).toISOString().replace('T', ' ').slice(0, 19) + ' UTC',
      signedAt: new Date().toISOString().replace('T', ' ').slice(0, 19) + ' UTC',
      clientIp: lib.clientIp(req),
    };

    const pdf = await buildPdf(p);

    const to = [];
    if (lib.validEmail(AGENCY_EMAIL || '')) to.push(AGENCY_EMAIL);
    if (lib.validEmail(p.clientEmail)) to.push(p.clientEmail);
    if (!to.length) { res.status(500).json({ error: 'No recipient is configured (AGENCY_EMAIL).' }); return; }

    const safeAgency = lib.escapeHtml(p.agencyName);
    const safeCompany = lib.escapeHtml(p.company);
    const filename = `Website Services Agreement - ${p.company.replace(/\.$/, '')}.pdf`.replace(/[\\/:*?"<>|]/g, '-');
    const html = [
      `<p>The Website Services Agreement between <strong>${safeAgency}</strong> and <strong>${safeCompany}</strong> was signed by the client on ${lib.escapeHtml(p.signedAt)}.</p>`,
      `<p>${lib.escapeHtml(p.payBody)}</p>`,
      `<p>The fully executed copy is attached as a PDF for your records. Agreement ID ${lib.escapeHtml(p.jti)}.</p>`,
    ].join('');
    // Plain-text alternative (multipart) lowers spam score vs HTML-only.
    const text = [
      `The Website Services Agreement between ${p.agencyName} and ${p.company} was signed by the client on ${p.signedAt}.`,
      p.payBody,
      `The fully executed copy is attached as a PDF for your records. Agreement ID ${p.jti}.`,
    ].join('\n\n');

    const resp = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${RESEND_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: RESEND_FROM,
        to,
        subject: `Signed agreement: ${p.agencyName} x ${p.company}`,
        html,
        text,
        attachments: [{ filename, content: pdf.toString('base64') }],
      }),
    });
    if (!resp.ok) {
      const detail = await resp.text();
      res.status(502).json({ error: 'Email provider rejected the send.', detail: detail.slice(0, 300) });
      return;
    }
    res.status(200).json({ ok: true, sentTo: to.length });
  } catch (err) {
    res.status(500).json({ error: 'Signing failed.', detail: String((err && err.message) || err).slice(0, 300) });
  }
};
