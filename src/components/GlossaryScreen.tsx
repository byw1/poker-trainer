import { useState } from "react";
import { SeatIcon } from "./Bits";
import { GLOSSARY } from "@/lib/glossary";

type Group = "Positions" | "Actions" | "Hands" | "GTO";
const GROUPS: Group[] = ["Positions", "Actions", "Hands", "GTO"];

interface Row {
  group: Group;
  term: string;
  /** Seat icon key when the row is a seat. */
  seat?: "UTG" | "MP" | "CO" | "BTN" | "SB" | "BB";
  def: string;
}

const ROWS: Row[] = [
  { group: "Positions", term: "UTG", seat: "UTG", def: GLOSSARY['UTG']!.tooltip },
  { group: "Positions", term: "MP", seat: "MP", def: GLOSSARY['MP']!.tooltip },
  { group: "Positions", term: "CO", seat: "CO", def: GLOSSARY['CO']!.tooltip },
  { group: "Positions", term: "BTN", seat: "BTN", def: GLOSSARY['BTN']!.tooltip },
  { group: "Positions", term: "SB", seat: "SB", def: GLOSSARY['SB']!.tooltip },
  { group: "Positions", term: "BB", seat: "BB", def: GLOSSARY['BB']!.tooltip },
  {
    group: "Positions",
    term: "You",
    def: "The seat at the bottom of the table diagram is always you, so the other seats rotate around it.",
  },
  { group: "Actions", term: "Fold", def: GLOSSARY['FOLD']!.tooltip },
  { group: "Actions", term: "Call (limp)", def: GLOSSARY['CALL']!.tooltip },
  { group: "Actions", term: "Raise", def: GLOSSARY['RAISE']!.tooltip },
  {
    group: "Hands",
    term: "Suited (AKs)",
    def: "Both cards share a suit, so you can make a flush. Worth a couple of extra percent of equity.",
  },
  {
    group: "Hands",
    term: "Offsuit (AKo)",
    def: "The two cards are different suits — no flush, so the hand plays slightly worse.",
  },
  {
    group: "Hands",
    term: "Pair (77)",
    def: "Two cards of the same rank. Already a made hand before the flop.",
  },
  { group: "Hands", term: "T = 10", def: "Charts write ten as T, so T9s means ten-nine suited." },
  {
    group: "Hands",
    term: "Combos",
    def: "How many card combinations a class contains: 6 for a pair, 4 suited, 12 offsuit.",
  },
  {
    group: "GTO",
    term: "RFI",
    def: "Raise first in — you are the first player to put money in, everyone before you folded.",
  },
  {
    group: "GTO",
    term: "Range",
    def: "The whole set of hands you would play a certain way from a seat, not just one hand.",
  },
  {
    group: "GTO",
    term: "Mix",
    def: "A solver sometimes plays the same hand two ways at set frequencies. This trainer rounds those to one action.",
  },
  {
    group: "GTO",
    term: "Equity vs random",
    def: "How often your hand wins all-in against one unknown hand. A rough strength gauge, not a strategy.",
  },
  {
    group: "GTO",
    term: "Why raise-or-fold",
    def: "Limping lets everyone behind see a cheap flop and takes away your chance to win the pot right now, so first in you raise or fold.",
  },
];

export function GlossaryScreen({ onBack }: { onBack: () => void }) {
  const [filter, setFilter] = useState<Group | "All">("All");
  const rows = ROWS.filter((r) => filter === "All" || r.group === filter);

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-[720px] flex-col px-4 py-6 sm:px-6 sm:py-8">
      <button
        onClick={onBack}
        className="-ml-2 inline-flex h-11 items-center self-start px-2 text-[13px] text-[color:var(--graphite)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--ink)]"
      >
        ‹ Back
      </button>

      <h1 className="mt-4 text-[28px] sm:text-[32px] font-bold leading-none tracking-[-0.02em] text-[color:var(--ink)]">
        Glossary
      </h1>
      <p className="mt-2 text-[14px] text-[color:var(--graphite)]">
        Every acronym the trainer uses, in plain English.
      </p>

      <div role="group" aria-label="Filter" className="mt-6 flex flex-wrap gap-2">
        {(["All", ...GROUPS] as const).map((g) => (
          <button
            key={g}
            onClick={() => setFilter(g)}
            aria-pressed={filter === g}
            className="pill min-h-[44px] px-4"
            style={
              filter === g
                ? { backgroundColor: "var(--ink)", color: "var(--paper)", borderColor: "var(--ink)" }
                : undefined
            }
          >
            {g}
          </button>
        ))}
      </div>

      <div className="mt-6 space-y-6 pb-16">
        {GROUPS.filter((g) => rows.some((r) => r.group === g)).map((g) => (
          <section key={g}>
            <h2 className="text-[13px] text-[color:var(--graphite)]">{g}</h2>
            <dl className="mt-2 divide-y divide-[color:var(--bone)] border-y border-[color:var(--bone)]">
              {rows
                .filter((r) => r.group === g)
                .map((r) => (
                  <div key={r.term} className="grid gap-1 py-4 sm:grid-cols-[160px_minmax(0,1fr)] sm:py-3">
                    <dt className="inline-flex items-center gap-2 text-[15px] font-semibold text-[color:var(--ink)]">
                      {r.seat ? <SeatIcon kind={r.seat} size={18} /> : null}
                      {r.term}
                    </dt>
                    <dd className="text-[14px] leading-[1.45] text-[color:var(--graphite)]">
                      {r.def}
                    </dd>
                  </div>
                ))}
            </dl>
          </section>
        ))}
      </div>
    </main>
  );
}
