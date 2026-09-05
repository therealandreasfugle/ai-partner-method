# The sales call proposal

This is the proposal you put on screen during a sales call. It carries the value
stack, the growth equation, the pricing ladder, the guarantee, and a contract the
client signs on the page.

The other proposal in this repo (`tools/instant-builder`) is the automated one
that builds a personalised page per lead for cold outreach. This one is the
polished version you walk somebody through live.

## Make it yours

Search and replace across `index.html`:

| Placeholder | Replace with |
|---|---|
| `{{YOUR_BUSINESS}}` | Your business name |
| `{{YOUR_NAME}}` | Your name |
| `{{YOUR_WEBSITE}}` | Your website |
| `yourbusiness` | a lowercase one word version, used for saved settings |

Then add two images to `agency-assets/`:

- `your-photo.jpg`, a real photo of you, not a stock model
- `your-signature.png`, your signature on a transparent background, if you want
  it pre-printed on contracts

⚠️ `index.html` and `proposal.html` must stay identical. After editing one, copy
it over the other:

```bash
cp index.html proposal.html
```

## The seller controls

There is a toolbar at the bottom of the page only you see. It opens a panel where
you set the client's company and contact name, the one time offer, the standard
setup fee, the monthly fee, the headline outcome, and the contract payment terms.
Everything saves in your browser per client, so you can retarget the page for a
call without rebuilding anything.

⚠️ Prices are remembered per browser. If you change a default price in the file
and do not see it, that is your saved value winning. Reset from the same panel.

## The contract

`api/` holds the send-to-sign flow. The client fills in their details, gets a
private signing link by email, signs, and both of you receive the executed PDF.

It needs four environment variables on your Vercel project:
`RESEND_API_KEY`, `RESEND_FROM`, `AGENCY_EMAIL`, `SIGNING_SECRET`.
See `api/README.md` and `RESEND-SETUP.md`.

⚠️ **The contract wording is a starting point, not legal advice.** Have your own
solicitor check it, and replace the clauses in `api/contract.json` with your own
before you sign anything real. If you change a clause, change it in all three
places: `api/contract.json`, the contract block in `index.html`, and `sign.html`.
