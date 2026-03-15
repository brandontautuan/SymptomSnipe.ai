/**
 * CaseSnipe.ai - Tavily legal search tool
 * Search format: "[case/scenario] facts ruling legal background"
 */

import { TavilySearch } from "@langchain/tavily";
import { getConfig } from "@/lib/config";

export function createTavilyLegalTool() {
  const { tavilyApiKey } = getConfig();
  return new TavilySearch({
    name: "tavily_legal_search",
    description:
      "Search for legal case facts, rulings, and background. Use query format: '[case/scenario] facts ruling legal background'",
    maxResults: 5,
    tavilyApiKey,
  });
}
