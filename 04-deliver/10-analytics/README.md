# 10. GA4 analytics

**What the client is paying for:** seeing what is actually happening. Value on the
proposal: $300.

**Where it happens:** Google Analytics, plus one tag in their site.

## What you do

1. Create a property at https://analytics.google.com, one per client
2. Copy the measurement ID, it looks like `G-XXXXXXXXXX`
3. Add it to their site config
4. Load the live site yourself and confirm it shows in Realtime

## The only four numbers a local business owner cares about

Do not send them a GA4 dashboard. They will not open it twice. In your monthly
report, give them these:

1. **How many people found the site**, and whether it went up
2. **How many enquired**, which is the only number that turns into money
3. **Where they came from**, mostly Google versus everything else
4. **Which pages they actually read**, which tells you what to build more of

Everything else in GA4 is for people who enjoy GA4.

## You MUST customise

- A separate property per client. Never share one
- Their own Google account owns it, or at minimum they are an admin on it

⚠️ Set this up on day one, not later. Analytics cannot tell you about traffic from
before you installed it, and the first month is the baseline every future report
is compared against.

⚠️ Same rule as the domain. If the property lives in your account and they leave,
they lose their history. Make them the owner.
