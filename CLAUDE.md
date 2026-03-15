# CaseSnipe.ai — CLAUDE.md

## Project Overview

A multi-agent courtroom simulation where three LangChain-powered AI agents go head-to-head: a **Prosecutor Agent** and a **Defendant Agent** (both Nebius open LLMs via Token Factory) autonomously argue opposing sides using real scraped case facts and a RAG-powered precedent engine, while a **Judge Agent** listens to both and delivers the final verdict. The game doubles as a **live LLM benchmark** — swap any Nebius model into any role and watch reasoning quality change in real time.

## Architecture

```
Nebius Open LLMs (via Token Factory)
              ↓
     LangChain AgentExecutor
    /           |            \
Case Agent  Prosecutor     Defendant
(MiniMax +  Agent          Agent
 Tavily)    (Nebius LLM +  (Nebius LLM +
             Tools)         Tools)
                  \        /
                 Judge Agent
                 (Nebius LLM)
                      ↓
                Final Verdict
                      ↓
         Hugging Face RAG (legal_case_document_summarization)
         FAISS vector store over 8k case summaries
```

### Game Flow
1. Pick/generate a real legal case or scenario
2. Tavily (as a LangChain tool) scrapes real case facts, rulings, and background
3. Case Agent briefs both sides via a LangChain `RunnableSequence`
4. **Prosecution turn**: Prosecutor AgentExecutor argues for conviction — requests evidence, cites precedents, files motions
5. **Defense turn**: Defendant AgentExecutor argues for acquittal — counters evidence, cites precedents, files motions
6. Turns alternate until both sides rest
7. **Judge** receives the full transcript and delivers a reasoned verdict
8. Score calculated: penalize weak arguments and irrelevant evidence, reward reasoning quality and accuracy

### The Four Agents

**Case Agent**
- Uses **Tavily as a LangChain tool** for structured, real-world case fact retrieval
- Backed by **MiniMax** for long-context case history summarization
- System-prompted to present facts neutrally as a court briefing document
- Search format: `"[case/scenario] facts ruling legal background"`

**Prosecutor Agent**
- Backed by **Nebius open LLMs** (routed via Token Factory / OpenRouter)
- Runs inside a **LangChain `AgentExecutor`** — fully agentic reasoning loop
- Autonomously decides next actions each turn:
  - `tavily_search("assault statute definition")` — research legal background
  - `request_evidence("surveillance footage")` — demand specific evidence
  - `lookup_precedent("People v Simpson")` — semantic search over 8k real case summaries (RAG/FAISS)
  - `file_motion("motion to admit prior convictions")` — take a legal action
  - `rest_case()` — conclude prosecution argument

**Defendant Agent**
- Same tool suite and AgentExecutor setup as Prosecutor
- System-prompted as defense counsel — argues reasonable doubt, challenges evidence
- Autonomously counters prosecution moves, cites exculpatory precedents
- Can call `cross_examine(evidence)` to challenge prosecution evidence

**Judge Agent**
- Receives full trial transcript (both sides' arguments, evidence, motions)
- Powered by a Nebius open LLM — no tools needed, pure reasoning chain
- Weighs arguments, applies legal standards, and delivers a structured verdict
- Outputs: ruling (guilty/not guilty/civil liability), reasoning, and sentencing/damages if applicable

## Tech Stack

| Tool | Role |
|------|------|
| **LangChain** | AgentExecutor, tool binding, memory, RunnableSequence orchestration |
| **Nebius Open LLMs** | Prosecutor, Defendant, and Judge agent backbones (via Token Factory / OpenRouter) |
| **MiniMax** | Long-context case history — Case agent summarization across long trials |
| **Tavily** | Case agent's web search for real facts, registered as a LangChain tool |
| **OpenRouter** | Model routing layer for Nebius model access |
| **Hugging Face** | `joelniklaus/legal_case_document_summarization` — 8k real case summaries for RAG |
| **FAISS** | Local vector store for semantic precedent search |
| **React** | Frontend UI |
| **Oumi** | Optional: fine-tune an agent on the legal dataset |

## RAG Precedent Engine

The `lookup_precedent` tool is backed by a **FAISS vector store** built from the `joelniklaus/legal_case_document_summarization` dataset (~8k Indian court case summaries).

### How It Works
1. Load dataset via `datasets` library → embed the `summary` field
2. Store embeddings in a local FAISS index at startup
3. When either agent calls `lookup_precedent("self-defense reasonable force")`:
   - Semantic search returns top 3 most relevant case summaries
   - Agent cites specific real cases in its argument
4. Judge sees the same precedents when weighing the verdict

### Why Summaries, Not Full Judgments
- Full judgments run up to 808k characters — too large for context
- Summaries (avg ~2k chars) are dense and retrieval-friendly
- Enough detail for the agent to cite facts, rulings, and legal reasoning

## Frontend

React app with a **three-panel courtroom UI**:
- **Left panel**: Prosecution argument log with live tool call stream
- **Center panel**: Judge's bench — running transcript, motions filed, evidence admitted
- **Right panel**: Defense argument log with live tool call stream

### Key UI Components
1. Three-panel courtroom layout with legal terminal aesthetic
2. **LangChain streaming connector** — shows tool calls live as each agent reasons
3. **Model switcher** — independently swap Nebius models for Prosecutor, Defendant, and Judge; display Artificial Analysis-style benchmark stats per role
4. Evidence and motions log — updated live as agents act
5. API key config screen — input for OpenRouter + Tavily keys (for judges)
6. Game over / results screen — Judge's verdict, both sides' arguments, final score

## Backend / Agent Logic

### LangChain Orchestration Layer
- **`AgentExecutor`** drives both Prosecutor and Defendant autonomous reasoning loops
- **`RunnableSequence`** manages turn order: Case briefing → Prosecution → Defense → (repeat) → Judge
- **Callbacks** emit tool-call events to the frontend via streaming
- **ConversationBufferMemory** keeps the full trial transcript in context for all agents

### Case Agent
- Initialized with Tavily registered as a LangChain tool
- MiniMax handles long-context compression of trial history
- Presents facts neutrally — does not favor prosecution or defense

### Prosecutor & Defendant Agents
- Both powered by Nebius open LLMs (can use different models per role)
- Shared tool suite registered in LangChain
- Each maintains its own AgentExecutor with role-specific system prompt
- Neither receives the hidden "correct" outcome — must reason from evidence

### Judge Agent
- Simple LangChain `LLMChain` — no tools, pure reasoning
- Receives the full formatted trial transcript as context
- Outputs structured verdict: ruling + legal reasoning + sentence/damages

### Shared Tool Suite (LangChain Tools — available to Prosecutor & Defendant)
| Tool | Description |
|------|-------------|
| `tavily_search` | Research legal background, statutes, or case context |
| `request_evidence` | Request a specific piece of evidence → returns what's available |
| `lookup_precedent` | RAG semantic search over 8k real case summaries (FAISS) |
| `file_motion` | Submit a legal motion (suppress, dismiss, compel, etc.) |
| `cross_examine` | Challenge a specific piece of evidence or testimony |
| `rest_case` | Signal end of argument turn |

### Cases Bank
- 20–30 curated cases with difficulty tiers:
  - **Easy**: clear-cut theft, simple assault, contract breach
  - **Medium**: self-defense claim, wrongful termination, DUI with contested evidence
  - **Hard**: corporate fraud, constitutional rights violation, complex civil litigation

### Evidence Simulator
- Called via `request_evidence` LangChain tool
- Returns realistic evidence conditioned on the actual hidden case outcome
- Evidence can cut both ways — some favors prosecution, some defense

## Team Split

**Person 1 — Frontend & LangChain Orchestration**
| # | Task | Details |
|---|------|---------|
| 1 | Build the React UI | Three-panel courtroom layout: Prosecution left, Judge center, Defense right |
| 2 | Set up LangChain `AgentExecutor` for both sides | Tool loop, memory, turn-taking RunnableSequence |
| 3 | Wire LangChain streaming to UI | Show tool calls live per agent as they reason |
| 4 | Model switcher + benchmark UI | Independently swap Nebius models per role; Artificial Analysis-style stats |
| 5 | Scoring + game over screen | Judge's verdict, both arguments, motions filed, final score |

**Person 2 — Tools, Agents & Data Pipeline**
| # | Task | Details |
|---|------|---------|
| 1 | Case agent | System prompt + Tavily as LangChain tool; MiniMax for trial history |
| 2 | Prosecutor + Defendant agents | Opposing system prompts, shared tool suite as LangChain tools |
| 3 | Judge agent | LLMChain with full transcript input → structured verdict output |
| 4 | RAG precedent engine | Load `joelniklaus/legal_case_document_summarization`, embed summaries, FAISS index, wire to `lookup_precedent` tool |
| 5 | Cases bank + evidence simulator | 20–30 cases, realistic evidence per case outcome |

**Shared**
- Wire Person 2's agent functions into Person 1's turn-taking game loop
- Prompt tuning — iterate until Prosecutor and Defendant feel genuinely adversarial
- Demo polish — pick 3 showcase cases (one easy, one medium, one hard) for the pitch

## Hackathon Timeline

| Time | Milestone |
|------|-----------|
| Hour 1–2 | Person 1: UI skeleton · Person 2: Tavily + Case agent + RAG index built |
| Hour 3–4 | Person 1: AgentExecutor + streaming · Person 2: Prosecutor, Defendant, Judge agents + evidence simulator |
| Hour 5 | Integration — wire all agents into UI, validate full trial loop |
| Hour 6 | Model switcher, scoring, benchmark display, demo case polish |
| Final 30 min | Practice pitch, fix bugs |

## Pitch Angle

> *"CaseSnipe is a multi-agent courtroom simulation built on LangChain + Nebius open LLMs. A Prosecutor and Defendant autonomously argue opposing sides — requesting evidence, citing real case precedents via RAG, and filing motions — while a Judge delivers the final verdict. Swap any Nebius model into any role and watch how reasoning quality changes in real time."*

Hits: **agentic pipelines · adversarial multi-agent · real-world legal data · open LLMs · Artificial Analysis benchmarking**

## Development Notes

- Keep API keys out of source — use environment variables or the in-app config screen
- Neither Prosecutor nor Defendant receives the hidden case outcome — both reason from evidence only
- Judge sees the full transcript but not the hidden outcome label
- Score penalizes: irrelevant evidence requests, weak/unsupported arguments
- Score rewards: correct verdict alignment, stronger cited reasoning, fewer wasted tool calls
- LangChain callbacks are the observability layer — log every tool call for scoring and the UI stream
- FAISS index should be pre-built at startup from the HuggingFace dataset — not rebuilt each game
- Aim for 3 polished demo cases: one easy (clear-cut theft), one medium (self-defense), one hard (corporate fraud)
