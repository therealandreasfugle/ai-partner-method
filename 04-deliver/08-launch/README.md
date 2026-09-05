# 08. Launch package: domain, hosting and SSL

**What the client is paying for:** their site actually live on their own address,
secure, with the first 90 days covered. Value on the proposal: $500.

**Where it happens:** Vercel, plus wherever their domain is registered.

## What you do

1. Deploy their site to its own Vercel project
2. In that project, **Settings** then **Domains**, add their domain
3. Vercel shows the DNS records. Add them wherever the domain is registered
4. Wait. The SSL padlock turns itself on

If they have no domain, buy one for them and bill it on. About 10 a year.

## Before you hand it over

Run every line of [LAUNCH-QA.md](LAUNCH-QA.md). Fifteen minutes, and it is the
difference between a launch and an apology.

## You MUST do

- Give them a project of their own. Never share a project between clients
- Confirm the live domain serves the new site, not a holding page
- Check the padlock is there before you tell them it is live

## The thing that causes arguments later

⚠️ **Never move a client's domain into your own account without telling them.**
If they leave, the domain is theirs and they will need it. Either add yourself as
a user on their registrar account, or have them add the DNS records while you are
on the phone. Quietly taking control of a domain turns a routine exit into a bad
review.

⚠️ A successful deploy message is not proof. Open the live URL and look.
