# 05. The referral program

**What the client is paying for:** their existing customers sending them the next
ones. Value on the proposal: $900.

**Where the system lives:** `tools/crm/referrals.html` and
`tools/crm/api/referrals.js`, plus the customer page `tools/crm/thanks.html`.

## What is already built

More than the proposal line promises:

- A payout ledger with pending and paid status
- Cash or credit, chosen per referral
- **A yearly cash cap per person**, enforced server side, so a referrer never
  crosses the threshold that creates a tax reporting problem
- Self-referral blocking and a duplicate guard
- Three automated emails: welcome, pending, and paid
- Reward, discount, keyword and cap all editable from the CRM with no redeploy

## You MUST customise, per client

- The reward amount, and whether it is cash or credit
- The discount the referred customer gets
- The keyword customers quote
- **Who funds the payout.** The client does, and it is in the contract. Say it out
  loud on the call so it is never a surprise

## The video the owner records

Same video as line 06, it covers both. Script for them is in
[../06-reviews/CLIENT-VIDEO-SCRIPT.md](../06-reviews/CLIENT-VIDEO-SCRIPT.md).

⚠️ Set the numbers so they work for the client's margin. The line that sells it:
nobody turns down paying out a hundred to bring in a thousand. If their numbers do
not support that, do not run the programme for them.
