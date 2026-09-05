"""Re-attach saved webhooks to a freshly-created Typeform form.

Usage:
    python3 recreate_webhooks.py <NEW_TYPEFORM_TOKEN> <NEW_FORM_ID> <webhooks.json>

Reads each webhook from webhooks.json and PUTs it onto the new form using its
original tag (PUT /forms/{form_id}/webhooks/{tag}). Tag is preserved so the
webhook ids stay grep-able across exports.

Edit webhooks.json *before* running this if you want to repoint URLs at new
Make scenarios / Modal slugs for a new client.
"""

from __future__ import annotations

import json
import sys
import urllib.error
import urllib.request


def put_webhook(token: str, form_id: str, tag: str, body: dict) -> dict:
    req = urllib.request.Request(
        f"https://api.typeform.com/forms/{form_id}/webhooks/{tag}",
        method="PUT",
        data=json.dumps(body).encode(),
        headers={
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/json",
        },
    )
    try:
        return json.loads(urllib.request.urlopen(req).read())
    except urllib.error.HTTPError as e:
        print(f"  ERROR {e.code}: {e.read().decode()}")
        raise


def main() -> None:
    if len(sys.argv) != 4:
        print(__doc__)
        sys.exit(1)

    token, form_id, webhooks_path = sys.argv[1], sys.argv[2], sys.argv[3]
    webhooks = json.load(open(webhooks_path))

    for wh in webhooks:
        tag = wh.get("tag") or f"hook_{wh.get('id','unnamed')}"
        body = {
            "url": wh["url"],
            "enabled": wh.get("enabled", True),
            "verify_ssl": wh.get("verify_ssl", True),
        }
        # Optional fields
        if wh.get("secret"):
            body["secret"] = wh["secret"]
        if wh.get("subdomain"):
            body["subdomain"] = wh["subdomain"]

        print(f"  PUT webhook tag={tag} url={wh['url']}")
        put_webhook(token, form_id, tag, body)

    print(f"\nDone — re-attached {len(webhooks)} webhook(s) to form {form_id}.")


if __name__ == "__main__":
    main()
