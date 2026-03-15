/**
 * CaseSnipe.ai - API key status
 * GET /api/config/status
 * Returns which keys are configured (never returns key values).
 */

import { NextResponse } from "next/server";

function hasKey(key: string | undefined): boolean {
  return typeof key === "string" && key.trim().length > 0;
}

export async function GET() {
  const openRouter = hasKey(process.env.OPENROUTER_API_KEY);
  const tavily = hasKey(process.env.TAVILY_API_KEY);
  const nebius = hasKey(process.env.NEBIUS_API_KEY);

  return NextResponse.json({
    openRouter,
    tavily,
    nebius,
  });
}
