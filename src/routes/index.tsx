import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Home } from "@/components/Home";
import { DrillScreen } from "@/components/DrillScreen";
import { ChartViewer } from "@/components/ChartViewer";
import { drills } from "@/drills";
import { freshStats, loadStats, type Stats } from "@/lib/storage";
import type { Position } from "@/lib/charts";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Poker Trainer — 6-max preflop open-raise drills" },
      {
        name: "description",
        content:
          "Drill 6-max cash game preflop open-raise decisions with instant feedback, range charts, and accuracy tracking.",
      },
      { property: "og:title", content: "Poker Trainer — 6-max preflop open-raise drills" },
      {
        property: "og:description",
        content:
          "Practice fold-or-raise decisions from every 6-max position and check your answers against published opening ranges.",
      },
    ],
  }),
  component: App,
});

type Screen = "home" | "drill" | "chart";

function App() {
  const [screen, setScreen] = useState<Screen>("home");
  const [stats, setStats] = useState<Stats>(() => freshStats());
  const [chartFrom, setChartFrom] = useState<"home" | "drill">("home");
  const [chartPosition, setChartPosition] = useState<Position>("UTG");
  const drill = drills[0]!;

  useEffect(() => {
    setStats(loadStats());
  }, []);

  const openChartFromHome = () => {
    setChartFrom("home");
    setChartPosition("UTG");
    setScreen("chart");
  };

  const openChartFromDrill = (position: Position) => {
    setChartFrom("drill");
    setChartPosition(position);
    setScreen("chart");
  };

  const closeChart = () => setScreen(chartFrom === "drill" ? "drill" : "home");

  const drillScreen = (
    <DrillScreen
      drill={drill}
      stats={stats}
      onStats={setStats}
      onHome={() => setScreen("home")}
      onChart={openChartFromDrill}
      suspended={screen === "chart"}
    />
  );

  if (screen === "home") {
    return <Home stats={stats} onStart={() => setScreen("drill")} onChart={openChartFromHome} />;
  }

  // Keep DrillScreen at the same tree position for drill and chart screens so
  // the current question survives a round trip to the chart viewer.
  return (
    <>
      <div className={screen === "chart" ? "hidden" : undefined}>{drillScreen}</div>
      {screen === "chart" ? (
        <ChartViewer initialPosition={chartPosition} onBack={closeChart} />
      ) : null}
    </>
  );
}
