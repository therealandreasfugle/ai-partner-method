# Video 7: Deliver line 02, the CRM and power dialler

**Length:** 4 minutes. **Value on the proposal:** $1,500.
**Source:** `04-deliver/02-crm`. **System:** `tools/crm`.

---

## OPEN

**SAY THIS:**

> Somewhere every lead and every customer lives, so nothing gets forgotten. There
> are two ways to run this and you pick per client.

TALK ABOUT:
- Most clients: you run the CRM and they get their leads by email and Slack.
  Simpler for them and it keeps you in the loop, which is how you keep the monthly
  fee alive.
- Clients with an actual sales team: give them their own login and let them work
  the pipeline themselves.

---

## SCREEN

1. Deploy `tools/crm` as its own Vercel project.
2. Set up the Google Sheet behind it, following `00-setup/07-google-sheet.md`.
3. Set the environment variables listed under "your CRM" in
   `00-setup/ENV-REFERENCE.md`.
4. Generate a login. The command is in that same file.
5. Open the deployed CRM and show the pipeline, the lead drawer and the call
   outcomes.

---

## SCREEN: the power dialler

Show it running down a list with the arrow keys and placing one call.

TALK ABOUT:
- It dials through your own phone with a normal phone link. Nothing to set up,
  nothing billed, no phone number to buy.
- Arrow keys move down the list. Every outcome gets logged as you go.

---

## YOU MUST CUSTOMISE

- The sheet URL and the sheet token, and they have to match the scraper's exactly
- A real generated password. Never reuse one across clients
- The list of email addresses allowed to log in

---

## THE ONE THING

**SAY THIS:**

> Environment variables only take effect on a new deployment. If you change a
> setting and nothing happens, you have not broken anything, you just have not
> redeployed. Change it, redeploy, then test. This will catch you at least once,
> so let it be now rather than on a client call.

---

## CLOSE

> Next is the single most important thing you deliver, and it is the one nobody
> puts on the proposal properly.
