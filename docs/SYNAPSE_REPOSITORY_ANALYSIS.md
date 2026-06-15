# Synapse Repository Analysis

> **Generated:** 2026-06-14  
> **Base project:** LibreChat v0.8.6 (npm workspaces monorepo)  
> **Workspace path:** `synapse` — upstream branding and package names still reference LibreChat; no Synapse-specific code paths were found at analysis time.

This document maps the repository structure, technology choices, and the highest-value customization surfaces for a Synapse-branded deployment.

---

## 1. High-Level Architecture Overview

LibreChat/Synapse is a **monorepo** with a React SPA frontend, an Express backend, and shared TypeScript packages. In production, a **single Node process** typically serves both the compiled SPA (`client/dist`) and the REST/SSE API on one port (default **3080**).

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         Browser (PWA-capable SPA)                        │
│  client/  +  packages/client  +  packages/data-provider                 │
└─────────────────────────────────┬───────────────────────────────────────┘
                                  │ HTTP / SSE / WebSocket-like streams
                                  ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                    Express API (api/server/index.js)                       │
│  Thin JS routes/controllers → @librechat/api (TypeScript business logic) │
└───┬─────────────┬──────────────┬──────────────┬──────────────┬──────────┘
    │             │              │              │              │
    ▼             ▼              ▼              ▼              ▼
 MongoDB      Meilisearch      Redis*       RAG API*      External LLM /
 (primary)    (conversation     (optional    (optional     MCP / OAuth /
              search)            cache)       pgvector)     file storage

* Optional depending on .env / librechat.yaml
```

### Workspace boundaries

| Workspace | Path | Role |
|-----------|------|------|
| Legacy backend shell | `/api` | Express server, Passport strategies, route wiring — **minimize changes** |
| New backend logic | `/packages/api` | TypeScript-only services (MCP, agents, files, auth helpers, memory) |
| Database | `/packages/data-schemas` | Mongoose schemas, models, DB methods |
| Shared API contract | `/packages/data-provider` | Endpoints, types, React Query keys, config schemas |
| Frontend shared UI | `/packages/client` | Reusable components, hooks, SVG icons |
| Frontend app | `/client` | Main SPA, routes, feature UI |
| Ops / CLI | `/config` | User admin scripts, migrations, balance tools |
| Deployment skills | `/skill` | Read-only deployment skill files (optional) |

Build orchestration uses **Turborepo** (`turbo.json`) with dependency order: `data-provider` → `data-schemas` → `api` → `client-package` → `client`.

External runtime dependency: **`@librechat/agents`** (npm package; source lives in a separate repo per project docs).

---

## 2. Frontend Technology Stack

| Layer | Technology |
|-------|------------|
| Framework | React 18 |
| Language | TypeScript + JSX (`client/src/main.jsx` entry) |
| Bundler / dev server | Vite 8 (`client/vite.config.ts`) |
| Routing | React Router DOM v6 |
| Server state | TanStack React Query v4 |
| Client state | Recoil + Jotai (mixed usage) |
| Styling | Tailwind CSS 3 + CSS variables (`client/src/style.css`) |
| UI primitives | Radix UI, Headless UI, Ariakit |
| Forms | React Hook Form + Zod |
| i18n | i18next / react-i18next (`client/src/locales/`) |
| Markdown / math | react-markdown, remark/rehype plugins, KaTeX, Mermaid |
| Code / artifacts | Monaco Editor, Sandpack |
| PWA | `vite-plugin-pwa` + Workbox |
| Testing | Jest + Testing Library |
| E2E | Playwright (`/e2e`) |

**Dev proxy:** Vite dev server (port **3090**) proxies `/api` and `/oauth` to the backend (port **3080**).

**Shared packages consumed by the client:**

- `librechat-data-provider` — API types, endpoints, startup config
- `@librechat/client` — shared components (`packages/client`)

---

## 3. Backend Technology Stack

| Layer | Technology |
|-------|------------|
| Runtime | Node.js **24.16.0** |
| HTTP | Express 5 |
| Language | JavaScript in `/api`; TypeScript in `/packages/api` |
| ODM | Mongoose 8 / MongoDB driver 6 |
| Auth | Passport (local, JWT, LDAP, OAuth, OpenID, SAML) |
| Sessions / tokens | express-session, jsonwebtoken, HTTP-only cookies |
| Caching | Keyv (memory, file, Redis via `@keyv/redis`) |
| Search index | Meilisearch |
| File processing | Sharp, Multer, pdfjs, mammoth, etc. |
| LLM clients | OpenAI SDK, Anthropic Vertex, Google GenAI, AWS Bedrock, Ollama, etc. |
| Agents runtime | `@librechat/agents` |
| MCP | `@modelcontextprotocol/sdk` + `/packages/api/src/mcp` |
| Observability | Winston, OpenTelemetry (optional), Langfuse (optional) |
| Testing | Jest, supertest, mongodb-memory-server |

**Entry points:**

- Production: `api/server/index.js` (`npm run backend`)
- Experimental: `api/server/experimental.js`
- Dev: nodemon on `api/server/index.js` (`npm run backend:dev`)

---

## 4. Authentication Flow

Authentication supports **multiple strategies** configured via environment variables. The frontend stores a JWT in client state after login; the backend also sets **HTTP-only refresh token cookies**.

### Email / password (local)

```
Client POST /api/auth/login
  → middleware: loginLimiter, checkBan, requireLocalAuth (Passport local)
  → api/strategies/localStrategy.js (bcrypt password verify)
  → api/server/controllers/auth/LoginController.js
       → if 2FA enabled: { twoFAPending, tempToken }
       → else: AuthService.setAuthTokens → { token, user }
  → client AuthContext stores token, navigates to /c/new
```

Key files:

- `api/server/routes/auth.js` — login, refresh, logout, register, 2FA routes
- `api/strategies/localStrategy.js` — credential validation
- `api/server/controllers/auth/LoginController.js`
- `api/server/services/AuthService.js` — `setAuthTokens`, sessions, refresh
- `client/src/hooks/AuthContext.tsx` — login/logout UX
- `client/src/data-provider/Auth/mutations.ts` — React Query mutations

### JWT on protected routes

```
Request with Authorization: Bearer <jwt> and/or cookies
  → api/server/middleware/requireJwtAuth.js
  → Strategy chain: jwt → openidJwt (if OPENID_REUSE_TOKENS) → fallback
  → tenantContextMiddleware → optional CloudFront cookie refresh
  → req.user attached
```

### Social / enterprise SSO

Configured in `api/server/socialLogins.js` and strategy modules under `api/strategies/`:

| Provider | Strategy module | OAuth callback |
|----------|-----------------|----------------|
| Google | `googleStrategy.js` | `/oauth/google/callback` |
| GitHub | `githubStrategy.js` | `/oauth/github/callback` |
| Discord | `discordStrategy.js` | `/oauth/discord/callback` |
| Facebook | `facebookStrategy.js` | `/oauth/facebook/callback` |
| Apple | `appleStrategy.js` | `/oauth/apple/callback` |
| OpenID Connect | `openIdStrategy.js`, `openIdJwtStrategy.js` | `/oauth/openid/callback` |
| SAML | `samlStrategy.js` | `/oauth/saml/callback` |
| LDAP | `ldapStrategy.js` | replaces local auth when `LDAP_URL` set |

OpenID token reuse, role sync, and admin-panel SSO are handled in `packages/api/src/oauth/` and related env vars (`OPENID_*`, `SAML_*`).

### Token lifecycle

- **Access JWT:** returned in login response body
- **Refresh token:** HTTP-only cookie (`refreshToken`), rotated via `POST /api/auth/refresh`
- **Session document:** MongoDB `Session` collection via `AuthService.setAuthTokens`
- **2FA:** temp token flow → `/login/2fa`

Startup config (`GET /api/config`) exposes which login methods are enabled to the UI.

---

## 5. Database Architecture

### Primary store: MongoDB

Connection: `api/db/connect.js` using `MONGO_URI` and optional pool tuning (`MONGO_MAX_POOL_SIZE`, etc.).

Models are defined in **`packages/data-schemas`** and registered via `createModels()`.

| Collection / domain | Schema file | Purpose |
|---------------------|-------------|---------|
| Users, roles, groups | `user.ts`, `role.ts`, `group.ts` | Identity, RBAC |
| Sessions, tokens | `session.ts`, `token.ts` | Auth sessions, email/reset tokens |
| Conversations, messages | `convo.ts`, `message.ts` | Chat history |
| Agents | `agent.ts`, `agentCategory.ts`, `agentApiKey.ts` | Agent definitions & API keys |
| Files | `file.ts` | Uploaded file metadata |
| Memories | `memory.ts` | User memory key/value store |
| MCP | `mcpServer.ts` | User-defined MCP server configs |
| Skills | `skill.ts`, `skillFile.ts`, `skillSync*.ts` | Agent skills |
| Prompts / presets | `prompt.ts`, `promptGroup.ts`, `preset.ts` | Prompt library |
| Permissions | `aclEntry.ts`, `accessRole.ts`, `systemGrant.ts` | Sharing & ACL |
| Assistants | `assistant.ts`, `action.ts`, `toolCall.ts` | OpenAI Assistants API |
| Commerce / limits | `balance.ts`, `transaction.ts` | Token balances (optional) |
| Config / banner | `config.ts`, `banner.ts` | App config snapshots, banners |
| Projects | `chatProject.ts` | Chat projects |
| Share links | `share.ts` | Shared conversations |

### Secondary stores

| Store | Purpose | Config |
|-------|---------|--------|
| **Meilisearch** | Full-text conversation/message search | `MEILI_HOST`, `SEARCH=true` |
| **Redis** (optional) | Cache, sessions, streams, MCP registry, leader election | `USE_REDIS`, `REDIS_URI` |
| **PostgreSQL + pgvector** (optional) | RAG embeddings via external `rag_api` service | Docker `vectordb` + `RAG_API_URL` |

Tenant isolation: optional multi-tenant fields (`tenantId`) on several schemas; controlled by middleware and `TENANT_ISOLATION_STRICT`.

---

## 6. PWA Implementation Details

PWA is implemented with **`vite-plugin-pwa`** in `client/vite.config.ts`.

| Setting | Value / behavior |
|---------|------------------|
| Registration | `injectRegister: 'auto'` |
| Update strategy | `registerType: 'autoUpdate'` |
| Dev SW | Disabled (`devOptions.enabled: false`) |
| Service worker extras | `sw/heal.js` imported via Workbox `importScripts` |
| Precache | JS, CSS, HTML, manifest icons, `manifest.webmanifest` |
| Exclusions | `index.html` (server-mutated), locale chunks, RUM, source maps |
| Runtime cache | Locale chunks — `StaleWhileRevalidate` |
| Manifest | `name` / `short_name`: **LibreChat** (customizable in vite config) |
| Theme | `#009688` (manifest), `#171717` (index.html meta) |

**Stale-build recovery:**

- `client/index.html` — `__lcRecoverStaleAssets()` unregisters SW and reloads on chunk load failures
- `client/sw/heal.js` — on SW activation, pings clients and reloads unresponsive tabs

**Mobile web app meta tags** in `client/index.html`:

- `mobile-web-app-capable`, `apple-mobile-web-app-capable`
- `apple-mobile-web-app-status-bar-style`
- `viewport` with `interactive-widget=resizes-content`

**Post-build:** `client/scripts/post-build.cjs` copies `public/assets` and `robots.txt` into `dist/`.

**Wake lock (mobile-friendly):** `client/src/hooks/useWakeLock.ts` + `WakeLockManager.tsx` keeps screen on during generation.

---

## 7. Mobile-Specific Code Locations

There is no separate native mobile app; responsiveness is handled in the web UI.

| Area | Location | Notes |
|------|----------|-------|
| Breakpoint hook | `packages/client/src/hooks/useMediaQuery.tsx` | Shared `(max-width: …)` detection |
| Sidebar / nav | `client/src/components/UnifiedSidebar/UnifiedSidebar.tsx` | Collapses on `≤768px` |
| Share view | `client/src/components/Share/ShareView.tsx` | `isMobile` at `767px` |
| Agents marketplace | `client/src/components/Agents/Marketplace.tsx` | Mobile layout variants |
| Prompt forms | `client/src/components/Prompts/forms/PromptForm.tsx` | Mobile-specific controls |
| Projects | `client/src/components/Projects/ProjectsView.tsx` | Open sidebar button on small screens |
| Data tables | `packages/client/src/components/DataTable/*` | `mobileSize` column meta |
| Virtual grids | `client/src/hooks/useVirtualGrid.ts` | `mobileBreakpoint` default 768 |
| Chat header | `client/src/components/Chat/Header.tsx` | Responsive layout |
| Side panel | `client/src/components/SidePanel/SidePanelGroup.tsx` | Panel behavior on small screens |
| PWA / install | `client/vite.config.ts`, `client/index.html` | Standalone display mode |
| Screen wake lock | `client/src/hooks/useWakeLock.ts` | Prevents sleep during streaming |

---

## 8. Branding-Related Files

| File / area | What to customize |
|-------------|-------------------|
| `.env` → `APP_TITLE` | Global product name (API + emails + document title) |
| `.env` → `CUSTOM_FOOTER` | Custom footer HTML/text via startup config |
| `.env` → `HELP_AND_FAQ_URL` | Help link in settings |
| `librechat.yaml` → `interface.customWelcome` | Welcome message on new chat |
| `librechat.yaml` → `interface.privacyPolicy` | Privacy policy URL / modal |
| `librechat.yaml` → `interface.termsOfService` | Terms of service URL / modal content |
| `client/index.html` | Default `<title>`, meta description, theme-color |
| `client/vite.config.ts` | PWA manifest `name`, `short_name`, `theme_color`, `background_color` |
| `client/src/style.css` | CSS variables (grays, greens, surfaces) |
| `client/tailwind.config.cjs` | Tailwind color extensions, fonts (Inter, Roboto Mono) |
| `client/public/assets/logo.svg` | Auth page logo |
| `client/src/components/Auth/AuthLayout.tsx` | Logo rendering on login/register |
| `client/src/components/Auth/Footer.tsx` | Privacy / terms links |
| `client/src/locales/en/translation.json` | User-facing copy (`com_ui_*` keys) |
| `client/src/hooks/Config/useAppStartup.ts` | Sets `document.title` from startup config |
| `api/server/routes/config.js` | Serves `appTitle`, interface config to client |
| OpenID/SAML button branding | `OPENID_BUTTON_LABEL`, `OPENID_IMAGE_URL`, `SAML_*` |

---

## 9. Logo / Icon Locations

| Asset | Path | Usage |
|-------|------|-------|
| Main SVG logo | `client/public/assets/logo.svg` | Auth screens (`AuthLayout`) |
| Provider / tool SVGs | `client/public/assets/*.svg` | Endpoint icons, tool branding |
| Shared SVG icons | `packages/client/src/svgs/` | UI icons (GPT, Azure, etc.) |
| User/agent avatars | `/images/...` (runtime) | Served from `images/` volume; gitignored |
| PWA favicons (referenced) | `client/public/assets/favicon-*.png`, `icon-192x192.png`, `apple-touch-icon-180x180.png`, `maskable-icon.png` | `index.html`, vite PWA manifest — **PNG icons are referenced but may need to be added locally** (not all are present in the tracked `public/assets` tree) |
| Agent avatars | MongoDB + file storage | `packages/api/src/agents/avatars.ts` |

**Docker volume for custom images:** `./images` → `/app/client/public/images` (see `docker-compose.yml`).

---

## 10. Application Title Locations

| Mechanism | Location |
|-----------|----------|
| Environment default | `.env` → `APP_TITLE=LibreChat` |
| API startup config | `api/server/routes/config.js` → `appTitle: process.env.APP_TITLE \|\| 'LibreChat'` |
| Initial HTML title | `client/index.html` → `<title>LibreChat</title>` |
| Runtime title (app load) | `client/src/hooks/Config/useAppStartup.ts` |
| Startup layout | `client/src/routes/Layouts/Startup.tsx` |
| New conversation reset | `client/src/hooks/useNewConvo.ts` (reads `localStorage` `APP_TITLE`) |
| Conversation titles | `client/src/components/Conversations/Convo.tsx`, SSE handlers |
| Share pages | `client/src/components/Share/ShareView.tsx` → `{title} \| {appTitle}` |
| PWA manifest | `client/vite.config.ts` → `manifest.name`, `manifest.short_name` |
| Emails | `api/server/services/AuthService.js`, `api/server/utils/sendEmail.js` |
| 2FA | `api/server/controllers/TwoFactorController.js` |
| i18n logo alt text | `com_ui_logo` in locale files — `"{{0}} Logo"` |

**Recommended Synapse approach:** set `APP_TITLE=Synapse` in `.env` and update PWA manifest + `index.html` defaults for first-paint consistency.

---

## 11. Environment Variables

Configuration is loaded from **project root `.env`** (see `.env.example`, ~200+ variables). Vite exposes prefixes: `VITE_`, `SCRIPT_`, `DOMAIN_`, `ALLOW_`.

### Core server

| Variable | Purpose |
|----------|---------|
| `HOST`, `PORT` | Bind address (default `localhost:3080`) |
| `DOMAIN_CLIENT`, `DOMAIN_SERVER` | Public URLs for links and OAuth |
| `TRUST_PROXY` | Express trust proxy hops |
| `NO_INDEX` | SEO / robots |
| `CONFIG_PATH` | Alternate path to `librechat.yaml` |
| `NODE_OPTIONS` / `NODE_MAX_OLD_SPACE_SIZE` | Node heap (Docker build arg) |

### Database

| Variable | Purpose |
|----------|---------|
| `MONGO_URI` | MongoDB connection string |
| `MONGO_*` | Pool size, auto-index, auto-create |

### Authentication & users

| Variable | Purpose |
|----------|---------|
| `JWT_SECRET`, `JWT_REFRESH_SECRET` | Token signing |
| `SESSION_EXPIRY`, `REFRESH_TOKEN_EXPIRY` | Token lifetimes |
| `ALLOW_*` | Registration, email login, social login, shared links, etc. |
| `CREDS_KEY`, `CREDS_IV` | Encrypt stored plugin credentials |
| `OPENID_*`, `SAML_*`, `LDAP_*` | Enterprise SSO |
| `DISCORD_*`, `GITHUB_*`, `GOOGLE_*`, etc. | Social OAuth |
| `EMAIL_*`, `MAILGUN_*` | Transactional email |

### AI endpoints (representative)

| Variable | Purpose |
|----------|---------|
| `OPENAI_API_KEY`, `ANTHROPIC_API_KEY`, `GOOGLE_KEY`, … | Provider keys |
| `ASSISTANTS_API_KEY` | OpenAI Assistants |
| `BEDROCK_AWS_*` | AWS Bedrock |
| Tool keys | `TAVILY_API_KEY`, `SERPER_API_KEY`, `FIRECRAWL_API_KEY`, etc. |

### Search, RAG, storage

| Variable | Purpose |
|----------|---------|
| `SEARCH`, `MEILI_HOST`, `MEILI_MASTER_KEY` | Meilisearch |
| `RAG_API_URL`, `RAG_OPENAI_*`, `EMBEDDINGS_*` | RAG microservice |
| `AWS_*`, `AZURE_*`, `FIREBASE_*` | Object storage |
| `USE_REDIS`, `REDIS_URI`, `REDIS_*` | Redis caching |

### UI / branding

| Variable | Purpose |
|----------|---------|
| `APP_TITLE` | Application name |
| `CUSTOM_FOOTER` | Footer override |
| `HELP_AND_FAQ_URL` | Help URL |
| `ANALYTICS_GTM_ID` | Google Tag Manager |

### MCP

| Variable | Purpose |
|----------|---------|
| `MCP_OAUTH_*`, `MCP_CB_*`, `MCP_STREAMABLE_HTTP_*` | MCP OAuth, circuit breaker, limits |
| `PROXY`, `HTTP_PROXY`, `HTTPS_PROXY` | Outbound proxy for remote MCP |

### Observability

| Variable | Purpose |
|----------|---------|
| `DEBUG_LOGGING`, `LOG_TO_FILE`, `CONSOLE_JSON` | Logging |
| `OTEL_*`, `LANGFUSE_*` | Tracing |
| `RUM_*` | Browser Real User Monitoring |

Full reference: [LibreChat dotenv docs](https://www.librechat.ai/docs/configuration/dotenv) and `.env.example`.

---

## 12. Build & Deployment Process

### Local development

```bash
npm run smart-reinstall   # install + turbo build
npm run backend:dev       # API with nodemon :3080
npm run frontend:dev      # Vite HMR :3090
```

### Production build

```bash
npm run build             # turbo: packages + client
npm run backend           # serves API + static client/dist
```

Turbo build order (from `turbo.json`):

1. `packages/data-provider`
2. `packages/data-schemas`
3. `packages/api`
4. `packages/client`
5. `client` (Vite → `client/dist`)

### Docker deployment options

| Compose file | Mode |
|--------------|------|
| `docker-compose.yml` | All-in-one image + Mongo + Meili + RAG stack |
| `deploy-compose.yml` | Split API + nginx client + dependencies |

### CI / images

- `.github/workflows/main-image-workflow.yml` — builds `Dockerfile` (monolith) and `Dockerfile.multi` (API target)
- `.github/workflows/build.yml`, `client.yml`, `data-provider.yml`, etc. — workspace CI
- Images published to `registry.librechat.ai/danny-avila/...`
- **Helm charts:** `helm/librechat/`, `helm/librechat-rag-api/`

### Config at deploy time

- `.env` — secrets and feature flags
- `librechat.yaml` — endpoints, interface, MCP servers, file strategy (gitignored; copy from `librechat.example.yaml`)
- Volumes: `images/`, `uploads/`, `logs/`, `skill/`, `data-node/`, `meili_data_*`

---

## 13. Docker Architecture

### Single-container (`Dockerfile`)

- Base: `node:24.16.0-alpine` + jemalloc + **uv** (MCP Python tooling)
- Runs `npm ci` → `npm run frontend` → `npm prune --production`
- Serves on `0.0.0.0:3080` via `npm run backend`
- Build args: `BUILD_COMMIT`, `BUILD_BRANCH`, `BUILD_DATE`, `NODE_MAX_OLD_SPACE_SIZE`

### Multi-stage (`Dockerfile.multi`)

Stages: `base` → parallel package builds → `client-build` → `api-build` (production deps only, includes `client/dist`).

### Typical compose stack (`docker-compose.yml`)

```
api (LibreChat) ──┬── mongodb (Mongo 8)
                  ├── meilisearch
                  └── rag_api ── vectordb (pgvector)
```

Environment wiring:

- `MONGO_URI=mongodb://mongodb:27017/LibreChat`
- `MEILI_HOST=http://meilisearch:7700`
- `RAG_API_URL=http://rag_api:8000`

`deploy-compose.yml` adds a separate **nginx** container for static frontend + reverse proxy to API.

---

## 14. MongoDB Usage

| Concern | Implementation |
|---------|----------------|
| Connection | `api/db/connect.js` — cached singleton, hot-reload safe |
| Schemas | `packages/data-schemas/src/schema/*` |
| Model factory | `packages/data-schemas/src/models/index.ts` |
| Data access methods | `packages/data-schemas/src/methods/*` |
| Legacy model wrappers | `api/models/*` (JS facades) |
| Migrations | `api/server/services/start/migration.js`, `packages/data-schemas/src/migrations/` |
| Seeding | `seedDatabase` on startup |
| Index sync | Meilisearch `indexSync()` after connect |
| Tests | `mongodb-memory-server` in API/package tests |
| Optional FerretDB | `packages/data-schemas/misc/ferretdb/docker-compose.ferretdb.yml` |

Default database name in examples: **`LibreChat`** (rename in `MONGO_URI` for Synapse if desired).

---

## 15. MCP-Related Code Locations

MCP (Model Context Protocol) is a first-class integration for tool servers.

### Backend (TypeScript core)

| Path | Role |
|------|------|
| `packages/api/src/mcp/MCPManager.ts` | Connection lifecycle, tool execution |
| `packages/api/src/mcp/MCPConnectionFactory.ts` | Transport factory (stdio, SSE, streamable HTTP) |
| `packages/api/src/mcp/registry/` | Server registry, DB-backed configs, Redis cache |
| `packages/api/src/mcp/oauth/` | OAuth flows for MCP servers |
| `packages/api/src/mcp/tools.ts`, `parsers.ts` | Tool registration and result parsing |
| `packages/api/src/mcp/mcpConfig.ts` | Settings from YAML/env |

### Backend (Express wiring)

| Path | Role |
|------|------|
| `api/server/services/initializeMCPs.js` | Startup initialization |
| `api/server/routes/mcp.js` | REST routes (CRUD, OAuth callbacks, tools) |
| `api/server/controllers/mcp/` | MCP controllers |
| `api/server/services/MCP/` | Connection status, setup helpers |
| `api/config/` | MCP manager/registry singletons |

### Frontend

| Path | Role |
|------|------|
| `client/src/components/MCP/` | MCP config UI, server status |
| `client/src/hooks/MCP/` | MCP selection, icons, server manager |
| `client/src/data-provider/MCP/` | React Query mutations/queries |

### Data layer

| Path | Role |
|------|------|
| `packages/data-schemas/src/schema/mcpServer.ts` | Persisted MCP server documents |

Configuration: `librechat.yaml` → `mcpServers` section + `.env` `MCP_*` tuning.

---

## 16. Agent-Related Code Locations

Agents are multi-tool LLM workflows powered by `@librechat/agents`.

### Backend core (`packages/api/src/agents/`)

| Module | Role |
|--------|------|
| `run.ts` | Agent graph execution, subagents, summarization |
| `client.ts`, `initialize.ts`, `load.ts` | Agent client setup |
| `handlers.ts`, `chain.ts`, `edges.ts` | Event handlers, graph edges |
| `tools.ts`, `skills.ts`, `skillFiles.ts` | Tool and skill loading |
| `memory.ts` | Agent memory tool integration |
| `openai/`, `responses/` | OpenAI-compatible API surfaces |
| `auth.ts`, `validation.ts`, `config.ts` | Auth and validation |
| `avatars.ts`, `attachments.ts` | Avatar and file attachments |

### Express routes

| Path | Role |
|------|------|
| `api/server/routes/agents/` | Chat, v1 OpenAI API, responses API, streaming |
| `api/server/controllers/agents/` | Request handling, callbacks |
| `client/src/components/Agents/` | Agent marketplace, detail UI |
| `client/src/components/SidePanel/Agents/` | Agent editor side panel |
| `client/src/data-provider/Agents/` | Frontend data layer |

### Schema

| Path | Role |
|------|------|
| `packages/data-schemas/src/schema/agent.ts` | Agent document schema |

Agent capabilities (file search, code, MCP, etc.) are configured in `librechat.yaml` under `endpoints.agents`.

---

## 17. Memory-Related Code Locations

User memories are persistent key/value facts the model can read/write via tools.

| Layer | Path |
|-------|------|
| MongoDB schema | `packages/data-schemas/src/schema/memory.ts` |
| DB methods | `packages/data-schemas/src/methods/memory.ts` |
| App config | `packages/data-schemas/src/app/memory.ts` |
| Agent tools | `packages/api/src/agents/memory.ts` |
| Memory utils | `packages/api/src/utils/memory.ts`, `packages/api/src/memory/config.ts` |
| API routes | `api/server/routes/memories.js` |
| Frontend panel | `client/src/components/SidePanel/Memories/` |
| Message UI | `client/src/components/Chat/Messages/Content/MemoryInfo.tsx`, `MemoryArtifacts.tsx` |
| Data provider | `client/src/data-provider/Memories/` |

Configured via `librechat.yaml` (`memory` section) with token limits and valid keys.

---

## 18. RAG-Related Code Locations

RAG uses an **external microservice** (`librechat-rag-api`) plus PostgreSQL/pgvector — not embedded in the main Node process.

| Layer | Path / service |
|-------|----------------|
| Docker | `docker-compose.yml` → `rag_api`, `vectordb` |
| Env | `RAG_API_URL`, `RAG_OPENAI_*`, `EMBEDDINGS_PROVIDER`, `EMBEDDINGS_MODEL` |
| Delete embeddings | `packages/api/src/files/rag.ts` → `deleteRagFile()` |
| File embedding pipeline | `api/server/services/Files/process.js`, `VectorDB/crud.js` |
| Agent file search tool | `api/app/clients/tools/util/fileSearch.js` |
| Context handlers | `api/app/clients/prompts/createContextHandlers.js` |
| Frontend vector UI | `client/src/components/Files/VectorStore/` |
| Helm | `helm/librechat-rag-api/` |
| Standalone compose | `rag.yml` |

File records track `embedded` status in MongoDB (`packages/data-schemas/src/schema/file.ts`).

---

## 19. Areas Most Suitable for Synapse Customization

Prioritized by impact vs. invasiveness:

### Tier 1 — Branding & product identity (low risk)

1. **`APP_TITLE`**, **`CUSTOM_FOOTER`**, **`HELP_AND_FAQ_URL`** in `.env`
2. **`librechat.yaml` → `interface`** — welcome message, terms, privacy, feature toggles
3. **`client/public/assets/logo.svg`** — replace with Synapse logo
4. **PWA assets** — add/replace favicons and update `client/vite.config.ts` manifest (`name`, `theme_color`)
5. **`client/index.html`** — title, description, theme-color for first paint
6. **`client/src/locales/en/translation.json`** — user-visible strings (prefix `com_ui_`)

### Tier 2 — Look & feel (medium risk)

1. **`client/src/style.css`** and **`client/tailwind.config.cjs`** — color palette, typography
2. **`client/src/components/Auth/AuthLayout.tsx`** — login shell layout
3. **Banner system** — `config/update-banner.js`, `api/server/routes/banner.js`
4. **Model specs / default landing** — `librechat.yaml` → `modelSpecs`, `interface` defaults

### Tier 3 — Behavior & capabilities (higher coordination)

1. **`librechat.yaml` → `endpoints`** — which AI providers and agent capabilities ship
2. **`packages/api/src/mcp/` + YAML MCP servers** — Synapse-specific tool integrations
3. **`/skill` deployment skills** — read-only skills via `DEPLOYMENT_SKILLS_DIR`
4. **Auth** — OpenID/SAML for enterprise (`OPENID_*`, `SAML_*`) without forking core auth
5. **Memory & RAG** — tune `memory` and `RAG_*` for Synapse knowledge bases

### Tier 4 — Architectural (avoid unless necessary)

1. **`/api` Express routes** — keep thin; put logic in **`/packages/api`**
2. **`@librechat/agents`** — external package; agent graph changes happen upstream or via hooks like `packages/api/src/agents/testHook.ts`
3. **Database name / schema** — prefer config over renaming collections

### Recommended workspace discipline (from project conventions)

- **New backend code:** TypeScript in `packages/api` only
- **Shared types/endpoints:** `packages/data-provider`
- **DB changes:** `packages/data-schemas`
- **Frontend features:** `client/src` + hooks in `client/src/data-provider/`

---

## 20. Repository Tree (Important Directories)

```
synapse/
├── api/                          # Express backend (legacy JS shell)
│   ├── server/
│   │   ├── index.js              # Main server entry
│   │   ├── routes/               # REST route modules (auth, agents, mcp, memories, …)
│   │   ├── controllers/          # Request controllers
│   │   ├── middleware/           # Auth, rate limits, capabilities
│   │   └── services/             # Auth, Files, Config, MCP init, …
│   ├── strategies/               # Passport strategies (local, JWT, OAuth, SAML, LDAP)
│   ├── db/connect.js             # MongoDB connection
│   ├── models/                   # JS model facades
│   └── app/clients/              # LLM client adapters, tools, prompts
│
├── client/                       # React SPA
│   ├── src/
│   │   ├── components/           # Feature UI (Chat, Agents, MCP, Memories, Auth, …)
│   │   ├── hooks/                # React hooks (AuthContext, SSE, MCP, …)
│   │   ├── routes/               # React Router layouts
│   │   ├── data-provider/        # React Query layer
│   │   ├── locales/              # i18n JSON (en + many languages)
│   │   └── store/                # Recoil/Jotai state
│   ├── public/assets/            # Static SVG logos, icons
│   ├── sw/heal.js                # PWA service worker helper
│   ├── vite.config.ts            # Vite + PWA config
│   └── index.html                # HTML shell, PWA meta, SW recovery
│
├── packages/
│   ├── api/                      # TypeScript backend services
│   │   └── src/
│   │       ├── agents/           # Agent runtime integration
│   │       ├── mcp/              # MCP manager, OAuth, registry
│   │       ├── memory/           # Memory config
│   │       ├── files/            # File/RAG helpers
│   │       ├── endpoints/        # Provider configs
│   │       ├── oauth/            # OpenID helpers
│   │       └── skills/           # Skill sync/import
│   ├── data-schemas/             # Mongoose schemas & methods
│   │   └── src/schema/           # MongoDB collection schemas
│   ├── data-provider/            # Shared types, API endpoints, config
│   └── client/                   # Shared frontend component library
│
├── config/                       # CLI scripts (users, balance, migrations)
├── skill/                        # Deployment skills (optional)
├── helm/                         # Kubernetes Helm charts
│   ├── librechat/
│   └── librechat-rag-api/
├── e2e/                          # Playwright end-to-end tests
├── scripts/                      # Repo maintenance scripts
├── utils/docker/                 # Docker test compose helpers
│
├── Dockerfile                    # Monolith production image
├── Dockerfile.multi              # Multi-stage API image
├── docker-compose.yml            # Local full stack
├── deploy-compose.yml            # Production-style compose (API + nginx)
├── librechat.example.yaml        # Main YAML config template
├── .env.example                  # Environment variable reference
├── turbo.json                    # Turborepo pipeline
└── package.json                  # Workspace root scripts
```

---

## Quick Reference: Key URLs & Ports

| Service | Default |
|---------|---------|
| Backend API | `http://localhost:3080` |
| Frontend dev | `http://localhost:3090` |
| MongoDB | `mongodb://127.0.0.1:27017/LibreChat` |
| Meilisearch | `http://0.0.0.0:7700` |
| RAG API | `http://rag_api:8000` (Docker) |

---

## Related Documentation

- Project conventions: `CLAUDE.md` / `AGENTS.md`
- Upstream docs: [https://www.librechat.ai/docs](https://www.librechat.ai/docs)
- Configuration: [dotenv](https://www.librechat.ai/docs/configuration/dotenv), [librechat.yaml](https://www.librechat.ai/docs/configuration/librechat_yaml)
- RAG: [RAG API docs](https://www.librechat.ai/docs/configuration/rag_api)
