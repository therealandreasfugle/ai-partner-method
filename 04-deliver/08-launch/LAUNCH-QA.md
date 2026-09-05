# Launch QA checklist

Run every line of this before you tell a client they are live. It takes about
fifteen minutes and it is the difference between a launch and an apology.

Print it or copy it into a note per client. Do not do it from memory.

---

## On a phone, first

More than half their customers will only ever see it on a phone. Check it there
before you check it anywhere else.

- [ ] Every page loads and nothing runs off the side of the screen
- [ ] The phone number is a tappable link, and tapping it actually calls
- [ ] The menu opens and closes
- [ ] Photos are not stretched or cut through somebody's face
- [ ] The enquiry form is usable with a thumb

## On a computer

- [ ] Every page loads
- [ ] Every link goes somewhere real, including the footer
- [ ] No template text anywhere. Search the site for the template's own words
- [ ] No placeholder images left
- [ ] Nothing says lorem ipsum, example.com, or the template's business name

## The details that get missed

- [ ] Business name spelled exactly as they spell it, including Ltd or Limited
- [ ] Phone number correct, digit by digit, read it out loud
- [ ] Email address correct and one that they actually check
- [ ] Address and opening hours match their Google listing exactly
- [ ] Every service listed is one they actually do
- [ ] Every area listed is one they actually cover
- [ ] Reviews shown are real and attributed correctly

## The enquiry form, properly

This is the one that costs money if it is wrong.

- [ ] Submit it yourself, as a customer would, from the live site
- [ ] The alert email arrives at **the client's** address, not yours
- [ ] Hitting reply on that email goes to the customer, not to you
- [ ] The customer gets their instant reply
- [ ] It lands in their Slack channel, if they wanted one
- [ ] Do it a second time from your phone on mobile data, not wifi

## The chatbot

- [ ] It opens
- [ ] Ask it something only their business would know, like whether they cover a
      specific town they serve
- [ ] It gives their real phone number if you ask how to get in touch
- [ ] It does not invent a price

## The address and the padlock

- [ ] The live domain serves the new site, not a holding page
- [ ] The padlock is there, on the real domain, not just the preview link
- [ ] The version without www and the version with www both work
- [ ] Nothing still points at their old site

## Getting found

- [ ] GA4 is installed and you can see yourself in Realtime
- [ ] sitemap.xml loads
- [ ] robots.txt loads and is not blocking the site
- [ ] The homepage title and description are written, not the template's
- [ ] Their Google Business Profile points at the new address

## Legal pages

- [ ] The privacy policy loads at /privacy and names the client's real business
- [ ] The terms load at /terms
- [ ] Both are linked in the footer
- [ ] If you switched the chatbot or analytics off for this client, the matching
      section in the privacy policy is deleted

## The things that run after launch

- [ ] Review engine: the three variables are set and the review link is theirs
- [ ] Referral page loads and the reward numbers are the ones you agreed
- [ ] Thank-you page has their details, not the template's

## Last

- [ ] Open the site as if you had never seen it and read it start to finish
- [ ] Ask yourself whether you would ring this business

---

⚠️ **A successful deploy message is not proof of anything.** Every line above is
something you look at with your own eyes on the real address.

⚠️ **Do not send the launch email until this is all ticked.** Finding a broken
form yourself costs you fifteen minutes. Letting the client find it costs you the
relationship.
