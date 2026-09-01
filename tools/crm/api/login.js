// The login endpoint. Node serverless (NOT edge): pbkdf2 with 600k iterations
// would blow the edge CPU-ms budget, so this must run on node.
//
// POST {user, pass}   -> on success, sets an HttpOnly session cookie and {ok:true}.
// POST {logout: 1}     -> clears the cookie, {ok:true}.
// anything else        -> 405.
//
// The password is never stored anywhere: the student sets CRM_PASS_SALT and
// CRM_PASS_HASH (salt + PBKDF2 hash of their chosen password) as Vercel env vars.
// We hash the submitted password the same way and compare in constant time. The
// session cookie is unforgeable: it carries only an expiry, signed with HMAC over
// AUTH_SECRET, which _auth.js re-checks on every API call.
import { pbkdf2Sync, timingSafeEqual, createHmac } from "node:crypto";

export const config = { runtime: "nodejs" };

const COOKIE_NAME = "crm_session";
const THIRTY_DAYS = 2592000; // seconds
const PBKDF2_ITERS = 600000;
const PBKDF2_KEYLEN = 32;
const FAIL_DELAY_MS = 800; // constant wait on every failure, to blunt brute force

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function settings() {
  return {
    secret: (process.env.AUTH_SECRET || "").trim(),
    hash: (process.env.CRM_PASS_HASH || "").trim(),
    salt: (process.env.CRM_PASS_SALT || "").trim(),
    users: (process.env.CRM_USERS || "").trim(),
  };
}

// Vercel parses a JSON body into req.body, but be defensive: accept an object, a
// JSON string, or a raw stream. Returns null when the body is not valid JSON, so
// a malformed body is treated as a failed attempt (same 401 as bad credentials).
async function readBody(req) {
  if (req.body != null) {
    if (typeof req.body === "object") return req.body;
    if (typeof req.body === "string") {
      try { return JSON.parse(req.body); } catch { return null; }
    }
  }
  try {
    let raw = "";
    for await (const chunk of req) raw += chunk;
    return raw ? JSON.parse(raw) : {};
  } catch {
    return null;
  }
}

function sessionCookie(exp, sig) {
  return COOKIE_NAME + "=" + exp + "." + sig +
    "; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=" + THIRTY_DAYS;
}

function clearedCookie() {
  return COOKIE_NAME + "=; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=0";
}

// Check a submitted user+pass against the configured allow-list and hash. This
// always runs the full PBKDF2 regardless of whether the username is known, so the
// time it takes never reveals whether a username exists (no user enumeration).
function verifyCredentials(body, cfg) {
  const user = String((body && body.user) || "").trim().toLowerCase();
  const pass = String((body && body.pass) || "");
  const allowed = cfg.users.split(",").map((u) => u.trim().toLowerCase()).filter(Boolean);
  const userOk = allowed.includes(user);

  let salt, expected;
  try {
    salt = Buffer.from(cfg.salt, "hex");
    expected = Buffer.from(cfg.hash, "hex");
  } catch {
    return false;
  }

  // Always derive, even for an unknown user, to keep the timing uniform.
  const derived = pbkdf2Sync(pass, salt, PBKDF2_ITERS, PBKDF2_KEYLEN, "sha256");

  // Guard the length first (timingSafeEqual throws on a mismatch), but still run
  // a compare either way so the branch does not leak timing.
  let passOk;
  if (derived.length === expected.length && expected.length > 0) {
    passOk = timingSafeEqual(derived, expected);
  } else {
    timingSafeEqual(derived, derived); // dummy, keep timing steady
    passOk = false;
  }

  return userOk && passOk;
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ ok: false, error: "Method not allowed." });
  }

  const cfg = settings();
  if (!cfg.secret || !cfg.hash || !cfg.salt || !cfg.users) {
    // Plain message on purpose: never name the missing env vars to the page.
    return res.status(500).json({ ok: false, error: "Login is not configured." });
  }

  const body = await readBody(req);

  if (body && body.logout) {
    res.setHeader("Set-Cookie", clearedCookie());
    return res.status(200).json({ ok: true });
  }

  if (!verifyCredentials(body, cfg)) {
    await sleep(FAIL_DELAY_MS);
    // Never say whether the username or the password was wrong.
    return res.status(401).json({ ok: false, error: "Wrong username or password." });
  }

  const exp = Math.floor(Date.now() / 1000) + THIRTY_DAYS;
  const sig = createHmac("sha256", cfg.secret).update(String(exp)).digest("hex");
  res.setHeader("Set-Cookie", sessionCookie(exp, sig));
  return res.status(200).json({ ok: true });
}
