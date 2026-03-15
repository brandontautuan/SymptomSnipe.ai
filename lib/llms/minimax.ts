/**
 * CaseSnipe.ai - MiniMax LLM for Case Agent
 * Model: abab6.5-chat (hardcoded)
 */

import { ChatMinimax } from "@langchain/community/chat_models/minimax";
import { getConfig } from "@/lib/config";

export function createCaseAgentLLM() {
  const { minimaxApiKey, minimaxGroupId } = getConfig();
  if (!minimaxGroupId?.trim()) {
    throw new Error(
      "MINIMAX_GROUP_ID is required. Get it from platform.minimax.io API settings."
    );
  }
  return new ChatMinimax({
    model: "abab6.5-chat",
    modelName: "abab6.5-chat",
    minimaxApiKey,
    minimaxGroupId,
    temperature: 0.3,
  });
}
