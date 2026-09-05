# Video 14: Deliver line 09, owner and sales team notifications

**Length:** 4 minutes. **Value on the proposal:** $400.
**Source:** `04-deliver/09-notifications`. **System:** the same endpoint as line
03.

---

## OPEN

**SAY THIS:**

> Knowing about an enquiry within seconds, and their team knowing too. The email
> half is already done, it came with line three. This video is the Slack half, and
> it takes about two minutes per client.

---

## SCREEN: email is automatic

TALK ABOUT:
- Covered by the client address you already set in line three.
- Comma separate it to notify more than one person. Whoever answers the phone when
  the owner cannot should be on that list.

---

## SCREEN: Slack, two minutes

Do this live on camera. It genuinely takes two minutes.

1. The client opens https://api.slack.com/apps and clicks Create New App, then
   From scratch.
2. Pick the workspace, name it something like Website leads.
3. Incoming Webhooks, turn it on.
4. Add New Webhook to Workspace, choose the channel.
5. Copy the URL into their Vercel project:

```
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/...
```

TALK ABOUT:
- No app review, no approval, no waiting.
- Every enquiry now lands in that channel with the details and a call button.

---

## YOU MUST CUSTOMISE

- A dedicated channel, usually a new one called leads
- Not their general channel

**SAY THIS:**

> Make them a channel just for this. If lead alerts go into the channel where
> everybody chats, the whole team mutes it within a week and then the alerts do
> nothing.

---

## THE ONE THING

**SAY THIS:**

> Do not promise their customers a text message. Every client would need their own
> phone number and a carrier registration that is slow, frequently rejected, and
> charges you per attempt whether it lands or not.
>
> Email plus Slack is instant, free and reliable. If the owner wants to text a
> customer back, give them a copy this text button and let them send it from their
> own phone. Same result, none of the cost.

---

## CLOSE

> Last one. The numbers, and the four that an owner actually cares about.
