// Sequences: a follow-up that runs itself.
//
// One email is a coin toss. The businesses that reply usually reply to the
// third or fourth touch, and nobody remembers to send those by hand. A
// sequence is a list of steps with a day offset:
//
//   [ { day: 0, kind: "email",  template: 12 },
//     { day: 3, kind: "task",   title: "Ring them, did they open it" },
//     { day: 7, kind: "email",  template: 13 },
//     { day: 12, kind: "task",  title: "Last try, then park it" } ]
//
// Enrolling a lead creates a run. A tick advances every run whose next step is
// due: an email step sends, a task step lands in the Tasks tab. The tick is
// idempotent per day, so running it twice cannot double-send.
//
//   GET    /api/sequences                 sequences + how many are enrolled
//   GET    /api/sequences?runs=1          every run, for the dashboard
//   GET    /api/sequences?lead=214        that lead's runs
//   POST   /api/sequences  {name, steps}  create or update a sequence
//   POST   /api/sequences?enroll=1        {sequence_id, leads:[{row,business,email,phone,slug}]}
//   POST   /api/sequences?stop=1          {run_id, reason}
//   POST   /api/sequences?tick=1          advance everything due (cron + on load)
//
// A run stops the moment a lead replies or is marked Won or Lost. Chasing
// somebody who already answered is the fastest way to lose them.

import { isAuthed, timingSafeEqual } from "./_auth.js";

export const config = { runtime: "edge" };

function json(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json", "cache-control": "no-store" },
  });
}

function store() {
  const url = (process.env.SUPABASE_URL || "").trim();
  const key = (process.env.SUPABASE_SERVICE_ROLE_KEY || "").trim();
  if (!url || !key) return null;
  return { url, headers: { apikey: key, Authorization: `Bearer ${key}`, "Content-Type": "application/json" } };
}

const today = () => new Date().toISOString().slice(0, 10);
const addDays = (iso, n) => {
  const d = new Date(iso + "T00:00:00Z");
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
};

/** Steps are user input, so they are checked rather than trusted. */
function cleanSteps(raw) {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((s) => ({
      day: Math.max(0, Math.min(120, parseInt(s.day, 10) || 0)),
      kind: s.kind === "email" ? "email" : "task",
      title: String(s.title || "").trim().slice(0, 200),
      subject: String(s.subject || "").trim().slice(0, 200),
      body: String(s.body || "").trim().slice(0, 5000),
    }))
    .filter((s) => (s.kind === "email" ? s.subject && s.body : s.title))
    .sort((a, b) => a.day - b.day)
    .slice(0, 12);
}

/** {{business}} and {{town}} filled in, anything unknown removed rather than left raw. */
function fill(text, run) {
  return String(text || "")
    .replace(/\{\{\s*business\s*\}\}/gi, run.business || "there")
    .replace(/\{\{\s*first_name\s*\}\}/gi, "there")
    .replace(/\{\{\s*town\s*\}\}/gi, run.town || "your area")
    /* The follow-up is worthless without the thing being followed up on, so a
       template can drop in the site we built them and the proposal page. Both
       come from the slug recorded when the lead was enrolled. A lead with no
       site built gets the sentence removed rather than a dead link. */
    .replace(/\{\{\s*site\s*\}\}/gi, run.slug ? "https://aipm-instant-site.vercel.app/" + run.slug : "")
    .replace(/\{\{\s*proposal\s*\}\}/gi, run.slug ? "https://aipm-instant-proposal.vercel.app/proposal.html?site=" + run.slug : "")
    .replace(/\{\{[^}]*\}\}/g, "")
    .replace(/\s{2,}/g, " ")
    .trim();
}

export default async function handler(req) {
  const authSecret = (process.env.AUTH_SECRET || "").trim();
  const url = new URL(req.url);
  const isTick = url.searchParams.get("tick") === "1";

  /* The tick also runs from the daily cron, which carries a secret rather than
     a session. Everything else needs a signed-in human. */
  const cronSecret = (process.env.CRON_SECRET || "").trim();
  /* Vercel sends its schedules "Authorization: Bearer <CRON_SECRET>" and
     nothing else. This used to look only for an x-cron-secret header and a
     ?key= parameter, neither of which Vercel sends, so the nightly tick was
     rejected every night and follow-ups never went out. The ?key= form is gone
     as well: a secret in a URL ends up in request logs. */
  const cronOk = isTick && cronSecret &&
    timingSafeEqual(req.headers.get("authorization") || "", "Bearer " + cronSecret);
  if (!cronOk && (!authSecret || !(await isAuthed(req)))) {
    return json({ ok: false, login: true }, 401);
  }

  const db = store();
  if (!db) return json({ ok: false, error: "Storage is not configured." }, 503);
  const rest = (path, init) => fetch(db.url + "/rest/v1/" + path, {
    ...init, headers: { ...db.headers, ...(init && init.headers) },
    signal: AbortSignal.timeout(9000),
  });

  try {
    /* The nightly tick, before any method branching. Vercel's scheduler sends a
       GET, but this used to sit inside the POST branch, so even once the cron
       was authenticating it fell through to the plain listing and no follow-up
       ever advanced. Safe to run twice: each step is keyed to the day it is
       due. */
    if (isTick) return await tick(rest);

    /* ---------------------------------------------------------------- read */
    if (req.method === "GET") {
      const lead = url.searchParams.get("lead");
      if (lead) {
        const res = await rest(`sequence_runs?lead_row=eq.${encodeURIComponent(lead)}&select=*&order=id.desc`);
        return json({ ok: true, runs: res.ok ? await res.json() : [] });
      }
      if (url.searchParams.get("runs") === "1") {
        const res = await rest("sequence_runs?select=*&order=id.desc&limit=500");
        return json({ ok: true, runs: res.ok ? await res.json() : [] });
      }
      const [seqRes, runRes] = await Promise.all([
        rest("sequences?select=*&order=id.asc"),
        rest("sequence_runs?select=sequence_id,status"),
      ]);
      const sequences = seqRes.ok ? await seqRes.json() : [];
      const runs = runRes.ok ? await runRes.json() : [];
      sequences.forEach((s) => {
        const mine = runs.filter((r) => r.sequence_id === s.id);
        s.enrolled = mine.filter((r) => r.status === "active").length;
        s.finished = mine.filter((r) => r.status !== "active").length;
      });
      return json({ ok: true, sequences });
    }

    if (req.method !== "POST") return json({ ok: false, error: "GET or POST." }, 405);
    const body = await req.json().catch(() => ({}));

    /* -------------------------------------------------------------- enroll */
    if (url.searchParams.get("enroll") === "1") {
      const seqId = parseInt(body.sequence_id, 10);
      const leads = Array.isArray(body.leads) ? body.leads.slice(0, 200) : [];
      if (!seqId || !leads.length) return json({ ok: false, error: "Pick a sequence and at least one lead." }, 400);

      const seqRes = await rest(`sequences?id=eq.${seqId}&select=*`);
      const seq = seqRes.ok ? (await seqRes.json())[0] : null;
      if (!seq) return json({ ok: false, error: "That sequence is gone." }, 404);
      const steps = cleanSteps(seq.steps);
      if (!steps.length) return json({ ok: false, error: "That sequence has no steps yet." }, 400);

      const rows = leads.map((l) => ({
        sequence_id: seqId,
        lead_row: Number.isFinite(+l.row) ? +l.row : null,
        business: String(l.business || "").slice(0, 160) || "(no business)",
        email: l.email || null,
        phone: l.phone || null,
        slug: l.slug || null,
        town: l.town || null,
        step_index: 0,
        next_due: addDays(today(), steps[0].day),
        status: "active",
      }));
      /* merge-duplicates so enrolling the same lead twice is a no-op rather
         than a second run quietly double-sending everything. */
      const res = await rest("sequence_runs", {
        method: "POST",
        headers: { Prefer: "resolution=merge-duplicates,return=representation" },
        body: JSON.stringify(rows),
      });
      if (!res.ok) return json({ ok: false, error: "Could not enrol those leads." }, 502);
      const saved = await res.json();
      return json({ ok: true, enrolled: saved.length });
    }

    /* ---------------------------------------------------------------- stop */
    if (url.searchParams.get("stop") === "1") {
      const id = parseInt(body.run_id, 10);
      if (!id) return json({ ok: false, error: "Which run?" }, 400);
      const res = await rest(`sequence_runs?id=eq.${id}`, {
        method: "PATCH",
        headers: { Prefer: "return=representation" },
        body: JSON.stringify({
          status: "stopped",
          stopped_reason: String(body.reason || "stopped by hand").slice(0, 120),
          updated_at: new Date().toISOString(),
        }),
      });
      if (!res.ok) return json({ ok: false, error: "Could not stop that." }, 502);
      return json({ ok: true });
    }

    /* ------------------------------------------------- create or update one */
    const name = String(body.name || "").trim().slice(0, 120);
    const steps = cleanSteps(body.steps);
    if (!name) return json({ ok: false, error: "A sequence needs a name." }, 400);
    if (!steps.length) return json({ ok: false, error: "Add at least one step." }, 400);

    if (body.id) {
      const res = await rest(`sequences?id=eq.${parseInt(body.id, 10)}`, {
        method: "PATCH",
        headers: { Prefer: "return=representation" },
        body: JSON.stringify({ name, steps }),
      });
      if (!res.ok) return json({ ok: false, error: "Could not save." }, 502);
      return json({ ok: true, sequence: (await res.json())[0] });
    }
    const res = await rest("sequences", {
      method: "POST",
      headers: { Prefer: "return=representation" },
      body: JSON.stringify([{ name, steps }]),
    });
    if (!res.ok) return json({ ok: false, error: "Could not save." }, 502);
    return json({ ok: true, sequence: (await res.json())[0] });
  } catch (err) {
    return json({ ok: false, error: "Storage did not answer." }, 502);
  }
}

/**
 * Advance every run whose next step is due.
 *
 * Safe to call as often as you like: a step is only ever acted on when its due
 * date has arrived, and acting on it moves the run forward, so the same step
 * cannot fire twice.
 */
async function tick(rest) {
  const now = today();
  const res = await rest(`sequence_runs?status=eq.active&next_due=lte.${now}&select=*&limit=200`);
  if (!res.ok) return json({ ok: false, error: "Could not read runs." }, 502);
  const due = await res.json();
  if (!due.length) return json({ ok: true, advanced: 0, sent: 0, tasks: 0 });

  const seqRes = await rest("sequences?select=*");
  const sequences = seqRes.ok ? await seqRes.json() : [];
  const byId = {};
  sequences.forEach((s) => { byId[s.id] = cleanSteps(s.steps); });

  let sent = 0, tasks = 0, advanced = 0, stopped = 0;

  for (const run of due) {
    const steps = byId[run.sequence_id] || [];
    const step = steps[run.step_index];
    if (!step) {
      await rest(`sequence_runs?id=eq.${run.id}`, {
        method: "PATCH",
        body: JSON.stringify({ status: "finished", updated_at: new Date().toISOString() }),
      });
      stopped++;
      continue;
    }

    if (step.kind === "email") {
      /* No address means the email step cannot run. It becomes a task instead,
         so the follow-up still happens, by phone, rather than silently not. */
      if (run.email) {
        const ok = await sendStep(run, step);
        if (ok) sent++;
      } else {
        await makeTask(rest, run, "Ring " + run.business + " (no email for step " + (run.step_index + 1) + ")", "call");
        tasks++;
      }
    } else {
      await makeTask(rest, run, fill(step.title, run), "follow_up");
      tasks++;
    }

    const nextIndex = run.step_index + 1;
    const nextStep = steps[nextIndex];
    const patch = nextStep
      ? {
          step_index: nextIndex,
          // Offsets are from the start, so the gap is the difference.
          next_due: addDays(now, Math.max(0, nextStep.day - step.day)),
          updated_at: new Date().toISOString(),
        }
      : { status: "finished", updated_at: new Date().toISOString() };
    await rest(`sequence_runs?id=eq.${run.id}`, { method: "PATCH", body: JSON.stringify(patch) });
    advanced++;
  }

  return json({ ok: true, advanced, sent, tasks, finished: stopped });
}

async function makeTask(rest, run, title, kind) {
  await rest("tasks", {
    method: "POST",
    headers: { Prefer: "return=minimal" },
    body: JSON.stringify([{
      lead_row: run.lead_row,
      business: run.business,
      title: title.slice(0, 200),
      kind,
      due_on: today(),
      note: "From a sequence",
    }]),
  }).catch(() => {});
}

/** Sends through the same Resend account and warm-up rules as everything else. */
async function sendStep(run, step) {
  const key = (process.env.RESEND_API_KEY || "").trim();
  const from = (process.env.RESEND_FROM || "Your Business <you@yourdomain.com>").trim();
  if (!key) return false;
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from,
        to: [run.email],
        subject: fill(step.subject, run),
        text: fill(step.body, run),
      }),
      signal: AbortSignal.timeout(8000),
    });
    return res.ok;
  } catch {
    return false;
  }
}
