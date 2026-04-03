#!/usr/bin/env node
/**
 * sync-share.mjs
 * Syncs src/ → mcp_share/src/ and aligns package versions.
 * Usage: node scripts/sync-share.mjs
 */

import { readFileSync, writeFileSync, copyFileSync, mkdirSync, readdirSync, statSync } from 'fs';
import { join, relative, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const SRC = join(ROOT, 'src');
const SHARE_SRC = join(ROOT, 'mcp_share', 'src');
const SHARE_MCP_JSON = join(ROOT, 'mcp_share', '.mcp.json');

// ──────────────────────────────────────────────
// 1. Read version from root package.json
// ──────────────────────────────────────────────
const rootPkg = JSON.parse(readFileSync(join(ROOT, 'package.json'), 'utf8'));
const version = rootPkg.version;
console.log(`\n📦 Syncing to version ${version}...\n`);

// ──────────────────────────────────────────────
// 2. Copy src/ → mcp_share/src/ recursively
// ──────────────────────────────────────────────
function copyDir(src, dest) {
  mkdirSync(dest, { recursive: true });
  const entries = readdirSync(src, { withFileTypes: true });
  let fileCount = 0;

  for (const entry of entries) {
    const srcPath = join(src, entry.name);
    const destPath = join(dest, entry.name);

    if (entry.isDirectory()) {
      fileCount += copyDir(srcPath, destPath);
    } else {
      copyFileSync(srcPath, destPath);
      fileCount++;
    }
  }
  return fileCount;
}

const filesCopied = copyDir(SRC, SHARE_SRC);
console.log(`✅ Copied ${filesCopied} files from src/ → mcp_share/src/`);

// ──────────────────────────────────────────────
// 3. Update version in mcp_share/package.json
// ──────────────────────────────────────────────
const sharePkgPath = join(ROOT, 'mcp_share', 'package.json');
const sharePkg = JSON.parse(readFileSync(sharePkgPath, 'utf8'));
const oldShareVersion = sharePkg.version;
sharePkg.version = version;
writeFileSync(sharePkgPath, JSON.stringify(sharePkg, null, 2) + '\n');
console.log(`✅ mcp_share/package.json: ${oldShareVersion} → ${version}`);

// ──────────────────────────────────────────────
// 4. Update version string in mcp_share/src/index.ts
// ──────────────────────────────────────────────
const shareIndexPath = join(SHARE_SRC, 'index.ts');
let shareIndex = readFileSync(shareIndexPath, 'utf8');
const versionRegex = /version:\s*["']([^"']+)["']/;
const oldVersionMatch = shareIndex.match(versionRegex);
if (oldVersionMatch) {
  const oldVer = oldVersionMatch[1];
  shareIndex = shareIndex.replace(versionRegex, `version: "${version}"`);
  writeFileSync(shareIndexPath, shareIndex);
  console.log(`✅ mcp_share/src/index.ts: version "${oldVer}" → "${version}"`);
} else {
  console.warn(`⚠️  Could not find version string in mcp_share/src/index.ts`);
}

// ──────────────────────────────────────────────
// 5. Verify mcp_share/.mcp.json has placeholders (not real credentials)
// ──────────────────────────────────────────────
try {
  const mcpJson = readFileSync(SHARE_MCP_JSON, 'utf8');
  const hasBearerToken = /[a-f0-9]{40,}/.test(mcpJson);
  const hasAbsolutePath = /[A-Z]:\\/.test(mcpJson) || /\/Users\/\w+\//.test(mcpJson);
  const hasPlaceholder = mcpJson.includes('<') && mcpJson.includes('>');

  if (hasBearerToken) {
    console.error(`❌ SECURITY WARNING: mcp_share/.mcp.json may contain a real session token!`);
    process.exit(1);
  }
  if (hasAbsolutePath) {
    console.error(`❌ mcp_share/.mcp.json contains an absolute path — should use relative paths only.`);
    process.exit(1);
  }
  if (!hasPlaceholder) {
    console.warn(`⚠️  mcp_share/.mcp.json doesn't seem to have placeholder values. Verify it's safe to distribute.`);
  } else {
    console.log(`✅ mcp_share/.mcp.json looks safe (has placeholders, no real tokens)`);
  }
} catch {
  console.warn(`⚠️  Could not read mcp_share/.mcp.json — skipping verification`);
}

// ──────────────────────────────────────────────
// 6. Count tools registered in src/
// ──────────────────────────────────────────────
function countTools(dir) {
  let count = 0;
  const entries = readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    if (entry.isFile() && entry.name.endsWith('.ts')) {
      const content = readFileSync(join(dir, entry.name), 'utf8');
      const matches = content.match(/server\.tool\(/g);
      if (matches) count += matches.length;
    } else if (entry.isDirectory()) {
      count += countTools(join(dir, entry.name));
    }
  }
  return count;
}

const toolCount = countTools(SRC);
console.log(`\n📊 Total tools in src/: ${toolCount}`);
console.log(`\n🎉 Sync complete! mcp_share/ is now at v${version} with ${toolCount} tools.\n`);
console.log(`Next steps:`);
console.log(`  1. Review changes: git diff mcp_share/`);
console.log(`  2. Stage changes:  git add mcp_share/`);
console.log(`  3. Commit:         git commit -m "chore: sync mcp_share to v${version}"\n`);
