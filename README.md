# OpenMascot

Open-source pixel mascot maker. Create a character, give it moods, embed it with two lines. It reacts to your users.

## What's here

| Path                  | What it is                                                                                                                                     |
| --------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| `packages/embed`      | The runtime. A typed player (`MascotPlayer`) plus a script-tag bundle (`dist/embed.js`) that mounts any `<div data-mascot>` on a page.         |
| `apps/studio`         | The studio: Make (pixel editor), Animate (sequences and triggers), Share (embed snippet, exports). Next.js, previews through the real runtime. |
| `packages/embed/demo` | A sample host page and `mascot.json` showing corner, inline and custom-event embeds.                                                           |

## The format

One JSON file per mascot. Poses are strings with one character per cell, row by row: `.` is transparent, any other character is a base-36 index into the palette. Sequences are lists of `{ pose, hold, offset, x, poof }` frames played at a fixed tick. Triggers map events (`load`, `click`, `hover`, `interval:<s>`, `custom:<name>`) to sequences. `idle` is the fallback and loops.

```json
{
  "id": "m_8f2k",
  "name": "Blobby",
  "grid": { "w": 24, "h": 16 },
  "tick": 60,
  "palette": ["#141413", "#d97757"],
  "poses": { "default": "....", "arms-up": "...." },
  "sequences": { "idle": [{ "pose": "default", "hold": 12 }] },
  "triggers": { "idle": "idle", "click": "jump", "custom:success": "celebrate" }
}
```

## Embed on a site

```html
<script src="embed.js" defer></script>
<div data-mascot="m_8f2k" data-src="/blobby.json" data-position="bottom-right"></div>
```

Omit `data-position` to render inline. From page code: `Mascot.play("celebrate")` or `Mascot.emit("success")`.

## Develop

```bash
pnpm install
pnpm dev                              # studio at http://localhost:3000
pnpm --filter @openmascot/embed demo  # builds embed.js, serves the demo at http://localhost:4311/demo/
pnpm check                            # typecheck + lint + format check
```

Node 24, pnpm, oxlint + oxfmt, conventional commits.
