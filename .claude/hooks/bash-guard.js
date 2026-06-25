#!/usr/bin/env node
// PreToolUse guard for the Bash tool: blocks obviously destructive commands.
// Exit 2 = block (stderr shown to the model); exit 0 = allow.
const DANGEROUS = [
  /\brm\s+-rf\s+(\/|~|\.\.?\/?\s*$)/i,
  /\bgit\s+push\s+.*(--force|-f)\b/i,
  /\bgit\s+reset\s+--hard\b/i,
  /\bgit\s+clean\s+-[a-z]*f/i,
  /\bgit\s+branch\s+-D\b/i,
  /\bmkfs\b/i,
  /\bdd\s+if=.*of=\/dev\//i,
  /\bchmod\s+-R\s+777\s+\//i,
  /\bformat\s+[a-z]:/i,
  /\bDROP\s+(TABLE|DATABASE)\b/i,
  /\bTRUNCATE\s+TABLE\b/i,
  /curl[^|]*\|\s*(sh|bash)\b/i,
  /wget[^|]*\|\s*(sh|bash)\b/i,
  /--no-verify\b/i,
  /--no-gpg-sign\b/i,
];

let input = "";
process.stdin.on("data", (d) => (input += d));
process.stdin.on("end", () => {
  let command = "";
  try {
    const payload = JSON.parse(input || "{}");
    command = payload.tool_input?.command || "";
  } catch {
    process.exit(0); // fail open on parse errors — don't block on our own bug
  }
  const hit = DANGEROUS.find((re) => re.test(command));
  if (hit) {
    process.stderr.write(
      `bash-guard: blocked potentially destructive command (matched ${hit}).\n` +
        `If this is intentional, ask the user to run it manually.\n`
    );
    process.exit(2);
  }
  process.exit(0);
});
