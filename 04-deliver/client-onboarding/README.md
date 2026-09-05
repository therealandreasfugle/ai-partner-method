# APM Client Onboarding System

The complete onboarding system for AI Partner Method operators.

Everything you need to take a creator client from "just closed" to "systems live" in 7 days — in a way that looks and feels completely professional.

---

## What's inside

| File | What it does |
|------|-------------|
| `execution/create_typeform.py` | Creates your creator client intake form in your Typeform account |
| `directives/onboard_creator_client.md` | The full step-by-step SOP you follow for every new client |
| `notion-template/client-workspace.md` | Exact Notion workspace structure to build for each creator client |
| `docs/getting-started.md` | How to get set up (start here) |

---

## Quick Start

```bash
# 1. Clone the repo
git clone https://github.com/YOUR_USERNAME/apm-client-onboarding
cd apm-client-onboarding

# 2. Run setup
chmod +x setup.sh && ./setup.sh

# 3. Add your API keys to .env
# (see docs/getting-started.md for where to get each one)

# 4. Create your intake form (run once)
python3 execution/create_typeform.py
# → Prints your live form URL to send to creator clients

# 5. Create a client workspace (run for every new client)
python3 execution/create_notion_workspace.py "Client Name"
# → Builds the full Notion workspace and prints the URL
```

---

## The Onboarding Process (overview)

```
Deal closed
    ↓
Send Typeform link + Notion workspace (Day 0, within 1 hour)
    ↓
Client completes form (48hr deadline)
    ↓
You review answers before kickoff call
    ↓
Kickoff call — 45 min (Day 2–3)
    ↓
Technical setup: DM setter, content brief (Week 1)
    ↓
Systems live
```

Full detail in `directives/onboard_creator_client.md`.

---

## Getting your Typeform API key

1. Create a free account at [typeform.com](https://typeform.com)
2. Go to **Account Settings → Personal tokens**
3. Create a new token → copy it
4. Paste into your `.env` file as `TYPEFORM_API_KEY`

---

Built for AI Partner Method students.
