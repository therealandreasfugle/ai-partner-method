// Shared session verifier for the login gate. Imported by both the edge APIs
// (crm.js, stats.js) and the node API (send.js), so it must run in either
// runtime: it uses only Web Crypto (globalThis.crypto.subtle) and TextEncoder,
// never node's crypto module. The signing side lives in login.js (node only).
//
// A session cookie is "<exp>.<sig>" where exp is unix seconds the cookie stops
// being valid and sig is HMAC-SHA256(exp) hex, keyed by AUTH_SECRET. isAuthed
// recomputes the HMAC and compares it in constant time. No AUTH_SECRET means the
// login layer is off, so isAuthed returns false and the caller falls back to its
// other checks (open, or the ?k= key).

const COOKIE_NAME = "crm_session";

// Cookie header from either an edge Request (Headers with .get) or a node
// request (plain headers object).
function cookieHeader(req) {
  const h = req && req.headers;
  if (!h) return "";
  if (typeof h.get === "function") return h.get("cookie") || h.get("Cookie") || "";
  return h.cookie || h.Cookie || "";
}

// Pull one cookie value out of a Cookie header without a regex on attacker input.
function readCookie(header, name) {
  const parts = String(header || "").split(";");
  for (const part of parts) {
    const eq = part.indexOf("=");
    if (eq === -1) continue;
    if (part.slice(0, eq).trim() === name) return part.slice(eq + 1).trim();
  }
  return "";
}

async function hmacHex(secret, message) {
  const enc = new TextEncoder();
  const key = await globalThis.crypto.subtle.importKey(
    "raw",
    enc.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sig = await globalThis.crypto.subtle.sign("HMAC", key, enc.encode(message));
  const bytes = new Uint8Array(sig);
  let hex = "";
  for (let i = 0; i < bytes.length; i++) hex += bytes[i].toString(16).padStart(2, "0");
  return hex;
}

// Constant-time compare of two hex strings. Walks the full length of the longer
// string and folds every difference (including a length mismatch) into one
// accumulator, so it never short-circuits and leaks position or length. A plain
// === would return early on the first differing byte and leak timing.
export function timingSafeEqual(a, b) {
  a = String(a);
  b = String(b);
  const len = Math.max(a.length, b.length);
  let diff = a.length ^ b.length;
  for (let i = 0; i < len; i++) {
    diff |= (a.charCodeAt(i) || 0) ^ (b.charCodeAt(i) || 0);
  }
  return diff === 0;
}

export async function isAuthed(req) {
  const secret = (process.env.AUTH_SECRET || "").trim();
  if (!secret) return false; // login layer is off

  const token = readCookie(cookieHeader(req), COOKIE_NAME);
  if (!token) return false;

  const dot = token.indexOf(".");
  if (dot === -1) return false;
  const expStr = token.slice(0, dot);
  const sig = token.slice(dot + 1);

  if (!/^\d+$/.test(expStr)) return false; // exp must be a positive integer
  const exp = parseInt(expStr, 10);
  if (!Number.isFinite(exp) || exp <= 0) return false;
  if (exp < Math.floor(Date.now() / 1000)) return false; // expired

  const expected = await hmacHex(secret, expStr);
  return timingSafeEqual(sig, expected);
}
