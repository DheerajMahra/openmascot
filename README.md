# OpenMascot

Open-source pixel mascot maker. Draw a character, give it moves, and put it on any website with two lines of HTML. It reacts to your users.

- **Wireframes:** [Studio Wireframes v2](https://claude.ai/artifact/HsCqHW9cdUMFXTyR3iDSsa?sk=KImMmpIN8JSFi-ZTZVTsUA#page-dcb81aee8d83)
- **Design:** [High-level design](docs/hld.md)

## Who it's for

- Makers of websites, docs and apps who want a small, friendly character that responds to what users do.
- Anyone who wants to draw a pixel character without learning an art tool.

## Phases

| Phase | Goal                                                                                 | Where mascots live   |
| ----- | ------------------------------------------------------------------------------------ | -------------------- |
| 1     | A polished studio: start, draw, animate and share a mascot. No account needed.       | The user's browser   |
| 2     | Accounts, a saved library in the cloud, and a community gallery.                     | The user's account   |
| 3     | Hosted embeds: paste a snippet with only the mascot's id; no files to host yourself. | Hosted by OpenMascot |

Each phase builds on the one before. Mascots made in phase 1 must keep working, unchanged, in phases 2 and 3.

## Phase 1 requirements

The studio is a three-step flow, **Make → Animate → Share**, reached from a Start page. Users can move between steps freely.

### Start

- Show "Continue where you left off" with the most recent mascot, its name and when it was last edited.
- Offer starting points: a blank canvas, and sample mascots (Clawd, Moss), each with a picture and a one-line description.
- Make clear that everything stays in this browser.

### Make: draw your character

- Name the mascot.
- Draw on a fixed 24 × 16 pixel board: left click paints, right click erases, dragging paints continuously.
- Pick and edit the mascot's colors (up to 36).
- Create, rename and switch between **poses** (for example `default`, `look-left`, `arms-up`, `blink`). A `default` pose always exists.
- Board menu: toggle center lines and ground line, reset to the default pose, clear the pose.
- Short tips that help first-time users draw a good character.
- A live preview showing exactly what a site will show, resting on the default pose while the user draws, with buttons to try each move.

### Animate: give it moves

- Create **moves** (sequences of poses): start empty, from a template (Jump, Wave, Nod), or by duplicating an existing move.
- Every move plays once, then the mascot rests on its `default` pose. Nothing loops on its own; an "every N seconds" trigger repeats a move.
- Edit a move as a table of steps: pose, how long to hold it, and left/right and up/down offsets. Steps can be added, removed and reordered.
- Show each move's length (poses, frames, seconds).
- Define **triggers**: when something happens, play a move. Supported events: page load, click, hover, every N seconds, and a custom event the host site sends (for example "success").
- Preview any move on demand.

### Share: take it with you

- Show a summary: picture, name, number of poses and moves, file size, and whether it is ready to use.
- Download the mascot as a single JSON file.
- Download a GIF of a move and a PNG of a pose (8× scale).
- Show a copyable embed snippet and explain which files to place next to the page.

### Embedding on a site

- Two lines of HTML: one script and one element pointing at the mascot file.
- Placement either fixed in a corner of the page or inline in the content.
- The host page can play a move or send a custom event from its own code.
- One page can show more than one mascot.

## The mascot file

- A mascot is one self-contained JSON file. It is the unit for saving, downloading, embedding and (later) sharing.
- The board size is always 24 × 16. Up to 36 colors, about 32 poses, about 32 moves and about 64 steps per move.
- Every mascot has an id that never changes once created.
- The file carries a format version so older mascots can be upgraded automatically and never break.
- A mascot file opened in the studio or loaded by an embed is checked first. A bad or incomplete file must never break the host page; it falls back to something safe.

## Quality bar

- **Safe to embed:** mascot files are treated as untrusted. Nothing in a mascot can run code or inject markup into the host page.
- **Small and fast:** the embed script stays tiny (target under 6 KB gzipped) and does not slow the host page, even with several mascots.
- **Accessible:** respects the user's reduced-motion setting, and every mascot has an accessible name. The studio works with a keyboard and meets contrast guidelines.
- **Private by default (phase 1):** no account, no server; work never leaves the browser unless the user downloads it.
- **No lock-in:** a downloaded mascot plus the embed script works anywhere, with no OpenMascot service involved.

## Out of scope for phase 1

- Accounts, sign-in and cloud sync.
- Community gallery, likes and forks.
- Hosted mascot URLs and a CDN-served embed.
- Variable board sizes, transparency other than empty cells, and visual effects beyond the per-step options above.

## Open questions

- Should GIF and PNG export also be available from the embed, or stay in the studio only?
- Which sign-in provider and hosting to use for phase 2.

## License

Open source. License to be chosen.
