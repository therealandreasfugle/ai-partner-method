/**
 * /api/settings
 *
 * Read and change how the outreach sends, without touching code.
 *
 *   GET   -> every sending account with its current settings and today's usage
 *   POST  -> { sender_key, enabled?, daily_cap?, warm_start? }
 *
 * Behind the same shared secret as /api/build, so the CRM reaches it through
 * its own authenticated proxy and the secret never reaches a browser.
 *
 * The settings live in the database rather than in environment variables so
 * they can be changed from the CRM. Environment variables stay as the source
 * for the KEYS themselves, which must never be editable from a web page.
 */

const STORE_URL = process.env.SUPABASE_URL;
const STORE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

function timingSafeEqual(given, expected) {
  const a = String(given == null ? "" : given);
  const b = String(expected);
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

/** The accounts that exist, taken from the environment. Keys are never returned. */
function configuredSenders() {
  const list = [];
  for (let i = 1; i <= 8; i++) {
    const key = process.env[`RESEND_KEY_${i}`];
    const from = process.env[`RESEND_FROM_${i}`];
    if (key && from) {
      list.push({
        sender_key: `pool-${i}`,
        from,
        domain: (from.match(/@([^\s>]+)/) || [])[1] || "",
        env_cap: parseInt(process.env[`RESEND_CAP_${i}`] || "50", 10),
        env_start: process.env[`RESEND_START_${i}`] || null,
      });
    }
  }
  return list;
}

async function store(path, options = {}) {
  const response = await fetch(`${STORE_URL}/rest/v1/${path}`, {
    ...options,
    headers: {
      apikey: STORE_KEY,
      Authorization: `Bearer ${STORE_KEY}`,
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });
  const text = await response.text();
  return { ok: response.ok, status: response.status, body: text };
}

/** Today's usage per account, so the page can show what is left. */
async function usedToday() {
  const since = new Date();
  since.setUTCHours(0, 0, 0, 0);
  const result = await store(
    `emails?select=sender&status=eq.sent&sent_at=gte.${since.toISOString()}`
  );
  if (!result.ok) return {};
  try {
    return JSON.parse(result.body).reduce((acc, row) => {
      const k = row.sender || "default";
      acc[k] = (acc[k] || 0) + 1;
      return acc;
    }, {});
  } catch {
    return {};
  }
}

export default async function handler(request, response) {
  response.setHeader("Access-Control-Allow-Origin", "*");
  response.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  response.setHeader("Access-Control-Allow-Headers", "Content-Type, x-build-secret");
  if (request.method === "OPTIONS") return response.status(204).end();

  const secret = process.env.BUILD_SECRET;
  if (!secret) return response.status(503).json({ error: "not configured" });
  if (!timingSafeEqual(request.headers["x-build-secret"], secret)) {
    return response.status(401).json({ error: "unauthorised" });
  }
  if (!STORE_URL || !STORE_KEY) {
    return response.status(503).json({ error: "no store configured" });
  }

  if (request.method === "POST") {
    const body = request.body || {};
    const key = String(body.sender_key || "");
    if (!/^pool-[1-8]$/.test(key)) {
      return response.status(400).json({ error: "unknown sender" });
    }
    const row = { sender_key: key, updated_at: new Date().toISOString() };
    if (body.enabled !== undefined) row.enabled = !!body.enabled;
    if (body.daily_cap !== undefined) {
      const cap = parseInt(body.daily_cap, 10);
      // A cap over a few hundred a day from one new domain is how domains die,
      // so the page cannot be used to set something reckless by accident.
      if (!Number.isFinite(cap) || cap < 0 || cap > 500) {
        return response.status(400).json({ error: "daily cap must be between 0 and 500" });
      }
      row.daily_cap = cap;
    }
    if (body.warm_start !== undefined) {
      const value = String(body.warm_start || "").trim();
      if (value && !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
        return response.status(400).json({ error: "warm start must be a date like 2026-08-07" });
      }
      row.warm_start = value || null;
    }
    // Merge with whatever is already stored. An upsert REPLACES the row, so
    // sending only the field that changed wiped the others: pausing an account
    // cleared its warm up date, which would have let it jump from a ramped
    // handful a day straight to its full ceiling. Read, merge, then write.
    const existing = await store(
      `outreach_settings?sender_key=eq.${encodeURIComponent(key)}&select=*`
    );
    let current = {};
    if (existing.ok) {
      try { current = JSON.parse(existing.body)[0] || {}; } catch { current = {}; }
    }
    const merged = {
      sender_key: key,
      enabled: row.enabled !== undefined ? row.enabled
        : (current.enabled === undefined ? true : current.enabled),
      daily_cap: row.daily_cap !== undefined ? row.daily_cap
        : (current.daily_cap === undefined ? null : current.daily_cap),
      warm_start: row.warm_start !== undefined ? row.warm_start
        : (current.warm_start === undefined ? null : current.warm_start),
      updated_at: row.updated_at,
    };
    if (merged.daily_cap === null) delete merged.daily_cap;

    const saved = await store("outreach_settings", {
      method: "POST",
      headers: { Prefer: "resolution=merge-duplicates,return=representation" },
      body: JSON.stringify(merged),
    });
    if (!saved.ok) {
      return response.status(500).json({ error: "could not save", detail: saved.body.slice(0, 160) });
    }
    return response.status(200).json({ saved: true });
  }

  const [rowsResult, used] = await Promise.all([
    store("outreach_settings?select=*"),
    usedToday(),
  ]);
  let saved = [];
  try { saved = JSON.parse(rowsResult.body); } catch { saved = []; }
  const byKey = Object.fromEntries(saved.map((r) => [r.sender_key, r]));

  const senders = configuredSenders().map((s) => {
    const row = byKey[s.sender_key] || {};
    return {
      ...s,
      enabled: row.enabled === undefined ? true : row.enabled,
      daily_cap: row.daily_cap === undefined ? s.env_cap : row.daily_cap,
      warm_start: row.warm_start === undefined ? s.env_start : row.warm_start,
      used_today: (used[s.from] || 0) + (used[s.sender_key] || 0),
    };
  });

  return response.status(200).json({ senders });
}
