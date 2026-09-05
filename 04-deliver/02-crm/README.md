# 02. The CRM and power dialler

**What the client is paying for:** somewhere every lead and customer lives, so
nothing gets forgotten. Value on the proposal: $1,500.

**Where the system lives:** `tools/crm`.

## Two ways to use it

**Most clients:** you run the CRM, they get the leads by email and Slack. Simpler
for them, and it keeps you in the loop.

**Clients with a sales team:** give them their own login so they can work the
pipeline themselves.

## What you do

1. Deploy `tools/crm` as its own Vercel project.
2. Set up the Google Sheet behind it. See `00-setup/07-google-sheet.md`.
3. Set the environment variables listed under "your CRM" in
   `00-setup/ENV-REFERENCE.md`.
4. Generate a login. The command is in the same file.

## You MUST customise

- `LEADS_SHEET_URL` and `LEADS_SHEET_TOKEN`, and they must match the scraper's
- A real password. Generate it, never reuse one across clients
- `CRM_USERS`, the email addresses allowed to log in

## The power dialler

Runs through the user's own phone with a `tel:` link, so there is nothing to set
up and nothing billed. Arrow keys move down the list, and every call outcome is
logged.

⚠️ **Environment changes only take effect on a new deployment.** Change a variable
then redeploy, or nothing happens.
