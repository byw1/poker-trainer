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
- `1`–`5` — lock the drill to UTG / MP / CO / BTN / SB
- `0` — return to All-positions drill
- From Home, start Today's 10 for the daily 10-hand challenge

## Chart data

v1 training set for 6-max 100bb cash RFI. Frequencies (~13/18/26/44/40%) match commonly published GTO opening-range summaries such as PokerPro preflop strategy (https://pokerpro.tools/articles/preflop-strategy) and equivalent 6-max cash charts. Exact hand lists are this spec's starting set, not a solver dump.

All charts live in `src/lib/charts.ts` as shorthand expanded by `src/lib/rangeParser.ts`. The big blind is excluded because it cannot open-raise.

Everything is client-side; progress is stored in `localStorage` under one versioned key. No accounts, no backend, no analytics.

## Screenshot

A GIF or screenshot of the drill — hole cards, Fold/Raise keys, and the range ripple after an answer — belongs here once captured.
