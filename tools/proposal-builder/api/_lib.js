// Shared helpers for the contract endpoints. Underscore prefix => Vercel does
// NOT expose this as a public function; it is imported by send-contract.js and
// complete-signature.js only.
//
// Security model (why this file exists):
//  - Signing links carry an HMAC-signed token so the client cannot alter the
//    price, terms, or their own email after the agency sends it. Stateless: no
//    database is provisioned per deployment.
//  - Both endpoints reject requests that do not originate from the deployment's
//    own page (same-origin), which stops outsiders and bots poking the API.
//  - All text is length-capped, control-stripped, and HTML-escaped before it is
//    ever placed into an email body or a PDF, so junk/inappropriate input cannot
//    ride through.

const crypto = require('crypto');

function b64urlEncode(buf) {
  return Buffer.from(buf).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}
function b64urlDecode(str) {
  str = String(str).replace(/-/g, '+').replace(/_/g, '/');
  while (str.length % 4) str += '=';
  return Buffer.from(str, 'base64');
}

// ---- HMAC token ------------------------------------------------------------
// token = base64url(JSON payload) + "." + base64url(HMAC-SHA256(payloadPart))
function signToken(payload, secret) {
  if (!secret) throw new Error('SIGNING_SECRET is not set');
  const body = b64urlEncode(JSON.stringify(payload));
  const mac = crypto.createHmac('sha256', secret).update(body).digest();
  return body + '.' + b64urlEncode(mac);
}

function verifyToken(token, secret) {
  if (!secret || typeof token !== 'string' || token.indexOf('.') === -1) return null;
  const [body, sig] = token.split('.');
  if (!body || !sig) return null;
  const expected = crypto.createHmac('sha256', secret).update(body).digest();
  let given;
  try { given = b64urlDecode(sig); } catch (e) { return null; }
  if (given.length !== expected.length) return null;
  if (!crypto.timingSafeEqual(given, expected)) return null;
  let payload;
  try { payload = JSON.parse(b64urlDecode(body).toString('utf8')); } catch (e) { return null; }
  if (!payload || typeof payload !== 'object') return null;
  if (typeof payload.exp === 'number' && Date.now() / 1000 > payload.exp) return null; // expired
  return payload;
}

function newId() {
  return crypto.randomBytes(9).toString('hex');
}

// ---- Same-origin guard -----------------------------------------------------
function deploymentHost(req) {
  return String(req.headers['x-forwarded-host'] || req.headers.host || '').toLowerCase();
}
function hostOf(url) {
  try { return new URL(url).host.toLowerCase(); } catch (e) { return ''; }
}
// A browser fetch POST always sends an Origin header. Requests with no Origin
// AND no matching Referer (curl, bots, cross-site) are rejected.
function sameOrigin(req) {
  const host = deploymentHost(req);
  if (!host) return false;
  const origin = req.headers.origin ? hostOf(req.headers.origin) : '';
  if (origin) return origin === host;
  const referer = req.headers.referer ? hostOf(req.headers.referer) : '';
  if (referer) return referer === host;
  return false;
}

function clientIp(req) {
  const xff = req.headers['x-forwarded-for'];
  if (xff) return String(xff).split(',')[0].trim();
  return (req.socket && req.socket.remoteAddress) || 'unknown';
}

// ---- Input cleaning --------------------------------------------------------
function clean(value, maxLen) {
  return String(value == null ? '' : value)
    .replace(/[\x00-\x1F\x7F]/g, ' ') // strip control chars
    .slice(0, maxLen || 200)
    .trim();
}
function escapeHtml(s) {
  return String(s == null ? '' : s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}
function validEmail(s) {
  return /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(String(s || ''));
}
// Make a string safe to draw with pdf-lib's StandardFonts (WinAnsi/CP1252).
// pdf-lib THROWS on any code point WinAnsi cannot encode, which would 500 the
// whole signing after the client already signed. Latin-1 accents (e u n c ...),
// smart quotes and dashes are kept as-is; Latin-extended letters (Polish l,
// Turkish s/g, etc.) are transliterated; anything else (CJK, Cyrillic, emoji)
// falls back to '?'. The on-page and email copies stay full Unicode (HTML); only
// the drawn PDF text is folded, so the PDF always generates.
const WINANSI_EXTRA = new Set([0x20ac, 0x201a, 0x0192, 0x201e, 0x2026, 0x2020, 0x2021, 0x02c6, 0x2030, 0x0160, 0x2039, 0x0152, 0x017d, 0x2018, 0x2019, 0x201c, 0x201d, 0x2022, 0x2013, 0x2014, 0x02dc, 0x2122, 0x0161, 0x203a, 0x0153, 0x017e, 0x0178]);
const WINANSI_TRANSLIT = { 'Ł': 'L', 'ł': 'l', 'Đ': 'D', 'đ': 'd', 'İ': 'I', 'ı': 'i', 'Ş': 'S', 'ş': 's', 'Ğ': 'G', 'ğ': 'g' };
function winansiSafe(s) {
  let out = '';
  for (const ch of String(s == null ? '' : s)) {
    const cp = ch.codePointAt(0);
    if ((cp >= 0x20 && cp <= 0x7e) || (cp >= 0xa0 && cp <= 0xff) || WINANSI_EXTRA.has(cp)) { out += ch; continue; }
    if (WINANSI_TRANSLIT[ch]) { out += WINANSI_TRANSLIT[ch]; continue; }
    const d = ch.normalize('NFKD').replace(/[̀-ͯ]/g, '');
    if (d && d !== ch && /^[\x20-\x7e]+$/.test(d)) { out += d; continue; }
    out += '?';
  }
  return out;
}
function money(s) {
  return String(s == null ? '' : s).replace(/[^0-9,]/g, '').slice(0, 12);
}

// ---- Best-effort rate limit (in-memory; per warm instance) -----------------
// Not a hard guarantee across serverless instances, but stops bursts. The real
// controls are same-origin + the signed-token requirement on completion.
const _hits = new Map();
function rateLimit(key, max, windowMs) {
  const now = Date.now();
  const win = windowMs || 10 * 60 * 1000;
  const lim = max || 6;
  const arr = (_hits.get(key) || []).filter((t) => now - t < win);
  arr.push(now);
  _hits.set(key, arr);
  if (_hits.size > 5000) { // guard memory
    for (const k of _hits.keys()) { if (k !== key) { _hits.delete(k); break; } }
  }
  return arr.length <= lim;
}

// ---- Body reader (Vercel auto-parses JSON, but be defensive) ---------------
function readJsonBody(req) {
  const b = req.body;
  if (!b) return {};
  if (typeof b === 'string') { try { return JSON.parse(b); } catch (e) { return {}; } }
  return b;
}

// ---- Payment clause (single source; mirrors the browser buildPayBody) ------
function buildPayBody(setup, monthly, paymentTerms) {
  const terms = clean(paymentTerms, 900);
  if (terms) return terms;
  const s = money(setup) || '0';
  const m = money(monthly) || '0';
  const mNum = parseInt(m.replace(/[^0-9]/g, ''), 10) || 0;
  let body = `The Client agrees to pay a one-time setup fee of $${s} due in full upon signing this Agreement`;
  body += mNum > 0
    ? `, followed by a recurring monthly service fee of $${m} beginning thirty (30) days after the website goes live.`
    : '. No monthly retainer applies to this Agreement.';
  return body;
}

module.exports = {
  signToken, verifyToken, newId,
  sameOrigin, clientIp, deploymentHost,
  clean, escapeHtml, validEmail, money, winansiSafe,
  rateLimit, readJsonBody, buildPayBody,
};
