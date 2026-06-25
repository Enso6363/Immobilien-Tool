---
name: token-lean
description: >-
  Keep this project's token and context usage low without sacrificing output
  quality. Use this skill whenever the user mentions token usage, context
  window, "context rot", API cost, hitting usage limits, "keep it lean",
  compaction, or is setting up / bootstrapping a new project and wants an
  efficient baseline. Also apply proactively at the start of any long,
  command-heavy, or data-heavy session (data analysis, large codebases,
  repeated test/log output) even if the user does not say the word "token".
  Prefer built-in, zero-dependency moves first; only suggest external tools
  when they clearly earn their keep, and always ask before installing anything.
---

# Token-Lean Operating Mode

Goal: spend the fewest tokens for the same answer. Less noise in context = better
reasoning, longer sessions, lower cost. Order of operations matters — cheap
built-in habits first, external tools only when measured friction justifies them.

## Golden rule

Measure first, then add **one** thing at a time. Never bolt on five token tools at
once — that is its own form of over-engineering. Most wins come from Stage 0, which
costs nothing and adds no third-party code.

## Stage 0 — Built-in habits (always on, zero dependencies)

Do these by default in every session:

- **Keep CLAUDE.md short** (< ~200 lines). It loads on every turn; bloat here is
  paid repeatedly. Put deep detail in `references/` files and link to them.
- **Scope context to the task.** Read only the files needed. Prefer targeted
  `grep`/`glob` over reading whole directories. Don't re-read files already in context.
- **Compact at phase boundaries.** After finishing a chunk of work, suggest
  `/compact`. Between unrelated tasks, suggest `/clear` to drop stale context.
- **Plan before non-trivial work.** Use plan mode / outline the steps so the model
  doesn't explore-and-backtrack (which burns tokens).
- **Only load MCP servers you need this session.** Each server's tool schemas cost
  input tokens every turn. Unused server = pure overhead.
- **Be terse in prose, exact in code.** Drop filler ("I'd be happy to…", "Let me
  summarize…"). Keep code, commands, paths, and error strings byte-exact.
- **Write less code.** Apply YAGNI: simplest thing that works, no speculative
  abstractions. Less code generated now = fewer tokens read back later.
- **gitignore build artifacts**; **deny secrets** via settings.json (see project root).

If the user is still happy after Stage 0, stop here. Do not add tools "just in case".

## Stage 1 — Compress command & tool output (add when command/data-heavy)

Trigger: sessions that run many shell commands, test runners, or produce large
logs / JSON (e.g. data analysis). The noise from these is the #1 context filler.

Pick **one**:

- **Headroom** (`chopratejas/headroom`) — broader: compresses tool outputs, logs,
  files, RAG chunks; reversible (originals kept locally, retrievable on demand);
  runs as library, proxy, or MCP. Bundles RTK internally for shell output.
  → Best default if you only add one tool.
- **RTK** (`rtk-ai/rtk`) — lighter: a CLI proxy that compresses outputs of 100+ dev
  commands via a Bash hook. Note: only intercepts the **Bash** tool, not built-in
  Read/Grep/Glob. On Cargo, install the git version (name clash with "Rust Type Kit").

Always ask the user before installing, install project-scoped, and review the repo
first (third-party code runs with your privileges).

## Stage 2 — Shorter responses (optional)

If the user wants the agent itself to talk less:

- **Caveman** (`JuliusBrussee/caveman`) — forces terse "telegram" replies; cuts
  output tokens (~65% avg), not reasoning tokens. Best for coding chatter; nuanced
  explanations still need full prose.
- This overlaps heavily with the Stage 0 "be terse / write less code" rule. If the
  CLAUDE.md discipline already feels good, skip this — don't duplicate it.

## Stage 3 — Query a graph instead of loading files (when the codebase grows)

Trigger: the project is large enough that reading raw files per question is wasteful.

- **Graphify** (`safishamsi/graphify`, PyPI `graphifyy`) — builds a queryable
  knowledge graph of the codebase so the agent traverses nodes instead of reading
  whole files (claims ~70x fewer tokens per query). Worth it once the repo is big;
  pointless on an empty/new repo.

## Security (applies to every external tool)

- Treat any marketplace/skill/MCP as untrusted code until reviewed — it runs with
  your privileges. Pin versions; avoid `@latest` for anything that executes.
- `.gitignore` and `.claudeignore` are **not** reliable secret boundaries — agents
  can still read ignored files when asked. The only safe move: never put real
  secrets where the agent runs. Use env vars + `permissions.deny`.

## Quick decision checklist

1. Did I apply all of Stage 0? (usually enough)
2. Is this session command/data-heavy? → consider Stage 1 (Headroom).
3. Does the user want the agent itself terser? → Stage 2 (optional).
4. Is the codebase now large? → Stage 3 (Graphify).
5. Before installing anything: ask, scope to project, review, pin version.
