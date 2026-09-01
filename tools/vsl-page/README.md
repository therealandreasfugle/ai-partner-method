# The evergreen VSL page

A one page video landing page you send to a local business owner instead of
getting on a call. They watch a short demo video and book a call from the page.

Use it when you want to sell without doing a live call for every lead, or as the
link in a cold email so the video does the first pitch for you.

## Make it yours (5 minutes)

Open `index.html` and search and replace these three:

| Placeholder | Replace with |
|---|---|
| `{{YOUR_BUSINESS}}` | Your business name |
| `{{YOUR_BOOKING_LINK}}` | Your booking link, for example your Cal.com URL |
| `{{YOUR_WEBSITE}}` | Your own website |

Then drop a photo of yourself in this folder named `your-photo.jpg`, and put your
video in the player near the top of the file.

## Personalise it per lead

The page reads three things off the end of the link, so one page serves every
prospect:

```
yourpage.vercel.app/?business=Bloor%20Street%20Plumbing&trade=plumbing&town=Birmingham
```

The business name, trade and town then appear through the page as if it was
built for them. Leave them off and it falls back to neutral wording.

## Deploy it

Same as any other page in this repo: push it to Vercel. It is a single HTML
file, so there is no build step.

⚠️ Record your own video. Do not send a page with somebody else's face on it.
