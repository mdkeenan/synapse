# Dev Container (local development)

Synapse/LibreChat runs in a VS Code Dev Container with MongoDB and Meilisearch on a shared Docker network. Use this setup on Windows (or any host) so native Node bindings match the Linux container.

## Architecture

| Service | Container name | URL / connection |
|---------|----------------|------------------|
| App (dev) | `synapse_devcontainer-app-1` | http://localhost:3080 |
| MongoDB | `chat-mongodb` | `mongodb://mongodb:27017/LibreChat` |
| Meilisearch | `chat-meilisearch` | `http://meilisearch:7700` |

Repo mount inside the app container: `/workspaces`

Config files: `.devcontainer/devcontainer.json`, `.devcontainer/docker-compose.yml`, `.devcontainer/Dockerfile`

## First-time setup

1. Install [Docker Desktop](https://www.docker.com/products/docker-desktop/) and the VS Code **Dev Containers** extension.
2. Open the repo in VS Code → **Dev Containers: Reopen in Container**.
3. If you previously ran `npm install` on Windows, remove host `node_modules` before or after reopening:

   ```bash
   rm -rf node_modules api/node_modules client/node_modules packages/*/node_modules
   ```

   Windows-installed optional natives (e.g. `@rolldown/binding-linux-x64-gnu`) will not work inside the Linux container.

4. Dependencies install via `postCreateCommand` (`npm install`). If needed, run manually inside the container:

   ```bash
   npm install
   ```

5. Copy env and set Dev Container values:

   ```bash
   cp .env.example .env   # if you do not already have .env
   ```

   Required for this compose stack:

   ```env
   MONGO_URI=mongodb://mongodb:27017/LibreChat
   MEILI_HOST=http://meilisearch:7700
   MEILI_MASTER_KEY=<same value as in .devcontainer/docker-compose.yml>
   HOST=0.0.0.0
   ```

   `docker-compose.yml` also injects `MONGO_URI` and `MEILI_HOST` into the app service; keep `.env` in sync for CLI scripts and consistency.

6. Build TypeScript packages (first time, or after pulling TS changes):

   ```bash
   npm run build:data-schemas
   npm run build:data-provider
   npm run build:api
   ```

   Or: `npm run build:packages` (includes `packages/client`).

7. Create a local user:

   ```bash
   npm run create-user
   ```

## Daily workflow

**Terminal 1 — backend (watch mode):**

```bash
npm run backend:dev
```

**Terminal 2 — frontend with HMR (optional):**

```bash
npm run frontend:dev
```

| Mode | URL | Notes |
|------|-----|--------|
| Backend only | http://localhost:3080 | Serves built client from `client/dist` if present |
| Backend + `frontend:dev` | http://localhost:3090 | Hot reload; backend must still run on 3080 |

Ports **3080** and **3090** are forwarded automatically via `devcontainer.json`.

## Rebuild packages after changes

| Changed in | Run |
|------------|-----|
| `packages/data-provider` | `npm run build:data-provider` |
| `packages/data-schemas` | `npm run build:data-schemas` |
| `packages/api` | `npm run build:api` |
| `packages/client` | `npm run build:client-package` |
| All packages | `npm run build:packages` |

## Data persistence

Docker volumes on the host (gitignored):

- `.devcontainer/data-node/` — MongoDB
- `.devcontainer/meili_data_v1.5/` — Meilisearch

Removing these folders resets local DB and search index.

## Expected warnings (safe to ignore locally)

| Warning | When to fix |
|---------|-------------|
| Default `CREDS_KEY`, `CREDS_IV`, `JWT_SECRET`, `JWT_REFRESH_SECRET` | Before sharing the instance; use [creds generator](https://www.librechat.ai/toolkit/creds_generator) |
| `METRICS_SECRET` not set | Only if you use `/metrics` |
| RAG API not reachable | Only if you need file-upload RAG (separate service + `RAG_API_URL`) |

For local-only dev, default secrets are acceptable on `localhost`.

## Synapse branding (optional)

In `.env`:

```env
APP_TITLE=Synapse
```

See [SYNAPSE_CUSTOMIZATION_MAP.md](./SYNAPSE_CUSTOMIZATION_MAP.md) for full branding locations.

## Local Ollama (optional)

Ollama is **local-only** — it is not in tracked `librechat.yaml` (production/Render stays Perplexity-only).

1. Copy the example config:

   ```bash
   cp librechat.local.example.yaml librechat.local.yaml
   ```

2. Dev Container sets `CONFIG_PATH=/workspaces/librechat.local.yaml` automatically.

3. Keep Ollama running on Windows (`ollama ps`). Models must match names in the YAML.

4. Restart `npm run backend:dev` after changing the local config.

## Production vs local

| | Dev Container | Render (`main`) |
|--|---------------|-----------------|
| MongoDB | `mongodb://mongodb:27017/...` | Atlas `MONGO_URI` |
| Meilisearch | In compose | Often unset on free tier |
| Config | `.env` + `librechat.local.yaml` (local) | Render env vars + `librechat.yaml` in image |
| Deploy | N/A | Auto-deploy from `main` |

## Troubleshooting

**`Cannot find module @rolldown/binding-linux-x64-gnu`**  
Delete all `node_modules` and run `npm install` inside the Dev Container, not on Windows.

**Cannot connect to MongoDB**  
Use hostname `mongodb`, not `127.0.0.1`. Ensure `chat-mongodb` is running (`docker ps`).

**Meilisearch auth errors**  
`MEILI_MASTER_KEY` in `.env` must match `MEILI_MASTER_KEY` in `.devcontainer/docker-compose.yml`.

**Port already in use**  
Stop a host-side backend or free port 3080/3090 before starting dev servers.

**Stale client UI**  
Run `npm run frontend:dev` on 3090, or `npm run build:client` and use backend on 3080.
