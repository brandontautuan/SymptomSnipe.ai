/**
 * CaseSnipe.ai - Case Agent API
 * POST /api/agents/case
 * Body: { caseName?: string; scenario?: string }
 */

import { NextRequest, NextResponse } from "next/server";
import { createCaseAgent } from "@/lib/agents/case-agent";
import { getConfig } from "@/lib/config";

export async function POST(request: NextRequest) {
  try {
    getConfig();
  } catch (err) {
    const message = err instanceof Error ? err.message : "Missing API keys";
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }

  try {
    const body = await request.json();
    const caseName = body.caseName ?? body.scenario;
    if (!caseName || typeof caseName !== "string") {
      return NextResponse.json(
        { error: "Missing caseName or scenario in request body" },
        { status: 400 }
      );
    }

    const agent = createCaseAgent();
    const briefing = await agent.invoke({ caseName });

    return NextResponse.json({ briefing });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
