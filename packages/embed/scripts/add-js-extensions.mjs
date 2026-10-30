/*
 * tsc keeps relative imports as written ("./element"), but ESM in Node and strict bundlers needs
 * the file extension. Rewrite every extensionless relative specifier in the emitted .js and .d.ts
 * files to end in ".js".
 *
 *   node scripts/add-js-extensions.mjs dist
 */
import { readFileSync, readdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const dir = process.argv[2] ?? "dist";
const specifier = /(\bfrom\s*|\bimport\s*\(\s*|\bimport\s+)(["'])(\.{1,2}\/[^"']*?)\2/g;

for (const name of readdirSync(dir, { recursive: true, encoding: "utf8" })) {
  if (!name.endsWith(".js") && !name.endsWith(".d.ts")) continue;
  const file = join(dir, name);
  const code = readFileSync(file, "utf8");
  const fixed = code.replace(specifier, (match, lead, quote, path) =>
    /\.(js|json)$/.test(path) ? match : `${lead}${quote}${path}.js${quote}`
  );
  if (fixed !== code) writeFileSync(file, fixed);
}
