// Shared outreach brain for the dashboard app: the email templates, the follow-up
// schedule, and the warm-up formula. Used by send.js (the autopilot) and
// stats.js (the dashboard). This mirrors send_emails.py in the repo root; if you
// change wording or timing, change both (and EMAIL-TEMPLATES.md).

// The six rotating first-touch templates. One link only: the video demo.
export const TEMPLATES = [
  {
    subject: "did u take a look at this yet?",
    body: `Hi there,

Made you a website, and recorded a quick video walking you through it. Here it is:
[video link]

It loads fast, works on mobile, and looks like somewhere people trust, so more of your visitors turn into calls. It can also text and email every new lead the second they enquire, so you are first to reply and win the job. No monthly hosting fees either.

If you like what you see, there is a link under the video to book a quick call, or just hit reply.

[name]
[phone]`,
  },
  {
    subject: "made you something",
    body: `Hi there,

I put a website together for your business and did a short video showing you around it:
[video link]

It is quick on any phone and built to look the part, so more of the people who find you actually get in touch. Every new enquiry gets an instant text and email back too, so you reply first while they are still keen. No ongoing hosting fees to worry about.

If it looks good, grab a time using the link under the video, or reply here.

[name]
[phone]`,
  },
  {
    subject: "this could be making you money",
    body: `Hi there,

Built you a sample website and recorded a quick walkthrough. Take a look:
[video link]

It loads fast, looks great on mobile, and builds instant trust, so visitors turn into calls instead of leaving. It also replies to every new lead by text and email the moment they come in, so you beat the competition to the phone. No monthly hosting fees either.

Want it live? Book a quick call from the link under the video, or just reply.

[name]
[phone]`,
  },
  {
    subject: "your new website (quick video)",
    body: `Hi there,

Made you a website. Here is a two minute video showing it off:
[video link]

It is fast, mobile-friendly, and looks trustworthy, so more visitors pick up the phone. Better still, every new lead gets an automatic text and email the moment they reach out, so you respond first and win the job. Plus no crazy hosting fees.

Like what you see? There is a booking link right under the video, or reply and I will send you a time.

[name]
[phone]`,
  },
  {
    subject: "thought this would be of interest",
    body: `Hi there,

I built a website for your business and put together a short video tour:
[video link]

Quick to load, easy on a phone, and built to look trustworthy, so more people who land on it get in touch. It also fires an instant text and email to every new lead, so you follow up in seconds and beat slower competitors. And no ongoing hosting fees.

If you like it, book a quick call from the link under the video, or just reply.

[name]
[phone]`,
  },
  {
    subject: "made you a website",
    body: `Hi there,

Put this together for you and recorded a quick video so you can see it in action:
[video link]

It loads fast, works on mobile, and looks like a business people trust, so more visitors become customers. Every new lead also gets an instant text and email, so you reply first while they are still deciding. No crazy monthly hosting fees, either.

Want it? Book a quick call using the link under the video, or hit reply.

[name]
[phone]`,
  },
];

// The five follow-ups, sent on a widening schedule until the lead replies.
export const FOLLOWUPS = [
  {
    subject: "quick one about the video",
    body: `Hi there,

Just checking you got the video I sent of the website I made you:
[video link]

No pressure at all. If it is useful, the quickest way to get it live is a short call, the booking link is under the video, or just reply here.

[name]
[phone]`,
  },
  {
    subject: "did the video make sense?",
    body: `Hi there,

Wanted to make sure the walkthrough I sent came through okay:
[video link]

If you have two minutes, book a quick call from the link under it and I will get it live for you. Or reply with any questions.

[name]
[phone]`,
  },
  {
    subject: "should I close this off?",
    body: `Hi there,

I have not heard back, so I will assume the timing is not right and leave it here.

If you did still want it, the video of your site is ready to watch:
[video link]

A quick call is the easiest way to get it live, the link is under the video.

[name]
[phone]`,
  },
  {
    subject: "still thinking it over?",
    body: `Hi there,

No rush on my end, I just did not want you to miss it. The website I made you is still ready to see in the video:
[video link]

If it is helpful, book a two minute call from the link under it and I will take it from there.

[name]
[phone]`,
  },
  {
    subject: "closing your file",
    body: `Hi there,

I am tidying up my list and about to close this out.

If you ever want it, the website is still built and the video is here:
[video link]

A quick call gets it live whenever suits you, the booking link is under the video. All the best with the business.

[name]
[phone]`,
  },
];

// After the follow-ups, one gentle note a month, rotated, until they reply.
export const NURTURES = [
  {
    subject: "still here if you want it",
    body: `Hi there,

Not chasing, just keeping you on my radar. The website I built for you is still ready whenever the timing is right:
[video link]

If it is ever useful, a quick call gets it live. All the best.

[name]
[phone]`,
  },
  {
    subject: "quick thought for your business",
    body: `Hi there,

Every month I watch local businesses win jobs just by replying faster than the competition. The site I made you does that on its own, an instant text and email to every new lead:
[video link]

Happy to walk you through it on a quick call whenever suits.

[name]
[phone]`,
  },
  {
    subject: "your website is still ready",
    body: `Hi there,

Just a friendly note that the website I put together for you is still here:
[video link]

No rush at all. If you want it live, a two minute call does it.

[name]
[phone]`,
  },
];

// Subject -> display name, for the dashboard's "Which email wins" table.
export const KNOWN_SUBJECTS = {};
TEMPLATES.forEach((t, i) => { KNOWN_SUBJECTS[t.subject] = "Template " + (i + 1); });
FOLLOWUPS.forEach((t, i) => { KNOWN_SUBJECTS[t.subject] = "Follow-up " + (i + 1); });
NURTURES.forEach((t) => { KNOWN_SUBJECTS[t.subject] = "Monthly nurture"; });

// The sequence: current status -> (days that must have passed, next status, template).
export const INITIAL_STATUS = "Contacted";
export const FOLLOWUP_STAGES = [
  ["contacted", 3, "Follow-up 1", 0],
  ["follow-up 1", 7, "Follow-up 2", 1],
  ["follow-up 2", 14, "Follow-up 3", 2],
  ["follow-up 3", 21, "Follow-up 4", 3],
  ["follow-up 4", 30, "Follow-up 5", 4],
];
export const NURTURE_STATUS = "Nurturing";
export const NURTURE_GAP = 30;
// Statuses that end the sequence for good. "Removed" is what the reply watcher
// sets when someone asks to be taken off; nothing ever sends to these again.
export const STOP_STATUSES = new Set([
  "replied", "removed", "unsubscribed", "not interested", "won",
  "interested", "proposal sent", "lost", "not a fit",
]);

function parseDay(value) {
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(String(value || "").trim());
  return m ? Date.UTC(+m[1], +m[2] - 1, +m[3]) : NaN;
}

// What (if anything) a lead is due for today. Returns null, or
// {kind: "initial"|"followup"|"nurture", index, next}.
export function dueAction(lead, todayUtcMs) {
  if (!String(lead.email || "").trim()) return null;
  const status = String(lead.status || "").trim();
  if (!status || status.toLowerCase() === "new") return { kind: "initial", index: -1, next: INITIAL_STATUS };
  const low = status.toLowerCase();
  if (STOP_STATUSES.has(low)) return null;
  const last = parseDay(lead.contacted_on);
  for (const [cur, gap, next, index] of FOLLOWUP_STAGES) {
    if (low === cur) {
      if (Number.isNaN(last)) return null;
      return (todayUtcMs - last) / 86400000 >= gap ? { kind: "followup", index, next } : null;
    }
  }
  if (low === "follow-up 5" || low === NURTURE_STATUS.toLowerCase()) {
    if (Number.isNaN(last)) return null;
    return (todayUtcMs - last) / 86400000 >= NURTURE_GAP ? { kind: "nurture", index: -1, next: NURTURE_STATUS } : null;
  }
  return null; // custom status the student invented: leave it alone
}

// Warm-up: day 1 allows 5 emails, plus 2 more each day, up to the ceiling
// (OUTREACH_DAILY_MAX, default 40, never above Resend's 100/day).
export function warmupCeiling() {
  const raw = parseInt(process.env.OUTREACH_DAILY_MAX || "40", 10);
  const value = Number.isNaN(raw) ? 40 : raw;
  return Math.max(1, Math.min(value, 100));
}
export function capForDay(dayNumber) {
  return Math.min(5 + 2 * (Math.max(1, dayNumber) - 1), warmupCeiling());
}

function fill(body, cfg) {
  return body
    .replaceAll("[video link]", cfg.video)
    .replaceAll("[name]", cfg.name)
    .replaceAll("[phone]", cfg.phone || "");
}

// Build a per-lead video link so the demo page greets each business by name.
// The demo page (settoku-watch) reads ?business= &trade= &town= to personalize
// its copy. Fields the lead is missing are simply left off the link.
export function personalizeVideo(base, lead) {
  if (!base || !lead) return base;
  const parts = [];
  if (lead.business) parts.push("business=" + encodeURIComponent(lead.business));
  const trade = lead.category || lead.trade;
  if (trade) parts.push("trade=" + encodeURIComponent(trade));
  const town = lead.city || lead.town;
  if (town) parts.push("town=" + encodeURIComponent(town));
  if (!parts.length) return base;
  return base + (base.includes("?") ? "&" : "?") + parts.join("&");
}

export function renderText(body, cfg) {
  const out = [];
  for (const ln of fill(body, cfg).split("\n")) {
    if (ln.trim() === "" && out.length && out[out.length - 1].trim() === "") continue;
    out.push(ln);
  }
  return out.join("\n").trim();
}

export function renderHtml(body, cfg) {
  const text = renderText(body, cfg);
  const paras = text.split("\n\n").map((b) => b.trim()).filter(Boolean);
  const parts = paras.map((para) => {
    const lines = para.split("\n").map((line) =>
      line === cfg.video ? `<a href="${line}">${line}</a>` : line
    );
    return "<p>" + lines.join("<br>") + "</p>";
  });
  return (
    '<div style="font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,' +
    'sans-serif;font-size:15px;line-height:1.5;color:#222;">' + parts.join("") + "</div>"
  );
}
