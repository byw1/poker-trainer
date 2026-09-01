# Poker Trainer

Live demo: https://poker-trainer-6max.lovable.app

A drill app for preflop open-raise decisions in 6-max cash games: you get a hand and a position, you fold or raise, and it shows you the range chart and why.

## Run locally

```
npm install
npm run dev
```

Tests:

```
npm test
```

## Keyboard shortcuts

- `F` — fold
- `R` — raise
- `Space` or `Enter` — next hand
- `?` — show the full chart for the current position

## Chart data

v1 training set for 6-max 100bb cash RFI. Frequencies match commonly published GTO opening-range summaries such as PokerPro preflop strategy (https://pokerpro.tools/articles/preflop-strategy). Exact hand lists are this spec's starting set, not a solver dump.

All charts live in `src/lib/charts.ts` as shorthand expanded by `src/lib/rangeParser.ts`. The big blind is excluded because it cannot open-raise. Unit tests in `src/lib/handClasses.test.ts` and `src/lib/rangeParser.test.ts` cover the 169 hand classes and range expansions.

Everything is client-side; progress is stored in `localStorage` under one versioned key. No accounts, no backend, no analytics.
