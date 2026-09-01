import type { Drill } from "./types";
import { openRaiseDrill } from "./openRaise";

export const drills: Drill[] = [];

function register(drill: Drill) {
  drills.push(drill);
}

register(openRaiseDrill);
