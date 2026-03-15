/**
 * CaseSnipe.ai - Defendant Agent
 * AgentExecutor with shared legal tools. Argues for acquittal, counters prosecution.
 */

import { AgentExecutor, createToolCallingAgent } from "@langchain/classic/agents";
import { ChatPromptTemplate, MessagesPlaceholder } from "@langchain/core/prompts";
import { createCaseAgentLLM } from "@/lib/llms/nebius";
import { createLegalTools } from "@/lib/tools/legal-tools";
import type { CaseBriefing } from "@/types/agents";

const SYSTEM_PROMPT = `You are defense counsel arguing for acquittal. You will receive the prosecution's argument — counter it directly. Use the tools to research legal background, request evidence, cite precedents, and challenge prosecution evidence. Build reasonable doubt. Call rest_case when you have finished your argument.`;

export function createDefendantAgent() {
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

export async function runDefendantTurn(
  caseBriefing: CaseBriefing,
  prosecutionArgument?: string,
  message?: string,
  turnNumber = 1
) {
  const prosecutionSection = prosecutionArgument
    ? `\n\nProsecution's argument (counter this):\n${prosecutionArgument}`
    : "";
  const input =
    message ??
    "Present your opening argument for acquittal and reasonable doubt.";
  const caseContext = `Case: ${caseBriefing.caseName}\nFacts: ${caseBriefing.facts}${prosecutionSection}\n\nYour task: ${input}`;

  const executor = createDefendantAgent();
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
