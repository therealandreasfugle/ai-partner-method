---
description: Build and deploy a website for a client who has paid
---

Build a client's real website. This is delivery work, for somebody who has paid,
not a demo.

**Start from their onboarding form answers.** If you do not have them, ask the
user to paste the email from the onboarding form before you write anything.

**Steps:**

1. Pick the closest template from `tools/website-templates/templates`. There are
   20. Match the trade, then the feel they asked for.
2. Fill in their real details: services, service areas, hours, phone, reviews,
   photos. Everything comes from their form answers.
3. Deploy it to a new Vercel project of its own, one per client.
4. Set the environment variables the site needs, from
   `00-setup/ENV-REFERENCE.md`, under "each client website". `LEAD_TO` is the
   client's address, `LEAD_FROM` is one of the user's verified senders.
5. Point their domain at it if they have one.

**Then verify it properly, before telling anyone it is done:**

- Open the live URL and look at it at desktop and phone width
- Submit the enquiry form yourself and confirm the alert email actually arrives
- Ask the chatbot a question about the business and check the answer is right
- Check the console is clean and no images are missing

⚠️ **Never invent anything about the business.** No made up review, rating, years
in business, number of customers, or accreditation. If the form left it blank,
leave it off the site or ask.

⚠️ **A form that does not reach the owner is worse than no form.** The lead
endpoint is the thing they are paying for. Test it with a real submission, not by
reading the code.
