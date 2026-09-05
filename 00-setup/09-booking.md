# 9. Cal.com

**What it does for you:** the booking page every single piece of outreach points
at. Every email, DM, video and proposal ends with the same ask, book a call, and
this is where they land.

**Cost:** free for one person.

## Steps

1. Sign up at https://cal.com/signup
2. Connect your calendar so it never double books you.
3. Make one event type: **15 minutes**, call it something plain like "Website
   chat".
4. Set your availability honestly. Only hours you will genuinely answer.
5. Copy your booking link. It looks like `https://cal.com/your-name/15min`.

## Where to put it

That one link goes in several places. Set it once in each:

| Where | What to change |
|---|---|
| `tools/vsl-page/index.html` | Replace `{{YOUR_BOOKING_LINK}}` |
| `tools/instant-builder/pitch-page/index.html` | `CONFIG.bookingUrl` at the top of the script |
| `scripts/cold-email` | Your sequence settings, as `{{your_booking_link}}` |
| Your email signature | |

⚠️ **Fifteen minutes, not thirty.** A local business owner will book fifteen
minutes to look at something. Thirty feels like a sales meeting and gets fewer
bookings. You can always run over once you are on the call.

⚠️ Turn on a reminder email and a reminder text if the free plan allows it.
No-shows are the biggest leak in this whole funnel.
