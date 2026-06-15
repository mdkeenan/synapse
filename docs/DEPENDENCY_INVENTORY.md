# Dependency Inventory

> **Generated:** 2026-06-14  
> **Monorepo:** LibreChat v0.8.6 (npm workspaces, `npm@11.13.0`, Node **24.16.0**)  
> **Workspaces:** `api`, `client`, `packages/*` (api, client, data-provider, data-schemas)

This document inventories every dependency declared across **8** `package.json` files. Versions match the workspace manifests at generation time; resolved versions in `package-lock.json` may differ within semver ranges.

---

## Legend

| Criticality | Meaning |
|-------------|---------|
| **Critical** | Server or SPA cannot start; data/auth integrity at risk |
| **High** | Core user-facing feature breaks (chat, agents, auth, files) |
| **Medium** | Optional integration or admin-only path |
| **Low** | Dev/test/build-only, or edge-case feature |

| Upgrade risk | Meaning |
|--------------|---------|
| **High** | Major-version or fast-moving API; wide blast radius |
| **Medium** | Semver-safe usually, but peer chains or native addons |
| **Low** | Utility libraries; patch/minor typically safe |

---

## Workspace overview

| Package | Name | Version | Runtime deps | Dev deps | Peer deps | Role |
|---------|------|---------|--------------|----------|-----------|------|
| Root | `LibreChat` | v0.8.6 | 0 | 28 | — | Orchestration, ESLint, Turbo, Playwright |
| `api/` | `@librechat/backend` | v0.8.6 | 98 | 6 | — | Express server shell |
| `client/` | `@librechat/frontend` | v0.8.6 | 96 | 39 | — | React SPA |
| `packages/api/` | `@librechat/api` | 1.7.31 | **0** | 42 | 62 | TypeScript backend services |
| `packages/data-provider/` | `librechat-data-provider` | 0.8.504 | 4 | 20 | 1 | Shared API types & client |
| `packages/data-schemas/` | `@librechat/data-schemas` | 0.0.52 | **0** | 19 | 9 | Mongoose schemas |
| `packages/client/` | `@librechat/client` | 0.4.60 | **0** | 37 | 46 | Shared React components |
| `packages/data-provider/react-query/` | (private stub) | — | 1 | 0 | — | Legacy export path |

**Architecture note:** `@librechat/api` and `@librechat/data-schemas` declare **peerDependencies only**. The `api` workspace installs those peers and re-exports runtime behavior. Upgrading backend deps usually means editing `api/package.json` first.

---

## Internal workspace packages

| Dependency | Version | Purpose | Criticality | Upgrade risk |
|------------|---------|---------|-------------|--------------|
| `@librechat/api` | `*` (1.7.31) | MCP, agents, files, auth helpers, cache, endpoints | Critical | High |
| `@librechat/data-schemas` | `*` (0.0.52) | MongoDB models, logging, app config resolution | Critical | High |
| `librechat-data-provider` | `*` (0.8.504) | Endpoints, Zod config, React Query layer | Critical | High |
| `@librechat/client` | `*` (0.4.60) | Shared UI components & hooks | High | Medium |
| `@librechat/agents` | `^3.2.34` | Agent graph runtime (external npm package) | Critical | High |

---

## Root `package.json`

### Runtime dependencies

None (all runtime deps live in workspaces).

### Dev dependencies

| Dependency | Version | Purpose | Criticality | Upgrade risk |
|------------|---------|---------|-------------|--------------|
| `@axe-core/playwright` | ^4.10.1 | Accessibility E2E checks | Low | Low |
| `@eslint/compat` | ^1.2.6 | Flat ESLint compat shims | Low | Low |
| `@eslint/eslintrc` | ^3.3.4 | Legacy config bridge for ESLint flat config | Low | Low |
| `@eslint/js` | ^9.20.0 | ESLint recommended rules | Low | Low |
| `@playwright/test` | ^1.56.1 | E2E test runner | Low | Medium |
| `@types/react-virtualized` | ^9.22.0 | Types for client lists | Low | Low |
| `caniuse-lite` | ^1.0.30001741 | Browserslist data (transitive pin) | Low | Low |
| `cross-env` | ^7.0.3 | Cross-platform env in npm scripts | Low | Low |
| `elliptic` | ^6.6.1 | **Security override** (not imported directly) | Low | Low |
| `eslint` | ^9.39.1 | Linting | Low | Medium |
| `eslint-config-prettier` | ^10.0.1 | Disable ESLint/Prettier conflicts | Low | Low |
| `eslint-import-resolver-typescript` | ^3.7.0 | TS path resolution for `eslint-plugin-import` | Low | Low |
| `eslint-plugin-i18next` | ^6.1.1 | i18n key lint | Low | Low |
| `eslint-plugin-import` | ^2.31.0 | Import order/rules | Low | Medium |
| `eslint-plugin-jest` | ^29.1.0 | Jest lint rules | Low | Low |
| `eslint-plugin-jsx-a11y` | ^6.10.2 | Accessibility lint | Low | Low |
| `eslint-plugin-prettier` | ^5.2.3 | Prettier as ESLint rule | Low | Low |
| `eslint-plugin-react` | ^7.37.4 | React lint | Low | Medium |
| `eslint-plugin-react-hooks` | ^5.1.0 | Hooks lint | Low | Medium |
| `eslint-plugin-simple-import-sort` | ^12.1.1 | Import sorting (via `scripts/sort-imports.mts`) | Low | Low |
| `globals` | ^15.14.0 | ESLint global env definitions | Low | Low |
| `husky` | ^9.1.7 | Git hooks (`.husky/pre-commit`) | Low | Low |
| `jest` | ^30.2.0 | Root/config tests | Low | Medium |
| `lint-staged` | ^15.4.3 | Pre-commit staged lint | Low | Low |
| `prettier` | ^3.5.0 | Code formatting | Low | Low |
| `prettier-plugin-tailwindcss` | ^0.6.11 | Tailwind class sorting (`.prettierrc`) | Low | Low |
| `turbo` | ^2.9.17 | Monorepo build cache | High | Medium |
| `typescript-eslint` | ^8.60.1 | **Possibly redundant** — ESLint uses `@typescript-eslint/*` directly | Low | Low |

### Root `overrides` (security & compatibility pins)

| Package | Pinned version | Purpose | Criticality | Upgrade risk |
|---------|----------------|---------|-------------|--------------|
| `@anthropic-ai/sdk` | ^0.92.0 | Force SDK version across tree | High | High |
| `@xmldom/xmldom` | ^0.8.13 | XML parse security | Medium | Low |
| `elliptic` | ^6.6.1 | Crypto CVE mitigation | High | Low |
| `fast-xml-parser` | 5.7.2 | XML parse security | Medium | Low |
| `form-data` | ^4.0.4 | HTTP multipart security | Medium | Low |
| `hono` / `@hono/node-server` | ^4.12.18 / ^1.19.10 | Transitive MCP/OAuth stack | Medium | Medium |
| `katex` + remark/rehype chain | ^0.16.21 | Math render consistency | Medium | Low |
| `langsmith` | ^0.6.0 | Tracing SDK pin | Low | Medium |
| `mdast-util-gfm-autolink-literal` | 2.0.0 | Markdown parse stability | Medium | Low |
| `monaco-editor` → `dompurify` | 3.4.0 | Editor XSS mitigation | Medium | Low |
| `postcss` | ^8.5.13 | Build toolchain consistency | Low | Low |
| `serialize-javascript` | 7.0.5 | XSS mitigation in bundlers | Medium | Low |
| `svgo` | ^2.8.2 | SVG optimize pin | Low | Low |
| `tslib` | ^2.8.1 | TS helper consistency | Low | Low |
| `underscore` | 1.13.8 | Legacy transitive pin | Low | Low |
| `eslint` → `ajv` | 6.14.0 | ESLint 9 compat | Low | Low |

---

## `api/` — `@librechat/backend`

### Core server & HTTP

| Dependency | Version | Purpose | Criticality | Upgrade risk |
|------------|---------|---------|-------------|--------------|
| `express` | ^5.2.1 | HTTP server | Critical | **High** (Express 5) |
| `cors` | ^2.8.5 | CORS middleware | High | Low |
| `compression` | ^1.8.1 | Response compression | Medium | Low |
| `express-rate-limit` | ^8.5.1 | Rate limiting | High | Medium |
| `express-mongo-sanitize` | ^2.2.0 | NoSQL injection guard | High | Low |
| `express-session` | ^1.18.2 | OAuth/SAML sessions | High | Medium |
| `express-static-gzip` | ^2.2.0 | Precompressed static assets | Medium | Low |
| `cookie-parser` | ^1.4.7 | Cookie parsing | High | Low |
| `cookie` | ^0.7.2 | Low-level cookie parse/set | High | Low |
| `multer` | ^2.1.1 | Multipart uploads | High | Medium |
| `dotenv` | ^16.0.3 | Env loading | Critical | Low |
| `module-alias` | ^2.2.3 | `~/` path alias | High | Low |
| `undici` | ^7.24.1 | Fetch/HTTP client | High | Medium |
| `axios` | ^1.16.0 | HTTP client | High | Medium |
| `node-fetch` | ^2.7.0 | Legacy fetch (CommonJS) | Medium | Medium |
| `form-data` | ^4.0.4 | Multipart bodies | Medium | Low |
| `https-proxy-agent` | ^7.0.6 | Outbound proxy | Medium | Low |
| `@smithy/node-http-handler` | ^4.4.5 | AWS HTTP tuning | Medium | Medium |
| `ua-parser-js` | ^1.0.36 | Client UA parsing / bans | Medium | Low |

### Authentication & identity

| Dependency | Version | Purpose | Criticality | Upgrade risk |
|------------|---------|---------|-------------|--------------|
| `passport` | ^0.6.0 | Auth middleware framework | Critical | Medium |
| `passport-local` | ^1.0.0 | Email/password | High | Low |
| `passport-jwt` | ^4.0.1 | JWT strategy | Critical | Medium |
| `passport-google-oauth20` | ^2.0.0 | Google OAuth | Medium | Low |
| `passport-github2` | ^0.1.12 | GitHub OAuth | Medium | Low |
| `passport-discord` | ^0.1.4 | Discord OAuth | Medium | Low |
| `passport-facebook` | ^3.0.0 | Facebook OAuth | Medium | Low |
| `passport-apple` | ^2.0.2 | Apple Sign In | Medium | Medium |
| `passport-ldapauth` | ^3.0.1 | LDAP | Medium | Medium |
| `@node-saml/passport-saml` | ^5.1.0 | SAML SSO | Medium | **High** |
| `openid-client` | ^6.5.0 | OpenID Connect | High | **High** |
| `jwks-rsa` | ^3.2.0 | JWKS for OIDC JWT | High | Medium |
| `jsonwebtoken` | ^9.0.0 | JWT sign/verify | Critical | Medium |
| `bcryptjs` | ^2.4.3 | Password hashing | Critical | Low |
| `connect-redis` | ^8.1.0 | Redis session store | Medium | Medium |
| `memorystore` | ^1.6.7 | Memory session fallback | Medium | Low |
| `rate-limit-redis` | ^4.2.0 | Redis-backed limits | Medium | Medium |

### Database & search

| Dependency | Version | Purpose | Criticality | Upgrade risk |
|------------|---------|---------|-------------|--------------|
| `mongoose` | ^8.23.1 | MongoDB ODM | Critical | **High** |
| `mongodb` | ^6.14.2 | MongoDB driver | Critical | **High** |
| `meilisearch` | ^0.38.0 | Conversation search | Medium | Medium |

### Cache & Redis

| Dependency | Version | Purpose | Criticality | Upgrade risk |
|------------|---------|---------|-------------|--------------|
| `ioredis` | ^5.3.2 | Redis client | Medium | Medium |
| `keyv` | ^5.3.2 | Cache abstraction | High | Medium |
| `@keyv/redis` | ^4.3.3 | Redis Keyv adapter | Medium | Medium |
| `keyv-file` | ^5.1.2 | File cache adapter | Low | Low |

### AI / LLM providers

| Dependency | Version | Purpose | Criticality | Upgrade risk |
|------------|---------|---------|-------------|--------------|
| `@librechat/agents` | ^3.2.34 | Agent execution engine | Critical | **High** |
| `openai` | 5.8.2 | OpenAI SDK (pinned minor) | Critical | **High** |
| `@google/genai` | ^2.8.0 | Google Gemini | High | **High** |
| `@anthropic-ai/vertex-sdk` | ^0.16.0 | Anthropic on Vertex | Medium | **High** |
| `@aws-sdk/client-bedrock-runtime` | ^3.1013.0 | AWS Bedrock | Medium | Medium |
| `ollama` | ^0.5.0 | Local Ollama | Low | Medium |
| `ai-tokenizer` | ^1.0.6 | Token counting | High | Low |

### Cloud storage & CDN

| Dependency | Version | Purpose | Criticality | Upgrade risk |
|------------|---------|---------|-------------|--------------|
| `@aws-sdk/client-s3` | ^3.980.0 | S3 storage | Medium | Medium |
| `@aws-sdk/s3-request-presigner` | ^3.758.0 | Signed S3 URLs | Medium | Medium |
| `@aws-sdk/cloudfront-signer` | ^3.1036.0 | CloudFront signed URLs/cookies | Medium | Medium |
| `@aws-sdk/client-cloudfront` | ^3.1042.0 | CloudFront invalidation | Low | Medium |
| `@aws-sdk/credential-providers` | ^3.1045.0 | AWS credential chain | Medium | Medium |
| `@azure/storage-blob` | ^12.30.0 | Azure Blob storage | Medium | Medium |
| `@azure/identity` | ^4.13.1 | Azure auth | Medium | Medium |
| `@azure/search-documents` | ^12.0.0 | Azure AI Search | Low | Medium |
| `firebase` | ^11.0.2 | Firebase storage | Medium | **High** |
| `sharp` | ^0.33.5 | Image processing (native) | High | **High** |

### MCP, Microsoft, observability

| Dependency | Version | Purpose | Criticality | Upgrade risk |
|------------|---------|---------|-------------|--------------|
| `@modelcontextprotocol/sdk` | ^1.29.0 | MCP protocol | High | **High** |
| `@microsoft/microsoft-graph-client` | ^3.0.7 | Entra ID / SharePoint | Medium | Medium |
| `winston` | ^3.11.0 | Logging | Critical | Low |
| `winston-daily-rotate-file` | ^5.0.0 | Log rotation | Medium | Low |
| `prom-client` | ^15.1.3 | Prometheus metrics | Low | Low |
| `@opentelemetry/api` | ^1.9.0 | Tracing API | Low | Medium |
| `@opentelemetry/sdk-node` | ^0.218.0 | OTEL SDK | Low | **High** |
| `@opentelemetry/instrumentation-express` | ^0.56.0 | Express spans | Low | Medium |
| `@opentelemetry/instrumentation-http` | ^0.207.0 | HTTP spans | Low | Medium |
| `@opentelemetry/instrumentation-mongodb` | ^0.60.0 | Mongo spans | Low | Medium |
| `@opentelemetry/instrumentation-mongoose` | ^0.54.0 | Mongoose spans | Low | Medium |
| `@opentelemetry/instrumentation-ioredis` | ^0.55.0 | Redis spans | Low | Medium |
| `@opentelemetry/instrumentation-undici` | ^0.18.0 | Undici spans | Low | Medium |
| `@opentelemetry/resources` | ^2.6.1 | OTEL resources | Low | Medium |
| `@opentelemetry/semantic-conventions` | ^1.39.0 | OTEL semconv | Low | Low |

### Files, documents, utilities

| Dependency | Version | Purpose | Criticality | Upgrade risk |
|------------|---------|---------|-------------|--------------|
| `file-type` | ^21.3.2 | MIME detection | High | Medium |
| `mime` | ^3.0.0 | MIME types | Medium | Low |
| `pdfjs-dist` | ^5.4.624 | PDF parsing | Medium | Medium |
| `mammoth` | ^1.11.0 | DOCX → text | Medium | Low |
| `xlsx` | 0.20.3 (SheetJS CDN) | Spreadsheet import | Medium | Medium |
| `jszip` | ^3.10.1 | ZIP archives | Medium | Low |
| `yauzl` | ^3.2.1 | ZIP read | Medium | Low |
| `sanitize-html` | ^2.13.0 | HTML sanitization | High | Medium |
| `handlebars` | ^4.7.9 | Email templates | Medium | Low |
| `nodemailer` | ^8.0.5 | SMTP email | Medium | Medium |
| `js-yaml` | ^4.1.1 | YAML config parse | Critical | Low |
| `lodash` | ^4.17.23 | Utilities | High | Low |
| `klona` | ^2.0.6 | Deep clone | Medium | Low |
| `nanoid` | ^3.3.7 | ID generation | High | Low |
| `zod` | ^3.22.4 | Runtime validation | High | Medium |
| `dedent` | ^1.5.3 | Template strings | Low | Low |
| `mathjs` | ^15.2.0 | Safe math eval (via `@librechat/api`) | Medium | Medium |
| `traverse` | ^0.6.7 | Object traversal (config parsers) | Medium | Low |
| `get-stream` | ^6.0.1 | Stream helpers | Low | Low |
| `eventsource` | ^3.0.2 | SSE client (config) | Low | Medium |

### `api/` devDependencies

| Dependency | Version | Purpose | Criticality | Upgrade risk |
|------------|---------|---------|-------------|--------------|
| `jest` | ^30.2.0 | Unit/integration tests | Low | Medium |
| `supertest` | ^7.1.0 | HTTP assertions | Low | Low |
| `mongodb-memory-server` | ^11.0.1 | In-memory MongoDB tests | Low | Medium |
| `nodemon` | ^3.0.3 | Dev file watch (via root script) | Low | Low |
| `@babel/preset-env` | ^7.29.5 | Jest transpile | Low | Low |
| `@types/sanitize-html` | ^2.13.0 | Types | Low | Low |

---

## `client/` — `@librechat/frontend`

### Core UI framework

| Dependency | Version | Purpose | Criticality | Upgrade risk |
|------------|---------|---------|-------------|--------------|
| `react` | ^18.2.0 | UI framework | Critical | **High** |
| `react-dom` | ^18.2.0 | DOM renderer | Critical | **High** |
| `react-router-dom` | ^6.30.3 | Client routing | Critical | Medium |
| `vite` | ^8.0.16 (dev) | Bundler | Critical | **High** |
| `@vitejs/plugin-react` | ^6.0.2 (dev) | React HMR | Critical | Medium |
| `typescript` | ^5.9.3 (dev) | Type checking | High | Medium |

### State & data fetching

| Dependency | Version | Purpose | Criticality | Upgrade risk |
|------------|---------|---------|-------------|--------------|
| `@tanstack/react-query` | ^4.28.0 | Server state / caching | Critical | **High** |
| `recoil` | ^0.7.7 | Client global state | High | Medium |
| `jotai` | ^2.12.5 | Atomic state (shared UI) | Medium | Medium |
| `swr` | ^2.3.8 | Mermaid asset fetch hook | Low | Medium |
| `librechat-data-provider` | * | API client & types | Critical | High |
| `@librechat/client` | * | Shared components | Critical | Medium |

### UI libraries (Radix, Headless UI, Ariakit)

| Dependency | Version | Purpose | Criticality | Upgrade risk |
|------------|---------|---------|-------------|--------------|
| `@radix-ui/react-*` (18 packages) | ^1–2.x | Accessible primitives | High | Medium |
| `@headlessui/react` | ^2.1.2 | Dialogs, menus | High | Medium |
| `@ariakit/react` | ^0.4.15 | Comboboxes, menus | High | Medium |
| `@ariakit/react-core` | ^0.4.17 | Low-level Ariakit (peer for `@librechat/client`) | Medium | Medium |
| `lucide-react` | ^0.394.0 | Icons | High | Low |
| `framer-motion` | ^12.40.0 | Animations | Medium | Medium |
| `@react-spring/web` | ^9.7.5 | Spring animations | Low | Medium |
| `class-variance-authority` | ^0.7.1 | Variant styling | Medium | Low |
| `clsx` / `tailwind-merge` | ^2.1.1 / ^1.9.1 | Class utilities | Medium | Low |
| `tailwindcss` | ^3.4.1 (dev) | CSS framework | Critical | Medium |
| `tailwindcss-animate` | ^1.0.5 | Animation utilities | Medium | Low |
| `tailwindcss-radix` | ^2.8.0 | Radix + Tailwind | Medium | Low |

### Chat, markdown, math, diagrams

| Dependency | Version | Purpose | Criticality | Upgrade risk |
|------------|---------|---------|-------------|--------------|
| `react-markdown` | ^9.0.1 | Markdown rendering | Critical | Medium |
| `remark-gfm` | ^4.0.0 | GFM markdown | High | Medium |
| `remark-math` / `rehype-katex` | ^6.x | LaTeX math | Medium | Medium |
| `remark-directive` / `mdast-util-directive` | ^3.x | Custom directives | Medium | Medium |
| `micromark-extension-gfm` | ^3.0.0 | GFM parser | High | Medium |
| `micromark-extension-math` | ^3.1.0 | Math parser | Medium | Medium |
| `micromark-extension-llm-math` | ^3.1.0 | LLM math alias (Vite resolve) | Medium | Low |
| `mermaid` | ^11.15.0 | Diagram rendering | Medium | **High** |
| `rehype-highlight` | ^6.0.0 | Syntax highlight | Medium | Low |
| `dompurify` | ^3.4.0 | HTML sanitization | High | Medium |
| `sse.js` | ^2.8.0 | SSE streaming | Critical | Medium |

### Forms, tables, virtualization

| Dependency | Version | Purpose | Criticality | Upgrade risk |
|------------|---------|---------|-------------|--------------|
| `react-hook-form` | ^7.43.9 | Forms | High | Medium |
| `zod` | ^3.22.4 | Validation | High | Medium |
| `@tanstack/react-table` | ^8.11.7 | Data tables | Medium | Medium |
| `react-virtualized` | ^9.22.6 | Virtual lists | High | **High** (legacy) |
| `react-vtree` | ^3.0.0 | Virtual tree (skills) | Medium | Medium |
| `react-textarea-autosize` | ^8.4.0 | Chat input | High | Low |
| `react-resizable-panels` | ^4.7.4 | Split panes | Medium | Medium |
| `rc-input-number` | ^7.4.2 | Numeric inputs | Low | Low |
| `input-otp` | ^1.4.2 | 2FA OTP UI | Medium | Low |
| `match-sorter` | ^8.1.0 | Fuzzy sort | Medium | Low |

### i18n, auth UX, integrations

| Dependency | Version | Purpose | Criticality | Upgrade risk |
|------------|---------|---------|-------------|--------------|
| `i18next` | ^24.2.2 | i18n core | High | Medium |
| `react-i18next` | ^15.4.0 | React i18n | High | Medium |
| `i18next-browser-languagedetector` | ^8.0.3 | Locale detection | High | Low |
| `@marsidev/react-turnstile` | ^1.1.0 | Cloudflare Turnstile CAPTCHA | Medium | Low |
| `@hyperdx/browser` | ^0.24.0 | RUM (optional) | Low | Medium |
| `react-gtm-module` | ^2.0.11 | Google Tag Manager | Low | Low |
| `@mcp-ui/client` | ^5.7.0 | MCP UI resources | Medium | **High** |
| `js-cookie` | ^3.0.5 | Cookie helpers | Medium | Low |

### Editors, artifacts, media

| Dependency | Version | Purpose | Criticality | Upgrade risk |
|------------|---------|---------|-------------|--------------|
| `@monaco-editor/react` | ^4.7.0 | Code editor | Medium | Medium |
| `monaco-editor` | ^0.55.1 (dev) | Editor bundle | Medium | Medium |
| `@codesandbox/sandpack-react` | ^2.19.10 | Code artifacts | Medium | **High** |
| `@dicebear/core` + `@dicebear/collection` | ^9.4.1 | Avatar generation | Medium | Low |
| `react-avatar-editor` | ^13.0.2 | Avatar crop | Medium | Low |
| `heic-to` | ^1.1.14 | HEIC image convert | Medium | Medium |
| `html-to-image` | ^1.11.11 | Screenshot export | Low | Low |
| `downloadjs` | ^1.4.7 | File download helper | Low | Low |
| `qrcode.react` | ^4.2.0 | Share QR codes | Low | Low |

### DnD, animation, misc

| Dependency | Version | Purpose | Criticality | Upgrade risk |
|------------|---------|---------|-------------|--------------|
| `react-dnd` / `react-dnd-html5-backend` | ^16.0.1 | Drag and drop | Medium | Medium |
| `react-flip-toolkit` | ^7.1.0 | Preset list animations | Low | Low |
| `react-transition-group` | ^4.4.5 | Transitions | Medium | Low |
| `react-speech-recognition` | ^3.10.0 | Browser STT | Medium | Medium |
| `regenerator-runtime` | ^0.14.1 | Async/generator polyfill | Medium | Low |
| `export-from-json` | ^1.7.2 | Export presets/data | Low | Low |
| `copy-to-clipboard` | ^3.3.3 | Clipboard | Medium | Low |
| `date-fns` | ^3.3.1 | Date formatting | Medium | Medium |
| `filenamify` | ^6.0.0 | Safe filenames | Low | Low |
| `lodash` | ^4.17.23 | Utilities | High | Low |
| `ts-md5` | ^1.3.1 | Mermaid cache keys | Low | Low |
| `cross-env` | ^7.0.3 | Build scripts | Low | Low |

### PWA & build (client devDependencies)

| Dependency | Version | Purpose | Criticality | Upgrade risk |
|------------|---------|---------|-------------|--------------|
| `vite-plugin-pwa` | ^1.3.0 | Service worker / manifest | High | Medium |
| `vite-plugin-node-polyfills` | ^0.28.0 | Node polyfills in browser | High | Medium |
| `vite-plugin-compression2` | ^2.5.3 | Brotli/gzip assets | Medium | Low |
| `jest` + Testing Library + happy-dom | various | Frontend tests | Low | Medium |
| `postcss` / `autoprefixer` / `postcss-preset-env` | various | CSS pipeline | Medium | Low |

---

## `packages/data-provider/`

### Runtime dependencies

| Dependency | Version | Purpose | Criticality | Upgrade risk |
|------------|---------|---------|-------------|--------------|
| `axios` | ^1.16.0 | HTTP client | Critical | Medium |
| `dayjs` | ^1.11.13 | Date utilities | High | Low |
| `js-yaml` | ^4.1.1 | YAML parsing | High | Low |
| `zod` | ^3.22.4 | Config schemas | Critical | Medium |

### Peer dependencies

| Dependency | Version | Purpose | Criticality | Upgrade risk |
|------------|---------|---------|-------------|--------------|
| `@tanstack/react-query` | ^4.28.0 | React Query hooks (optional import path) | High | **High** |

### Notable devDependencies

| Dependency | Version | Purpose | Criticality | Upgrade risk |
|------------|---------|---------|-------------|--------------|
| `tsdown` | ^0.22.2 | Bundle TS → CJS/ESM | High | Medium |
| `typescript` | ^5.9.3 | Types | High | Medium |
| `openapi-types` | ^12.1.3 | OpenAPI action types | Medium | Low |
| `jest` | ^30.2.0 | Tests | Low | Medium |
| `rollup` + plugins | ^4.34.9 | Legacy rollup path | Low | Medium |

---

## `packages/data-schemas/`

No runtime `dependencies`. Peers supplied by `api/`:

| Peer dependency | Version | Purpose | Criticality | Upgrade risk |
|-----------------|---------|---------|-------------|--------------|
| `mongoose` | ^8.23.1 | ODM | Critical | **High** |
| `librechat-data-provider` | * | Shared types | Critical | High |
| `lodash` | ^4.17.23 | Utilities | High | Low |
| `nanoid` | ^3.3.7 | IDs | High | Low |
| `jsonwebtoken` | ^9.0.2 | JWT helpers | High | Medium |
| `klona` | ^2.0.6 | Clone | Medium | Low |
| `meilisearch` | ^0.38.0 | Search client types | Medium | Medium |
| `winston` | ^3.17.0 | Logging | Critical | Low |
| `winston-daily-rotate-file` | ^5.0.0 | Log rotation | Medium | Low |

Build: `tsdown`, `typescript`, `jest`, `mongodb-memory-server`, Rollup plugins (dev).

---

## `packages/api/` — peer dependency surface

`packages/api` has **no** runtime `dependencies`; it expects the `api` workspace to install **62 peer packages** (same cloud, AI, cache, and document stack as above). Notable peers **only** in `packages/api` (not always obvious in `api/` grep):

| Peer dependency | Version | Purpose | Criticality | Upgrade risk |
|-----------------|---------|---------|-------------|--------------|
| `google-auth-library` | ^9.15.1 | Vertex / Google auth | Medium | Medium |

All other peers mirror `api/package.json` entries and are consumed from `packages/api/src/**`.

Build/dev: `tsdown`, `typescript`, `jest`, `rimraf`, Rollup plugins, test fixtures (`aws-sdk-client-mock`, etc.).

---

## `packages/client/`

No runtime `dependencies`; **46 peerDependencies** (React, Radix, TanStack, i18n, etc.) satisfied by `client/package.json`.

Build/dev: `tsdown`, `typescript`, `jest`, `@tsdown/css`, Rollup/postcss plugins.

---

## Unused dependency analysis

Analysis used **[depcheck](https://github.com/depcheck/depcheck)** (same tool as [`.github/workflows/unused-packages.yml`](../.github/workflows/unused-packages.yml)) after `npm ci`. Monorepo workspace imports cause false positives unless scoped like CI.

### Confirmed / likely unused (safe to investigate)

| Package | Workspace | Depcheck | Verdict |
|---------|-----------|----------|---------|
| `typescript-eslint` | root | Unused devDep | **Likely unused** — `eslint.config.mjs` imports `@typescript-eslint/eslint-plugin` and `@typescript-eslint/parser` directly, not the meta package |
| `@types/react-virtualized` | root | Unused devDep | **Used indirectly** — types for `client` imports; keep unless client owns the dep |
| `caniuse-lite` | root | Unused devDep | **Transitive pin** — intentional browserslist override; keep |
| `elliptic` | root | Unused devDep | **Override-only** — not imported; keep for `overrides` |
| `eslint-import-resolver-typescript` | root | Unused devDep | **May be unused** — not referenced in flat `eslint.config.mjs`; verify before removal |
| `eslint-plugin-simple-import-sort` | root | Unused devDep | **Used by** `scripts/sort-imports.mts`, not depcheck-scanned |
| `husky` / `lint-staged` | root | Unused devDep | **Used by** `.husky/pre-commit` |
| `prettier-plugin-tailwindcss` | root | Unused devDep | **Used by** `.prettierrc` plugins array |

### False positives (do **not** remove)

| Package | Workspace | Reason |
|---------|-----------|--------|
| `micromark-extension-llm-math` | client | Resolved via Vite alias (`micromark-extension-math` → `micromark-extension-llm-math` in `client/vite.config.ts`); CI explicitly excludes this |
| Most `api/` deps flagged by naive depcheck | api | Imported from `packages/api/src`, not `api/` tree — CI merges workspace usage |
| `@anthropic-ai/vertex-sdk`, `@aws-sdk/*`, OpenTelemetry, `pdfjs-dist`, etc. | api | Used in `@librechat/api` source; required at runtime |
| Rollup/Babel/Jest in `packages/*` | packages | Build/test tooling; depcheck does not attribute to build scripts |

### Potentially redundant direct dependency

| Package | Workspace | Notes |
|---------|-----------|-------|
| `@ariakit/react-core` | client | No direct imports under `client/src/`; **required** as peer for `@librechat/client` (which imports `@ariakit/react-core/select/*`). Keep in `client` to satisfy npm peer resolution. |

### `packages/data-provider` devDeps flagged by depcheck

| Package | Verdict |
|---------|---------|
| `@babel/preset-react`, `rimraf` | Build/test; used in npm scripts |
| `@types/jest`, `@types/react` | Test/type support |

**No unused runtime dependencies** were found in `packages/data-provider`.

---

## Upgrade priority matrix (Synapse operators)

| Priority | Packages | Rationale |
|----------|----------|-----------|
| 1 | `mongoose`, `mongodb`, `express`, `passport`/`openid-client`, `jsonwebtoken` | Security + data integrity |
| 2 | `@librechat/agents`, `openai`, `@modelcontextprotocol/sdk`, `librechat-data-provider`, `@librechat/api` | Core product behavior |
| 3 | `react`, `vite`, `@tanstack/react-query`, `sharp` | Frontend build/runtime |
| 4 | Cloud SDKs (`@aws-sdk/*`, `@azure/*`, `firebase`) | Only if those backends enabled |
| 5 | OpenTelemetry, RUM, Playwright | Observability / CI |

**Recommended upgrade path:** bump LibreChat upstream (see [UPSTREAM_MAINTENANCE.md](./UPSTREAM_MAINTENANCE.md)), run `npm ci`, `npm run build`, workspace test suites, then deploy. Avoid one-off major bumps of `@librechat/agents` or `openai` without matching upstream release notes.

---

## Related documentation

- [SYNAPSE_REPOSITORY_ANALYSIS.md](./SYNAPSE_REPOSITORY_ANALYSIS.md) — architecture  
- [UPSTREAM_MAINTENANCE.md](./UPSTREAM_MAINTENANCE.md) — sync strategy  
- [LibreChat npm docs](https://www.librechat.ai/docs/local/npm)
