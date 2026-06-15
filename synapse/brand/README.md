# Synapse brand sources

Place **master** brand files here. They are versioned in git but **not** served by the application.

## Expected source files

| File | Purpose |
|------|---------|
| `synapse-logo-1024x1024.png` | Raster master for favicons and PWA icons |
| `synapse-logo.svg` | Vector logo copied to `client/public/assets/logo.svg` |

Add other masters as needed (e.g. wordmark-only, dark-mode variant). Register new exports in [`exports.json`](./exports.json).

## Export targets

The export script writes **application-facing** assets to `client/public/assets/`:

| Output | Size / notes |
|--------|----------------|
| `logo.svg` | 1:1 copy from vector source |
| `favicon-16x16.png` | 16×16 |
| `favicon-32x32.png` | 32×32 |
| `apple-touch-icon-180x180.png` | 180×180 |
| `icon-192x192.png` | 192×192 |
| `maskable-icon.png` | 512×512 with safe-zone padding |

Referenced by `client/index.html`, `client/vite.config.ts` (PWA manifest), and `client/scripts/post-build.cjs`.

## Commands

From the repository root:

```bash
npm run synapse:export-brand
```
