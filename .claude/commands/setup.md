---
description: Walk me through connecting my accounts, one at a time
---

The user is setting up this repo for the first time. They are not a developer.
Your job is to get them from nothing to a working system without overwhelming them.

**First, run the check so you know where they actually are:**

```bash
python3 00-setup/setup_check.py
```

Then work through whatever it reported, **one item at a time**. Do not paste a
list of ten things. Fix one, confirm it, move to the next.

For each item:
1. Say plainly what it is for, in one sentence, in terms of their business, not
   in technical terms.
2. Give them the direct link to the page they need. Never say "go to settings and
   find the API section", give the URL that lands them on the exact page.
3. Ask them to paste back what they got.
4. Write it into the right file for them. Never make them edit a file by hand.
5. Re-run the check and show them the line that just turned OK.

Read `00-setup/README.md` for the order and `00-setup/ENV-REFERENCE.md` for where
each value belongs.

**Rules:**
- One thing at a time. Wait for them.
- If a key looks wrong, say so before saving it.
- Never put a key in a file that gets committed. `.env` files only, or Vercel
  environment settings.
- If they paste a key into the chat, save it and tell them to rotate it later if
  the chat is ever shared.
- The Google Sheet step is the hardest. Slow down there, and make sure they set
  `SHARED_TOKEN`, which the older setup guide wrongly calls optional.
