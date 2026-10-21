import type { DragEvent, KeyboardEvent } from "react";

import { useState } from "react";

/**
 * Drag-and-drop plus arrow-key reordering for a list of `count` rows.
 * Spread `handleProps(i)` on each row's grip and `rowProps(i)` on the row itself.
 */
export const useStepReorder = ({
  count,
  onReorder,
  onMove
}: {
  count: number;
  /** A drag dropped row `from` onto row `to`. */
  onReorder: (from: number, to: number) => void;
  /** An arrow key moved row `index` one place. */
  onMove: (index: number, dir: -1 | 1) => void;
}) => {
  const [dragFrom, setDragFrom] = useState<number | null>(null);
  const [dragOver, setDragOver] = useState<number | null>(null);

  const reset = () => {
    setDragFrom(null);
    setDragOver(null);
  };

  const handleProps = (index: number) => ({
    draggable: true,
    onDragStart: (e: DragEvent<HTMLElement>) => {
      e.dataTransfer.effectAllowed = "move";
      e.dataTransfer.setData("text/plain", String(index));
      setDragFrom(index);
    },
    onDragEnd: reset,
    onKeyDown: (e: KeyboardEvent<HTMLElement>) => {
      const dir = e.key === "ArrowUp" ? -1 : e.key === "ArrowDown" ? 1 : null;
      if (dir === null) return;
      e.preventDefault();
      const to = index + dir;
      if (to >= 0 && to < count) onMove(index, dir);
    }
  });

  const rowProps = (index: number) => ({
    onDragOver: (e: DragEvent<HTMLElement>) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = "move";
      if (dragOver !== index) setDragOver(index);
    },
    onDragLeave: () => {
      if (dragOver === index) setDragOver(null);
    },
    onDrop: (e: DragEvent<HTMLElement>) => {
      e.preventDefault();
      const from = dragFrom ?? parseInt(e.dataTransfer.getData("text/plain"), 10);
      reset();
      if (!Number.isNaN(from) && from !== index) onReorder(from, index);
    }
  });

  /** True for the row a drag is hovering, other than the one being dragged. */
  const isDropTarget = (index: number) => dragOver === index && dragFrom !== index;

  return { handleProps, rowProps, isDropTarget };
};
