/**
 * CaseSnipe.ai — Scoring Engine
 * Scores Prosecutor and Defendant based on transcript quality.
 *
 * Rewards: argument depth, evidence obtained, efficiency
 * Penalizes: repeated tool calls, zero arguments, no evidence used
 */

interface TrialEvent {
  type: string;
  side?: string;
  content?: string;
  toolName?: string;
}

export interface SideScore {
  total: number;          // 0–100
  breakdown: {
    arguments: number;    // 0–45
    evidence: number;    // 0–30
    efficiency: number;  // 0–25
  };
  grade: "S" | "A" | "B" | "C" | "D";
  summary: string;
}

export interface TrialScore {
  prosecution: SideScore;
  defense: SideScore;
  winner: "prosecution" | "defense" | "draw";
  verdictFavors: "prosecution" | "defense" | "unclear";
}

function grade(score: number): SideScore["grade"] {
  if (score >= 90) return "S";
  if (score >= 75) return "A";
  if (score >= 60) return "B";
  if (score >= 45) return "C";
  return "D";
}

function scoreSide(events: TrialEvent[], side: string): SideScore {
  const mine = events.filter((e) => e.side === side);

  // Arguments — reward depth (longer = more substantive, up to a point)
  const args = mine.filter((e) => e.type === "argument");
  const argChars = args.reduce((sum, e) => sum + (e.content?.length ?? 0), 0);
  const argScore = Math.min(45, Math.round((argChars / 800) * 45));

  // Evidence — reward variety, penalize none
  const evidenceItems = mine.filter((e) => e.type === "evidence");
  const evidenceScore = Math.min(30, evidenceItems.length * 10);

  // Efficiency — penalize excessive tool calls without substance
  const totalToolCalls = mine.filter((e) => e.type === "tool_call").length;
  const efficiencyScore =
    totalToolCalls === 0 && args.length > 0 ? 25 :
    totalToolCalls <= 6 ? 25 :
    totalToolCalls <= 10 ? 15 :
    5;

  const total = Math.min(100, argScore + evidenceScore + efficiencyScore);

  const summaryParts: string[] = [];
  if (args.length === 0) summaryParts.push("No arguments made");
  else if (argScore >= 30) summaryParts.push("Strong argumentation");
  else summaryParts.push("Minimal arguments");
  if (evidenceItems.length > 0) summaryParts.push(`${evidenceItems.length} evidence item(s) used`);

  return {
    total,
    breakdown: {
      arguments: argScore,
      evidence: evidenceScore,
      efficiency: efficiencyScore,
    },
    grade: grade(total),
    summary: summaryParts.join(" · ") || "No activity recorded",
  };
}

function parseVerdictFavor(verdict: string): "prosecution" | "defense" | "unclear" {
  const v = verdict.toLowerCase();
  if (v.includes("guilty") && !v.includes("not guilty")) return "prosecution";
  if (v.includes("not guilty") || v.includes("not liable") || v.includes("acquit")) return "defense";
  if (v.includes("liable") && !v.includes("not liable")) return "prosecution";
  return "unclear";
}

export function scoreTrialEvents(events: TrialEvent[], verdict: string): TrialScore {
  const prosecution = scoreSide(events, "prosecution");
  const defense     = scoreSide(events, "defense");
  const verdictFavors = parseVerdictFavor(verdict);

  const winner: TrialScore["winner"] =
    verdictFavors === "prosecution" ? "prosecution" :
    verdictFavors === "defense"     ? "defense"     :
    Math.abs(prosecution.total - defense.total) <= 5 ? "draw" :
    prosecution.total > defense.total ? "prosecution" : "defense";

  return { prosecution, defense, winner, verdictFavors };
}
