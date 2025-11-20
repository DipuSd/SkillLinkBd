#!/usr/bin/env node

/**
 * Cross-platform script to start both frontend and backend servers
 * Works on Windows, macOS, and Linux
 */

const { spawn } = require("child_process");
const path = require("path");
const os = require("os");

const isWindows = os.platform() === "win32";
const isPowerShell = process.env.SHELL === undefined || process.env.SHELL.includes("powershell");

console.log("🚀 Starting SkillLinkBD Development Servers...\n");

// Colors for terminal output
const colors = {
  reset: "\x1b[0m",
  bright: "\x1b[1m",
  cyan: "\x1b[36m",
  yellow: "\x1b[33m",
  green: "\x1b[32m",
  red: "\x1b[31m",
};

function colorize(text, color) {
  return `${color}${text}${colors.reset}`;
}

// Frontend server
const frontendProcess = spawn(
  isWindows ? "npm.cmd" : "npm",
  ["run", "dev"],
  {
    cwd: process.cwd(),
    stdio: "pipe",
    shell: isWindows,
    env: { ...process.env, FORCE_COLOR: "1" },
  }
);

// Backend server
const serverProcess = spawn(
  isWindows ? "npm.cmd" : "npm",
  ["run", "dev"],
  {
    cwd: path.join(process.cwd(), "server"),
    stdio: "pipe",
    shell: isWindows,
    env: { ...process.env, FORCE_COLOR: "1" },
  }
);

// Handle frontend output
frontendProcess.stdout.on("data", (data) => {
  const output = data.toString();
  process.stdout.write(colorize("[FRONTEND] ", colors.cyan) + output);
});

frontendProcess.stderr.on("data", (data) => {
  const output = data.toString();
  process.stderr.write(colorize("[FRONTEND] ", colors.cyan) + output);
});

// Handle backend output
serverProcess.stdout.on("data", (data) => {
  const output = data.toString();
  process.stdout.write(colorize("[SERVER] ", colors.yellow) + output);
});

serverProcess.stderr.on("data", (data) => {
  const output = data.toString();
  process.stderr.write(colorize("[SERVER] ", colors.yellow) + output);
});

// Handle process exit
function cleanup() {
  console.log("\n\n" + colorize("🛑 Shutting down servers...", colors.bright));
  frontendProcess.kill();
  serverProcess.kill();
  process.exit(0);
}

process.on("SIGINT", cleanup);
process.on("SIGTERM", cleanup);

// Handle process errors
frontendProcess.on("error", (error) => {
  console.error(colorize("❌ Frontend error:", colors.red), error);
});

serverProcess.on("error", (error) => {
  console.error(colorize("❌ Server error:", colors.red), error);
});

frontendProcess.on("exit", (code) => {
  if (code !== 0 && code !== null) {
    console.error(colorize(`\n❌ Frontend exited with code ${code}`, colors.red));
  }
});

serverProcess.on("exit", (code) => {
  if (code !== 0 && code !== null) {
    console.error(colorize(`\n❌ Server exited with code ${code}`, colors.red));
  }
});

console.log(colorize("✅ Frontend server starting on http://localhost:5173", colors.green));
console.log(colorize("✅ Backend server starting on http://localhost:4000", colors.green));
console.log(colorize("\n📝 Press Ctrl+C to stop both servers\n", colors.bright));

