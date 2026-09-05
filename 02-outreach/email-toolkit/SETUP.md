# Setup

This is a documentation + templates repo — no Python, no compiler, no dependencies. The "tool" is Claude Code reading the SOP and templates on your behalf. You can also use this repo entirely by hand (copy-paste templates), no AI required.

---

## Required (to use anything)

### 1. Git

```bash
git --version
```

If missing: `brew install git` (Mac), `sudo apt install git` (Linux), or [Git for Windows](https://git-scm.com/download/win).

### 2. Clone the repo

```bash
git clone https://github.com/BrettZuke/ai-partner-method-email-toolkit.git
cd ai-partner-method-email-toolkit
```

That's it. You can now read every template in `templates/` and copy-paste them into your ESP (ConvertKit, ActiveCampaign, Klaviyo, Mailchimp, etc.).

---

## Recommended (to use Claude Code)

[Claude Code](https://claude.com/claude-code) is an AI assistant that runs in your terminal. Drop it inside this repo and it reads `CLAUDE.md` automatically — meaning it knows the frameworks, the SOP, and how to use the templates.

### Install

```bash
npm install -g @anthropic-ai/claude-code
```

(Need npm? Install Node.js from [nodejs.org](https://nodejs.org/) — npm comes with it.)

### Verify

```bash
claude --version
```

### Start a session inside this repo

```bash
cd ai-partner-method-email-toolkit
claude
```

You're in. Try:

> *"What sequences can you write?"*

Claude will list them and ask which one you need.

---

## Recommended (your daily workflow)

### 1. Set up a brief for each client

```bash
cp examples/brief.example.json clients/<client-slug>/brief.json
```

This is the single source of truth for that client's voice, audience, offer, and tone. Update it as you learn more about them.

> The example brief is for "Apex Performance" — a generic fitness coach. Use it as a model for the level of detail you want.

### 2. Write a sequence

In your Claude Code session:

> *"Using `clients/mike-fitness/brief.json`, write a 4-email pre-call sequence."*

Claude follows the SOP, picks PAS or AIDA based on the audience temperature, and produces 4 emails ready to edit.

### 3. Edit for voice

The 80% Claude writes is structurally correct. The last 20% is making it sound like your client — not generic AI prose. Read every line out loud. Cut anything that sounds robotic.

### 4. QA before sending

Run through the checklist in `SOP.md` → "Quality Checklist" before loading into your ESP. Especially:
- Subject line 6–10 words
- No spam trigger words (full list in `subject-lines.md`)
- Single CTA per email
- Mobile-friendly paragraphs (max 4 lines)

### 5. Load into your ESP and schedule

Best send times in `SOP.md` → "Timing".

---

## Optional — the no-AI workflow

Don't have Claude Code? Don't want to use AI? This repo still works:

1. Open the template you need (e.g. `templates/pre_call_sequence.md`).
2. Copy every email.
3. Find/replace every `[Bracketed Placeholder]` with your client's specifics.
4. Done.

The templates are designed to be standalone-usable. Claude just speeds up the find/replace + voice work.

---

## Troubleshooting setup

| Problem                                    | Fix                                                                  |
|--------------------------------------------|----------------------------------------------------------------------|
| `claude: command not found` after npm install | npm's global bin isn't on your PATH. Run `npm config get prefix` and add `$(...)/bin` to your shell rc. |
| Claude doesn't seem to read CLAUDE.md      | Make sure you ran `claude` from inside the repo root (`pwd` should end in `/ai-partner-method-email-toolkit`). |
| `git clone` says "permission denied"       | The repo URL is HTTPS, not SSH — re-copy from GitHub.                |

If you hit something not in this table, open an issue with the exact command and the full error.
