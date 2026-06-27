# Projekt-Gerüst (token-arm, projektneutral)

Dieses Repo ist ein wiederverwendbares Claude-Code-Setup. Projektspezifische Inhalte
(Stack, Befehle, Domain-Regeln) trägst du selbst in `CLAUDE.md` nach.

## Was installiert ist (Scope: Project, lokal in diesem Ordner)

| Was | Wo | Zweck |
|---|---|---|
| `.claude/skills/token-lean/` | project skill | Token-/Context-Disziplin |
| `.claude/settings.json` | project | Secrets-Deny + Bash-Guard-Hook + Format-Hook |
| `.claude/hooks/bash-guard.js` | project | Blockt destruktive Bash-Befehle (Exit 2) |
| `.claude/hooks/format-on-write.js` | project | Formatiert geschriebene Dateien best-effort (kein Auto-Install) |
| `.claude/commands/{plan,review,deploy}.md` | project | Neutrale Slash-Commands |
| `.claude/agents/reviewer.md` | project | Review-Subagent mit frischem Kontext |
| `.mcp.json` → `headroom` | project | Headroom MCP-Server (Docker, nur Claude Code) |

**Headroom — installiert (Docker, Claude-Code-only):**
- Image: `ghcr.io/chopratejas/headroom:latest` (787MB, lokal gepullt)
- Proxy-Container `headroom-proxy` läuft dauerhaft (`--restart unless-stopped`),
  Port `8787`, Health-Check: `curl http://127.0.0.1:8787/health`
- MCP-Server in `.mcp.json` registriert (`headroom_compress/retrieve/stats` Tools)
- Für volle automatische Kompression zusätzlich beim Claude-Start setzen:
  `ANTHROPIC_BASE_URL=http://127.0.0.1:8787 claude`
- Stoppen: `docker stop headroom-proxy` · Entfernen: `docker rm -f headroom-proxy`
- Kein lokaler Rust-Build nötig (pip-Install schlägt auf Windows ohne Cargo fehl —
  daher Docker-Weg statt `pip install headroom-ai`)
- **Status: ungetestet, funktioniert aktuell nicht** — Proxy läuft healthy, aber `ANTHROPIC_BASE_URL`
  + Abo-Login (OAuth) wurde noch nicht erfolgreich durchgetestet. Vor Nutzung selbst verifizieren:
  in eigenem Terminal `ANTHROPIC_BASE_URL=http://127.0.0.1:8787 claude` starten und prüfen ob normale
  Antwort kommt statt Auth-Fehler.

**Noch nicht installiert** (bei Bedarf nachziehen):
- GitHub-MCP / Context7 (nur mit explizitem OK, da Kontextkosten)

**andrej-karpathy-skills — installiert** (Plugin, scope: user, global aktiv)
**caveman — installiert** (Plugin, aktiv genutzt, Modi `lite|full|ultra`)

**graphify — installiert** (global, kein projekt-lokales `.venv`, Paket `graphifyy` 0.8.49, CLI `graphify`):
- Run: `graphify install --platform claude` um Skill in Claude Code zu registrieren
- Graph bauen erst sinnvoll, wenn echter Code im Repo liegt

## Wie entfernen / deaktivieren

- Hooks/Guardrails abschalten: `.claude/settings.json` löschen oder Hook-Einträge entfernen.
- Skill abschalten: `.claude/skills/token-lean/` löschen.
- Alles lokal, nichts global — Löschen des Ordners entfernt das komplette Setup.

## Die 3 Spar-Habits

1. **`/compact`** nach Abschluss einer Phase/Aufgabe — Kontext komprimieren.
2. **`/clear`** zwischen unabhängigen Aufgaben — alten Kontext nicht mitschleppen.
3. **Plan Mode** für nicht-triviale Arbeit — erst Plan zeigen, dann ausführen.

## Projektspezifisches nachtragen

Folgendes ist bewusst offen (Platzhalter in `CLAUDE.md`):
- Was das Projekt tut, Stack, Run/Test/Lint-Befehle
- Domain-Regeln in den Guardrails
- Inhalte in `docs/`, `knowledge-base/`, `src/<modul>/CLAUDE.md`
