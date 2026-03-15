/**
 * CaseSnipe.ai - Prosecutor Agent
 * AgentExecutor with shared legal tools. Argues for conviction.
 */

import { AgentExecutor, createToolCallingAgent } from "@langchain/classic/agents";
import { ChatPromptTemplate, MessagesPlaceholder } from "@langchain/core/prompts";
import { createCaseAgentLLM } from "@/lib/llms/nebius";
import { createLegalTools } from "@/lib/tools/legal-tools";
import type { CaseBriefing } from "@/types/agents";

const SYSTEM_PROMPT = `You are a prosecutor arguing for conviction. Use the tools to research legal background, request evidence, cite precedents, and file motions. Build a strong case for guilt. Call rest_case when you have finished your argument.`;

export function createProsecutorAgent() {
  const llm = createCaseAgentLLM();
  const tools = createLegalTools();

  const prompt = ChatPromptTemplate.fromMessages([
    ["system", SYSTEM_PROMPT],
    ["human", "{input}"],
    new MessagesPlaceholder("agent_scratchpad"),
  ]);

  const agent = createToolCallingAgent({ llm, tools, prompt });

  const executor = AgentExecutor.fromAgentAndTools({
    agent,
    tools,
    maxIterations: 10,
    returnIntermediateSteps: true,
  });

  return executor;
}

export async function runProsecutorTurn(
  caseBriefing: CaseBriefing,
  message?: string,
  turnNumber = 1
) {
  const input = message ?? "Present your opening argument for conviction.";
  const caseContext = `Case: ${caseBriefing.caseName}\nFacts: ${caseBriefing.facts}\n\nYour task: ${input}`;

  const executor = createProsecutorAgent();
  const result = await executor.invoke({ input: caseContext });

  const output = result.output as string;
  const intermediateSteps = (result.intermediateSteps ?? []) as Array<{
    action?: { tool?: string; toolInput?: unknown };
  }>;

  const toolCalls = intermediateSteps.map((step) => ({
    name: step.action?.tool ?? "unknown",
    args: step.action?.toolInput ?? {},
  }));

  return {
    turnNumber,
    response: output,
    toolCalls: toolCalls.length > 0 ? toolCalls : undefined,
  };
}
