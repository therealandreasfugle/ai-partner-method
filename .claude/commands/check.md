---
description: Check everything is connected and working
---

Run the setup check and explain the result in plain English.

```bash
python3 00-setup/setup_check.py
```

Then:
- If everything is OK, say so in one line and stop.
- If things need fixing, take the **first one only** and walk them through it.
  Do not dump the whole list back at them, they can already see it.

Explain each item in terms of what breaks in their business if it stays broken,
not in technical terms. A missing Resend domain is not "unverified DNS", it is
"your emails will land in spam and you will think your copy is the problem".
