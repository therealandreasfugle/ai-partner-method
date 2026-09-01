/**
 * /api/resend-webhook
 *
 * Receives delivery events from Resend and stores them, so the CRM can show
 * what happened to an email after it left, without anyone opening Resend and
 * without a Google login.
 *
 * Resend posts one event per thing that happens to a message: delivered,
 * opened, clicked, bounced, complained, delivery_delayed. Together those are the
 * numbers that actually matter while a domain is warming:
 *
 *   bounced    the fastest way to wreck a young domain, must stay near zero
 *   complained someone pressed "report spam", the single worst signal there is
 *   opened     soft, and inflated by Apple and Gmail pre-loading images
 *   clicked    the honest one, a human chose to act
 *
 * SECURITY
 * Resend signs every webhook with Svix headers. This verifies that signature
 * against RESEND_WEBHOOK_SECRET and rejects anything that fails, so nobody can
 * forge delivery events by posting to a URL they guessed. With no secret set it
 * refuses everything rather than trusting the internet.
 */

import { createHmac, timingSafeEqual as nodeTimingSafeEqual } from "node:crypto";

const STORE_URL = process.env.SUPABASE_URL;
const STORE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

/**
 * Verifies a Svix signature, which is what Resend uses.
 *
 * The signed payload is "<id>.<timestamp>.<body>", the secret is base64 after a
 * "whsec_" prefix, and the header can carry several space separated signatures
 * (Svix rotates keys), so any one matching is a pass.
 */
function signatureIsValid(headers, rawBody, secret) {
  const id = headers["svix-id"] || headers["webhook-id"];
  const timestamp = headers["svix-timestamp"] || headers["webhook-timestamp"];
  const signatureHeader = headers["svix-signature"] || headers["webhook-signature"];
  if (!id || !timestamp || !signatureHeader) return false;

  // Reject anything older than five minutes so a captured request cannot be
  // replayed back at us later.
  const age = Math.abs(Date.now() / 1000 - Number(timestamp));
  if (!Number.isFinite(age) || age > 300) return false;

  const key = Buffer.from(secret.replace(/^whsec_/, ""), "base64");
  const expected = createHmac("sha256", key)
    .update(`${id}.${timestamp}.${rawBody}`)
    .digest("base64");

  return String(signatureHeader)
    .split(" ")
    .map((part) => part.split(",").pop())
    .some((candidate) => {
      const a = Buffer.from(candidate || "", "utf8");
      const b = Buffer.from(expected, "utf8");
      return a.length === b.length && nodeTimingSafeEqual(a, b);
    });
}

/** The domain an email was sent FROM, which is the thing being warmed. */
function sendingDomain(from) {
  const match = String(from || "").match(/[^\s<@]+@([^\s>]+)/);
  return match ? match[1].toLowerCase() : null;
}

async function store(row) {
  if (!STORE_URL || !STORE_KEY) return { ok: false, reason: "no store configured" };
  const response = await fetch(`${STORE_URL}/rest/v1/email_events`, {
    method: "POST",
    headers: {
      apikey: STORE_KEY,
      Authorization: `Bearer ${STORE_KEY}`,
      "Content-Type": "application/json",
      // Duplicate deliveries are normal: Resend retries until it gets a 200.
      Prefer: "resolution=ignore-duplicates",
    },
    body: JSON.stringify(row),
  });
  return { ok: response.ok, reason: response.ok ? "" : (await response.text()).slice(0, 140) };
}

export const config = { api: { bodyParser: false } };

export default async function handler(request, response) {
  if (request.method !== "POST") {
    return response.status(405).json({ error: "POST only" });
  }

  // One secret per Resend account, because each account signs with its own.
  // All three post to this same URL, so any of them matching is a pass.
  const secrets = [
    process.env.RESEND_WEBHOOK_SECRET,
    process.env.RESEND_WEBHOOK_SECRET_2,
    process.env.RESEND_WEBHOOK_SECRET_3,
  ].filter(Boolean);
  if (!secrets.length) {
    // Fail closed. An open webhook lets anyone write false delivery history.
    return response.status(503).json({ error: "webhook is not configured" });
  }

  // The signature covers the exact bytes, so the raw body is needed, not a
  // re-serialised object.
  let raw = "";
  for await (const chunk of request) raw += chunk;

  if (!secrets.some((secret) => signatureIsValid(request.headers, raw, secret))) {
    return response.status(401).json({ error: "bad signature" });
  }

  let payload;
  try {
    payload = JSON.parse(raw);
  } catch (error) {
    return response.status(400).json({ error: "could not read the event" });
  }

  const data = payload.data || {};
  const from = Array.isArray(data.from) ? data.from[0] : data.from;
  const to = Array.isArray(data.to) ? data.to[0] : data.to;

  const result = await store({
    provider_id: data.email_id || data.id || null,
    event: String(payload.type || "").replace(/^email\./, "") || "unknown",
    occurred_at: payload.created_at || new Date().toISOString(),
    to_email: to || null,
    sender: from || null,
    sending_domain: sendingDomain(from),
    raw: payload,
  });

  // Always 200 on a verified event. A non-200 makes Resend retry, and retrying
  // will not fix a row our own database rejected.
  if (!result.ok) console.error("email_events insert failed:", result.reason);
  return response.status(200).json({ received: true });
}
