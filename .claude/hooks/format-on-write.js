#!/usr/bin/env node
// PostToolUse hook for Write|Edit: best-effort formatting of the touched file
// using a formatter that is already installed locally. Never installs anything,
// never fails the tool call — formatting is a nice-to-have, not a gate.
const { execFileSync } = require("child_process");
const path = require("path");
const fs = require("fs");

let input = "";
process.stdin.on("data", (d) => (input += d));
process.stdin.on("end", () => {
  let filePath = "";
  try {
    const payload = JSON.parse(input || "{}");
    filePath = payload.tool_input?.file_path || "";
  } catch {
    process.exit(0);
  }
  if (!filePath || !fs.existsSync(filePath)) process.exit(0);

  const ext = path.extname(filePath).toLowerCase();
  const bin = (name) =>
    path.join(
      "node_modules",
      ".bin",
      process.platform === "win32" ? `${name}.cmd` : name
    );

  const tryRun = (cmd, args) => {
    try {
      execFileSync(cmd, args, { stdio: "ignore" });
    } catch {
      // formatter missing or failed — silently skip, don't block the agent
    }
  };

  if ([".js", ".jsx", ".ts", ".tsx", ".json", ".md", ".css", ".html"].includes(ext)) {
    if (fs.existsSync(bin("prettier"))) tryRun(bin("prettier"), ["--write", filePath]);
  } else if (ext === ".py") {
    tryRun("ruff", ["format", filePath]);
  } else if (ext === ".go") {
    tryRun("gofmt", ["-w", filePath]);
  }
  process.exit(0);
});
