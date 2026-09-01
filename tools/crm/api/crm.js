// The mini CRM's data source. Runs in the student's own Vercel account.
//   GET  -> every lead from their Google Sheet (phone or not), each joined with
//           its email history from Resend (sends, opens, clicks), ranked by who
//           needs attention first. The sheet is the single source of truth.
//   POST -> saves a change back to the sheet: a call outcome, a status change,
//           or a note. One endpoint, three shapes:
//             {row, outcome: "voicemail"}   a call result (stamps date + note)
//             {row, status: "Interested"}   a direct status change
//             {row, note: "spoke to Sam"}   a dated note, prepended to Notes
// Calling itself is free: the page dials with tel: links from the student's own
// phone. This endpoint only reads Resend and reads/writes the sheet.
import { isAuthed } from "./_auth.js";
import { thankYouConfig, findThankYouTarget, deliverThankYou } from "./_thankyou.js";

export const config = { runtime: "edge" };

const WINDOW_DAYS = 30;
const MAX_PAGES = 20; // 20 x 100 emails, months of volume

function json(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json", "cache-control": "no-store" },
  });
}

/* ------------------------------------------------------------ last good copy

   Apps Script is slow from cold and sometimes does not answer at all, and the
   CRM was showing "Could not load your leads" when that happened: the tool
   looked broken when nothing was actually wrong with it. Every successful read
   is kept, and a failed one falls back to it rather than to an error screen.

   The store is reached with the service role key, which never leaves the
   server, and the table has row level security on, so the browser's anon key
   cannot read it. */

const CACHE_KEY = "crm-leads";

async function saveLastGood(payload) {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return;
  try {
    await fetch(`${url}/rest/v1/sheet_cache`, {
      method: "POST",
      headers: {
        apikey: key, Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
        Prefer: "resolution=merge-duplicates,return=minimal",
      },
      body: JSON.stringify([{ key: CACHE_KEY, payload, saved_at: new Date().toISOString() }]),
      signal: AbortSignal.timeout(3500),
    });
  } catch {
    // Serving the leads matters more than keeping the copy up to date.
  }
}

async function readLastGood() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  try {
    const res = await fetch(
      `${url}/rest/v1/sheet_cache?key=eq.${CACHE_KEY}&select=payload,saved_at&limit=1`,
      { headers: { apikey: key, Authorization: `Bearer ${key}` }, signal: AbortSignal.timeout(3500) }
    );
    if (!res.ok) return null;
    const rows = await res.json();
    return rows[0] || null;
  } catch {
    return null;
  }
}

/** "4 minutes ago", for telling someone how old the copy they are reading is. */
function agoInWords(iso) {
  const mins = Math.max(0, Math.round((Date.now() - Date.parse(iso)) / 60000));
  if (mins < 1) return "moments ago";
  if (mins === 1) return "a minute ago";
  if (mins < 60) return mins + " minutes ago";
  const hours = Math.round(mins / 60);
  return hours === 1 ? "an hour ago" : hours + " hours ago";
}

function sheetTarget(params) {
  const base = (process.env.LEADS_SHEET_URL || "").trim();
  const token = (process.env.LEADS_SHEET_TOKEN || "").trim();
  const sep = base.includes("?") ? "&" : "?";
  return base + sep + params + (token ? "&token=" + encodeURIComponent(token) : "");
}

// Call outcomes: what each button writes to the sheet. Keep keys in sync with
// crm.html. `retire` outcomes leave the power-dial queue for good.
export const OUTCOMES = {
  interested: { status: "Interested", note: "interested", retire: true },
  not_interested: { status: "Not a fit", note: "not interested", retire: true },
  voicemail: { status: "Voicemail", note: "left a voicemail", retire: false },
  no_answer: { status: "No answer", note: "no answer", retire: false },
  callback: { status: "Callback", note: "wants a callback", retire: false },
  bad_number: { status: "Bad number", note: "bad number", retire: true },
};

// The statuses the sheet dropdown knows. Direct status changes are held to this
// list so the sheet never collects junk values.
export const STATUSES = [
  "New", "Contacted", "Follow-up 1", "Follow-up 2", "Follow-up 3", "Follow-up 4",
  "Follow-up 5", "Nurturing", "Replied", "Removed", "Interested", "Proposal sent",
  "Won", "Lost", "Not a fit", "Voicemail", "No answer", "Callback", "Bad number",
];

// Done-with entirely (never dial, sits at the bottom of the table).
const RETIRED = new Set(["won", "lost", "removed", "bad number", "not a fit"]);
// Answer-these-first (a human responded).
const REPLIED = new Set(["replied", "interested", "proposal sent"]);
// Called before, call again later.
const RETRY = new Set(["voicemail", "no answer", "callback"]);

function heatRank(h) {
  const v = String(h || "").toUpperCase();
  return v === "HOT" ? 0 : v === "WARM" ? 1 : v === "COOL" ? 2 : 3;
}
// Who needs attention first: replies, then never-touched, then in-motion, then done.
function attentionRank(status) {
  const low = String(status || "").trim().toLowerCase();
  if (REPLIED.has(low)) return 0;
  if (!low || low === "new") return 1;
  if (RETIRED.has(low)) return 3;
  return 2;
}

// Resend timestamps: "2026-07-16 04:42:20.249721+00" (space + bare zone).
function parseTime(createdAt) {
  const iso = String(createdAt || "").replace(" ", "T").replace(/([+-]\d{2})$/, "$1:00");
  return Date.parse(iso);
}

export function shapeLeads(rawLeads) {
  const out = [];
  for (const l of rawLeads || []) {
    const phone = String(l.phone || "").trim();
    const email = String(l.email || "").trim().toLowerCase();
    if (!String(l.business || "").trim() && !phone && !email) continue; // blank row
    const low = String(l.status || "").trim().toLowerCase();
    out.push({
      row: l.row,
      business: l.business || "",
      owner_name: l.owner_name || "",
      phone,
      tel: phone.replace(/[^\d+]/g, ""),
      email,
      why: l.why || "",
      website: l.website || "",
      facebook: l.facebook || "",
      instagram: l.instagram || "",
      heat: String(l.heat || "").toUpperCase(),
      website_status: l.website_status || "",
      category: l.category || "",
      rating: l.rating || "",
      reviews: l.reviews || "",
      address: l.address || "",
      city: l.city || "",
      region: l.region || "",
      postal_code: l.postal_code || "",
      country: l.country || "",
      google_maps_url: l.google_maps_url || "",
      status: l.status || "",
      contacted_on: l.contacted_on || "",
      notes: l.notes || "",
      attention: attentionRank(l.status),
      callable: !!phone && !RETIRED.has(low) && !REPLIED.has(low),
      called_before: RETRY.has(low),
      emails: [],
    });
  }
  /* Inside a heat tier, the leads you can email come first, matching the order
     the sheet is written in. Anyone looking at the top of the list should see a
     column of real email addresses, not a run of blanks. */
  out.sort((a, b) =>
    a.attention - b.attention ||
    heatRank(a.heat) - heatRank(b.heat) ||
    (a.email ? 0 : 1) - (b.email ? 0 : 1) ||
    (parseInt(b.reviews, 10) || 0) - (parseInt(a.reviews, 10) || 0) ||
    a.business.localeCompare(b.business)
  );
  return out;
}

// Attach each lead's Resend history: [{when, subject, event}], newest first.
export function joinEmails(leads, resendRows) {
  const byRecipient = new Map();
  for (const r of resendRows || []) {
    const to = (Array.isArray(r.to) ? r.to[0] : r.to || "").trim().toLowerCase();
    if (!to) continue;
    if (!byRecipient.has(to)) byRecipient.set(to, []);
    byRecipient.get(to).push({
      when: String(r.created_at || "").slice(0, 16),
      subject: r.subject || "",
      event: r.last_event || "sent",
    });
  }
  for (const lead of leads) {
    if (!lead.email) continue;
    const hits = byRecipient.get(lead.email) || [];
    lead.emails = hits.slice(0, 20);
  }
  return leads;
}

async function fetchResend(apiKey) {
  const rows = [];
  const cutoff = Date.now() - WINDOW_DAYS * 86400000;
  let after = "";
  for (let page = 0; page < MAX_PAGES; page++) {
    const qs = new URLSearchParams({ limit: "100" });
    if (after) qs.set("after", after);
    const res = await fetch("https://api.resend.com/emails?" + qs, {
      headers: { Authorization: `Bearer ${apiKey}` },
    });
    if (!res.ok) throw new Error("Resend returned HTTP " + res.status);
    const body = await res.json();
    const batch = body.data || [];
    rows.push(...batch);
    if (!body.has_more || batch.length === 0) break;
    const oldest = batch[batch.length - 1];
    after = oldest.id;
    if (parseTime(oldest.created_at) < cutoff) break;
  }
  return rows.filter((r) => {
    const t = parseTime(r.created_at);
    return !Number.isNaN(t) && t >= cutoff;
  });
}

const SCRIPT_KEYS = ["no_website", "old_site", "voicemail"];

// The CRM's script editor: saves the three call scripts into the sheet's
// Scripts tab (the sheet is storage only; editing happens in the CRM).
async function saveScripts(base, body) {
  const incoming = body.scripts && typeof body.scripts === "object" ? body.scripts : null;
  if (!incoming) return json({ ok: false, error: "Nothing to save." }, 400);
  const scripts = {};
  for (const k of SCRIPT_KEYS) {
    if (typeof incoming[k] === "string") scripts[k] = incoming[k].slice(0, 5000);
  }
  if (!Object.keys(scripts).length) return json({ ok: false, error: "Nothing to save." }, 400);
  try {
    const res = await fetch(base, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ op: "scripts", token: (process.env.LEADS_SHEET_TOKEN || "").trim(), scripts }),
      signal: AbortSignal.timeout(15000),
    });
    const data = JSON.parse(await res.text());
    if (!data.ok) return json({ ok: false, error: String(data.error || "the sheet rejected the update") }, 502);
    return json({ ok: true, saved: data.saved || 0, scripts });
  } catch (err) {
    return json({ ok: false, error: "Could not save (" + (err && err.message ? err.message : "network error") + "). Try again." }, 502);
  }
}

async function saveChange(base, body) {
  const row = parseInt(body.row, 10);
  if (!row || row < 3) return json({ ok: false, error: "Unknown lead row." }, 400);
  const when = new Date().toISOString().slice(0, 10);
  const update = { row };
  let retire = false;

  if (body.outcome != null) {
    const rule = OUTCOMES[String(body.outcome)];
    if (!rule) return json({ ok: false, error: "Unknown call outcome." }, 400);
    update.status = rule.status;
    update.contacted_on = when;
    update.note = "Called " + when + ": " + rule.note;
    retire = rule.retire;
  } else {
    if (body.status != null) {
      const status = String(body.status).trim();
      if (!STATUSES.includes(status)) return json({ ok: false, error: "Unknown status." }, 400);
      update.status = status;
      // Moving a lead into an email-sequence stage restarts its follow-up clock.
      // Without a date the autopilot would treat it as never contacted and skip
      // its follow-ups forever, so a board drag or status toggle stamps today.
      if (/^(contacted|follow-up [1-5]|nurturing)$/i.test(status)) update.contacted_on = when;

      /* Undo has to put the date back as well as the status.
         Moving a lead to Contacted stamps today. Undoing that used to restore
         only the status, leaving a contact date for a conversation that never
         happened, which then made the lead look recently worked when it had
         never been touched at all. An explicit contacted_on wins over the
         stamp above, and an empty string clears it. */
      if (typeof body.contacted_on === "string") {
        const want = body.contacted_on.trim().slice(0, 10);
        /* The sheet skips empty values, so sending "" leaves the old date in
           place. A formula that evaluates to nothing is the one thing it will
           accept that reads back as blank. */
        update.contacted_on = want || '=""';
      }
    }
    if (body.note != null) {
      const note = String(body.note).trim().slice(0, 500);
      if (note) update.note = when + ": " + note;
    }
    if (!update.status && !update.note) return json({ ok: false, error: "Nothing to save." }, 400);
  }

  // Winning a lead is the one status change that reaches the customer: it sends
  // them the thank-you video page. Who to email has to be worked out before the
  // write, because afterwards the sheet says Won and there is no way left to
  // tell a fresh customer from one who was already marked months ago.
  const tyCfg = thankYouConfig();
  const winning = String(update.status || "").trim().toLowerCase() === "won";
  const target = winning && tyCfg.ready
    ? await findThankYouTarget((process.env.LEADS_SHEET_URL || "").trim(), (process.env.LEADS_SHEET_TOKEN || "").trim(), row, tyCfg)
    : { skip: "not a win" };

  try {
    const res = await fetch(base, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        op: "mark",
        token: (process.env.LEADS_SHEET_TOKEN || "").trim(),
        updates: [update],
      }),
      signal: AbortSignal.timeout(15000),
    });
    const data = JSON.parse(await res.text());
    if (!data.ok) return json({ ok: false, error: String(data.error || "the sheet rejected the update") }, 502);

    // Only now that the save is safely on the sheet.
    let welcomed = "";
    if (target.lead) {
      const out = await deliverThankYou(tyCfg, target.lead);
      welcomed = out.sent ? "Thank-you video sent to " + target.lead.email : "Could not send the thank-you email: " + out.reason;
    }

    return json({ ok: true, row, status: update.status || "", note: update.note || "", contacted_on: update.contacted_on || "", retire, welcomed });
  } catch (err) {
    return json({
      ok: false,
      error: "Could not save to the sheet (" + (err && err.message ? err.message : "network error") + "). Nothing was logged, so try again.",
    }, 502);
  }
}

export default async function handler(req) {
  const url = new URL(req.url);
  // The gate: a login cookie (AUTH_SECRET) or the legacy ?k= key (DASH_KEY).
  // If neither env is set the endpoint stays open, exactly as it always was.
  const lock = (process.env.DASH_KEY || "").trim();
  const authSecret = (process.env.AUTH_SECRET || "").trim();
  if (lock || authSecret) {
    const keyOk = lock && url.searchParams.get("k") === lock;
    const cookieOk = authSecret && (await isAuthed(req));
    if (!keyOk && !cookieOk) {
      const out = { ok: false };
      if (authSecret) out.login = true; // tells the page to show the login screen
      else out.error = "This page is locked. Open it with ?k=your-key added to the address.";
      return json(out, 401);
    }
  }
  const base = (process.env.LEADS_SHEET_URL || "").trim();
  if (!base) {
    return json({
      ok: false,
      connected: false,
      error: "No leads sheet connected yet. In Vercel add LEADS_SHEET_URL (your sheet's web app link), then redeploy. See dashboard/README.md.",
    });
  }

  if (req.method === "POST") {
    let body;
    try {
      body = await req.json();
    } catch {
      return json({ ok: false, error: "Bad request." }, 400);
    }
    if (body.scripts != null) return saveScripts(base, body);
    // Find and build sends the businesses it scraped, so they land in the sheet
    // beside every other lead. The dashboard holds no sheet credentials, so it
    // goes through here like every other write.
    if (body.op === "add_leads") {
      /* Apps Script is slow from cold, and writing a batch of leads is the
         slowest thing it does. Fifteen seconds was not enough: the run would
         finish, the sites would all be built, and then the last thing on
         screen said the leads had not been filed. Two attempts, the second
         after a pause to let a cold script finish waking up.

         Worth being clear about what is at stake: every lead is already saved
         to our own store by the builder, so nothing is lost when this fails.
         The sheet is the copy the student can see, which is exactly why it
         should not quietly stop being written to. */
      const payload = JSON.stringify({
        op: "add_leads",
        token: (process.env.LEADS_SHEET_TOKEN || "").trim(),
        leads: body.leads || [],
      });

      /* One attempt, and it has to fit inside the platform's own ceiling for an
         edge function, which is twenty five seconds. Two attempts of eighteen
         and twelve added up to thirty, so the platform killed the function
         mid-write and answered with an HTML error page instead of JSON: the
         retry meant to make this reliable was the thing breaking it. A cold
         Apps Script needs the better part of twenty seconds, so it gets one
         run at it with a few seconds of headroom. */
      let lastError = "";
      for (const budget of [21000]) {
        try {
          const res = await fetch(base, {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: payload,
            signal: AbortSignal.timeout(budget),
          });
          const text = await res.text();
          try {
            return json(JSON.parse(text));
          } catch {
            lastError = "the sheet did not return data";
          }
        } catch (error) {
          lastError = (error && error.message) || "network error";
        }
      }
      return json({
        ok: false,
        error: "Your sheet did not answer, so these are not in it yet. They are saved here and on the Find and build tab.",
        detail: lastError.slice(0, 80),
      });
    }
    return saveChange(base, body);
  }

  // GET: the sheet and the Resend history, in parallel.
  const apiKey = (process.env.RESEND_API_KEY || "").trim();
  const resendPromise = apiKey ? fetchResend(apiKey).catch(() => null) : Promise.resolve([]);

  // Apps Script is slow when it has been idle: the first request in a while
  // often blows a ten second budget, and one timeout was showing the whole CRM
  // as broken. Try twice, with a longer second attempt, before giving up.
  async function fetchSheet() {
    // Both attempts together must finish inside the platform's own ceiling for
    // this function. Twelve plus twenty exceeded it, and the platform then
    // returned an HTML error page, which the browser could not parse as JSON:
    // the retry meant to fix slow loading was breaking the page outright.
    /* Eight seconds is under what a cold Apps Script usually needs, so the
       first attempt was failing every time and burning eight of the twenty
       available seconds before the real attempt began. One long attempt, then
       a short retry for the case where the first was simply unlucky. */
    const budgets = [13000, 6000];
    let lastError;
    for (const budget of budgets) {
      try {
        return await fetch(sheetTarget("crm=1"), { signal: AbortSignal.timeout(budget) });
      } catch (error) {
        lastError = error;
      }
    }
    throw lastError;
  }

  /* Apps Script needs the better part of twenty seconds when it has been idle,
     and every visitor was paying it. A copy from the last few minutes is worth
     far more than numbers that are twenty seconds fresher, so a recent one is
     served straight away. The refresh button asks for a live read, and any
     copy older than the window below forces one anyway. */
  /* Six hours, not fifteen minutes. The window used to be short so the data
     could not drift far, but that meant whoever arrived after it lapsed paid
     the full twenty second wait, and on a live demo that person is the one
     standing in front of an audience. The page now refreshes itself in the
     background straight after it paints, so a longer window costs nothing:
     the screen fills instantly and the live numbers land a moment later. */
  const FAST_COPY_MINUTES = 360;
  const wantsFresh = url.searchParams.get("fresh") === "1";
  if (!wantsFresh) {
    const saved = await readLastGood();
    const ageMinutes = saved && saved.saved_at
      ? (Date.now() - Date.parse(saved.saved_at)) / 60000
      : Infinity;
    if (saved && saved.payload && ageMinutes < FAST_COPY_MINUTES) {
      return json({
        ...saved.payload,
        stale: true,
        saved_ago: agoInWords(saved.saved_at),
        partial: saved.payload.partial ||
          "Showing the copy saved " + agoInWords(saved.saved_at) + ". Hit refresh for the very latest.",
      });
    }
  }

  let data;
  try {
    const res = await fetchSheet();
    const text = await res.text();
    try {
      data = JSON.parse(text);
    } catch {
      return json({
        ok: false,
        connected: true,
        error: "The sheet link did not return data. Make sure the web app is deployed so 'Anyone' can access it, and that you pasted the latest Code.gs.",
      });
    }
  } catch (err) {
    /* The sheet did not answer. Serving the copy from the last successful read
       keeps the CRM usable, and says plainly how old it is so nobody acts on
       stale numbers without knowing. */
    const saved = await readLastGood();
    if (saved && saved.payload) {
      return json({
        ...saved.payload,
        stale: true,
        partial: "Your sheet did not answer just now, so this is the copy saved " +
                 agoInWords(saved.saved_at) + ". Changes you make will still be written to the sheet.",
      });
    }
    return json({
      ok: false,
      connected: true,
      error: "Could not reach the sheet (" + (err && err.message ? err.message : "network error") + ").",
    });
  }
  if (!data.ok) {
    let msg = String(data.error || "the sheet rejected the request");
    if (/phone|crm/i.test(msg)) msg += " Re-paste the latest Code.gs into your sheet.";
    return json({ ok: false, connected: true, error: msg });
  }

  const leads = shapeLeads(data.leads || []);
  const scripts = data.scripts && typeof data.scripts === "object" ? data.scripts : {};
  const resendRows = await resendPromise; // null means Resend failed
  if (resendRows) joinEmails(leads, resendRows);

  const payload = {
    ok: true,
    connected: true,
    count: leads.length,
    agent: (process.env.OUTREACH_SENDER_NAME || "").trim(),
    video: (process.env.OUTREACH_VIDEO_LINK || "").trim(), // prefills the follow-up email
    scripts, // custom call scripts from the sheet's Scripts tab, when present
    emails_joined: !!resendRows && !!apiKey,
    partial: resendRows === null ? "Email history is unavailable right now (Resend did not respond); calls and statuses still work." : "",
    leads,
  };
  await saveLastGood(payload);
  return json(payload);
}
