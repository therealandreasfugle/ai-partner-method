# 09. Owner and sales team lead notifications

**What the client is paying for:** knowing about an enquiry within seconds, and
their team knowing too. Value on the proposal: $400.

**Where the system lives:** the same endpoint as line 03,
`tools/website-template/api/lead.mjs`.

## Email is automatic

Covered by `LEAD_TO` in line 03. Comma separate to notify more than one person.

## Slack, about two minutes per client

A Slack incoming webhook needs no app review and no approval.

1. The client opens https://api.slack.com/apps and clicks **Create New App**,
   then **From scratch**
2. Pick the workspace, name it something like "Website leads"
3. **Incoming Webhooks**, turn it on
4. **Add New Webhook to Workspace**, choose the channel, usually a new `#leads`
   channel
5. Copy the URL and set it on their Vercel project:

```
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/...
```

Every enquiry now lands in that channel with the details and a call button.

## You MUST customise

- `LEAD_TO`, the client's address, not yours
- Anyone else who answers the phone when the owner cannot
- A dedicated channel, not their general one, or the alerts get muted within a
  week

⚠️ **Do not promise SMS to their customers.** Every client would need their own
phone number and a carrier registration that is slow, gets rejected, and charges
per attempt. Email plus Slack is instant, free, and reliable. If the owner wants
to text a customer back, give them a copy-this-text button and let them send it
from their own phone.
