# Synapse fork overlay

Synapse-specific files live here so they stay isolated from upstream LibreChat paths and merge cleanly.

| Path | Purpose |
|------|---------|
| [`brand/`](./brand/) | Versioned **source** brand assets (masters, vectors). Not served by the app. |
| [`scripts/`](./scripts/) | Fork utilities (e.g. export brand assets into `client/public/assets/`). |
| `config/` *(future)* | Example `librechat.yaml` templates and deployment notes |

## Brand assets workflow

1. Add source files under `brand/` (e.g. `synapse-logo-1024x1024.png`, `synapse-logo.svg`).
2. Adjust [`brand/exports.json`](./brand/exports.json) if filenames or export sizes change.
3. Run from the repo root:

   ```bash
   npm run synapse:export-brand
   ```

4. Build the client: `npm run build:client`.

**Source vs shipped assets**

- **Source (here):** high-resolution masters and working files — committed to git.
- **Shipped (`client/public/assets/`):** favicons, PWA icons, login logo — copied or resized by the export script and included in the production build.

See [docs/UPSTREAM_MAINTENANCE.md](../docs/UPSTREAM_MAINTENANCE.md) and [docs/SYNAPSE_CUSTOMIZATION_MAP.md](../docs/SYNAPSE_CUSTOMIZATION_MAP.md).
