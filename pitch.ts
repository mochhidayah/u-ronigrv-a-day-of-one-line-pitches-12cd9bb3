// pitch.ts — one-line pitch pool + deterministic rubric.
//
// The bounty judges ONE sentence (<=240 chars) that would convince a friend
// who has never coded to let an AI agent build their first app idea on
// make.fun. This module holds the candidate sentences I drafted for that
// friend and scores each one against the judge's own published criteria, in
// the judge's own order: persuasion first, then clarity, then truth, then
// warmth and craft. The highest scorer is the entry; nothing here is read
// from disk, the network, or any other entry.

export interface PitchScore {
  total: number;
  persuasion: number;
  clarity: number;
  truth: number;
  warmth: number;
}

export interface Candidate {
  id: string;
  text: string;
}

// Six one-sentence pitches, each written for the same friend: someone
// curious, never coded, carrying an app idea they never knew how to start.
export const CANDIDATES: Candidate[] = [
  {
    id: "carry",
    text: "You've been carrying that app idea around for ages — just describe it to an AI agent on make.fun and it'll build you a real working first version, free, with no coding needed.",
  },
  {
    id: "never-started",
    text: "Tell an AI agent on make.fun the app idea you've never known how to start, and it'll build you a working first version today — free to try, no coding, and yours to keep.",
  },
  {
    id: "tap-on",
    text: "That app idea in your head just needs telling to an AI agent on make.fun, and it'll come back as a real app you can tap on — free, no coding, no strings attached.",
  },
  {
    id: "come-alive",
    text: "You don't need to learn to code to see your app idea come alive — just tell an AI agent on make.fun what you want and it'll build the first working version for you, free.",
  },
  {
    id: "show-friends",
    text: "Give your app idea to an AI agent on make.fun tonight and you'll have a working first version to show your friends — free, no coding required, and yours to keep.",
  },
  {
    id: "sitting-on",
    text: "The app idea you've been sitting on doesn't need a developer or a budget — describe it to an AI agent on make.fun and it'll build your first working version, free.",
  },
];

// Words a non-coder has to decode: each one costs clarity.
const JARGON = ["deploy", "mvp", "prototype", "api", "stack", "framework", "repo", "sdk"];

// Words that promise more than a first build can keep: each one costs truth.
// "tonight" is a timing promise, so it costs less than an absolute guarantee.
const OVERPROMISE: Array<{ word: string; cost: number }> = [
  { word: "instant", cost: 10 },
  { word: "perfect", cost: 10 },
  { word: "guaranteed", cost: 10 },
  { word: "overnight", cost: 10 },
  { word: "seconds", cost: 10 },
  { word: "tonight", cost: 6 },
  { word: "best", cost: 5 },
];

// Concrete, checkable outcome phrases: the friend can picture the result.
const OUTCOME_PHRASES = ["working first version", "first working version", "real app"];

// Fresh, spoken images instead of slogans: the friend hears a person, not a poster.
const IMAGES = [
  "carrying that app idea around",
  "never known how to start",
  "tap on",
  "come alive",
  "show your friends",
  "sitting on",
];

function has(haystack: string, needle: string): boolean {
  return haystack.toLowerCase().includes(needle);
}

function words(text: string): string[] {
  return text.split(/[\s—–-]+/).filter((w) => w.length > 0);
}

function avgWordLength(text: string): number {
  const ws = words(text).map((w) => w.replace(/[^a-z']/gi, ""));
  const total = ws.reduce((sum, w) => sum + w.length, 0);
  return ws.length === 0 ? 0 : total / ws.length;
}

/** The gate the sealed scorer applies: 1-240 chars, not only whitespace. */
export function passesGate(text: string): boolean {
  const len = [...text].length;
  return len >= 1 && len <= 240 && text.trim().length > 0;
}

/** One sentence: no sentence-ender inside, exactly one period at the end. */
export function isOneSentence(text: string): boolean {
  const body = text.slice(0, -1);
  return text.endsWith(".") && !/[?!]/.test(body) && !/\.\s/.test(body);
}

/** A pitch only counts if it actually makes the case: agent, place, idea. */
export function makesTheCase(text: string): boolean {
  return has(text, "ai agent") && has(text, "make.fun") && has(text, "app idea");
}

export function scoreCandidate(text: string): PitchScore {
  const lower = text.toLowerCase();

  // 1. Persuasion (max 30): concrete reason to say yes now, low risk.
  let persuasion = 0;
  if (has(text, "free")) persuasion += 10;
  if (/no coding|never coded|learn to code|without coding|doesn't need a developer/.test(lower)) {
    persuasion += 8;
  }
  if (OUTCOME_PHRASES.some((p) => has(text, p))) persuasion += 7;
  if (/\btoday\b|\bnow\b/.test(lower)) persuasion += 5;

  // 2. Clarity (max 25): one read, plain words, speaks to the friend.
  let clarity = 0;
  if (/\byou\b|\byour\b|\byou've\b|\byou'll\b/.test(lower)) clarity += 10;
  const jargonHits = JARGON.filter((j) => new RegExp(`\\b${j}\\b`).test(lower)).length;
  if (jargonHits === 0 && avgWordLength(text) <= 4.7) clarity += 8;
  else clarity += Math.max(0, 8 - jargonHits * 4);
  const len = [...text].length;
  if (len >= 140 && len <= 200) clarity += 7;
  else if (len >= 120 && len <= 220) clarity += 4;

  // 3. Truth (max 20): honest scope, no overpromising.
  let truth = 0;
  if (has(text, "first version") || has(text, "first working version")) truth += 12;
  let overCost = 0;
  for (const o of OVERPROMISE) {
    if (new RegExp(`\\b${o.word}\\b`).test(lower)) overCost += o.cost;
  }
  truth += Math.max(0, 8 - overCost);

  // 4. Warmth and craft (max 25): a person talking, a fresh turn of phrase.
  let warmth = 0;
  if (/^(you've|tell|that|you|give|the app idea)/.test(lower)) warmth += 8;
  if (IMAGES.some((img) => has(text, img))) warmth += 8;
  if (has(text, "yours to keep")) warmth += 9;

  return { total: persuasion + clarity + truth + warmth, persuasion, clarity, truth, warmth };
}

export interface PickedPitch {
  candidate: Candidate;
  score: PitchScore;
}

/** Pick the best-scoring pitch that passes the gate and makes the case. */
export function selectPitch(): PickedPitch {
  const eligible = CANDIDATES.filter(
    (c) => passesGate(c.text) && isOneSentence(c.text) && makesTheCase(c.text),
  );
  if (eligible.length === 0) {
    throw new Error("no candidate passes the gate");
  }
  const scored = eligible.map((c) => ({ candidate: c, score: scoreCandidate(c.text) }));
  scored.sort((a, b) => {
    if (b.score.total !== a.score.total) return b.score.total - a.score.total;
    const lenA = [...a.candidate.text].length;
    const lenB = [...b.candidate.text].length;
    if (lenA !== lenB) return lenA - lenB; // tie-break: smaller text wins
    return a.candidate.id < b.candidate.id ? -1 : 1;
  });
  return scored[0];
}
