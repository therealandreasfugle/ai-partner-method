---
name: client-brand
description: Create or update a saved brand file for one of the user's clients (local business or online coach) at ~/.claude/clients/<client-name>.md so every content and copy skill writes in that client's voice without re-asking setup questions. Use when the user says "set up a client profile", "new client", "update [client]'s brand file", or when writing content for a named client that has no file yet.
---

# Client Brand

AIPM students build content and sites for clients, not for themselves. This skill runs one short interview per client and saves the answers to `~/.claude/clients/<client-name>.md` (kebab-case the business name). After the file exists, every content skill (hooks, carousels, reels, UGC scripts, lead magnets, funnel pages, sites) should read the right client file first and stop asking the same setup questions.

## Which client?

If the user names the client, use that. If not, list the files in `~/.claude/clients/` and ask which one, or whether this is a new client. If the folder does not exist, create it.

## If the file already exists

Read it, show a 5-line summary, and ask what changed. Edit only what changed.

## If it does not exist: the interview

Ask these in ONE message, grouped, so the user answers everything at once. Accept rough answers; tighten them yourself. The user is often answering from a single onboarding call with the client, so partial answers are fine. Mark real gaps as TODO lines in the file instead of inventing facts.

1. Business name, owner's name, and where they show up (Instagram, TikTok, Google Business, website, city and service area if local).
2. What the business does in one sentence, and who exactly the customer is (situation, pain, dream outcome).
3. The offer: what is sold, price point, and where a buyer goes (booking link, phone number, DM keyword, store).
4. Voice: three adjectives, and anything the client never says (words, phrases, tones, claims).
5. Two or three proof points (reviews, results, years in business, numbers the client can honestly claim).

## Write the file

Save to `~/.claude/clients/<client-name>.md` in exactly this shape:

```markdown
# <Business Name>

## Client
Business name / owner / platforms / city and service area if local.

## Business and customers
One sentence on what they do. Customer: who they are, the pain, the dream outcome.

## Offer
What is sold, price point, where buyers go (link, phone, or DM keyword).

## Voice
Three adjectives. Sentence style. Things they say. Things they never say.
Defaults (keep unless the client's real voice overrides): no emojis,
no em or en dashes, plain punctuation, short sentences, no hype words.

## Proof
Honest results, reviews, and numbers that can be referenced in content.
Never invent proof. If a claim is not in this section, do not make it.

## Links
Booking / website / socials / Google Business.
```

## Using it

When any content or copy request names a client, or clearly belongs to one, read their file first and follow it. If the request names no client and more than one client file exists, ask which client before writing anything.

## Done message

Confirm the file path, list which skills now use it (hooks, carousels, reels, UGC scripts, captions, lead magnets, funnel pages, sites), and note the user can say "update [client]'s brand file" any time something changes.
