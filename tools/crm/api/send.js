// The outreach autopilot. Vercel calls this once a day on a schedule (vercel.json),
// and the dashboard's "Send now" button calls it on demand. Each run it:
//   1. reads every lead and status from the student's Google Sheet,
//   2. works out who is due (first touch, follow-up, or monthly nurture),
//   3. skips anyone marked Replied or Removed, always,
//   4. sends up to today's warm-up allowance through Resend, and
//   5. writes the new statuses back to the sheet.
// The sheet is the single source of truth, so a lead the reply watcher marked
// Removed can never receive another email.
import {
  TEMPLATES, FOLLOWUPS, NURTURES, dueAction, capForDay, warmupCeiling,
  renderText, renderHtml, personalizeVideo,
} from "./_outreach.js";
import { isAuthed, timingSafeEqual } from "./_auth.js";

export const config = { maxDuration: 60 };

const SEND_GAP_MS = 600; // Resend allows 2 requests a second; stay under it
const WINDOW_DAYS = 30;

function parseTime(createdAt) {
  const iso = String(createdAt || "").replace(" ", "T").replace(/([+-]\d{2})$/, "$1:00");
  return Date.parse(iso);
}

// Today's sends and the warm-up day number, read from Resend itself, so the
// autopilot never double-spends the daily allowance no matter where sends happen.
async function warmupFromResend(apiKey) {
  const today = new Date().toISOString().slice(0, 10);
  const cutoff = Date.now() - WINDOW_DAYS * 86400000;
  let sentToday = 0;
  let earliest = Infinity;
  let after = "";
  for (let page = 0; page < 20; page++) {
    const qs = new URLSearchParams({ limit: "100" });
    if (after) qs.set("after", after);
    const res = await fetch("https://api.resend.com/emails?" + qs, {
      headers: { Authorization: `Bearer ${apiKey}` },
    });
    if (!res.ok) throw new Error("Resend returned HTTP " + res.status + " while checking today's volume");
    const body = await res.json();
    const batch = body.data || [];
    for (const r of batch) {
      const t = parseTime(r.created_at);
      if (Number.isNaN(t) || t < cutoff) continue;
      if (String(r.created_at || "").slice(0, 10) === today) sentToday++;
      if (t < earliest) earliest = t;
    }
    if (!body.has_more || batch.length === 0) break;
    const oldest = batch[batch.length - 1];
    after = oldest.id;
    if (parseTime(oldest.created_at) < cutoff) break;
  }
  const day = earliest === Infinity ? 1 : Math.floor((Date.now() - earliest) / 86400000) + 1;
  return { day, cap: capForDay(day), sent_today: sentToday, ceiling: warmupCeiling() };
}

function sheetTarget(params) {
  const base = (process.env.LEADS_SHEET_URL || "").trim();
  const token = (process.env.LEADS_SHEET_TOKEN || "").trim();
  const sep = base.includes("?") ? "&" : "?";
  return base + sep + params + (token ? "&token=" + encodeURIComponent(token) : "");
}

async function sendOne(cfg, to, subject, html, text) {
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${cfg.key}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: cfg.from, to: [to], reply_to: cfg.reply_to, subject, html, text,
    }),
  });
  const body = await res.text();
  if (!res.ok) throw new Error("Resend HTTP " + res.status + ": " + body.slice(0, 200));
  return (JSON.parse(body).id || "");
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

export default async function handler(req, res) {
  const url = new URL(req.url, "http://x");
  // The gate: a login cookie (AUTH_SECRET), the legacy page key (?k=, DASH_KEY),
  // or Vercel's cron secret each open it on their own. If none of the gate envs
  // are set the endpoint stays open, exactly as it always was. The cron path must
  // keep working even when the dashboard is locked, or the daily autopilot dies.
  const lock = (process.env.DASH_KEY || "").trim();
  const authSecret = (process.env.AUTH_SECRET || "").trim();
  const cronSecret = (process.env.CRON_SECRET || "").trim();
  const auth = String(req.headers["authorization"] || "");
  const gateActive = !!lock || !!authSecret;
  const keyOk = !!lock && timingSafeEqual(url.searchParams.get("k") || "", lock);
  const cookieOk = !!authSecret && (await isAuthed(req));
  const cronOk = !!cronSecret && timingSafeEqual(auth, "Bearer " + cronSecret);
  if (gateActive && !keyOk && !cookieOk && !cronOk) {
    const out = authSecret
      ? { ok: false, login: true }
      : { error: "Locked. Open with ?k=your-key (or set CRON_SECRET for the schedule)." };
    return res.status(401).json(out);
  }

  const cfg = {
    key: (process.env.RESEND_API_KEY || "").trim(),
    from: (process.env.RESEND_FROM || "").trim(),
    reply_to: (process.env.RESEND_REPLY_TO || "").trim() || (process.env.RESEND_FROM || "").trim(),
    video: (process.env.OUTREACH_VIDEO_LINK || "").trim(),
    name: (process.env.OUTREACH_SENDER_NAME || "").trim(),
    phone: (process.env.OUTREACH_SENDER_PHONE || "").trim(),
  };
  const missing = [];
  if (!cfg.key) missing.push("RESEND_API_KEY");
  if (!cfg.from) missing.push("RESEND_FROM");
  if (!cfg.video) missing.push("OUTREACH_VIDEO_LINK");
  if (!cfg.name) missing.push("OUTREACH_SENDER_NAME");
  if (!(process.env.LEADS_SHEET_URL || "").trim()) missing.push("LEADS_SHEET_URL");
  // ?check=1: report whether the autopilot could send, without sending anything.
  // The CRM's setup panel uses this; the daily schedule never passes it.
  if (url.searchParams.get("check") === "1") {
    return res.status(200).json({ ok: true, configured: missing.length === 0, missing });
  }
  if (missing.length) {
    return res.status(500).json({
      error: "Autopilot is not configured yet. Add these in Vercel (Settings, Environment Variables) and redeploy: " + missing.join(", ") + ". See dashboard/README.md.",
    });
  }

  // 1. Who exists, and who already replied or asked out (they are skipped).
  let sheet;
  try {
    const r = await fetch(sheetTarget("leads=1"), { signal: AbortSignal.timeout(10000) });
    sheet = JSON.parse(await r.text());
  } catch (err) {
    return res.status(502).json({ error: "Could not read the leads sheet (" + (err && err.message ? err.message : "network error") + "). Check LEADS_SHEET_URL." });
  }
  if (!sheet.ok) return res.status(502).json({ error: "The leads sheet said: " + String(sheet.error || "unknown error") });
  const leads = sheet.leads || [];

  // 2. What is due today.
  const todayUtc = Date.now();
  const plan = [];
  let initials = 0;
  let stopped = 0;
  for (const lead of leads) {
    const action = dueAction(lead, todayUtc);
    if (!action) {
      const low = String(lead.status || "").trim().toLowerCase();
      if (low === "replied" || low === "removed" || low === "unsubscribed" || low === "not interested") stopped++;
      continue;
    }
    let tpl;
    if (action.kind === "initial") { tpl = TEMPLATES[initials % TEMPLATES.length]; initials++; }
    else if (action.kind === "nurture") tpl = NURTURES[new Date().getUTCMonth() % NURTURES.length];
    else tpl = FOLLOWUPS[action.index];
    plan.push({ lead, subject: tpl.subject, body: tpl.body, next: action.next });
  }

  // 3. Today's allowance, measured against everything already sent today.
  let warmup;
  try {
    warmup = await warmupFromResend(cfg.key);
  } catch (err) {
    return res.status(502).json({ error: String(err.message || err) });
  }
  const override = parseInt(url.searchParams.get("limit") || "", 10);
  const room = Number.isNaN(override)
    ? Math.max(0, warmup.cap - warmup.sent_today)
    : Math.max(0, Math.min(override, 100 - warmup.sent_today));
  const toSend = plan.slice(0, room);

  // 4. Send, spaced out, and remember every advance for the write-back.
  const stamp = new Date().toISOString().slice(0, 16).replace("T", " ");
  const updates = [];
  const details = [];
  let sent = 0, failed = 0;
  for (let i = 0; i < toSend.length; i++) {
    const { lead, subject, body, next } = toSend[i];
    try {
      const leadCfg = { ...cfg, video: personalizeVideo(cfg.video, lead) };
      const id = await sendOne(cfg, lead.email, subject, renderHtml(body, leadCfg), renderText(body, leadCfg));
      updates.push({ row: lead.row, status: next, contacted_on: stamp });
      details.push({ business: lead.business, email: lead.email, moved_to: next, id });
      sent++;
    } catch (err) {
      failed++;
      details.push({ business: lead.business, email: lead.email, error: String(err.message || err).slice(0, 160) });
    }
    if (i < toSend.length - 1) await sleep(SEND_GAP_MS);
  }

  // 5. Write the new statuses back to the sheet (the source of truth).
  let writeback = { ok: true, updated: 0 };
  if (updates.length) {
    try {
      const r = await fetch((process.env.LEADS_SHEET_URL || "").trim(), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ op: "mark", token: (process.env.LEADS_SHEET_TOKEN || "").trim(), updates }),
        signal: AbortSignal.timeout(15000),
      });
      writeback = JSON.parse(await r.text());
    } catch (err) {
      writeback = { ok: false, error: String(err && err.message ? err.message : err) };
    }
  }

  return res.status(200).json({
    ok: true,
    due: plan.length,
    sent,
    failed,
    held_for_tomorrow: Math.max(0, plan.length - toSend.length),
    skipped_replied_or_removed: stopped,
    warmup: { day: warmup.day, cap_today: warmup.cap, already_sent_today: warmup.sent_today, ceiling: warmup.ceiling },
    writeback,
    details: details.slice(0, 12),
  });
}
