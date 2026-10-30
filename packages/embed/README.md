# openmascot

Pixel mascots for any website. Draw a character and its moves in the [OpenMascot](https://github.com/DheerajMahra/openmascot) studio, download its JSON, and put it on a page with a `<Mascot>` React component or one script tag. It reacts to page load, clicks, hovers, timers and your own code.

- No dependencies. The script tag is about 3 KB gzipped.
- The mascot JSON is treated as data: nothing in it can run code or inject markup.
- Respects `prefers-reduced-motion`.

## React

```bash
npm install openmascot
```

```tsx
import { Mascot, emit } from "openmascot/react";
import moss from "./moss.json";

export const App = () => (
  <>
    <Mascot doc={moss} position="bottom-right" />
    <button onClick={() => emit("success")}>Save</button>
  </>
);
```

Needs React 19. Works with server rendering (Next.js and others): the doc is passed through a ref, so it survives hydration.

## Script tag

```html
<script src="https://cdn.jsdelivr.net/npm/openmascot@0" defer></script>
<open-mascot src="/moss.json" position="bottom-right"></open-mascot>

<script>
  Mascot.emit("success");
</script>
```

Put `moss.json` next to your page. Tags added or removed later start and stop on their own.

## Options

| `<Mascot>` prop    | `<open-mascot>` attribute | Meaning                                                                                 |
| ------------------ | ------------------------- | --------------------------------------------------------------------------------------- |
| `doc`              | (property)                | The mascot JSON as an object.                                                           |
| `src`              | `src`                     | URL of the mascot JSON, when `doc` isn't given.                                         |
| `position`         | `position`                | `"bottom-right"` or `"bottom-left"` pins it to a corner. Leave it out to render inline. |
| `scale`            | `scale`                   | Screen pixels per mascot pixel. Default 4.                                              |
| `name`             | `name`                    | A handle for targeting one mascot.                                                      |
| `triggers={false}` | `triggers="off"`          | Turns off load, click, hover and timer moves. `emit` and `play` still work.             |

## Playing moves from your code

```ts
emit("success"); // fires the mascot's "success" event: the studio decides which move plays
play("wave"); // plays a move by name
emit("success", { to: "inbox" }); // only the mascot named "inbox"
```

Both return `true` if a mascot played something. In the script tag they are `Mascot.emit` and `Mascot.play`.

To drive one mascot directly, take a ref (React) or the element (HTML). It has `play()`, `emit()`, `pause()` and `resume()`.

```tsx
const mascot = useRef<MascotElement>(null);

<Mascot ref={mascot} doc={moss} />;
mascot.current?.play("wave");
```

`MascotElement` is exported as a type from `openmascot/react`.

## License

MIT
