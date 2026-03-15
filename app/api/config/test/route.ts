/**
 * CaseSnipe.ai - Test API key connection
 * POST /api/config/test
 * Body: { key: "openRouter" | "tavily" | "nebius" }
 * Returns { success: boolean, error?: string }
 */

import { NextRequest, NextResponse } from "next/server";

type KeyType = "openRouter" | "tavily" | "nebius";

function getKey(keyType: KeyType): string | undefined {
  switch (keyType) {
    case "openRouter":
      return process.env.OPENROUTER_API_KEY?.trim();
    case "tavily":
      return process.env.TAVILY_API_KEY?.trim();
    case "nebius":
      return process.env.NEBIUS_API_KEY?.trim();
    default:
      return undefined;
  }
}

async function testOpenRouter(key: string): Promise<{ success: boolean; error?: string }> {
  try {
    const res = await fetch("https://openrouter.ai/api/v1/models", {
      headers: { Authorization: `Bearer ${key}` },
    });
    if (res.ok) return { success: true };
    return { success: false, error: `HTTP ${res.status}` };
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Connection failed";
    return { success: false, error: msg };
  }
}

async function testTavily(key: string): Promise<{ success: boolean; error?: string }> {
  try {
    const res = await fetch("https://api.tavily.com/search", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${key}`,
      },
      body: JSON.stringify({ query: "test", max_results: 1 }),
    });
    if (res.ok) return { success: true };
    return { success: false, error: `HTTP ${res.status}` };
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Connection failed";
    return { success: false, error: msg };
  }
}

async function testNebius(key: string): Promise<{ success: boolean; error?: string }> {
  try {
    const res = await fetch("https://api.tokenfactory.nebius.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${key}`,
      },
      body: JSON.stringify({
        model: "meta-llama/Meta-Llama-3.1-8B-Instruct-fast",
        messages: [{ role: "user", content: "hi" }],
        max_tokens: 1,
      }),
    });
    if (res.ok) return { success: true };
    return { success: false, error: `HTTP ${res.status}` };
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Connection failed";
    return { success: false, error: msg };
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const keyType = body?.key as KeyType | undefined;

    if (!keyType || !["openRouter", "tavily", "nebius"].includes(keyType)) {
      return NextResponse.json(
        { success: false, error: "Invalid key type" },
        { status: 400 }
      );
    }

    const key = getKey(keyType);
    if (!key) {
      return NextResponse.json({ success: false, error: "Key not configured" });
    }

    let result: { success: boolean; error?: string };
    switch (keyType) {
      case "openRouter":
        result = await testOpenRouter(key);
        break;
      case "tavily":
        result = await testTavily(key);
        break;
      case "nebius":
        result = await testNebius(key);
        break;
      default:
        result = { success: false, error: "Unknown key type" };
    }

    return NextResponse.json(result);
  } catch {
    return NextResponse.json(
      { success: false, error: "Request failed" },
      { status: 500 }
    );
  }
}
