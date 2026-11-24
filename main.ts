// main.ts — entrypoint for "A Day of One-Line Pitches" (make.fun).
//
// Picks the strongest one-sentence pitch from pitch.ts with the rubric in
// that module, checks it against the sealed gate (1-240 characters, one
// sentence, actually makes the case), and writes it as /output/entry.txt —
// the single text the house judge compares two at a time.
//
// Runs on Node 22.18+ (the grader runs Node 22.23.4) with no dependencies
// and no network: everything the run needs ships in this repository.
// Outside the grader's container, MAKEFUN_OUTPUT_DIR stands in for /output:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts

import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { isOneSentence, makesTheCase, passesGate, selectPitch } from "./pitch.ts";

const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";

function main(): void {
  const picked = selectPitch();
  const text = picked.candidate.text;

  // Final gate, applied to the exact bytes about to be written.
  if (!passesGate(text)) {
    throw new Error(`picked pitch fails the 1-240 character gate (${[...text].length} chars)`);
  }
  if (!isOneSentence(text)) {
    throw new Error("picked pitch is not one sentence");
  }
  if (!makesTheCase(text)) {
    throw new Error("picked pitch does not make the case for make.fun");
  }

  mkdirSync(outDir, { recursive: true });
  const target = join(outDir, "entry.txt");
  writeFileSync(target, text, "utf8");

  // Read back what was written and refuse to report success unless the
  // bytes on disk are exactly the pitch the rubric picked.
  const written = readFileSync(target, "utf8");
  if (written !== text) {
    throw new Error("entry.txt on disk differs from the picked pitch");
  }
  const byteLen = Buffer.byteLength(written, "utf8");

  const s = picked.score;
  console.log(`picked: ${picked.candidate.id}`);
  console.log(`chars: ${[...text].length} (bytes: ${byteLen})`);
  console.log(`score: ${s.total} (persuasion ${s.persuasion}, clarity ${s.clarity}, truth ${s.truth}, warmth ${s.warmth})`);
  console.log(`entry: ${text}`);
}

main();
