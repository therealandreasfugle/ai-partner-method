# Email templates (for the Resend outreach)

These are the emails the tool sends. Six first-touch templates rotate by lead, so no
two leads in a row get the same message, then up to five follow-ups go out on a
widening schedule, and after that a gentle email once a month, until the lead replies.

**You are welcome to edit these.** Rewrite them in your own voice any time. Two rules
keep them working:

1. Keep at least **six** first-touch variations, and keep them rotating. Sending the
   same words to everyone is what trips spam filters.
2. Keep **one link** in each email: your video demo. The entire job of the email is
   to get the lead to watch that short video and book a call. One clear link
   converts better and stays out of spam.

The copy below is what actually sends. It also lives in `send_emails.py` (the code
that sends), so if you change wording, change it in both places. Placeholders are
filled from your `.env`:

- **[video link]** is `OUTREACH_VIDEO_LINK`, your video demo. Put a "book a call"
  button on that video page (Loom lets you add one), so the single link both sells
  and books. People can also just reply.
- **[name]** is `OUTREACH_SENDER_NAME`.
- **[phone]** is `OUTREACH_SENDER_PHONE`. Leave it blank and it drops off the
  signature.

The emails send as HTML, so the spacing and the link come out clean in every inbox.

---

## First-touch templates (six, rotated)

### Template 1
**Subject:** did u take a look at this yet?

> Hi there,
>
> Made you a website, and recorded a quick video walking you through it. Here it is:
> [video link]
>
> It loads fast, works on mobile, and looks like somewhere people trust, so more of
> your visitors turn into calls. It can also text and email every new lead the second
> they enquire, so you are first to reply and win the job. No monthly hosting fees
> either.
>
> If you like what you see, there is a link under the video to book a quick call, or
> just hit reply.
>
> [name]
> [phone]

### Template 2
**Subject:** made you something

> Hi there,
>
> I put a website together for your business and did a short video showing you around
> it:
> [video link]
>
> It is quick on any phone and built to look the part, so more of the people who find
> you actually get in touch. Every new enquiry gets an instant text and email back
> too, so you reply first while they are still keen. No ongoing hosting fees to worry
> about.
>
> If it looks good, grab a time using the link under the video, or reply here.
>
> [name]
> [phone]

### Template 3
**Subject:** this could be making you money

> Hi there,
>
> Built you a sample website and recorded a quick walkthrough. Take a look:
> [video link]
>
> It loads fast, looks great on mobile, and builds instant trust, so visitors turn
> into calls instead of leaving. It also replies to every new lead by text and email
> the moment they come in, so you beat the competition to the phone. No monthly
> hosting fees either.
>
> Want it live? Book a quick call from the link under the video, or just reply.
>
> [name]
> [phone]

### Template 4
**Subject:** your new website (quick video)

> Hi there,
>
> Made you a website. Here is a two minute video showing it off:
> [video link]
>
> It is fast, mobile-friendly, and looks trustworthy, so more visitors pick up the
> phone. Better still, every new lead gets an automatic text and email the moment they
> reach out, so you respond first and win the job. Plus no crazy hosting fees.
>
> Like what you see? There is a booking link right under the video, or reply and I
> will send you a time.
>
> [name]
> [phone]

### Template 5
**Subject:** thought this would be of interest

> Hi there,
>
> I built a website for your business and put together a short video tour:
> [video link]
>
> Quick to load, easy on a phone, and built to look trustworthy, so more people who
> land on it get in touch. It also fires an instant text and email to every new lead,
> so you follow up in seconds and beat slower competitors. And no ongoing hosting
> fees.
>
> If you like it, book a quick call from the link under the video, or just reply.
>
> [name]
> [phone]

### Template 6
**Subject:** made you a website

> Hi there,
>
> Put this together for you and recorded a quick video so you can see it in action:
> [video link]
>
> It loads fast, works on mobile, and looks like a business people trust, so more
> visitors become customers. Every new lead also gets an instant text and email, so
> you reply first while they are still deciding. No crazy monthly hosting fees,
> either.
>
> Want it? Book a quick call using the link under the video, or hit reply.
>
> [name]
> [phone]

---

## Follow-ups (sent automatically until they reply)

These reach only leads who have not replied. The moment a lead replies (you mark them
Replied, or the Google Sheet reply-watcher does it), they drop out of the rest. Each
gap is bigger than the last, so you nudge without nagging:

- **Follow-up 1:** 3 days after the first email
- **Follow-up 2:** 7 days after follow-up 1
- **Follow-up 3:** 14 days after follow-up 2
- **Follow-up 4:** 21 days after follow-up 3
- **Follow-up 5:** 30 days after follow-up 4
- **Then monthly:** one gentle top-of-mind email every 30 days after that, until they
  reply or ask to be removed

### Follow-up 1
**Subject:** quick one about the video

> Hi there,
>
> Just checking you got the video I sent of the website I made you:
> [video link]
>
> No pressure at all. If it is useful, the quickest way to get it live is a short
> call, the booking link is under the video, or just reply here.
>
> [name]
> [phone]

### Follow-up 2
**Subject:** did the video make sense?

> Hi there,
>
> Wanted to make sure the walkthrough I sent came through okay:
> [video link]
>
> If you have two minutes, book a quick call from the link under it and I will get it
> live for you. Or reply with any questions.
>
> [name]
> [phone]

### Follow-up 3
**Subject:** should I close this off?

> Hi there,
>
> I have not heard back, so I will assume the timing is not right and leave it here.
>
> If you did still want it, the video of your site is ready to watch:
> [video link]
>
> A quick call is the easiest way to get it live, the link is under the video.
>
> [name]
> [phone]

### Follow-up 4
**Subject:** still thinking it over?

> Hi there,
>
> No rush on my end, I just did not want you to miss it. The website I made you is
> still ready to see in the video:
> [video link]
>
> If it is helpful, book a two minute call from the link under it and I will take it
> from there.
>
> [name]
> [phone]

### Follow-up 5
**Subject:** closing your file

> Hi there,
>
> I am tidying up my list and about to close this out.
>
> If you ever want it, the website is still built and the video is here:
> [video link]
>
> A quick call gets it live whenever suits you, the booking link is under the video.
> All the best with the business.
>
> [name]
> [phone]

---

## Monthly nurture (after the follow-ups, to stay top of mind)

Once a lead has been through all five follow-ups without replying, they get one of
these gentle notes about once a month, rotated, so you stay on their radar without
nagging. It keeps going until they reply or ask to be removed.

### Nurture 1
**Subject:** still here if you want it

> Hi there,
>
> Not chasing, just keeping you on my radar. The website I built for you is still ready
> whenever the timing is right:
> [video link]
>
> If it is ever useful, a quick call gets it live. All the best.
>
> [name]
> [phone]

### Nurture 2
**Subject:** quick thought for your business

> Hi there,
>
> Every month I watch local businesses win jobs just by replying faster than the
> competition. The site I made you does that on its own, an instant text and email to
> every new lead:
> [video link]
>
> Happy to walk you through it on a quick call whenever suits.
>
> [name]
> [phone]

### Nurture 3
**Subject:** your website is still ready

> Hi there,
>
> Just a friendly note that the website I put together for you is still here:
> [video link]
>
> No rush at all. If you want it live, a two minute call does it.
>
> [name]
> [phone]
