const fs = require('fs');
const path = require('path');

const REPO_ROOT = path.resolve(__dirname, '../..');
const BRAND_DIR = path.join(REPO_ROOT, 'synapse', 'brand');
const CONFIG_PATH = path.join(BRAND_DIR, 'exports.json');

function loadSharp() {
  const candidates = [
    path.join(REPO_ROOT, 'api', 'node_modules', 'sharp'),
    path.join(REPO_ROOT, 'node_modules', 'sharp'),
  ];

  for (const candidate of candidates) {
    try {
      return require(candidate);
    } catch {
      continue;
    }
  }

  return null;
}

function readConfig() {
  const raw = fs.readFileSync(CONFIG_PATH, 'utf8');
  return JSON.parse(raw);
}

function resolveSource(sourceKey, sources) {
  const filename = sources[sourceKey];
  if (!filename) {
    throw new Error(`Unknown source key "${sourceKey}" in exports.json`);
  }

  return path.join(BRAND_DIR, filename);
}

function ensureParentDir(filePath) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
}

async function copyAsset(sourcePath, destPath) {
  if (!fs.existsSync(sourcePath)) {
    console.warn(`⏭️  Skip copy — source not found: ${path.relative(REPO_ROOT, sourcePath)}`);
    return false;
  }

  ensureParentDir(destPath);
  fs.copyFileSync(sourcePath, destPath);
  console.log(`✅ Copied ${path.relative(REPO_ROOT, sourcePath)} → ${path.relative(REPO_ROOT, destPath)}`);
  return true;
}

async function resizeAsset(sharp, sourcePath, destPath, options) {
  if (!fs.existsSync(sourcePath)) {
    console.warn(`⏭️  Skip resize — source not found: ${path.relative(REPO_ROOT, sourcePath)}`);
    return false;
  }

  ensureParentDir(destPath);

  let pipeline = sharp(sourcePath).resize({
    width: options.width,
    height: options.height,
    fit: options.fit ?? 'cover',
    background: options.background,
  });

  if (options.fit === 'contain' && options.background) {
    pipeline = pipeline.flatten({ background: options.background });
  }

  await pipeline.png().toFile(destPath);
  console.log(
    `✅ Resized ${path.relative(REPO_ROOT, sourcePath)} → ${path.relative(REPO_ROOT, destPath)} (${options.width}×${options.height})`,
  );
  return true;
}

async function main() {
  const config = readConfig();
  const sharp = loadSharp();
  let copied = 0;
  let resized = 0;
  let skipped = 0;

  for (const entry of config.copies ?? []) {
    const sourcePath = resolveSource(entry.source, config.sources);
    const destPath = path.join(REPO_ROOT, entry.dest);
    const ok = await copyAsset(sourcePath, destPath);
    if (ok) {
      copied += 1;
    } else {
      skipped += 1;
    }
  }

  if ((config.resizes ?? []).length > 0 && !sharp) {
    console.error('❌ sharp is required for PNG exports. Run npm ci from the repo root.');
    process.exit(1);
  }

  for (const entry of config.resizes ?? []) {
    const sourcePath = resolveSource(entry.source, config.sources);
    const destPath = path.join(REPO_ROOT, entry.dest);
    const ok = await resizeAsset(sharp, sourcePath, destPath, entry);
    if (ok) {
      resized += 1;
    } else {
      skipped += 1;
    }
  }

  console.log(`\nDone: ${copied} copied, ${resized} resized, ${skipped} skipped.`);

  if (skipped > 0 && copied === 0 && resized === 0) {
    console.log('\nAdd source files under synapse/brand/ (see synapse/brand/README.md).');
  }
}

main().catch((error) => {
  console.error('❌ Export failed:', error.message);
  process.exit(1);
});
