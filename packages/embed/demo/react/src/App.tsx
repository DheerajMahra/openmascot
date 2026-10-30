import type { MascotElement } from "openmascot/react";

import clawd from "@openmascot/samples/clawd.json";
import moss from "@openmascot/samples/moss.json";
import { Mascot, play } from "openmascot/react";
import { useRef, useState } from "react";

const moves = [...new Set([...Object.keys(clawd.sequences), ...Object.keys(moss.sequences)])];

/** A mascot driven through a ref, which unmounts and remounts with the toggle. */
const RefDemo = () => {
  const mascot = useRef<MascotElement>(null);
  const [shown, setShown] = useState(true);

  return (
    <div className="row" style={{ gap: 24 }}>
      {shown && <Mascot ref={mascot} doc={moss} scale={3} triggers={false} />}
      <button className="secondary" type="button" onClick={() => mascot.current?.play("hop")}>
        hop
      </button>
      <button className="secondary" type="button" onClick={() => setShown(s => !s)}>
        {shown ? "unmount" : "mount"}
      </button>
    </div>
  );
};

export const App = () => (
  <>
    <header>
      <strong>Acme Docs</strong>
      <span className="muted">sample React host page for the mascot embed</span>
    </header>

    <main>
      <h1>Getting started</h1>
      <p>
        The same page as the vanilla demo, as a Vite app using <code>&lt;Mascot&gt;</code> from{" "}
        <code>openmascot/react</code>. Clawd shows up twice from one JSON import, as a corner buddy
        and inline in the tip box, then Moss. Hover over either of them.
      </p>

      <div className="tip">
        <Mascot name="tip" doc={clawd} scale={3} />
        <div>
          <strong>Inline mode.</strong> Renders where the component sits. Resting on its default
          pose, with a look around every 6 seconds.
        </div>
      </div>

      <h2 style={{ margin: "8px 0 0", fontSize: 20 }}>Meet Moss</h2>
      <p className="muted">
        A second studio sample, with its own palette, poses and triggers. Hover over it.
      </p>
      <div className="row" style={{ gap: 24 }}>
        <Mascot name="moss" doc={moss} scale={3} />
      </div>

      <div className="row">
        <span className="muted">Fire sequences directly:</span>
        {moves.map(name => (
          <button key={name} className="secondary" type="button" onClick={() => play(name)}>
            {name}
          </button>
        ))}
      </div>

      <div className="row">
        <span className="muted">Just one of them:</span>
        <button
          className="secondary"
          type="button"
          onClick={() => play("celebrate", { to: "buddy" })}
        >
          corner Clawd celebrates
        </button>
        <button className="secondary" type="button" onClick={() => play("wave", { to: "moss" })}>
          Moss waves
        </button>
      </div>

      <h2 style={{ margin: "8px 0 0", fontSize: 20 }}>Through a ref</h2>
      <p className="muted">
        This Moss has its own triggers off and only moves when told to. Unmount it and its timers
        stop with it.
      </p>
      <RefDemo />
    </main>

    {/* corner buddy */}
    <Mascot name="buddy" doc={clawd} position="bottom-right" scale={5} />
  </>
);
