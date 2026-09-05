# ManyChat 3x Follow-Gate Distribution Flow (SOP)

> **Source:** Adapted from Ronin Socials' "AI Lead Magnet Builder" PDF. The distribution mechanic behind their 10M+ views claim. Pairs with [build_interactive_lead_magnet.md](./build_interactive_lead_magnet.md).
>
> **Purpose:** Convert every comment on a lead magnet post into both a new follower AND a captured lead. The lead magnet becomes the *price of admission* for following the account.
>
> **When to use:** Every time a client launches an interactive lead magnet. Standard distribution layer for every client.

---

## Why This Doubles Followers Per Automation

Most people who comment to grab a freebie never actually follow you — they just want the resource. A naked link-drop ManyChat flow gives away the value with zero follower gain.

The 3x follow-gate fixes that. The lead magnet gets people to raise their hand. The follow-condition then converts them into followers *before* they get the link. You get both the lead and the follower.

The 3x check is the trick. Most people tap "I'm following" without actually hitting follow. Three checks force the follow.

> **Mantra:** 200 downloads and 5 clients beats 10,000 downloads and no revenue. Quality follow + lead beats raw download volume.

---

## What You Need Before You Start

- [ ] A live lead magnet link (Lovable app URL, Netlify page, or any URL)
- [ ] A ManyChat account connected to Instagram via Meta Business
- [ ] A trigger keyword (e.g. `MAGNET`, `SCRIPTS`, `PARTNER`)
- [ ] 3–4 public reply variants so the comment section looks natural
- [ ] First DM set up as a Private Reply with a solid button (not a quick reply)
- [ ] The follow-condition added **3 times** in the flow — do NOT skip this

---

## Step 1 — Set Up the Comment Trigger

In ManyChat → Automation → **New Automation** → Start from Scratch.

- Click **Add Trigger** → Instagram → **User Comments on Post or Reel**
- Set it to **All Posts and Reels** so you only build this once
- Add your trigger keyword (e.g. `MAGNET`)
- Add a few common variations and typos (`magnett`, `magnet!`, `Magnet`) so you do not miss legitimate comments

### Public Replies (Rotation)

Add 3–4 public reply variants that rotate automatically. This prevents the comment section from looking like a bot.

Examples:
- "Sending it now!"
- "Check your DMs"
- "Coming your way"
- "On it"

---

## Step 2 — Send the Opening DM (Private Reply)

The first message **must** be set to **Private Reply** or it will not send. Instagram's API restriction.

Keep it to one content block — Instagram only allows one in the first message.

Example opening DM:
> "Hey, are you here for the free [lead magnet name]?"

Add a **Yes button**. When they tap Yes it opens the full conversation and triggers the follow check.

---

## Step 3 — Add the Follow Condition (Check 1)

After the Yes button, instead of sending the link directly, click **Condition** in the flow builder. Select **"Follows you on Instagram."**

This creates two paths:

**If They DO Follow You**
- Send the link immediately
- Example: "Sweet, here it is: [YOUR LINK]"
- Add a button labelled with the link text
- Done — they get instant access

**If They Do NOT Follow You**
- Send a message like: "This resource is only for my followers. Once you are following, tap the button below and I will send it right over."
- Add a button that says **"I am following"**

---

## Step 4 — Run the Condition Again (Check 2)

When they tap "I am following", do **not** send the link yet. Run them through the exact same Follow Condition a second time.

This is critical — some people will tap the button without actually following to try to bypass.

**If They Now Follow You**
- Send them straight to the link. Same message as Check 1.

**If They Still Do Not Follow**
- Send a light message: "Nice try — the system actually checks. Tap below once you have followed and I will send it right over."
- Add "I am following" button one final time.

---

## Step 5 — Run the Condition One Last Time (Check 3 — Final Gate)

After the third button tap, run the follow condition one final time.

- **If they follow:** send the link.
- **If they still do not follow:** end the flow cleanly. Do NOT put them on a loop — if someone has not followed after three checks they are not going to. Let it end.

---

## Pin the Post

Pin the post to the top of the profile immediately after publishing. It keeps collecting comments and triggering the flow for weeks. One post, compounding followers and leads on autopilot.

---

## Caption Template for the Post

The post caption needs to include the trigger keyword *visibly*. Suggested format:

```
[Hook — one line that names the specific outcome the tool delivers]

[2–3 lines on what the tool does and who it's for]

Comment "[KEYWORD]" below and I'll send it straight to your DMs.
```

Example for a calculator-style lead magnet:
```
Most dealers spend £400+/month on AutoTrader and BCA without ever checking the ROI.

I built a free tool that shows you exactly which lead sources to defund and reinvest into TikTok. Takes 3 minutes. Personalised to your forecourt.

Comment "STOCK" below and I'll send it straight to your DMs.
```

---

## What Goes Wrong (Common Failures)

| Symptom | Cause | Fix |
|---|---|---|
| First DM never sends | Not set as Private Reply | Toggle "Private Reply" on the opening message |
| People bypass the gate | Only one follow-check in the flow | Add the condition exactly 3 times |
| Comment section looks botty | Only one public reply variant | Add 3–4 rotating variants |
| Low completion rate | Trigger keyword too long / weird | Use a 1-word, easy-to-spell keyword |
| Followers spike but leads don't | Link sent before email capture in tool | Move email gate inside the tool to *after* partial result |

---

## Per-Client Setup Checklist

For each client launch, fill in:

| Field | Value |
|---|---|
| Client | e.g. [client name] |
| ManyChat account | Connected via Meta Business |
| IG handle | e.g. `@clienthandle` |
| Trigger keyword | e.g. `GUIDE` |
| Lead magnet URL | e.g. `https://yourtool.lovable.app` |
| Public reply variants | 3–4 rotating |
| Pin status | Pinned ✓ |
| Tested | DM'd from a non-following test account ✓ |

Save the completed checklist into the client's lead magnet directive file alongside the build spec.

---

## Bonus: Compounding Effect

A single pinned post + this flow keeps converting for weeks/months without any maintenance. One pinned post can:
- Trigger 100+ ManyChat DMs/week passively
- Convert 30–60% of commenters into followers (vs 5–10% without the gate)
- Capture every email at the tool's email-gate
- Feed straight into the client's paid offer pipeline

The lead magnet is just the bait. This flow is the trap.
