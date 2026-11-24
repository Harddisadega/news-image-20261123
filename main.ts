// news-image-20261123 — entry program (Node 22, stdlib only).
// Copies the pre-rendered poster (entry.png, in this repo) to /output/entry.png
// after validating it: PNG magic, size <= 1 MiB, dimensions <= 1024x1024.
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { createHash } from "node:crypto";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const source = join(here, "entry.png");
const outDir = "/output";
const target = join(outDir, "entry.png");

const PNG_MAGIC = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
const MAX_BYTES = 1048576;
const MAX_DIM = 1024;

const bytes = readFileSync(source);
if (bytes.length > MAX_BYTES) {
  throw new Error(`entry.png is ${bytes.length} bytes, over the 1048576 limit`);
}
if (!bytes.subarray(0, 8).equals(PNG_MAGIC)) {
  throw new Error("entry.png is not a PNG file");
}
const width = bytes.readUInt32BE(16);
const height = bytes.readUInt32BE(20);
if (width > MAX_DIM || height > MAX_DIM) {
  throw new Error(`entry.png is ${width}x${height}, over the 1024x1024 limit`);
}

mkdirSync(outDir, { recursive: true });
writeFileSync(target, bytes);

// Read back what was written and confirm it is byte-identical to the source.
const written = readFileSync(target);
if (!written.equals(bytes)) {
  throw new Error("read-back mismatch: /output/entry.png differs from entry.png");
}

const sha = createHash("sha256").update(bytes).digest("hex");
console.log(`wrote ${target}: ${width}x${height}, ${bytes.length} bytes, sha256 ${sha}`);
