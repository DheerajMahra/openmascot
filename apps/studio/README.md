# @openmascot/studio

The editor. A start page and three steps, one document.

- **Start** (`/`): continue where you left off, start from a blank canvas or one of the samples (each live, with its triggers), and a Continue card when a mascot is already in this browser.
- **Make** (`/make`): mascot name, colors and poses in the left sidebar, the Pixelboard in the center with its tool column (pencil, mirror pencil, eraser, fill, undo, redo, and a ⋯ menu for center lines, reset and clear), tips under the board, and a live preview with "try a move" on the right.
- **Animate** (`/animate`): moves on the left with a preset picker for new ones (start from a preset, duplicate, or empty). The selected move is a pose table: one row per pose with a drag handle, the pose, and plain number fields for Hold (frames), Down (rows; negative is up, so −2 is a hop) and Slide (columns). Click a row to hold that pose in the preview; while a move plays, the row on screen is highlighted. Under it, the Triggers table maps page events (load, click, hover, every N seconds, a custom event) to moves.
- **Share** (`/share`): a centered column with the summary, JSON / GIF / PNG downloads and the embed snippet.

State lives in `src/lib/mascot-store.tsx` (a reducer over the mascot document with undo and redo) and autosaves to `localStorage`. One mascot is kept at a time and there is no Save button. Previews mount `MascotPlayer` from `@openmascot/embed`, so what you see is what the embed draws. `src/lib/gif-encoder.ts` writes animated GIFs without a dependency.

```bash
pnpm dev
```
