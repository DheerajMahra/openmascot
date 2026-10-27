import type { MascotDoc, MascotFrame } from "@openmascot/embed";

import { EMPTY_CELL, expandSequence, sequencePadding } from "@openmascot/embed";

/**
 * Minimal animated GIF writer for one move. Indexed colors only, which is exactly
 * what a pixel mascot is: palette + transparent.
 */

interface IndexedFrame {
  pixels: Uint8Array; // palette indices, 0 = transparent
  delayCs: number; // centiseconds
}

/** Render one frame of a move into an indexed pixel buffer, mirroring the runtime's draw(). */
const renderFrame = (
  doc: MascotDoc,
  frame: MascotFrame,
  scale: number,
  width: number,
  height: number
): Uint8Array => {
  const { w, h } = doc.grid;
  const out = new Uint8Array(width * height); // 0 = transparent
  const pose = doc.poses[frame.pose] ?? doc.poses["default"] ?? "";
  const pad = sequencePadding(doc);
  const ox = ((frame.x ?? 0) + pad.left) * scale;
  const oy = ((frame.offset ?? 0) + pad.up) * scale;
  const put = (px: number, py: number, idx: number) => {
    for (let dy = 0; dy < scale; dy++) {
      for (let dx = 0; dx < scale; dx++) {
        const x = px + dx;
        const y = py + dy;
        if (x >= 0 && y >= 0 && x < width && y < height) out[y * width + x] = idx;
      }
    }
  };
  for (let i = 0; i < w * h; i++) {
    const ch = pose[i];
    if (!ch || ch === EMPTY_CELL) continue;
    put(ox + (i % w) * scale, oy + Math.floor(i / w) * scale, parseInt(ch, 36) + 1);
  }
  return out;
};

/* --- LZW --- */

class BitWriter {
  private bytes: number[] = [];
  private cur = 0;
  private nbits = 0;

  write(code: number, size: number): void {
    this.cur |= code << this.nbits;
    this.nbits += size;
    while (this.nbits >= 8) {
      this.bytes.push(this.cur & 0xff);
      this.cur >>>= 8;
      this.nbits -= 8;
    }
  }

  finish(): number[] {
    if (this.nbits > 0) this.bytes.push(this.cur & 0xff);
    return this.bytes;
  }
}

const lzwEncode = (pixels: Uint8Array, minCodeSize: number): number[] => {
  const clear = 1 << minCodeSize;
  const eoi = clear + 1;
  const out = new BitWriter();
  let dict = new Map<string, number>();
  let next = eoi + 1;
  let codeSize = minCodeSize + 1;
  const reset = () => {
    dict = new Map();
    next = eoi + 1;
    codeSize = minCodeSize + 1;
  };
  out.write(clear, codeSize);
  let prefix = "";
  for (const p of pixels) {
    const key = prefix ? `${prefix},${p}` : `${p}`;
    if (dict.has(key) || prefix === "") {
      if (prefix === "" && !dict.has(key)) {
        prefix = key;
        continue;
      }
      prefix = key;
      continue;
    }
    const code = prefix.includes(",") ? dict.get(prefix) : Number(prefix);
    out.write(code as number, codeSize);
    if (next < 4096) {
      dict.set(key, next++);
      if (next - 1 === 1 << codeSize && codeSize < 12) codeSize++;
    } else {
      out.write(clear, codeSize);
      reset();
    }
    prefix = `${p}`;
  }
  const code = prefix.includes(",") ? dict.get(prefix) : Number(prefix);
  out.write(code as number, codeSize);
  out.write(eoi, codeSize);
  return out.finish();
};

/* --- GIF container --- */

const hexToRgb = (hex: string): [number, number, number] => [
  parseInt(hex.slice(1, 3), 16),
  parseInt(hex.slice(3, 5), 16),
  parseInt(hex.slice(5, 7), 16)
];

export const encodeMoveGif = (doc: MascotDoc, seqName: string, scale = 4): Blob => {
  const { w, h } = doc.grid;
  const pad = sequencePadding(doc);
  const width = (w + pad.left + pad.right) * scale;
  const height = (h + pad.up + pad.down) * scale;

  // Merge identical consecutive expanded frames back into one frame with a longer delay.
  const expanded = expandSequence(doc.sequences[seqName]);
  const frames: IndexedFrame[] = [];
  let last: { key: string; frame: IndexedFrame } | null = null;
  for (const f of expanded) {
    const key = `${f.pose}|${f.offset ?? 0}|${f.x ?? 0}`;
    if (last && last.key === key) {
      last.frame.delayCs += doc.tick / 10;
      continue;
    }
    const frame = { pixels: renderFrame(doc, f, scale, width, height), delayCs: doc.tick / 10 };
    frames.push(frame);
    last = { key, frame };
  }

  // Global color table: index 0 transparent, then the palette, padded to a power of two.
  const colors: Array<[number, number, number]> = [[0, 0, 0]];
  for (const hex of doc.palette) colors.push(hexToRgb(hex));
  let tableBits = 1;
  while (1 << tableBits < colors.length) tableBits++;
  tableBits = Math.max(1, tableBits);
  const tableSize = 1 << tableBits;
  while (colors.length < tableSize) colors.push([0, 0, 0]);
  const minCodeSize = Math.max(2, tableBits);

  const bytes: number[] = [];
  const push = (...b: number[]) => bytes.push(...b);
  const u16 = (n: number) => push(n & 0xff, (n >> 8) & 0xff);

  // Header + logical screen descriptor
  push(0x47, 0x49, 0x46, 0x38, 0x39, 0x61);
  u16(width);
  u16(height);
  push(0x80 | ((tableBits - 1) << 4) | (tableBits - 1), 0, 0);
  for (const [r, g, b] of colors) push(r, g, b);

  // Netscape loop extension: loop forever
  push(0x21, 0xff, 0x0b);
  for (const c of "NETSCAPE2.0") push(c.charCodeAt(0));
  push(0x03, 0x01, 0x00, 0x00, 0x00);

  for (const frame of frames) {
    // Graphic control extension: restore to background, transparency index 0
    push(0x21, 0xf9, 0x04, 0x09);
    u16(Math.max(2, Math.round(frame.delayCs)));
    push(0x00, 0x00);
    // Image descriptor
    push(0x2c);
    u16(0);
    u16(0);
    u16(width);
    u16(height);
    push(0x00);
    // Image data
    push(minCodeSize);
    const data = lzwEncode(frame.pixels, minCodeSize);
    for (let i = 0; i < data.length; i += 255) {
      const chunk = data.slice(i, i + 255);
      push(chunk.length, ...chunk);
    }
    push(0x00);
  }
  push(0x3b);
  return new Blob([new Uint8Array(bytes)], { type: "image/gif" });
};
