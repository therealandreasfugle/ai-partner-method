# Skills

Thirty Claude Code skills. A skill is a set of instructions Claude loads when it
is relevant, so instead of you knowing how to do something, Claude does.

## Install them (one minute, once)

Copy this whole folder into your Claude skills directory:

```bash
cp -R skills/* ~/.claude/skills/
```

Restart Claude Code. That is it. You do not call them by name, Claude picks the
right one when the work matches.

## What you get

**Writing and copy**
`copywriting`, `ogilvy-copywriting`, `creative-copywriting-master`,
`copy-editing`, `stop-slop`, `avoid-ai-writing`

Use these for client website copy, your cold emails, and anything a client will
read. `stop-slop` and `avoid-ai-writing` are the two that stop your work sounding
like it came out of a machine, which matters more than anything else on this list.

**Design and build**
`high-end-visual-design`, `frontend-design`, `distinctive-frontend`,
`design-review`, `web-design-guidelines`, `redesign-existing-projects`,
`make-interfaces-feel-better`, `motion-design`, `ui-styling`, `minimalist-ui`,
`interface-design`

`high-end-visual-design` is the one to reach for when a client site needs to look
expensive. `redesign-existing-projects` is for upgrading a site that already
exists, which is most of your redesign work.

**Selling pages**
`page-cro`, `premium-funnel-page`, `lead-magnet-builder`

`page-cro` is for when a page gets traffic but no enquiries.

**SEO**
`seo-audit`, `seo-content`, `seo-local`, `seo-page`, `seo-technical`

`seo-local` is the one that matters most for local business clients.

**Video and content**
`auto-captions`, `ffmpeg-video-editor`, `viral-hook-creator`, `carousel-builder`,
`make-pdf`

## How to actually use one

You do not need to do anything special. Open Claude Code in a project and
describe the work:

> the copy on this client's homepage is flat, make it sell

Claude loads the copywriting skills on its own. If you want to force one, just
name it:

> use high-end-visual-design and redo this hero section

⚠️ These are tools, not autopilot. Read what they produce before it reaches a
client.
