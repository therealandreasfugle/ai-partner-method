# 2. Claude Code

**What it does for you:** this is the thing that actually does the work. You
describe what you want and it builds it. Everything in this repo is designed to be
driven by it.

**Cost:** your existing Claude plan.

## Steps

1. Install it: https://docs.claude.com/en/docs/claude-code/overview
2. Open Terminal, go to your copy of this repo, and start it:

```bash
cd ~/Desktop/AIPM-Complete-Setup
claude
```

3. Install the skills that came with this repo. From the repo folder:

```bash
cp -R skills/* ~/.claude/skills/
```

Restart Claude Code afterwards. You now have 38 extra skills covering copywriting,
design, SEO and video. You do not call them by name, Claude picks the right one.

## How to actually use it

Talk to it like a person who knows the codebase. Not "run build-from-template.py
with the following arguments", but:

> build the site for the plumber I just onboarded, their answers are in the email

⚠️ Read what it produces before it reaches a client. It is very good and it is not
infallible.
