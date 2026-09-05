# How to deploy `[Coach] 1-on-1 Call Form`

## 1. Customize

Open `customize.md` in this folder and apply the listed swaps to `form.json`
and `webhooks.json`.

## 2. Create the form on your Typeform account

```bash
export TYPEFORM_TOKEN=tfp_xxx   # your personal access token

curl -s -X POST https://api.typeform.com/forms \
  -H "Authorization: Bearer $TYPEFORM_TOKEN" \
  -H "Content-Type: application/json" \
  --data-binary @form.json | tee /tmp/new_form.json
```

The response includes the new form id. Grab it:

```bash
NEW_FORM_ID=$(python3 -c 'import json; print(json.load(open("/tmp/new_form.json"))["id"])')
echo "New form: https://admin.typeform.com/form/$NEW_FORM_ID"
```

## 3. Wire up the webhook(s)

```bash
python3 ../../scripts/recreate_webhooks.py "$TYPEFORM_TOKEN" "$NEW_FORM_ID" webhooks.json
```

## 4. Share the public form URL

The public URL is included in the response from step 2 under
`_links.display`. Drop it in your funnel, autoresponder, or onboarding email.
