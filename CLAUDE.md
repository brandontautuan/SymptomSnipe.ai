# CaseSnipe.ai — CLAUDE.md

## Project Overview

A multi-agent legal reasoning game where two LangChain-powered AI agents interact: a **Case Agent** (Tavily-grounded, MiniMax-backed) presents real case facts scraped from the web, and a **Lawyer Agent** (Nebius open LLMs via Token Factory) autonomously reasons, requests evidence, builds arguments, and delivers a verdict. The game also doubles as a **live LLM benchmark** — swap any Nebius model in and watch how legal reasoning quality changes in real time.

## Architecture

```
Nebius Open LLMs (via Token Factory)
           ↓
  LangChain AgentExecutor
   /                   \
Case Agent             Lawyer Agent
(MiniMax +             (Nebius LLM +
 Tavily search)         Reasoning loop)
           ↓
  Tool calls: search, request evidence, lookup precedent, file motion
           ↓
  Hugging Face (fine-tuned legal reasoning model, optional)
```

### Game Flow
1. Pick/generate a real legal case or scenario
2. Tavily (as a LangChain tool) scrapes real case facts, rulings, and background
3. Case Agent presents facts to Lawyer via a LangChain `RunnableSequence`
4. Lawyer AgentExecutor autonomously decides next actions — request evidence, research precedent, file motions, build arguments
5. Case Agent responds using Tavily-grounded facts; MiniMax maintains full case history
6. Lawyer delivers a verdict and legal argument
7. Score calculated: penalize irrelevant evidence requests, reward reasoning quality and accuracy

### The Two Agents

**Case Agent**
- Uses **Tavily as a LangChain tool** for structured, real-world case fact retrieval
- Backed by **MiniMax** for long-context case history summarization
- System-prompted to present case facts naturally, like a briefing document
- Search format: `"[case/scenario] facts ruling legal background"`

**Lawyer Agent**
- Backed by **Nebius open LLMs** (routed via Token Factory / OpenRouter)
- Runs inside a **LangChain `AgentExecutor`** — fully agentic reasoning loop
- Autonomously decides its own next action at each step:
  - `tavily_search("Miranda rights precedent")` — research legal background
  - `request_evidence("surveillance footage")` — demand specific evidence
  - `lookup_precedent("Roe v Wade summary")` — retrieve relevant case law
  - `file_motion("motion to suppress")` — take a legal action
  - `deliver_verdict("guilty", argument)` — conclude with final ruling
- **LangChain conversation memory** keeps full case history in context
- LangChain **callbacks** provide real-time observability of tool calls

## Tech Stack

| Tool | Role |
|------|------|
| **LangChain** | AgentExecutor, tool binding, memory, RunnableSequence orchestration |
| **Nebius Open LLMs** | Lawyer agent backbone (via Token Factory / OpenRouter) |
| **MiniMax** | Long-context case history — Case agent summarization |
| **Tavily** | Case agent's web search for real facts, registered as a LangChain tool |
| **OpenRouter** | Model routing layer for Nebius model access |
| **React** | Frontend UI |
| **Hugging Face** | Optional: fine-tuned legal reasoning model with Oumi |
| **Oumi** | Fine-tune Lawyer agent on legal datasets |
| **Toloka HomER dataset** | Training data base (adapted for legal reasoning) |

## Frontend

React app with a **two-panel "courtroom terminal" UI**:
- **Left panel**: Case Agent ↔ Lawyer Agent exchange with live LangChain tool call stream
- **Right panel**: Evidence log, motions filed, and active model benchmark display

### Key UI Components
1. Two-panel layout with courtroom/legal terminal aesthetic
2. **LangChain streaming connector** — shows tool calls live as the Lawyer reasons
3. **Model switcher** — swap Nebius models mid-game; display Artificial Analysis-style benchmark stats (speed, argument quality, evidence efficiency)
4. Scoring display — shown at game end
5. API key config screen — input for OpenRouter + Tavily keys (for judges)
6. Game over / results screen — actual outcome, Lawyer's verdict, evidence requested, final score

## Backend / Agent Logic

### LangChain Orchestration Layer
- **`AgentExecutor`** drives the Lawyer's autonomous reasoning loop — no hardcoded turn-taking
- **`RunnableSequence`** handles the Case → Lawyer handoff cleanly
- **Callbacks** emit tool-call events to the frontend via streaming
- **ConversationBufferMemory** keeps the full dialogue in context for both agents

### Case Agent
- Initialized with Tavily registered as a LangChain tool
- MiniMax handles long-context compression of case history
- Formats real scraped case facts naturally as a legal briefing

### Lawyer Agent
- Powered by a Nebius open LLM loaded via Token Factory / OpenRouter
- Tool suite registered in LangChain (see Tools below)
- Requests evidence, researches precedent, files motions, and concludes with a verdict
- Must NOT receive the outcome — reasons purely from facts and evidence

### Lawyer Tool Suite (LangChain Tools)
| Tool | Description |
|------|-------------|
| `tavily_search` | Research legal background, statutes, or case context |
| `request_evidence` | Demand a specific piece of evidence → returns what's available |
| `lookup_precedent` | Retrieve relevant case law and prior rulings |
| `file_motion` | Submit a legal motion (suppress, dismiss, compel, etc.) |
| `deliver_verdict` | Submit final verdict and argument (ends the game loop) |

### Cases Bank
- 20–30 curated cases with difficulty tiers:
  - **Easy**: clear-cut theft, speeding violation, simple contract breach
  - **Medium**: self-defense claim, wrongful termination, DUI with contested evidence
  - **Hard**: corporate fraud, constitutional rights violation, complex civil litigation

### Evidence Simulator
- Called via the `request_evidence` LangChain tool
- Returns realistic evidence conditioned on the actual hidden case outcome

## Team Split

**Person 1 — Frontend & LangChain Orchestration**
| # | Task | Details |
|---|------|---------|
| 1 | Build the React UI | Two-panel layout: Case briefing left, Lawyer + evidence/motions right. Courtroom terminal aesthetic. |
| 2 | Set up LangChain `AgentExecutor` | Tool loop, memory, RunnableSequence for Case → Lawyer handoff |
| 3 | Wire LangChain streaming to UI | Show tool calls and reasoning steps live as the Lawyer works |
| 4 | Model switcher + benchmark UI | Swap Nebius models; display Artificial Analysis-style stats (speed, accuracy, evidence count) |
| 5 | Scoring + game over screen | Show actual outcome, Lawyer's verdict, motions filed, final score |

**Person 2 — Tools, Agents & Data Pipeline**
| # | Task | Details |
|---|------|---------|
| 1 | Case agent | System prompt + Tavily as LangChain tool; MiniMax for case history |
| 2 | Lawyer tool suite | Implement `request_evidence`, `lookup_precedent`, `file_motion`, `deliver_verdict` as LangChain tools |
| 3 | Nebius Token Factory integration | Wire Nebius open LLMs via OpenRouter into LangChain's LLM interface |
| 4 | MiniMax integration | Extended case history summarization for long sessions |
| 5 | Cases bank + evidence simulator | 20–30 cases, realistic evidence per case outcome |

**Shared**
- Wire Person 2's agent functions into Person 1's AgentExecutor / game loop
- Prompt tuning — iterate system prompts until the game feels natural and the Lawyer reasons well
- Demo polish — pick 3 showcase cases (one easy, one medium, one hard) for the pitch

## Hackathon Timeline

| Time | Milestone |
|------|-----------|
| Hour 1–2 | Person 1: UI skeleton · Person 2: Tavily LangChain tool + Case agent working |
| Hour 3–4 | Person 1: AgentExecutor + streaming · Person 2: Lawyer tools + evidence simulator |
| Hour 5 | Integration — wire agents into UI, validate full game loop |
| Hour 6 | Model switcher, scoring, benchmark display, demo case polish |
| Final 30 min | Practice pitch, fix bugs |

## Pitch Angle

> *"CaseSnipe is a multi-agent legal reasoning game built on LangChain + Nebius open LLMs. The Lawyer agent autonomously plans, requests evidence, argues motions, and delivers verdicts — while the Case agent uses Tavily to ground facts in real web data. It's also a live benchmark: swap any Nebius model in and watch how legal reasoning quality changes in real time."*

Hits: **agentic pipelines · real-world utility · open LLMs · Artificial Analysis benchmarking**

## Development Notes

- Keep API keys out of source — use environment variables or the in-app config screen
- The Lawyer agent must NOT receive the case outcome — it reasons from facts and evidence only
- Score penalizes: irrelevant `request_evidence` calls, incorrect final verdict
- Score rewards: correct verdict, stronger argument quality, fewer tools used, faster resolution
- LangChain callbacks are the observability layer — log every tool call for scoring and the UI stream
- Aim for 3 polished demo cases: one easy (clear-cut theft), one medium (self-defense), one hard (corporate fraud)
