# CLAUDE.md — <PROJECT NAME>

> Keep this file short (< ~200 lines). It loads on every turn. Put long detail in
> `references/*.md` and link to it. Replace every <PLACEHOLDER> below, then delete
> this quote block.

## What this project is
<One or two sentences. What it does, who it's for.>

## Stack & key commands
- Language / runtime: <e.g. Python 3.12>
- Install: `<e.g. uv sync  /  pip install -r requirements.txt>`
- Run: `<e.g. python -m src.main>`
- Test: `<e.g. pytest -q>`
- Lint/format: `<e.g. ruff check . && ruff format .>`

## Layout
- `src/` — <your modules>
- `references/` — extra docs the agent reads on demand

## How I want you to work (project rules)
- **Be terse in prose, exact in code.** Drop filler; keep code/commands/paths exact.
- **Scope your reads.** Touch only the files needed; don't re-read what's in context.
- **Ask before**: installing anything, adding a dependency, setting up API keys,
  or network calls that cost money/limits.
- **Token discipline is active** — follow the `token-lean` skill in `.claude/skills/`.

## Guardrails
- Never read or print secrets. Keys live in `.env` (gitignored) and are denied in
  `.claude/settings.json`. Never write a real key into any file.
- <Optional: hard domain rule for this project, if any — fill per project>

## Behavior layer (Karpathy plugin)
Core coding behavior (state assumptions, simplicity, surgical edits, goal-driven
execution) comes from the installed `andrej-karpathy-skills` plugin — not duplicated
here. This file is the project-specific layer on top of it.
