#!/usr/bin/env node
// Build script — packages extension into .xpi file

const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

const version = JSON.parse(fs.readFileSync("manifest.json", "utf8")).version;
const outputName = `karakeep-search-${version}.xpi`;

// Files to include in the package
const include = [
  "manifest.json",
  "background.js",
  "LICENSE",
  "README.md",
  "content/**/*",
  "icons/**/*",
  "options/**/*",
  "src/**/*.js",
];

// Exclude test files
const exclude = ["**/*.test.js"];

console.log(`Building ${outputName}...`);

try {
  // Create zip using system command (works on macOS/Linux)
  // Build include patterns for zip command
  const includeArgs = include
    .map((pattern) => {
      if (pattern.endsWith("/**/*")) {
        const dir = pattern.replace("/**/*", "");
        return `-r "${dir}"`;
      }
      if (pattern.endsWith("/**/*.js")) {
        const dir = pattern.replace("/**/*.js", "");
        return `-r "${dir}" -x "*.test.js"`;
      }
      return `"${pattern}"`;
    })
    .join(" ");

  // Build the zip command
  const zipCmd = `zip -r "${outputName}" ${includeArgs} -x "*.test.js" "node_modules/*" ".git/*" ".claude/*" "plan/*" "scripts/*" "package*.json" ".gitignore" "*.xpi"`;

  execSync(zipCmd, { stdio: "inherit" });

  console.log(`\n✓ Built: ${outputName}`);
  console.log(`  Size: ${(fs.statSync(outputName).size / 1024).toFixed(1)} KB`);
} catch (err) {
  console.error("Build failed:", err.message);
  process.exit(1);
}
