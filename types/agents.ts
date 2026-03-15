/**
 * CaseSnipe.ai - Agent types
 */

export interface CaseBriefing {
  caseName: string;
  facts: string;
  timestamp: string;
}

export interface CaseAgentInput {
  caseName?: string;
  scenario?: string;
}
