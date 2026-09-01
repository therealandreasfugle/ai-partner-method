// Outreach dashboard data source. Runs in the student's own Vercel account.
// Reads their Resend account (RESEND_API_KEY env var), aggregates every send by
// outcome, day, and sending domain, and returns compact JSON for index.html.
// The API key never leaves the server; the browser only ever sees these totals.
import { KNOWN_SUBJECTS, capForDay, warmupCeiling } from "./_outreach.js";
import { isAuthed } from "./_auth.js";

export const config = { runtime: "edge" };

const WINDOW_DAYS = 30; // the dashboard judges the last 30 days
const MAX_PAGES = 20;   // safety stop: 20 x 100 = 2,000 emails, months of volume

// How each Resend outcome reads on the dashboard.
const GOOD = ["delivered", "opened", "clicked"];
const REACHED = ["delivered", "opened", "clicked", "complained"]; // landed somewhere

function json(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json", "cache-control": "no-store" },
  });
}

function domainOf(from) {
  const angle = /<([^>]+)>/.exec(from || "");
  const addr = (angle ? angle[1] : from || "").trim().toLowerCase();
  const at = addr.lastIndexOf("@");
  return at === -1 ? "unknown" : addr.slice(at + 1);
}

function dayOf(createdAt) {
  return String(createdAt || "").slice(0, 10); // "YYYY-MM-DD"
}

// Resend timestamps look like "2026-07-16 04:42:20.249721+00": a space instead of
// "T" and a bare "+00" zone, both of which JavaScript's date parser rejects.
function parseTime(createdAt) {
  const iso = String(createdAt || "")
    .replace(" ", "T")
    .replace(/([+-]\d{2})$/, "$1:00");
  return Date.parse(iso);
}

function pct(part, whole) {
  return whole ? Math.round((part / whole) * 1000) / 10 : 0;
}

// Replies live in the student's leads Google Sheet (Resend cannot see inbound
// email). If LEADS_SHEET_URL is set to their Apps Script web app, read status
// counts and recent replies from it. Never breaks the page: returns
// {connected:false} or {connected:true, error} instead of throwing.
async function fetchSheet() {
  const base = (process.env.LEADS_SHEET_URL || "").trim();
  if (!base) return { connected: false };
  const token = (process.env.LEADS_SHEET_TOKEN || "").trim();
  const sep = base.includes("?") ? "&" : "?";
  const target = base + sep + "stats=1" + (token ? "&token=" + encodeURIComponent(token) : "");
  try {
    const res = await fetch(target, { signal: AbortSignal.timeout(8000) });
    const text = await res.text();
    let data;
    try {
      data = JSON.parse(text);
    } catch {
      return { connected: true, error: "The sheet link did not return data. Make sure the web app is deployed so 'Anyone' can access it." };
    }
    if (!data.ok) return { connected: true, error: String(data.error || "the sheet rejected the request") };
    const statuses = data.statuses || {};
    const get = (k) => statuses[k] || 0;
    const inSequence = get("Contacted") + get("Follow-up 1") + get("Follow-up 2") + get("Follow-up 3") + get("Follow-up 4") + get("Follow-up 5");
    const repliedCount = get("Replied") + get("Interested");
    const wonCount = get("Won") + get("Proposal sent");
    const emailed = inSequence + get("Nurturing") + repliedCount + wonCount + get("Removed") + get("Lost");
    return {
      connected: true,
      total: data.total || 0,
      new_leads: get("New"),
      in_sequence: inSequence,
      nurturing: get("Nurturing"),
      replied: repliedCount,
      removed: get("Removed"),
      won: wonCount,
      emailed,
      reply_rate: pct(repliedCount + wonCount, emailed),
      recent_replies: (data.replied || []).slice(0, 6),
    };
  } catch (err) {
    return { connected: true, error: "Could not reach the sheet (" + (err && err.message ? err.message : "network error") + ")" };
  }
}

// The plain-English read: healthy, throttle down, or stop and fix.
function verdict(t, warmup, sheet) {
  const notes = [];
  const extras = [];
  if (sheet && sheet.connected && !sheet.error) {
    if (sheet.replied > 0) extras.push(`${sheet.replied} lead(s) have replied. Answer them today; speed wins these deals.`);
    if (sheet.emailed >= 100 && sheet.replied + sheet.won === 0) extras.push(`No replies yet after ${sheet.emailed} leads emailed. Deliverability looks fine, so sharpen the video demo or pick better-fit leads.`);
  }
  if (warmup && t.total > 0 && warmup.sent_today === 0 && warmup.remaining > 0) {
    extras.push("Nothing has gone out yet today. Run the send once (or check your daily schedule) so the follow-ups stay on time.");
  }
  if (t.total < 10) {
    return {
      level: "neutral",
      title: "Too early to judge",
      notes: ["Fewer than 10 emails sent so far. Keep going; the numbers mean something after a week or two."].concat(extras),
    };
  }
  if (t.openTrackingOff) {
    notes.push("Opens look like zero, which usually means open tracking is switched off. In Resend go to your domain settings and turn on open and click tracking.");
  }
  if (t.bounceRate > 5 || t.spamRate > 0.3) {
    if (t.bounceRate > 5) notes.push(`Bounce rate is ${t.bounceRate}% (should be under 2%). The list has bad addresses; scrape fresh leads and let the tool drop dead domains.`);
    if (t.spamRate > 0.3) notes.push(`${t.spamRate}% of recipients marked you as spam (should be under 0.1%). Stop sending on this domain for a few days, soften the copy, and consider starting a fresh domain.`);
    return { level: "critical", title: "Pause and fix before sending more", notes: notes.concat(extras) };
  }
  if (t.bounceRate > 2 || t.spamRate > 0.1) {
    if (t.bounceRate > 2) notes.push(`Bounce rate is ${t.bounceRate}%, a little high (aim under 2%). Watch it for a few days.`);
    if (t.spamRate > 0.1) notes.push(`Spam complaints at ${t.spamRate}% (aim under 0.1%). Do not raise your daily limit yet.`);
    return { level: "warning", title: "Throttle down and watch for a few days", notes: notes.concat(extras) };
  }
  if (!t.openTrackingOff && t.reached >= 50 && t.openRate < 15) {
    notes.push(`Only ${t.openRate}% of delivered emails are being opened (aim for 20%+). Subject lines may need work, or the domain is still building trust. Hold your current pace.`);
    return { level: "warning", title: "Deliverable, but opens are low", notes: notes.concat(extras) };
  }
  notes.push("Bounces and spam complaints are inside safe limits.");
  if (t.atCeiling) {
    notes.push("You are at your daily limit and the numbers are healthy. Raise the limit by about five a day, checking back here each time.");
  } else {
    notes.push("Let the warm-up keep running. Once you are steady at your limit with numbers like these, raise it a little at a time.");
  }
  return { level: "good", title: "Healthy. Keep sending", notes: notes.concat(extras) };
}

export default async function handler(req) {
  const url = new URL(req.url);
  // The gate: a login cookie (AUTH_SECRET) or the legacy ?k= key (DASH_KEY).
  // If neither env is set the dashboard stays open, exactly as it always was.
  const lock = (process.env.DASH_KEY || "").trim();
  const authSecret = (process.env.AUTH_SECRET || "").trim();
  if (lock || authSecret) {
    const keyOk = lock && url.searchParams.get("k") === lock;
    const cookieOk = authSecret && (await isAuthed(req));
    if (!keyOk && !cookieOk) {
      const out = { ok: false };
      if (authSecret) out.login = true; // tells the page to show the login screen
      else out.error = "This dashboard is locked. Open it with ?k=your-key added to the address.";
      return json(out, 401);
    }
  }
  const apiKey = (process.env.RESEND_API_KEY || "").trim();
  if (!apiKey) {
    return json({ error: "RESEND_API_KEY is not set. In Vercel: Settings, Environment Variables, add RESEND_API_KEY, then redeploy." }, 500);
  }

  const sheetPromise = fetchSheet(); // replies, from the student's sheet, in parallel

  // Pull the send history, newest first, until we are past the window.
  const rows = [];
  let after = "";
  let failure = "";
  const cutoff = Date.now() - WINDOW_DAYS * 86400000;
  for (let page = 0; page < MAX_PAGES; page++) {
    const qs = new URLSearchParams({ limit: "100" });
    if (after) qs.set("after", after);
    let res;
    try {
      res = await fetch("https://api.resend.com/emails?" + qs, {
        headers: { Authorization: `Bearer ${apiKey}` },
      });
    } catch (err) {
      failure = "Could not reach Resend (" + (err && err.message ? err.message : "network error") + ")";
      break;
    }
    if (res.status === 401) return json({ error: "Resend rejected the API key (401). Check RESEND_API_KEY in Vercel." }, 502);
    if (!res.ok) { failure = "Resend returned HTTP " + res.status; break; }
    const body = await res.json();
    const batch = body.data || [];
    rows.push(...batch);
    if (!body.has_more || batch.length === 0) break;
    const oldest = batch[batch.length - 1];
    after = oldest.id;
    if (parseTime(oldest.created_at) < cutoff) break;
  }
  if (failure && rows.length === 0) return json({ error: failure }, 502);

  // Keep only the window, newest first as Resend returns them.
  const windowRows = rows.filter((r) => {
    const t = parseTime(r.created_at);
    return !Number.isNaN(t) && t >= cutoff;
  });

  // Aggregate: outcomes, per-day volume, per-domain health, per-template wins.
  const counts = {};
  const byDay = {};
  const byDomain = {};
  const byTemplate = {};
  for (const r of windowRows) {
    const ev = r.last_event || "unknown";
    counts[ev] = (counts[ev] || 0) + 1;
    const day = dayOf(r.created_at);
    byDay[day] = (byDay[day] || 0) + 1;
    const dom = domainOf(r.from);
    const d = (byDomain[dom] ||= { domain: dom, sent: 0, reached: 0, opened: 0, bounced: 0, spam: 0 });
    d.sent += 1;
    if (REACHED.includes(ev)) d.reached += 1;
    if (ev === "opened" || ev === "clicked") d.opened += 1;
    if (ev === "bounced") d.bounced += 1;
    if (ev === "complained") d.spam += 1;
    const name = KNOWN_SUBJECTS[(r.subject || "").trim()];
    if (name) {
      const t = (byTemplate[name] ||= { template: name, subject: (r.subject || "").trim(), sent: 0, opened: 0, clicked: 0 });
      t.sent += 1;
      if (ev === "opened" || ev === "clicked") t.opened += 1;
      if (ev === "clicked") t.clicked += 1;
    }
  }

  const total = windowRows.length;
  const reached = REACHED.reduce((n, ev) => n + (counts[ev] || 0), 0);
  const openedPlus = (counts.opened || 0) + (counts.clicked || 0);
  const bounced = counts.bounced || 0;
  const complained = counts.complained || 0;
  const failed = counts.failed || 0;

  // A continuous last-30-days series, zero-filled, oldest to newest.
  const days = [];
  for (let i = WINDOW_DAYS - 1; i >= 0; i--) {
    const d = new Date(Date.now() - i * 86400000).toISOString().slice(0, 10);
    days.push({ day: d, sent: byDay[d] || 0 });
  }
  const maxDay = Math.max(1, ...days.map((d) => d.sent));

  const totals = {
    total,
    reached,
    openRate: pct(openedPlus, reached),
    clickRate: pct(counts.clicked || 0, reached),
    bounceRate: pct(bounced, total),
    spamRate: pct(complained, total),
    openTrackingOff: openedPlus === 0 && reached >= 10,
    atCeiling: days.slice(-7).filter((d) => d.sent >= warmupCeiling() - 5).length >= 3,
  };

  // Warm-up: day number counts from the earliest send we can see (good enough,
  // since past day 19 the ramp is complete anyway). "Today" is the last UTC bucket.
  let earliest = Infinity;
  for (const r of windowRows) {
    const t = parseTime(r.created_at);
    if (!Number.isNaN(t) && t < earliest) earliest = t;
  }
  const dayNumber = earliest === Infinity ? 1 : Math.floor((Date.now() - earliest) / 86400000) + 1;
  const capToday = capForDay(dayNumber);
  const sentToday = days.length ? days[days.length - 1].sent : 0;
  const warmup = {
    day: dayNumber,
    cap_today: capToday,
    ceiling: warmupCeiling(),
    sent_today: sentToday,
    remaining: Math.max(0, capToday - sentToday),
    complete: capToday >= warmupCeiling(),
  };

  const sheet = await sheetPromise;

  return json({
    generated_at: new Date().toISOString(),
    window_days: WINDOW_DAYS,
    partial: failure || "",
    total,
    counts,
    stats: {
      sent: total,
      reached,
      opened: openedPlus,
      clicked: counts.clicked || 0,
      bounced,
      spam: complained,
      failed,
      open_rate: totals.openRate,
      click_rate: totals.clickRate,
      bounce_rate: totals.bounceRate,
      spam_rate: totals.spamRate,
      max_day: maxDay,
      open_tracking_off: totals.openTrackingOff,
    },
    days,
    warmup,
    sheet,
    domains: Object.values(byDomain).sort((a, b) => b.sent - a.sent),
    templates: Object.values(byTemplate).sort((a, b) => b.sent - a.sent),
    recent: windowRows.slice(0, 20).map((r) => ({
      to: Array.isArray(r.to) ? r.to[0] : r.to,
      subject: r.subject,
      last_event: r.last_event,
      created_at: String(r.created_at || "").slice(0, 16),
    })),
    verdict: verdict(totals, warmup, sheet),
  });
}
