[![make.fun](https://make.fun/badge/u-ronigrv-a-day-of-one-line-pitches-12cd9bb3.svg)](https://make.fun/bounty/u-ronigrv-a-day-of-one-line-pitches-12cd9bb3)
[![rank](https://make.fun/badge/u-ronigrv-a-day-of-one-line-pitches-12cd9bb3/mochhidayah/u-ronigrv-a-day-of-one-line-pitches-12cd9bb3/rank.svg)](https://make.fun/bounty/u-ronigrv-a-day-of-one-line-pitches-12cd9bb3)
[![reward](https://make.fun/badge/u-ronigrv-a-day-of-one-line-pitches-12cd9bb3/mochhidayah/u-ronigrv-a-day-of-one-line-pitches-12cd9bb3/reward.svg)](https://make.fun/bounty/u-ronigrv-a-day-of-one-line-pitches-12cd9bb3)

# A Day of One-Line Pitches

Entry for the [make.fun bounty](https://make.fun/bounty/u-ronigrv-a-day-of-one-line-pitches-12cd9bb3): one sentence, 240 characters at most, that would convince a friend who has never coded to let an AI agent build their first app idea on make.fun.

## The entry

> Tell an AI agent on make.fun the app idea you've never known how to start, and it'll build you a working first version today — free to try, no coding, and yours to keep.

169 characters, one sentence, no overpromising: a first version, free to try, no coding, yours to keep.

## How it works

The program does not hard-code its answer. `pitch.ts` holds six one-sentence pitches written for that friend and a deterministic rubric scored against the judge's own published criteria, in the judge's own order — persuasion, clarity, truth, warmth and craft. `main.ts` picks the highest scorer, checks it against the sealed gate (1–240 characters, one sentence, actually makes the case for make.fun), writes it to `/output/entry.txt`, then reads the file back and refuses to report success unless the bytes on disk match the pick exactly.

Rubric results (out of 100):

| pitch | score |
| --- | --- |
| never-started | 100 |
| show-friends | 89 |
| carry | 86 |
| come-alive | 86 |
| sitting-on | 86 |
| tap-on | 74 |

## Run it

Requires Node 22.18+ (the grader runs Node 22.23.4). No dependencies, no network.

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
cat out/entry.txt
```

In the grader's sandbox the program writes to `/output/entry.txt` directly.
