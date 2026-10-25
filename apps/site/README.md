# @openmascot/site

The landing page. One static page, exported to plain HTML: hero, how it works (Make → Animate → Share), features, a parade and a send-off.

Every mascot on the page is drawn by `@openmascot/embed` from the samples in `@openmascot/samples`. `src/lib/mascots.ts` adapts them for the site: interval triggers come off, so nothing moves on a timer, and a click plays each one's happiest move.

`src/components` has three layers, each importing only from the ones below it:

- `ui/`: primitives with no product knowledge (Button, Pill, Chip, Card, CodeBlock, …).
- `mascot/`: primitives built on the runtime (Mascot, PoseImage, PoseStrip, PixelBoard).
- `sections/`: one folder per page section; they own the copy. Sections are server components; only leaves that touch canvas, scroll or timers are client components.

Colors, type, spacing, radii and shadows come from the tokens in `src/app/globals.css`: the studio palette plus landing-only tokens. Where the design's clay, moss or gold sit under small text they use darker `*-text` / `clay-button` twins so contrast passes WCAG AA. Restart the dev server after adding a token: Turbopack does not pick up new `@theme` keys on hot reload.

`NEXT_PUBLIC_STUDIO_URL` sets where "Open the studio" and "Make a mascot" go; without it they scroll to how it works.

```bash
pnpm dev     # http://localhost:3001
pnpm build   # static export to out/
pnpm serve   # serve out/ on http://localhost:3002
```
