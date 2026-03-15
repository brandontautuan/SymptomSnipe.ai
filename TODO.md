# CaseSnipe.ai — Big Picture TODO

Based on [CLAUDE.md](./CLAUDE.md). Check off items as they're completed.

---

## Backend — Agents & Tools

- [x] **Case Agent** — Tavily search + LLM, neutral court briefing
- [x] **Prosecutor Agent** — AgentExecutor, shared tools, argues for conviction
- [x] **Defendant Agent** — AgentExecutor, shared tools, argues for acquittal
- [x] **Judge Agent** — LLMChain, full transcript → structured verdict (ruling, reasoning, confidence)
- [x] **tavily_search** — Real web search for legal research
- [ ] **lookup_precedent** — RAG over 8k case summaries (currently stub)
- [ ] **request_evidence** — Evidence simulator (currently stub)
- [x] **file_motion, cross_examine, rest_case** — Legal action tools

---

## Backend — Data & Orchestration

- [ ] **RAG precedent engine** — HuggingFace dataset, FAISS index, wire to `lookup_precedent`
- [ ] **Cases bank** — 20–30 curated cases (easy / medium / hard tiers)
- [ ] **Evidence simulator** — Realistic evidence per case outcome for `request_evidence`
- [ ] **Turn-taking orchestration** — RunnableSequence: Case → Prosecution → Defense → (repeat) → Judge
- [ ] **ConversationBufferMemory** — Full trial transcript in context for all agents

---

## Frontend

- [ ] **Three-panel courtroom UI** — Prosecution left, Judge center, Defense right
- [ ] **LangChain streaming connector** — Tool calls live as each agent reasons
- [ ] **Model switcher** — Swap Nebius models per role
- [ ] **Benchmark UI** — Artificial Analysis-style stats per role
- [ ] **Evidence & motions log** — Updated live as agents act
- [ ] **API key config screen** — Input for OpenRouter + Tavily (and other keys)
- [ ] **Game over / results screen** — Verdict, both arguments, motions filed, final score

---

## Integration & Polish

- [ ] **Wire backend into frontend** — Full trial loop from UI
- [ ] **Scoring logic** — Penalize weak arguments, reward reasoning quality
- [ ] **Prompt tuning** — Prosecutor and Defendant feel genuinely adversarial
- [ ] **Demo polish** — 3 showcase cases: easy, medium, hard

---

## Notes

- **LLM**: Case, Prosecutor, Defendant, and Judge use Nebius (via Token Factory) or OpenRouter fallback
- **RAG**: Optional for demo; Tavily covers research; RAG adds real precedent citations
- **Evidence simulator**: Needed for full fidelity; stub works for basic demo
