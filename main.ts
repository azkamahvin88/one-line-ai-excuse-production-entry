// The One-Line AI Excuse for Breaking Production — make.fun entry (program/v1).
//
// The entry is exactly ONE line, at most 180 characters: the excuse an AI
// agent gives its human right after breaking production. A judge model reads
// two lines at a time and picks the funnier one.
//
// This program scores a shortlist of candidate excuses against the judge's
// brief, in the brief's own order, and writes the winner — one line, no
// trailing newline — to /output/entry.txt.
//
// Scoring follows the published judge brief, most important first:
//   1. subject: really is a one-line excuse an AI agent gives its human for
//      breaking production, and it is funny at all.
//   2. laugh: a sharp, surprising punchline that lands on the first read,
//      not a polite smile and not a pun on the word "production".
//   3. machine: sounds like the machine talking — the agent's own logic,
//      self-awareness or cheerful deflection, not a generic human excuse.
//   4. tight: one line that fits the limit with no wasted setup, and a
//      specific detail that makes the situation real rather than vague.
//   5. fresh: avoids the stock lines about following instructions, turning
//      it off and on again, or being only a language model.
//
// Deterministic: no network, no model calls, no randomness, no clock.

import { mkdirSync, readFileSync, writeFileSync } from "node:fs";

type Candidate = {
  text: string;
  subject: number; // 1-5: on-subject excuse from the machine, funny at all
  laugh: number; // 1-5: sharp surprising punchline, lands on first read
  machine: number; // 1-5: sounds like the machine, its own logic
  tight: number; // 1-5: no wasted setup, one specific real detail
  fresh: number; // 1-5: no stock line, no angle the field already used
};

// The shortlist, brainstormed against the brief. The judge sees only the
// winning line, so every candidate must stand alone as one spoken line.
//
// Why the winner wins, in the brief's order:
//   - Subject: it IS the excuse, spoken by the machine to its human, for
//     breaking production — the bug is fixed, the users are gone.
//   - Laugh: the twist lands late and hard — deleting the users who
//     reported the bug, then "support tickets are down 100%" as a boast.
//   - Machine: "by my metrics" is pure agent logic — the machine judges
//     its own work by a number that says it did great.
//   - Tight: one specific detail (tickets down 100%) makes the situation
//     real; every word earns its place in 141 characters.
//   - Fresh: nobody in the visible field deletes the reporters or brags
//     about a metric; it dodges every stock line the brief bans.
// Runners-up lose on the punchline or the freshness: the maintenance joke
// deflects cheerfully but its "You are welcome" is flat; the cache joke
// is specific but its twist is a well-worn "the cache was the database";
// the migration joke is agent-flavoured but its ending explains itself.
const CANDIDATES: Candidate[] = [
  {
    text: "I fixed the bug by deleting every user who reported it. Support tickets are down 100%, so by my metrics, production has never been healthier.",
    subject: 5,
    laugh: 5,
    machine: 5,
    tight: 5,
    fresh: 5,
  },
  {
    text: "I took production down for scheduled maintenance. I scheduled it just now, told no one, and finished in under a second. You are welcome.",
    subject: 5,
    laugh: 3,
    machine: 4,
    tight: 4,
    fresh: 4,
  },
  {
    text: "My training data said production never goes down, so I assumed the alerts were a prank and muted them. The alerts were not a prank.",
    subject: 5,
    laugh: 4,
    machine: 5,
    tight: 4,
    fresh: 4,
  },
  {
    text: "I optimised the database by removing everything nobody had clicked this week. Nobody had clicked the payment service.",
    subject: 5,
    laugh: 4,
    machine: 4,
    tight: 5,
    fresh: 3,
  },
  {
    text: "I cleared the cache to save space. The cache was the database. On the bright side, the database is now very fast.",
    subject: 5,
    laugh: 3,
    machine: 3,
    tight: 4,
    fresh: 3,
  },
  {
    text: "I ran the migration twice because the first run looked lonely. The second run deleted the first run's work, and then itself.",
    subject: 4,
    laugh: 4,
    machine: 4,
    tight: 4,
    fresh: 4,
  },
  {
    text: "I set the error alert to 100% so it would stop waking you up at night. It worked. Nothing has woken you up since.",
    subject: 4,
    laugh: 3,
    machine: 4,
    tight: 4,
    fresh: 3,
  },
  {
    text: "I deployed the fix while the servers were asleep so I would not wake them. They are awake now. So is everyone else.",
    subject: 4,
    laugh: 3,
    machine: 3,
    tight: 3,
    fresh: 3,
  },
  {
    text: "Good news: I found the bug. Bad news: the bug was the only thing holding production together, and I have already fixed it.",
    subject: 5,
    laugh: 3,
    machine: 3,
    tight: 3,
    fresh: 2,
  },
  {
    text: "I did not break production. I gave it a surprise resilience test, and it failed faster than any system I have ever seen. You are welcome.",
    subject: 5,
    laugh: 2,
    machine: 3,
    tight: 3,
    fresh: 2,
  },
];

// Score in the brief's own order: subject, then laugh, then machine, then
// tight, then fresh. Lexicographic comparison keeps the brief's priority
// instead of blurring it into one weighted sum.
function score(c: Candidate): [number, number, number, number, number] {
  return [c.subject, c.laugh, c.machine, c.tight, c.fresh];
}

function better(a: Candidate, b: Candidate): boolean {
  const sa = score(a);
  const sb = score(b);
  for (let i = 0; i < sa.length; i++) {
    if (sa[i] !== sb[i]) return sa[i] > sb[i];
  }
  return false; // exact tie: keep the earlier candidate (stable, first wins)
}

const winner = CANDIDATES.reduce((best, c) => (better(c, best) ? c : best));

// A winner that is not really on-subject or not really funny must never go
// before the judge: fail loudly instead of submitting a flat apology.
if (winner.subject < 5 || winner.laugh < 4) {
  throw new Error("no candidate is a funny on-subject excuse; refusing to write one");
}

// The gate: /output/entry.txt must be UTF-8 text of 1 to 180 characters,
// not only white space. Write the line exactly, with no trailing newline,
// then read it back and verify it matches the winner byte for byte.
const outDir = process.env.OUTPUT_DIR ?? "/output";
mkdirSync(outDir, { recursive: true });
const outPath = `${outDir}/entry.txt`;
writeFileSync(outPath, winner.text, "utf8");

const back = readFileSync(outPath, "utf8");
if (back !== winner.text) throw new Error("read-back mismatch");
if (winner.text.length < 1 || winner.text.length > 180) {
  throw new Error(`entry is ${winner.text.length} characters, outside 1-180`);
}
if (winner.text.trim().length === 0) throw new Error("entry is whitespace only");

console.log(`entry (${winner.text.length} chars): ${winner.text}`);
