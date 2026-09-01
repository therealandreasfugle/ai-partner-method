# `work/` (client project gallery — empty until Stage 10.1 populates)

Stage 10.1 writes project gallery images here per the client's `OurWork`
section data. File-name contract:

- `project-1.webp` … `project-N.webp` — project still photos
- `action-1.webp` … `action-N.webp` — optional action/process photos
- `gallery-cover-N.webp` — optional cover images keyed by section

The template references slots by name; if a slot file is missing, the
component renders nothing for that tile.
