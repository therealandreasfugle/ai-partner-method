// Customers.
//   GET  -> everyone who has actually bought, merged from the three places that
//           know about them, plus what they are worth in referrals.
//   POST {action:"job"} -> logs a job against one of them.
//
// There is deliberately no "add a customer" here. A customer is a lead that
// reached Won or somebody who arrived on a referral, and both of those already
// have a front door. A third way in would let the same person exist twice with
// two different phone numbers, which is exactly the mess this view exists to
// prevent.
import { isAuthed } from "./_auth.js";

const SHEET_TIMEOUT_MS = 30000;

function sheetTarget(params) {
  const base = (process.env.LEADS_SHEET_URL || "").trim();
  const token = (process.env.LEADS_SHEET_TOKEN || "").trim();
  const sep = base.includes("?") ? "&" : "?";
  return base + sep + params + (token ? "&token=" + encodeURIComponent(token) : "");
}

function sheetError(err, advice) {
  const timedOut = err && (err.name === "TimeoutError" || /aborted due to timeout/i.test(String(err.message || "")));
  if (timedOut) return "Google took too long to answer. " + advice;
  return String(err.message || err);
}

async function readSheet() {
  const res = await fetch(sheetTarget("customers=1"), { signal: AbortSignal.timeout(SHEET_TIMEOUT_MS) });
  const text = await res.text();
  let data;
  try {
    data = JSON.parse(text);
  } catch {
    throw new Error("The sheet link did not return data. Re-paste the latest Code.gs and redeploy the web app.");
  }
  if (!data.ok) throw new Error(String(data.error || "the sheet rejected the request"));
  return data;
}

async function writeSheet(payload) {
  const res = await fetch((process.env.LEADS_SHEET_URL || "").trim(), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...payload, token: (process.env.LEADS_SHEET_TOKEN || "").trim() }),
    signal: AbortSignal.timeout(SHEET_TIMEOUT_MS),
  });
  const text = await res.text();
  let data;
  try {
    data = JSON.parse(text);
  } catch {
    throw new Error("The sheet did not accept the write. Re-paste the latest Code.gs.");
  }
  if (!data.ok) throw new Error(String(data.error || "the sheet rejected the update"));
  return data;
}

function json(res, body, status = 200) {
  res.status(status).setHeader("content-type", "application/json");
  res.setHeader("cache-control", "no-store");
  res.end(JSON.stringify(body));
}

const norm = (s) => String(s || "").trim().toLowerCase();

export default async function handler(req, res) {
  const url = new URL(req.url, "http://x");
  const lock = (process.env.DASH_KEY || "").trim();
  const authSecret = (process.env.AUTH_SECRET || "").trim();
  if (authSecret || lock) {
    const signedIn = authSecret ? await isAuthed(req) : false;
    const keyed = lock ? url.searchParams.get("k") === lock : false;
    if (!signedIn && !keyed) return json(res, { ok: false, error: "Not signed in." }, 401);
  }

  if (!(process.env.LEADS_SHEET_URL || "").trim()) {
    return json(res, { ok: false, error: "No leads sheet connected yet. In Vercel add LEADS_SHEET_URL, then redeploy." }, 503);
  }

  if (req.method === "GET") {
    try {
      const data = await readSheet();
      const customers = (data.customers || []).slice().sort((a, b) => {
        // Most recent thing first, whether that was a job or the day they came in.
        const ax = a.last_job_date || a.since || "";
        const bx = b.last_job_date || b.since || "";
        if (ax !== bx) return ax < bx ? 1 : -1;
        return String(a.name).localeCompare(String(b.name));
      });
      const jobs = customers.reduce((n, c) => n + (Number(c.jobs) || 0), 0);
      const owed = customers.reduce((n, c) => n + (Number(c.owed) || 0), 0);
      const advocates = customers.filter((c) => Number(c.sent) > 0).length;
      return json(res, {
        ok: true,
        customers,
        summary: { total: customers.length, jobs, owed, advocates },
      });
    } catch (err) {
      return json(res, { ok: false, error: sheetError(err, "Nothing has changed. Reload the page.") }, 502);
    }
  }

  if (req.method !== "POST") return json(res, { ok: false, error: "POST or GET only" }, 405);

  let body = req.body;
  if (typeof body === "string") {
    try { body = JSON.parse(body); } catch { body = {}; }
  }
  body = body || {};

  if (body.action !== "job") return json(res, { ok: false, error: "Unknown action." }, 400);

  const customer = String(body.customer || "").trim();
  const job = String(body.job || "").trim();
  if (!customer) return json(res, { ok: false, error: "Which customer? No name given." }, 400);
  if (!job) return json(res, { ok: false, error: "Say what the job was." }, 400);

  // The job has to belong to somebody already on the books, for the same reason
  // there is no add-a-customer button: a typo here would otherwise invent a new
  // person who nobody can ever match up again.
  let sheet;
  try {
    sheet = await readSheet();
  } catch (err) {
    return json(res, { ok: false, error: sheetError(err, "Nothing was saved, so try again.") }, 502);
  }
  const email = String(body.customer_email || "").trim();
  const match = (sheet.customers || []).find((c) =>
    email ? norm(c.email) === norm(email) : norm(c.name) === norm(customer)
  );
  if (!match) {
    return json(res, {
      ok: false,
      error: `${customer} is not one of your customers yet. Mark their lead as Won first, or log the referral that brought them in.`,
    }, 400);
  }

  try {
    const written = await writeSheet({
      op: "job",
      job: {
        customer: match.name || customer,
        customer_email: match.email || email,
        customer_phone: match.phone || String(body.customer_phone || "").trim(),
        job,
        notes: String(body.notes || "").trim(),
      },
    });
    return json(res, { ok: true, row: written.row, customer: match.name || customer, job });
  } catch (err) {
    return json(res, {
      ok: false,
      error: sheetError(err, "It may still have gone through. Reload the page and check before you log it again."),
    }, 502);
  }
}
